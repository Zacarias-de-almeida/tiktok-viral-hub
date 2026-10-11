import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { formatKz, offers } from "@/lib/funnel/offers";
import { acceptOffer } from "@/lib/funnel/funnel.functions";
import { loadOrder, saveOrder } from "@/lib/funnel/order-session";

export const Route = createFileRoute("/oferta/$orderId")({
  validateSearch: z.object({ tipo: z.enum(["upsell", "downsell"]).catch("upsell") }),
  head: () => ({ meta: [
    { title: "Oferta especial — O Segredo para Viralizar no TikTok" },
    { name: "description", content: "Uma oferta complementar ao teu pedido." },
    { property: "og:title", content: "Oferta especial" },
    { property: "og:description", content: "Uma oferta complementar ao teu pedido." },
    { name: "robots", content: "noindex" },
  ] }),
  ssr: false,
  component: OfferPage,
});

function OfferPage() {
  const { orderId } = Route.useParams();
  const { tipo } = Route.useSearch();
  const offer = offers[tipo];
  const available = offer.priceKz !== null;
  const navigate = useNavigate();
  const accept = useServerFn(acceptOffer);
  const [stored, setStored] = useState<ReturnType<typeof loadOrder>>(null);
  useEffect(() => setStored(loadOrder(orderId)), [orderId]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const decline = () => tipo === "upsell"
    ? navigate({ to: "/oferta/$orderId", params: { orderId }, search: { tipo: "downsell" } })
    : navigate({ to: "/pedido/$orderId", params: { orderId } });

  async function onAccept() {
    if (!stored) return;
    setBusy(true); setError(null);
    try {
      const r = await accept({ data: { parentOrderId: orderId, accessToken: stored.token, offer: tipo, email: stored.email } });
      saveOrder(r.orderId, { token: r.accessToken, email: stored.email });
      navigate({ to: "/pedido/$orderId", params: { orderId: r.orderId } });
    } catch (e) { setError(e instanceof Error ? e.message : "Erro"); setBusy(false); }
  }

  return (
    <main className="section funnel-page"><div className="page-container offer-content">
      <p className="eyebrow justify-center">{tipo === "upsell" ? "OFERTA ESPECIAL" : "ÚLTIMA OPORTUNIDADE"}</p>
      <h1 className="section-heading">{offer.name}</h1>
      <p className="body-copy">{offer.description}</p>
      <p className="current-price">{available ? formatKz(offer.priceKz!) : "Preço por definir"}</p>
      {!stored && <p className="funnel-error">Pedido original não encontrado nesta sessão.</p>}
      {error && <p className="funnel-error" role="alert">{error}</p>}
      <div className="funnel-actions">
        <Button variant="purchase" size="sales" disabled={!available || !stored || busy} onClick={onAccept}>{busy ? "A CRIAR PEDIDO…" : "SIM, QUERO ADICIONAR"}</Button>
        <Button variant="presentation" size="sales" onClick={decline}>NÃO, OBRIGADO</Button>
      </div>
      <p className="checkout-note">Aceitar cria um pedido separado, pendente até o fornecedor de pagamentos confirmar.</p>
      <p className="disclaimer"><Link to="/pedido/$orderId" params={{ orderId }}>Voltar ao pedido</Link></p>
    </div></main>
  );
}
