import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { FunnelError, authorizeOrder, createMainOrder, createOfferOrder, getDownloadUrl } from "./core";

const tokenSchema = z.string().regex(/^[0-9a-f]{64}$/);

function safe(e: unknown): never {
  if (e instanceof FunnelError) throw new Error(e.message);
  console.error(e);
  throw new Error("Não foi possível concluir o pedido. Tenta novamente.");
}

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    email: z.string().trim().email().max(255),
    name: z.string().trim().max(100).optional(),
    includeBump: z.boolean(),
  }).parse(d))
  .handler(async ({ data }) => {
    try {
      const { getSupabaseRepo } = await import("./repo.server");
      const { getPaymentProvider } = await import("./payment-provider.server");
      const result = await createMainOrder(await getSupabaseRepo(), { email: data.email, name: data.name || null, includeBump: data.includeBump });
      return { ...result, paymentMessage: getPaymentProvider().createPaymentMessage };
    } catch (e) { safe(e); }
  });

export const acceptOffer = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    parentOrderId: z.string().uuid(), accessToken: tokenSchema,
    offer: z.enum(["upsell", "downsell"]), email: z.string().trim().email().max(255),
  }).parse(d))
  .handler(async ({ data }) => {
    try {
      const { getSupabaseRepo } = await import("./repo.server");
      const { getPaymentProvider } = await import("./payment-provider.server");
      const result = await createOfferOrder(await getSupabaseRepo(), data);
      return { ...result, paymentMessage: getPaymentProvider().createPaymentMessage };
    } catch (e) { safe(e); }
  });

export const getOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ orderId: z.string().uuid(), accessToken: tokenSchema }).parse(d))
  .handler(async ({ data }) => {
    try {
      const { getSupabaseRepo } = await import("./repo.server");
      const o = await authorizeOrder(await getSupabaseRepo(), data.orderId, data.accessToken);
      return { id: o.id, kind: o.kind, status: o.status, totalKz: o.totalKz, productIds: o.items.map((i) => i.productId) };
    } catch (e) { safe(e); }
  });

export const requestDownload = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ orderId: z.string().uuid(), accessToken: tokenSchema, productId: z.string().max(50) }).parse(d))
  .handler(async ({ data }) => {
    try {
      const { getSupabaseRepo } = await import("./repo.server");
      return { url: await getDownloadUrl(await getSupabaseRepo(), data) };
    } catch (e) { safe(e); }
  });
