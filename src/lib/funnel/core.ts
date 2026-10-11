// Pure funnel logic with an injectable repository so it can be unit-tested
// without a database. Server wiring lives in *.server.ts files.

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded";
export type OfferKind = "main" | "order_bump" | "upsell" | "downsell";

export type Product = { id: string; kind: OfferKind; priceKz: number | null; active: boolean; storagePath: string | null };
export type OrderItem = { productId: string; unitPriceKz: number; quantity: number };
export type Order = {
  id: string;
  parentOrderId: string | null;
  kind: OfferKind;
  status: OrderStatus;
  totalKz: number;
  currency: "AOA";
  accessTokenHash: string;
  items: OrderItem[];
};

export class FunnelError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

/** Accurate integer total. Throws if any selected product is not purchasable. */
export function computeTotal(products: Product[]): { items: OrderItem[]; totalKz: number } {
  const items = products.map((p) => {
    if (!p.active || p.priceKz === null || !Number.isInteger(p.priceKz) || p.priceKz <= 0) {
      throw new FunnelError("offer_unavailable", `Produto ${p.id} ainda não tem preço definido.`);
    }
    return { productId: p.id, unitPriceKz: p.priceKz, quantity: 1 };
  });
  const totalKz = items.reduce((sum, i) => sum + i.unitPriceKz * i.quantity, 0);
  return { items, totalKz };
}

// ---------- tokens ----------
export function generateAccessToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// ---------- repository ----------
export interface FunnelRepo {
  getProducts(ids: string[]): Promise<Product[]>;
  insertOrder(input: Omit<Order, "id" | "status"> & { customerEmail: string; customerName: string | null }): Promise<string>;
  getOrder(id: string): Promise<Order | null>;
  /** Returns false if (provider, eventId) already exists — idempotency. */
  recordWebhookEvent(e: { provider: string; eventId: string; orderId: string | null; outcome: string; payload: unknown }): Promise<boolean>;
  updateWebhookOutcome(provider: string, eventId: string, outcome: string): Promise<void>;
  setOrderStatus(orderId: string, status: OrderStatus, providerReference: string): Promise<void>;
  grantEntitlements(orderId: string, productIds: string[]): Promise<void>;
  revokeEntitlements(orderId: string): Promise<void>;
  hasEntitlement(orderId: string, productId: string): Promise<boolean>;
  createSignedUrl(storagePath: string, expiresInSeconds: number): Promise<string>;
  logDelivery(orderId: string, productId: string): Promise<void>;
}

export async function authorizeOrder(repo: FunnelRepo, orderId: string, accessToken: string): Promise<Order> {
  const order = await repo.getOrder(orderId);
  if (!order || !timingSafeEqual(order.accessTokenHash, await hashToken(accessToken))) {
    throw new FunnelError("not_found", "Pedido não encontrado.");
  }
  return order;
}

// ---------- orders ----------
export async function createMainOrder(
  repo: FunnelRepo,
  input: { email: string; name: string | null; includeBump: boolean },
) {
  const ids = input.includeBump ? ["main-ebook", "order-bump"] : ["main-ebook"];
  const products = await repo.getProducts(ids);
  if (products.length !== ids.length) throw new FunnelError("offer_unavailable", "Produto indisponível.");
  const { items, totalKz } = computeTotal(products);
  const accessToken = generateAccessToken();
  const orderId = await repo.insertOrder({
    parentOrderId: null, kind: "main", totalKz, currency: "AOA",
    accessTokenHash: await hashToken(accessToken), items,
    customerEmail: input.email, customerName: input.name,
  });
  return { orderId, accessToken, totalKz, status: "pending" as const };
}

