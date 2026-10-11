import { describe, expect, it } from "vitest";
import {
  computeTotal, createMainOrder, createOfferOrder, getDownloadUrl, processWebhook,
  type FunnelRepo, type Order, type PaymentProvider, type Product, type VerifiedPaymentEvent,
} from "@/lib/funnel/core";

function memRepo(products: Product[]) {
  const orders = new Map<string, Order>();
  const events = new Set<string>();
  const ents = new Set<string>();
  let n = 0;
  const repo: FunnelRepo = {
    async getProducts(ids) { return products.filter((p) => ids.includes(p.id)); },
    async insertOrder(o) { const id = `00000000-0000-0000-0000-00000000000${++n}`; orders.set(id, { ...o, id, status: "pending" }); return id; },
    async getOrder(id) { return orders.get(id) ?? null; },
    async recordWebhookEvent(e) { const k = `${e.provider}:${e.eventId}`; if (events.has(k)) return false; events.add(k); return true; },
    async updateWebhookOutcome() {},
    async setOrderStatus(id, s) { orders.get(id)!.status = s; },
    async grantEntitlements(id, pids) { pids.forEach((p) => ents.add(`${id}:${p}`)); },
    async revokeEntitlements() {},
    async hasEntitlement(id, p) { return ents.has(`${id}:${p}`); },
    async createSignedUrl(path) { return `https://signed/${path}`; },
    async logDelivery() {},
  };
  return { repo, orders };
}

const catalogue: Product[] = [
  { id: "main-ebook", kind: "main", priceKz: 2850, active: true, storagePath: "main.pdf" },
  { id: "order-bump", kind: "order_bump", priceKz: 1500, active: true, storagePath: "bump.pdf" },
  { id: "upsell", kind: "upsell", priceKz: 4900, active: true, storagePath: null },
  { id: "downsell", kind: "downsell", priceKz: 2500, active: true, storagePath: null },
];

const provider = (event: VerifiedPaymentEvent | null): PaymentProvider => ({ id: "test", configured: true, verifyWebhook: async () => event });

describe("funnel", () => {
  it("computes order bump totals in integer Kz", () => {
    expect(computeTotal([catalogue[0]]).totalKz).toBe(2850);
    expect(computeTotal([catalogue[0], catalogue[1]]).totalKz).toBe(4350);
    expect(() => computeTotal([{ ...catalogue[1], priceKz: null }])).toThrow();
  });

  it("is idempotent for duplicate webhooks", async () => {
    const { repo } = memRepo(catalogue);
    const o = await createMainOrder(repo, { email: "a@b.co", name: null, includeBump: true });
    const ev = { eventId: "evt1", orderId: o.orderId, status: "paid" as const, amountKz: 4350, currency: "AOA", providerReference: "r" };
    expect((await processWebhook(repo, provider(ev), "{}", new Headers())).outcome).toBe("paid");
    expect((await processWebhook(repo, provider(ev), "{}", new Headers())).outcome).toBe("duplicate");
  });

  it("rejects invalid signatures and unconfigured providers", async () => {
    const { repo } = memRepo(catalogue);
    expect((await processWebhook(repo, provider(null), "{}", new Headers())).status).toBe(401);
    expect((await processWebhook(repo, { ...provider(null), configured: false }, "{}", new Headers())).status).toBe(503);
  });

  it("rejects amount mismatch without changing status", async () => {
    const { repo, orders } = memRepo(catalogue);
    const o = await createMainOrder(repo, { email: "a@b.co", name: null, includeBump: false });
    const r = await processWebhook(repo, provider({ eventId: "e2", orderId: o.orderId, status: "paid", amountKz: 100, currency: "AOA", providerReference: "r" }), "{}", new Headers());
    expect(r.outcome).toBe("amount_mismatch");
    expect(orders.get(o.orderId)!.status).toBe("pending");
  });

  it("denies download for unpaid orders", async () => {
    const { repo } = memRepo(catalogue);
    const o = await createMainOrder(repo, { email: "a@b.co", name: null, includeBump: false });
    await expect(getDownloadUrl(repo, { orderId: o.orderId, accessToken: o.accessToken, productId: "main-ebook" })).rejects.toThrow(/não foi confirmado/);
  });

  it("creates upsell/downsell as separate pending orders", async () => {
    const { repo, orders } = memRepo(catalogue);
    const main = await createMainOrder(repo, { email: "a@b.co", name: null, includeBump: false });
    const up = await createOfferOrder(repo, { parentOrderId: main.orderId, accessToken: main.accessToken, offer: "upsell", email: "a@b.co" });
    const down = await createOfferOrder(repo, { parentOrderId: main.orderId, accessToken: main.accessToken, offer: "downsell", email: "a@b.co" });
    for (const r of [up, down]) {
      expect(r.orderId).not.toBe(main.orderId);
      expect(orders.get(r.orderId)!.status).toBe("pending");
      expect(orders.get(r.orderId)!.parentOrderId).toBe(main.orderId);
    }
    await expect(createOfferOrder(repo, { parentOrderId: main.orderId, accessToken: "0".repeat(64), offer: "upsell", email: "a@b.co" })).rejects.toThrow();
  });
});
