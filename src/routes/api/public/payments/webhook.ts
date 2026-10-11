import { createFileRoute } from "@tanstack/react-router";
import { processWebhook } from "@/lib/funnel/core";

// Payment-provider webhook. The ONLY path that can mark an order paid.
// Browser redirects/navigation are never accepted as proof of payment.
export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        if (rawBody.length > 100_000) return Response.json({ error: "payload_too_large" }, { status: 413 });
        const { getSupabaseRepo } = await import("@/lib/funnel/repo.server");
        const { getPaymentProvider } = await import("@/lib/funnel/payment-provider.server");
        const result = await processWebhook(await getSupabaseRepo(), getPaymentProvider(), rawBody, request.headers);
        return Response.json({ outcome: result.outcome }, { status: result.status });
      },
    },
  },
});