/** Upsell/downsell always create a SEPARATE pending order; navigation never grants access. */
export async function createOfferOrder(
  repo: FunnelRepo,
  input: { parentOrderId: string; accessToken: string; offer: "upsell" | "downsell"; email: string },
) {
  const parent = await authorizeOrder(repo, input.parentOrderId, input.accessToken);
  const [product] = await repo.getProducts([input.offer]);
  if (!product) throw new FunnelError("offer_unavailable", "Oferta indisponível.");
  const { items, totalKz } = computeTotal([product]);
  const accessToken = generateAccessToken();
  const orderId = await repo.insertOrder({
    parentOrderId: parent.id, kind: input.offer, totalKz, currency: "AOA",
    accessTokenHash: await hashToken(accessToken), items,
    customerEmail: input.email, customerName: null,
  });
  return { orderId, accessToken, totalKz, status: "pending" as const };
}

// ---------- webhook ----------
export type VerifiedPaymentEvent = {
  eventId: string;
  orderId: string;
  status: "paid" | "failed" | "cancelled" | "refunded";
  amountKz: number;
  currency: string;
  providerReference: string;
};

export interface PaymentProvider {
  id: string;
  configured: boolean;
  /** Must use the provider's official signature method. Returns null when invalid. */
  verifyWebhook(rawBody: string, headers: Headers): Promise<VerifiedPaymentEvent | null>;
}

export type WebhookResult = { status: number; outcome: string };

export async function processWebhook(
  repo: FunnelRepo, provider: PaymentProvider, rawBody: string, headers: Headers,
): Promise<WebhookResult> {
  if (!provider.configured) return { status: 503, outcome: "provider_unconfigured" };
  const event = await provider.verifyWebhook(rawBody, headers);
  if (!event) return { status: 401, outcome: "invalid_signature" };

  const isNew = await repo.recordWebhookEvent({
    provider: provider.id, eventId: event.eventId, orderId: null, outcome: "received", payload: null,
  });
  console.info(`[webhook] provider=${provider.id} event=${event.eventId} new=${isNew}`);
  if (!isNew) return { status: 200, outcome: "duplicate" };

  const finish = async (r: WebhookResult) => {
    await repo.updateWebhookOutcome(provider.id, event.eventId, r.outcome);
    return r;
  };

  const order = await repo.getOrder(event.orderId);
  if (!order) return finish({ status: 422, outcome: "unknown_order" });
  if (event.currency !== "AOA" || event.amountKz !== order.totalKz) {
    return finish({ status: 422, outcome: "amount_mismatch" });
  }

  if (event.status === "paid") {
    if (order.status === "paid") return finish({ status: 200, outcome: "already_paid" });
    if (order.status !== "pending") return finish({ status: 409, outcome: "invalid_transition" });
    await repo.setOrderStatus(order.id, "paid", event.providerReference);
    await repo.grantEntitlements(order.id, order.items.map((i) => i.productId));
    return finish({ status: 200, outcome: "paid" });
  }
  if (event.status === "refunded") {
    await repo.setOrderStatus(order.id, "refunded", event.providerReference);
    await repo.revokeEntitlements(order.id);
    return finish({ status: 200, outcome: "refunded" });
  }
  if (order.status === "pending") await repo.setOrderStatus(order.id, event.status, event.providerReference);
  return finish({ status: 200, outcome: event.status });
}

// ---------- downloads ----------
export async function getDownloadUrl(
  repo: FunnelRepo, input: { orderId: string; accessToken: string; productId: string },
): Promise<string> {
  const order = await authorizeOrder(repo, input.orderId, input.accessToken);
  if (order.status !== "paid") throw new FunnelError("not_paid", "O pagamento ainda não foi confirmado.");
  if (!order.items.some((i) => i.productId === input.productId)) throw new FunnelError("forbidden", "Produto não incluído no pedido.");
  if (!(await repo.hasEntitlement(order.id, input.productId))) throw new FunnelError("forbidden", "Acesso não concedido.");
  const [product] = await repo.getProducts([input.productId]);
  if (!product?.storagePath) throw new FunnelError("not_ready", "Ficheiro ainda não disponível.");
  const url = await repo.createSignedUrl(product.storagePath, 300);
  await repo.logDelivery(order.id, input.productId);
  return url;
}
