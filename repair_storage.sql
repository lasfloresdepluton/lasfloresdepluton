-- ═══════════════════════════════════════════════════════════════════════════
-- REPARACIÓN DE STORAGE - LAS FLORES DE PLUTÓN
-- Copiá y pegá TODO este script en el SQL EDITOR de Supabase para arreglar
-- el error de "Bucket not found" y habilitar las subidas.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. CREAR BUCKETS (si no existen)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('brand', 'brand', true)
ON CONFLICT (id) DO UPDATE SET public = true;


-- 2. POLÍTICAS PARA EL BUCKET 'products'
DO $$
BEGIN
  -- Lectura pública
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Public read product images'
  ) THEN
    CREATE POLICY "Public read product images" ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'products');
  END IF;

  -- Gestión total para Admins
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Admins manage products'
  ) THEN
    CREATE POLICY "Admins manage products" ON storage.objects FOR ALL TO authenticated
    USING (
      bucket_id = 'products' AND
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
      bucket_id = 'products' AND
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;


-- 3. POLÍTICAS PARA EL BUCKET 'brand' (Logo, etc)
DO $$
BEGIN
  -- Lectura pública
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Public read brand assets'
  ) THEN
    CREATE POLICY "Public read brand assets" ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'brand');
  END IF;

  -- Gestión total para Admins
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Admins manage brand'
  ) THEN
    CREATE POLICY "Admins manage brand" ON storage.objects FOR ALL TO authenticated
    USING (
      bucket_id = 'brand' AND
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
      bucket_id = 'brand' AND
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ LISTO. Intentá subir el logo o una foto nuevamente.
-- ═══════════════════════════════════════════════════════════════════════════
