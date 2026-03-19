-- ═══════════════════════════════════════════════════════════════════════════
-- LAS FLORES DE PLUTÓN — SEED COMPLETO
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. STORAGE BUCKET ───────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (usando DO block para evitar error si ya existen)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Public read product images'
  ) THEN
    EXECUTE 'CREATE POLICY "Public read product images"
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = ''products'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Admins upload product images'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins upload product images"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = ''products'' AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = ''admin'')
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Admins update product images'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins update product images"
      ON storage.objects FOR UPDATE TO authenticated
      USING (
        bucket_id = ''products'' AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = ''admin'')
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Admins delete product images'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins delete product images"
      ON storage.objects FOR DELETE TO authenticated
      USING (
        bucket_id = ''products'' AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = ''admin'')
      )';
  END IF;
END $$;

-- ── 2. CATEGORIES ───────────────────────────────────────────────────────────
INSERT INTO public.categories (name, slug, description) VALUES
  ('Sahumerios', 'sahumerios', 'Sahumerios artesanales tradicionales'),
  ('Línea Eco & Tibetana', 'eco-tibetana', 'Ecosahumerios y sahumerios tibetanos naturales'),
  ('Especialidades', 'especialidades', 'Conitos cascada, bombas de defumación y más'),
  ('Defumación', 'defumacion', 'Bombas, canastitas y sahumos de defumación'),
  ('Palo Santo', 'palo-santo', 'Palo Santo artesanal')
ON CONFLICT (slug) DO NOTHING;

-- ── 3. FRAGRANCES ───────────────────────────────────────────────────────────
INSERT INTO public.fragrances (name, is_active) VALUES
  ('Sándalo', true),
  ('Lavanda', true),
  ('Rosa', true),
  ('Jazmín', true),
  ('Mirra', true),
  ('Incienso', true),
  ('Nag Champa', true),
  ('Pachulí', true),
  ('Canela', true),
  ('Naranja', true),
  ('Limón', true),
  ('Bergamota', true),
  ('Vainilla', true),
  ('Cedro', true),
  ('Eucalipto', true),
  ('Menta', true),
  ('Ruda', true),
  ('Flores de Loto', true),
  ('Bambu', true),
  ('Ylang Ylang', true),
  ('Romero', true),
  ('Verbena', true),
  ('Coco', true),
  ('Almizcle', true),
  ('Ámbar', true),
  ('Siete Potencias', true),
  ('Sagrada Familia', true),
  ('Lluvia', true),
  ('Pino', true),
  ('Clavel', true)
ON CONFLICT (name) DO NOTHING;

-- ── 4. PRODUCTS ──────────────────────────────────────────────────────────────
-- Precios basados en listas minorista y mayorista reales

INSERT INTO public.products
  (name, slug, description, retail_price, wholesale_price, wholesale_min_qty,
   is_active, is_pack, pack_slots, category_id)
