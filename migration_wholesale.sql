-- 1. Actualizar tabla de Productos para mayoristas
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_wholesale_only BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS wholesale_category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS min_qty_per_variant INTEGER DEFAULT 1;

-- 2. Tabla para Escalas de Precios Mayoristas (Ej: 100u -> $14000)
CREATE TABLE IF NOT EXISTS public.wholesale_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  min_total_qty INTEGER NOT NULL, -- Ej: 100
  fixed_total_price DECIMAL(10,2), -- Ej: 14000 (total de la promo)
  unit_price DECIMAL(10,2),        -- Ej: 140 (si no hay precio fijo total)
  label TEXT,                      -- Ej: "Pack 100 Sahumerios"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, min_total_qty)
);

-- 3. Habilitar RLS en la nueva tabla
ALTER TABLE public.wholesale_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read wholesale_tiers" ON public.wholesale_tiers FOR SELECT TO public USING (true);
CREATE POLICY "Admin manage wholesale_tiers" ON public.wholesale_tiers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Asegurar que site_settings tiene el mínimo de orden mayorista
INSERT INTO public.site_settings (key, value) 
VALUES ('wholesale_min_order_amount', '50000') 
ON CONFLICT (key) DO NOTHING;
