import type { PaymentProvider } from "./core";

export const UNCONFIGURED_MESSAGE =
  "O pagamento online ainda não está ativo. O pedido ficou registado como pendente e nenhum valor foi cobrado.";

/**
 * Selects the payment provider from env vars (server-only):
 *   PAYMENT_PROVIDER          e.g. "TODO_PROVIDER_NAME"
 *   PAYMENT_PROVIDER_API_KEY  provider API credential
 *   PAYMENT_WEBHOOK_SECRET    provider webhook signing secret
 *
 * No real provider is implemented yet. When the gateway is activated, add an
 * adapter here that implements `verifyWebhook` with the provider's OFFICIAL
 * signature verification (per its docs) and a `createPayment` call.
 * Until then this always returns the unconfigured adapter, which rejects all webhooks.
 */
export function getPaymentProvider(): PaymentProvider & { createPaymentMessage: string } {
  const name = process.env["PAYMENT_PROVIDER"];
  if (name) console.warn(`[payments] PAYMENT_PROVIDER=${name} set but no adapter is implemented.`);
  return {
    id: "unconfigured",
    configured: false,
    createPaymentMessage: UNCONFIGURED_MESSAGE,
    async verifyWebhook() {
      return null;
    },
  };
}
