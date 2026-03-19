'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

export type ProductWithVariants = Database['public']['Tables']['products']['Row'] & {
  categories: { name: string; slug: string } | null
  product_variants: (Database['public']['Tables']['product_variants']['Row'] & {
    fragrances: Database['public']['Tables']['fragrances']['Row'] | null
  })[]
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

  let query = supabase
    .from('products')
    .select(`
      *,
      categories ( name, slug ),
      product_variants (
        *,
        fragrances ( * )
      )
    `)
    .eq('is_active', true)

  if (!includeWholesale) {
    query = query.eq('is_wholesale_only', false)
  }

  query = query.order('name')

  if (categorySlug) {
    // Filter by category slug via join
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    if (cat) {
      query = query.eq('category_id', (cat as { id: string }).id)
    }
  }

  const { data, error } = await query
  if (error) {
    console.error('getProducts error:', error)
    return []
  }
  return (data ?? []) as ProductWithVariants[]
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
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

  if (error || !data) return null
  return data as ProductWithVariants
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
