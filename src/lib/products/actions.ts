import { createClient, createAdminClient } from '@/lib/supabase/server'

export interface Fragrance {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

export interface ProductWholesaleTier {
  id: string
  product_id: string
  min_total_qty: number
  price_per_unit: number
  wholesale_price: number
}

export interface ProductWithVariants {
  id: string
  name: string
  slug: string
  description: string | null
  retail_price: number
  wholesale_price: number
  image_url: string | null
  is_pack: boolean
  pack_slots: number
  is_active: boolean
  is_wholesale_only: boolean
  is_exact_total: boolean
  min_qty_per_variant: number
  min_total_qty?: number
  category_id: string
  categories: {
    id: string
    name: string
    slug: string
  }
  product_variants: Array<{
    id: string
    fragrance_id: string
    image_url: string | null
    is_active: boolean
    fragrances: Fragrance
  }>
  wholesale_tiers: ProductWholesaleTier[]
  wholesale_category?: string
}

export type WholesaleProduct = ProductWithVariants

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

export interface UserProfile {
  role: string
  is_verified_wholesaler: boolean
}

export async function getProducts(categorySlug?: string, includeWholesale: boolean = false): Promise<ProductWithVariants[]> {
  const supabase = createAdminClient()
  
  if (includeWholesale) {
    let query = supabase
      .from('wholesale_products')
      .select(`
        *,
        categories:category_id (*)
      `)

    if (categorySlug) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
      if (cat) query = query.eq('category_id', (cat as any).id)
    }

    const { data, error } = await query.order('name')
    if (error) return []

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

  // Purest query for retail - ensuring no silent fail on joins
  let query = supabase
    .from('products')
    .select(`
      *,
      categories:category_id (*),
      product_variants:product_variants (
        *,
        fragrances:fragrance_id (*)
      ),
      wholesale_tiers:wholesale_tiers!product_id (*)
    `)

  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
    if (cat) query = query.eq('category_id', (cat as any).id)
  }

  const { data, error } = await query.order('name')
  if (error) {
    console.error('getProducts error:', error)
    // Absolute fallback
    const { data: simple } = await supabase.from('products').select('*')
    return (simple ?? []).map(p => ({ ...p, categories: { name: 'Varios' }, product_variants: [] })) as any
  }

  return (data ?? []).map((p: any) => ({
    ...p,
    is_wholesale_only: false,
    is_exact_total: false
  })) as ProductWithVariants[]
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  const supabase = createAdminClient()
  
  // Try retail first
  const { data: retail, error: rError } = await supabase
    .from('products')
    .select(`
      *,
      categories:category_id (*),
      product_variants:product_variants (
        *,
        fragrances:fragrance_id (*)
      ),
      wholesale_tiers:wholesale_tiers!product_id (*)
    `)
    .eq('slug', slug)
    .single()

  if (retail) {
    return {
      ...(retail as any),
      is_exact_total: false
    } as any
  }

  if (rError) {
    console.error('getProductBySlug retail error:', rError)
    // Fallback search to ensure we find it
    const { data: simple } = await supabase.from('products').select('*, categories:category_id(*)').eq('slug', slug).single()
    if (simple) return { ...simple, product_variants: [], is_exact_total: false } as any
  }

  // Try wholesale next
  const { data: wholesale } = await supabase
    .from('wholesale_products')
    .select(`
      *,
      categories:category_id (*)
    `)
    .eq('slug', slug)
    .single()

  if (wholesale) {
     const w = wholesale as any
     const { data: tiers } = await supabase
       .from('wholesale_tiers')
       .select('*')
       .eq('product_id', w.id)
       .order('min_total_qty', { ascending: true })

     const { data: fragrances } = await supabase
       .from('fragrances')
       .select('*')
       .eq('is_active', true)
       .order('name')

     const syntheticVariants = (fragrances || []).map((f: any) => ({
       id: f.id,
       fragrance_id: f.id,
       image_url: null,
       is_active: true,
       fragrances: f
     }))

     return {
       ...w,
       is_pack: true,
       pack_slots: w.min_total_qty || 100,
       is_wholesale_only: true,
       is_exact_total: w.is_exact_total || false,
       product_variants: syntheticVariants,
       wholesale_tiers: tiers || [],
       wholesale_price: w.wholesale_price,
       min_qty_per_variant: w.min_qty_per_variant || 1
     } as any
  }

  return null
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) return []
  return data
}

export async function getWholesaleProducts(): Promise<WholesaleProduct[]> {
  return getProducts(undefined, true)
}

export async function getFragrances(): Promise<Fragrance[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('fragrances')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (error) return []
  return data
}
