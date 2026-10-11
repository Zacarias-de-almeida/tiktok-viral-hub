<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the sales experience on the index route with in-page anchors, because this project requires one continuous sales page.
- Centralize the checkout address and product pricing in `src/lib/sales-config.ts`, so every purchase link uses the same official destination.
- Keep simulated presentation state separate from purchase notifications; purchase notifications require authorized confirmed payment events and render nothing without one.
- Define visual styling in the global semantic design system and use Button variants for sales actions, to keep the page consistent.
- Funnel logic lives in `src/lib/funnel/core.ts` with an injectable repository; only the provider webhook may mark orders paid, because browser navigation is not proof of payment.
- Funnel tables are service-role only (RLS on, no public policies) and ebooks are served via short-lived signed URLs from a private bucket.
- Checkout/order/offer pages are separate routes (exception to the single sales page rule) and stay unlinked from the sales page until the gateway is live.
