import { ShoppingBag } from "lucide-react";

export type ConfirmedPurchase = {
  id: string;
  displayName?: string;
  confirmedAt: string;
};

// The caller must supply an authorized, confirmed payment event.
// No event is supplied until a payment integration is connected.
export function PurchaseNotification({ purchase }: { purchase?: ConfirmedPurchase }) {
  if (!purchase) return null;
  return (
    <div className="purchase-notification" role="status">
      <ShoppingBag size={20} aria-hidden="true" />
      <p>{purchase.displayName ? `${purchase.displayName} adquiriu O Segredo para Viralizar no TikTok.` : "Nova compra do guia digital!"}</p>
    </div>
  );
}