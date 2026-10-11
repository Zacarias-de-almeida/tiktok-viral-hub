import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { offers, formatKz } from "@/lib/funnel/offers";
import { createOrder } from "@/lib/funnel/funnel.functions";
import { saveOrder } from "@/lib/funnel/order-session";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [
    { title: "Checkout — O Segredo para Viralizar no TikTok" },
    { name: "description", content: "Finaliza o teu pedido do guia digital O Segredo para Viralizar no TikTok." },
    { property: "og:title", content: "Checkout — O Segredo para Viralizar no TikTok" },
    { property: "og:description", content: "Finaliza o teu pedido do guia digital." },
    { name: "robots", content: "noindex" },
  ] }),
  component: Checkout,
});

function Checkout() {
  const main = offers["main-ebook"];
  const bump = offers["order-bump"];
  const bumpAvailable = bump.priceKz !== null;
  const [includeBump, setIncludeBump] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const create = useServerFn(createOrder);
  const navigate = useNavigate();
  const total = (main.priceKz ?? 0) + (includeBump && bump.priceKz ? bump.priceKz : 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const r = await create({ data: { email, name, includeBump: includeBump && bumpAvailable } });
      saveOrder(r.orderId, { token: r.accessToken, email });
      navigate({ to: "/pedido/$orderId", params: { orderId: r.orderId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setBusy(false);
    }
  }

  return (
    <main className="section funnel-page"><div className="page-container offer-content">
      <p className="eyebrow justify-center">CHECKOUT</p>
      <h1 className="section-heading">{main.name}</h1>
      <form onSubmit={submit} className="funnel-card">
        <label className="funnel-field">Email<input type="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="funnel-field">Nome (opcional)<input maxLength={100} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className={`funnel-bump ${bumpAvailable ? "" : "is-disabled"}`}>
          <input type="checkbox" disabled={!bumpAvailable} checked={includeBump} onChange={(e) => setIncludeBump(e.target.checked)} />
          <span><strong>{bump.name}</strong> — {bumpAvailable ? formatKz(bump.priceKz!) : "preço por definir"}<br /><small>{bump.description}</small></span>
        </label>
        <dl className="funnel-totals">
          <div><dt>{main.name}</dt><dd>{formatKz(main.priceKz!)}</dd></div>
          {includeBump && bump.priceKz && <div><dt>{bump.name}</dt><dd>{formatKz(bump.priceKz)}</dd></div>}
          <div className="is-total"><dt>Total</dt><dd>{formatKz(total)}</dd></div>
        </dl>
        {error && <p className="funnel-error" role="alert">{error}</p>}
        <Button type="submit" variant="purchase" size="sales" disabled={busy}>{busy ? "A CRIAR PEDIDO…" : `CRIAR PEDIDO — ${formatKz(total).toUpperCase()}`}</Button>
        <p className="checkout-note"><LockKeyhole size={12} />O pagamento online ainda não está ativo; o pedido fica pendente e nada é cobrado.</p>
      </form>
    </div></main>
  );
}
