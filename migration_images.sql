-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION: Add image_url to products table
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Also add a gallery array for multiple general photos
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';

-- Site settings table for logo and other config
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.site_settings (key, value)
VALUES ('logo_url', null)
ON CONFLICT (key) DO NOTHING;

-- RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
  ON public.site_settings FOR SELECT TO public USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_settings'
    AND policyname = 'Admins can update site settings'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can update site settings"
      ON public.site_settings FOR UPDATE TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = ''admin'')
      )';
  END IF;
END $$;

-- Storage bucket for brand assets (logo, etc)
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand', 'brand', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Public read brand assets'
  ) THEN
    EXECUTE 'CREATE POLICY "Public read brand assets"
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = ''brand'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Admins manage brand assets'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins manage brand assets"
      ON storage.objects FOR ALL TO authenticated
      USING (
        bucket_id = ''brand'' AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = ''admin'')
      )
      WITH CHECK (
        bucket_id = ''brand'' AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = ''admin'')
      )';
  END IF;
END $$;
