// Editable funnel catalogue. Prices are integer AOA (Kz).
// TODO(owner): supply real names, content and prices for bump/upsell/downsell.
// An offer with priceKz === null is NOT purchasable and is hidden/disabled in the UI.
// Keep these values in sync with the `products` table (server reads prices from the DB).
export type OfferId = "main-ebook" | "order-bump" | "upsell" | "downsell";

export type Offer = {
  id: OfferId;
  kind: "main" | "order_bump" | "upsell" | "downsell";
  name: string;
  description: string;
  priceKz: number | null;
};

export const offers: Record<OfferId, Offer> = {
  "main-ebook": {
    id: "main-ebook",
    kind: "main",
    name: "O Segredo para Viralizar no TikTok",
    description: "Guia digital (eBook).",
    priceKz: 2850,
  },
  "order-bump": {
    id: "order-bump",
    kind: "order_bump",
    name: "TODO: nome do order bump",
    description: "TODO: descrição do order bump.",
    priceKz: null,
  },
  upsell: {
    id: "upsell",
    kind: "upsell",
    name: "TODO: nome do upsell",
    description: "TODO: descrição do upsell.",
    priceKz: null,
  },
  downsell: {
    id: "downsell",
    kind: "downsell",
    name: "TODO: nome do downsell",
    description: "TODO: descrição do downsell.",
    priceKz: null,
  },
};

export function formatKz(value: number) {
  return `${value.toLocaleString("pt-PT").replace(/\s/g, ".")} Kz`;
}
