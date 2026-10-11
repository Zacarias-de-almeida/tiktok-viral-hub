# Funnel & payments — setup checklist

Status: foundation only. **The payment gateway is NOT active. No real payment works yet.**
The live sales page still links to the existing Kursinha checkout (`src/lib/sales-config.ts`).

## Implemented
- Database (Lovable Cloud): `products`, `orders`, `order_items`, `payment_attempts`, `webhook_events`
  (unique provider+event id), `entitlements`, `deliveries`. Amounts are integer AOA Kz. Statuses: pending/paid/failed/cancelled/refunded.
  RLS on, no public policies: only server code (service role) reads/writes.
- Private storage bucket `ebooks` (no public access). Downloads use 5-minute signed links, only for paid orders whose items include the product.
- `/checkout` (optional order bump, accurate totals, creates a pending order server-side), `/pedido/$orderId`, `/oferta/$orderId?tipo=upsell|downsell`.
  Upsell/downsell create separate pending orders. Navigation never grants access.
- Payment adapter `src/lib/funnel/payment-provider.server.ts`: always UNCONFIGURED.
- Webhook `POST /api/public/payments/webhook`: rejects when unconfigured (503) or invalid signature (401); idempotent; checks amount/currency/order; logs event ids.
- Tests: `src/test/funnel.test.ts`.

## Still required (manual)
1. Activate the gateway and choose the provider.
2. Fill TODO names/prices for bump/upsell/downsell in `src/lib/funnel/offers.ts` AND the `products` table (set `active = true`).
3. Implement the provider adapter (create payment + official webhook signature verification from the provider's docs).
4. Add secrets in Project Settings → Secrets: `PAYMENT_PROVIDER`, `PAYMENT_PROVIDER_API_KEY`, `PAYMENT_WEBHOOK_SECRET`.
5. Configure the webhook URL in the provider: `https://<published-domain>/api/public/payments/webhook`.
6. Upload the eBook PDF to the `ebooks` bucket as `main-ebook.pdf`.
7. Set `funnelCheckoutEnabled` / repoint sales buttons to `/checkout` only after steps 1–6.
8. Run an end-to-end test with a real sandbox payment.
9. Admin order view: not built — requires staff sign-in and roles first.
