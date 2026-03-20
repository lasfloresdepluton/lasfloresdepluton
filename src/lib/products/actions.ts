'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

export type ProductWithVariants = Database['public']['Tables']['products']['Row'] & {
  categories: { name: string; slug: string } | null
  product_variants: (Database['public']['Tables']['product_variants']['Row'] & {
    fragrances: Database['public']['Tables']['fragrances']['Row'] | null
  })[]
  wholesale_tiers: ProductWholesaleTier[]
  is_wholesale_only: boolean
  is_exact_total: boolean
  wholesale_category: string | null
  min_qty_per_variant: number
  image_url?: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

export interface Fragrance {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

export interface UserProfile {
  role: string
  is_verified_wholesaler: boolean
}

export async function getProducts(categorySlug?: string, includeWholesale: boolean = false): Promise<ProductWithVariants[]> {
  const supabase = await createClient()

  if (includeWholesale) {
    // Fetch from wholesale_products
    let query = supabase
      .from('wholesale_products')
      .select(`
        *,
        categories ( id, name, slug )
      `)
      .eq('is_active', true)

    if (categorySlug) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
      if (cat) query = query.eq('category_id', (cat as any).id)
    }

    const { data, error } = await query.order('name')
    if (error) return []

    // Map to ProductWithVariants format
    return (data || []).map((p: any) => ({
      ...p,
      product_variants: [],
      wholesale_tiers: [],
      is_wholesale_only: true,
      is_exact_total: p.is_exact_total || false,
      wholesale_category: p.wholesale_category,
      min_qty_per_variant: p.min_qty_per_variant,
    })) as any[]
  }

  // Regular retail products
  let query = supabase
    .from('products')
    .select(`
      *,
      categories ( name, slug ),
      product_variants (
        *,
        fragrances ( * )
      ),
      wholesale_tiers ( * )
    `)
    .eq('is_active', true)
    .or('is_wholesale_only.eq.false,is_wholesale_only.is.null') // Retail only (includes null)

  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
    if (cat) query = query.eq('category_id', (cat as any).id)
  }

  const { data, error } = await query.order('name')
  if (error) return []
  return (data ?? []).map((p: any) => ({
    ...p,
    is_exact_total: false
  })) as ProductWithVariants[]
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  const supabase = await createClient()
  
  // Try retail first
  const { data: retail, error: retailErr } = await supabase
    .from('products')
    .select(`
      *,
      categories ( name, slug ),
      product_variants (
        *,
        fragrances ( * )
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (retail) {
    return {
      ...(retail as any),
      is_exact_total: false
    } as any
  }

  // Try wholesale next
  const { data: wholesale, error: wholesaleErr } = await supabase
    .from('wholesale_products')
    .select(`
      *,
      categories ( name, slug )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (wholesale) {
    const w = wholesale as any;
    const [tiersRes, fragrancesRes] = await Promise.all([
      supabase.from('wholesale_tiers').select('*').eq('product_id', w.id).order('min_total_qty', { ascending: true }),
      supabase.from('fragrances').select('*').eq('is_active', true).order('name')
    ])

    const cleanName = w.name
      .replace(' (Wholesale)', '')
      .replace(' (Unitario)', '')
      .replace(' (Pack 100/500)', '')

    return {
      ...w,
      name: cleanName,
      is_pack: true, // Wholesale in this table are always customized packs/selections
      pack_slots: w.min_total_qty || 100, // Default to 100 or its minimum
      product_variants: (fragrancesRes.data || []).map((f: any) => ({
        id: f.id,
        fragrance_id: f.id,
        product_id: w.id,
        is_active: true,
        image_url: w.image_url,
        fragrances: f,
        stock: 999
      })),
      wholesale_tiers: (tiersRes.data || []).map((t: any) => ({
        id: t.id,
        product_id: t.product_id,
        min_total_qty: t.min_total_qty,
        wholesale_price: t.price_per_unit || t.wholesale_price,
      })),
      is_wholesale_only: true,
      is_exact_total: w.is_exact_total || false,
      wholesale_category: w.wholesale_category,
      min_qty_per_variant: w.min_qty_per_variant,
    } as ProductWithVariants
  }

  return null
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('*').order('name')
  return (data ?? []) as Category[]
}

export async function getFragrances(): Promise<Fragrance[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('fragrances')
    .select('*')
    .eq('is_active', true)
    .order('name')
  return (data ?? []) as Fragrance[]
}

export async function getUserRole(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('role, is_verified_wholesaler')
    .eq('id', userId)
    .single()
  return data as UserProfile | null
}

// ── WHOLESALE TIERS ──────────────────────────────────────────────────────────

export interface ProductWholesaleTier {
  id: string
  product_id: string
  min_total_qty: number
  wholesale_price: number
  fixed_total_price: number | null
  unit_price: number | null
  label: string | null
}

export interface WholesaleProduct {
  id: string
  name: string
  slug: string
  description: string | null
  retail_price: number
  wholesale_price: number
  min_qty_per_variant: number
  wholesale_category: string | null
  image_url: string | null
  category_id: string | null
  min_total_qty: number
  is_exact_total: boolean
}


export async function getWholesaleProducts(): Promise<WholesaleProduct[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('wholesale_products')
    .select('*, categories(name)')
    .eq('is_active', true)
    .order('name')
  
  if (error) {
    console.error('Error fetching wholesale products:', error)
    return []
  }
  return data as WholesaleProduct[]
}

export async function getWholesaleTiers(productId: string): Promise<ProductWholesaleTier[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('wholesale_tiers')
    .select('*')
    .eq('product_id', productId)
    .order('min_total_qty', { ascending: true })
  return (data ?? []) as ProductWholesaleTier[]
}