VALUES
  -- SAHUMERIOS (minorista: 10u=$3.000 / mayorista: 100u=$14.000 → $140/u)
  ('Sahumerios x10', 'sahumerios-x10',
   'Pack de 10 sahumerios artesanales. Elegí las fragancias que quieras.',
   3000, 1400, 10, true, true, 10,
   (SELECT id FROM public.categories WHERE slug = 'sahumerios')),

  ('Sahumerios x20', 'sahumerios-x20',
   'Pack de 20 sahumerios artesanales. Combiná hasta 20 fragancias distintas.',
   5500, 2800, 10, true, true, 20,
   (SELECT id FROM public.categories WHERE slug = 'sahumerios')),

  ('Sahumerios x30', 'sahumerios-x30',
   'Pack de 30 sahumerios artesanales. Personalizá cada fragancia.',
   8500, 4200, 10, true, true, 30,
   (SELECT id FROM public.categories WHERE slug = 'sahumerios')),

  -- ECO SAHUMERIOS (minorista: 6u=$3.500 / mayorista: $325/u mín 18)
  ('Eco Sahumerios x6', 'eco-sahumerios-x6',
   'Pack de 6 ecosahumerios artesanales, elaborados con materiales naturales.',
   3500, 1950, 18, true, true, 6,
   (SELECT id FROM public.categories WHERE slug = 'eco-tibetana')),

  ('Eco Sahumerios x12', 'eco-sahumerios-x12',
   'Pack de 12 ecosahumerios artesanales línea natural.',
   6000, 3900, 18, true, true, 12,
   (SELECT id FROM public.categories WHERE slug = 'eco-tibetana')),

  -- TIBETANOS (minorista: 5u=$2.500 / mayorista: $315/u mín 18)
  ('Tibetanos x5', 'tibetanos-x5',
   'Pack de 5 sahumerios tibetanos artesanales.',
   2500, 1575, 18, true, true, 5,
   (SELECT id FROM public.categories WHERE slug = 'eco-tibetana')),

  ('Tibetanos x8', 'tibetanos-x8',
   'Pack de 8 sahumerios tibetanos artesanales.',
   3500, 2520, 18, true, true, 8,
   (SELECT id FROM public.categories WHERE slug = 'eco-tibetana')),

  -- CONITOS CASCADA (minorista: 10u=$2.500 / mayorista: 50u=$6.000 → $120/u)
  ('Conitos Cascada x10', 'conitos-cascada-x10',
   'Pack de 10 conos para fuente cascada de humo. Efecto visual espectacular.',
   2500, 1200, 50, true, true, 10,
   (SELECT id FROM public.categories WHERE slug = 'especialidades')),

  ('Conitos Cascada x25', 'conitos-cascada-x25',
   'Pack de 25 conos para fuente cascada de humo.',
   5000, 3000, 50, true, true, 25,
   (SELECT id FROM public.categories WHERE slug = 'especialidades')),

  -- BOMBAS DE DEFUMACIÓN (minorista: 4u=$2.500 / mayorista: $300/u mín 16)
  ('Bombas de Defumación x4', 'bombas-defumacion-x4',
   '4 bombas de defumación artesanales para limpieza energética.',
   2500, 1200, 16, true, true, 4,
   (SELECT id FROM public.categories WHERE slug = 'defumacion')),

  ('Bombas de Defumación x10', 'bombas-defumacion-x10',
   '10 bombas de defumación artesanales.',
   5000, 3000, 16, true, true, 10,
   (SELECT id FROM public.categories WHERE slug = 'defumacion')),

  -- CANASTITAS (minorista: 1u=$1.000 / 4u=$3.000)
  ('Canastita de Defumación', 'canastita-defumacion',
   'Canastita artesanal de defumación, rellena de hierbas naturales.',
   1000, 600, 4, true, false, 0,
   (SELECT id FROM public.categories WHERE slug = 'defumacion')),

  ('Canastitas de Defumación x4', 'canastitas-defumacion-x4',
   'Pack de 4 canastitas artesanales de defumación.',
   3000, 2000, 4, true, false, 0,
   (SELECT id FROM public.categories WHERE slug = 'defumacion')),

  -- SAHUMO MAYA (minorista: 1u=$1.000 / mayorista: $400/u mín 5)
  ('Sahumo Maya', 'sahumo-maya',
   'Sahumo Maya artesanal, elaborado con resinas e hierbas de tradición maya.',
   1000, 400, 5, true, false, 0,
   (SELECT id FROM public.categories WHERE slug = 'especialidades')),

  ('Sahumo Maya x3', 'sahumo-maya-x3',
   'Pack de 3 Sahumos Maya artesanales.',
   2500, 1200, 5, true, false, 0,
   (SELECT id FROM public.categories WHERE slug = 'especialidades')),

  -- SAHUMO HERBAL (minorista: 1u=$5.000 / mayorista: $2.000/u mín 5)
  ('Sahumo Herbal', 'sahumo-herbal',
   'Sahumo Herbal artesanal con hierbas naturales seleccionadas para defumar.',
   5000, 2000, 5, true, false, 0,
   (SELECT id FROM public.categories WHERE slug = 'especialidades')),

  -- PALO SANTO (minorista: 1u=$3.000)
  ('Palo Santo', 'palo-santo',
   'Palo Santo artesanal, madera sagrada de los Andes para limpieza energética.',
   3000, 1500, 5, true, false, 0,
   (SELECT id FROM public.categories WHERE slug = 'palo-santo'))

ON CONFLICT (slug) DO NOTHING;

-- ── 5. VARIANTES (fragancias por producto) ───────────────────────────────────

-- Sahumerios clásicos: todas las 30 fragancias
INSERT INTO public.product_variants (product_id, fragrance_id, stock, is_active)
SELECT p.id, f.id, 0, true
FROM public.products p
CROSS JOIN public.fragrances f
WHERE p.slug IN ('sahumerios-x10', 'sahumerios-x20', 'sahumerios-x30')
ON CONFLICT (product_id, fragrance_id) DO NOTHING;

-- Eco Sahumerios: primeras 12 fragancias (por orden alfabético)
INSERT INTO public.product_variants (product_id, fragrance_id, stock, is_active)
SELECT p.id, f.id, 0, true
FROM public.products p
CROSS JOIN (
  SELECT id FROM public.fragrances WHERE is_active = true ORDER BY name LIMIT 12
) f
WHERE p.slug IN ('eco-sahumerios-x6', 'eco-sahumerios-x12')
ON CONFLICT (product_id, fragrance_id) DO NOTHING;

-- Tibetanos: primeras 8 fragancias
INSERT INTO public.product_variants (product_id, fragrance_id, stock, is_active)
SELECT p.id, f.id, 0, true
FROM public.products p
CROSS JOIN (
  SELECT id FROM public.fragrances WHERE is_active = true ORDER BY name LIMIT 8
) f
WHERE p.slug IN ('tibetanos-x5', 'tibetanos-x8')
ON CONFLICT (product_id, fragrance_id) DO NOTHING;

-- Conitos Cascada: primeras 8 fragancias
INSERT INTO public.product_variants (product_id, fragrance_id, stock, is_active)
SELECT p.id, f.id, 0, true
FROM public.products p
CROSS JOIN (
  SELECT id FROM public.fragrances WHERE is_active = true ORDER BY name LIMIT 8
) f
WHERE p.slug IN ('conitos-cascada-x10', 'conitos-cascada-x25')
ON CONFLICT (product_id, fragrance_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ LISTO. Luego de correr este script:
--   1. Ir a /admin/productos → "Editar" en cada producto para subir fotos
--   2. Si las fragancias exactas son distintas, ajustarlas en /admin/fragancias
-- ═══════════════════════════════════════════════════════════════════════════
