import type { FunnelRepo, Order, OrderStatus, Product } from "./core";

export async function getSupabaseRepo(): Promise<FunnelRepo> {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");

  const getOrder = async (id: string): Promise<Order | null> => {
    const { data, error } = await db
      .from("orders")
      .select("id, parent_order_id, kind, status, total_kz, access_token_hash, order_items(product_id, unit_price_kz, quantity)")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id, parentOrderId: data.parent_order_id, kind: data.kind, status: data.status,
      totalKz: data.total_kz, currency: "AOA", accessTokenHash: data.access_token_hash,
      items: (data.order_items ?? []).map((i) => ({ productId: i.product_id, unitPriceKz: i.unit_price_kz, quantity: i.quantity })),
    };
  };

  return {
    async getProducts(ids) {
      const { data, error } = await db.from("products").select("id, kind, price_kz, active, storage_path").in("id", ids);
      if (error) throw error;
      return (data ?? []).map((p): Product => ({ id: p.id, kind: p.kind, priceKz: p.price_kz, active: p.active, storagePath: p.storage_path }));
    },
    async insertOrder(o) {
      const { data, error } = await db.from("orders").insert({
        parent_order_id: o.parentOrderId, kind: o.kind, total_kz: o.totalKz, currency: o.currency,
        access_token_hash: o.accessTokenHash, customer_email: o.customerEmail, customer_name: o.customerName,
      }).select("id").single();
      if (error) throw error;
      const { error: itemsError } = await db.from("order_items").insert(
        o.items.map((i) => ({ order_id: data.id, product_id: i.productId, unit_price_kz: i.unitPriceKz, quantity: i.quantity })),
      );
      if (itemsError) throw itemsError;
      return data.id;
    },
    getOrder,
    async recordWebhookEvent(e) {
      const { error } = await db.from("webhook_events").insert({
        provider: e.provider, provider_event_id: e.eventId, order_id: e.orderId, outcome: e.outcome, payload: e.payload as never,
      });
      if (error?.code === "23505") return false;
      if (error) throw error;
      return true;
    },
    async updateWebhookOutcome(provider, eventId, outcome) {
      await db.from("webhook_events").update({ outcome }).eq("provider", provider).eq("provider_event_id", eventId);
    },
    async setOrderStatus(orderId, status: OrderStatus, ref) {
      const { error } = await db.from("orders").update({
        status, provider_reference: ref, updated_at: new Date().toISOString(),
        ...(status === "paid" ? { paid_at: new Date().toISOString() } : {}),
      }).eq("id", orderId);
      if (error) throw error;
    },
    async grantEntitlements(orderId, productIds) {
      const { error } = await db.from("entitlements").upsert(
        productIds.map((product_id) => ({ order_id: orderId, product_id })), { onConflict: "order_id,product_id", ignoreDuplicates: true },
      );
      if (error) throw error;
    },
    async revokeEntitlements(orderId) {
      await db.from("entitlements").update({ revoked_at: new Date().toISOString() }).eq("order_id", orderId);
    },
    async hasEntitlement(orderId, productId) {
      const { data } = await db.from("entitlements").select("id").eq("order_id", orderId).eq("product_id", productId).is("revoked_at", null).maybeSingle();
      return !!data;
    },
    async createSignedUrl(path, expires) {
      const { data, error } = await db.storage.from("ebooks").createSignedUrl(path, expires);
      if (error || !data) throw new Error("Ficheiro indisponível.");
      return data.signedUrl;
    },
    async logDelivery(orderId, productId) {
      const { data } = await db.from("entitlements").select("id").eq("order_id", orderId).eq("product_id", productId).maybeSingle();
      if (data) await db.from("deliveries").insert({ entitlement_id: data.id });
    },
  };
}
