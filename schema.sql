-- LAS FLORES DE PLUTÓN - INITIAL DATABASE SCHEMA
-- Execute this in the Supabase SQL Editor

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'customer', 'wholesaler');
CREATE TYPE order_status AS ENUM ('pending', 'producing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled');
CREATE TYPE order_type AS ENUM ('retail', 'wholesale');

-- 3. TABLES

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'customer' NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  is_verified_wholesaler BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fragrances
CREATE TABLE IF NOT EXISTS public.fragrances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  retail_price DECIMAL(10,2) NOT NULL,
  wholesale_price DECIMAL(10,2) NOT NULL,
  wholesale_min_qty INTEGER DEFAULT 1, -- Min qty of THIS product for wholesale
  is_active BOOLEAN DEFAULT TRUE,
  is_pack BOOLEAN DEFAULT FALSE,      -- Unique logic for pack selection
  pack_slots INTEGER DEFAULT 0,       -- How many fragrance choices in pack
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Variants (M:N Products to Fragrances)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  fragrance_id UUID REFERENCES public.fragrances(id) ON DELETE CASCADE,
  stock INTEGER DEFAULT 0,
  image_url TEXT, -- The "Sándalo in Sahumerio" vs "Sándalo in Conito" photo
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(product_id, fragrance_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  status order_status DEFAULT 'pending' NOT NULL,
  type order_type NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  shipping_address JSONB,
  shipping_method TEXT,
  scheduled_dispatch_date DATE, -- SLA Logic (2 days vs 10 days)
  payment_id TEXT,             -- Mercado Pago Ref
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id), -- Nullable if it's a pack
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  selected_fragrances JSONB, -- For Packs: list of fragrance_ids chosen
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fragrances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Profiles: Users see own, Admin sees all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Products/Fragrances/Variants: Publicly readable
CREATE POLICY "Public read products" ON public.products FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO public USING (true);
CREATE POLICY "Public read fragrances" ON public.fragrances FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Public read variants" ON public.product_variants FOR SELECT TO public USING (is_active = true);

-- Orders: Users view own, Admin view all
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. TRIGGER FOR NEW USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
