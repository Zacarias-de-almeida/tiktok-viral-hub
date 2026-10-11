CREATE TYPE public.order_status AS ENUM ('pending','paid','failed','cancelled','refunded');
CREATE TYPE public.offer_kind AS ENUM ('main','order_bump','upsell','downsell');

CREATE TABLE public.products (
  id text PRIMARY KEY,
  kind public.offer_kind NOT NULL,
  name text NOT NULL,
  price_kz integer CHECK (price_kz IS NULL OR price_kz > 0),
  currency text NOT NULL DEFAULT 'AOA' CHECK (currency = 'AOA'),
  storage_path text,
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_order_id uuid REFERENCES public.orders(id),
  kind public.offer_kind NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  customer_email text NOT NULL,
  customer_name text,
  total_kz integer NOT NULL CHECK (total_kz > 0),
  currency text NOT NULL DEFAULT 'AOA' CHECK (currency = 'AOA'),
  access_token_hash text NOT NULL,
  provider text,
  provider_reference text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.products(id),
  unit_price_kz integer NOT NULL CHECK (unit_price_kz > 0),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  UNIQUE (order_id, product_id)
);
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.payment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_payment_id text,
  idempotency_key text NOT NULL UNIQUE,
  amount_kz integer NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_payment_id)
);
GRANT ALL ON public.payment_attempts TO service_role;
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  order_id uuid REFERENCES public.orders(id),
  outcome text NOT NULL,
  payload jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_event_id)
);
GRANT ALL ON public.webhook_events TO service_role;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.products(id),
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE (order_id, product_id)
);
GRANT ALL ON public.entitlements TO service_role;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entitlement_id uuid NOT NULL REFERENCES public.entitlements(id) ON DELETE CASCADE,
  delivered_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.deliveries TO service_role;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Intentionally no policies for anon/authenticated: all access goes through server code.

INSERT INTO public.products (id, kind, name, price_kz, storage_path, active) VALUES
  ('main-ebook', 'main', 'O Segredo para Viralizar no TikTok', 2850, 'main-ebook.pdf', true),
  ('order-bump', 'order_bump', 'TODO: nome do order bump', NULL, NULL, false),
  ('upsell', 'upsell', 'TODO: nome do upsell', NULL, NULL, false),
  ('downsell', 'downsell', 'TODO: nome do downsell', NULL, NULL, false);