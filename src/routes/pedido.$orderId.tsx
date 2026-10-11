import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatKz, offers } from "@/lib/funnel/offers";
import { getOrderStatus, requestDownload } from "@/lib/funnel/funnel.functions";
import { loadOrder } from "@/lib/funnel/order-session";

export const Route = createFileRoute("/pedido/$orderId")({
  head: () => ({ meta: [
    { title: "Estado do pedido — O Segredo para Viralizar no TikTok" },
    { name: "description", content: "Consulta o estado do teu pedido." },
    { property: "og:title", content: "Estado do pedido" },
    { property: "og:description", content: "Consulta o estado do teu pedido." },
    { name: "robots", content: "noindex" },
  ] }),
  ssr: false,
  component: OrderPage,
});

const statusLabel = { pending: "Pagamento pendente", paid: "Pago", failed: "Pagamento falhou", cancelled: "Cancelado", refunded: "Reembolsado" } as const;

function OrderPage() {
  const { orderId } = Route.useParams();
  const [stored, setStored] = useState<ReturnType<typeof loadOrder>>(null);
  useEffect(() => setStored(loadOrder(orderId)), [orderId]);
  const fetchStatus = useServerFn(getOrderStatus);
  const download = useServerFn(requestDownload);
  const q = useQuery({
    queryKey: ["order", orderId, stored?.token],
    enabled: !!stored,
    queryFn: () => fetchStatus({ data: { orderId, accessToken: stored!.token } }),
  });
  const [dlError, setDlError] = useState<string | null>(null);

  if (!stored) return <Shell><p className="body-copy">Não encontrámos este pedido nesta sessão do navegador.</p></Shell>;
  if (q.isLoading) return <Shell><p className="body-copy">A carregar…</p></Shell>;
  if (q.error || !q.data) return <Shell><p className="funnel-error">Pedido não encontrado.</p></Shell>;
  const o = q.data;

  return (
    <Shell>
      <div className="funnel-card">
        <p className="funnel-status" data-status={o.status}>{statusLabel[o.status]}</p>
        <p className="current-price">{formatKz(o.totalKz)}</p>
        {o.status === "pending" && <p className="body-copy">O pedido foi registado, mas o pagamento online ainda não está ativo. Nenhum valor foi cobrado e o acesso só é libertado após confirmação do pagamento pelo fornecedor.</p>}
        {o.status === "paid" && o.productIds.map((pid) => (
          <Button key={pid} variant="purchase" size="sales" onClick={async () => {
            setDlError(null);
            try { const r = await download({ data: { orderId, accessToken: stored.token, productId: pid } }); window.location.href = r.url; }
            catch (e) { setDlError(e instanceof Error ? e.message : "Erro"); }
          }}>DESCARREGAR: {offers[pid as keyof typeof offers]?.name ?? pid}</Button>
        ))}
        {dlError && <p className="funnel-error">{dlError}</p>}
        {o.kind === "main" && <Button variant="presentation" size="sales" asChild><Link to="/oferta/$orderId" params={{ orderId }} search={{ tipo: "upsell" }}>VER OFERTA ESPECIAL</Link></Button>}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="section funnel-page"><div className="page-container offer-content"><p className="eyebrow justify-center">O TEU PEDIDO</p>{children}</div></main>;
}
