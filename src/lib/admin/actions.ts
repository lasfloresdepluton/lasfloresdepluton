'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── USERS / WHOLESALERS ─────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  full_name: string | null
  phone: string | null
  city: string | null
  postal_code: string | null
  role: string
  is_verified_wholesaler: boolean
  created_at: string
}

export async function getUsers(): Promise<AdminUser[]> {
  const supabase = createAdminClient()
  const { data } = await (supabase.from('profiles') as any)
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as AdminUser[]
}

export async function approveWholesaler(userId: string) {
  const supabase = createAdminClient()
  await (supabase.from('profiles') as any)
    .update({ role: 'wholesaler', is_verified_wholesaler: true })
    .eq('id', userId)
  revalidatePath('/admin/usuarios')
  return { ok: true }
}

export async function revokeWholesaler(userId: string) {
  const supabase = createAdminClient()
  await (supabase.from('profiles') as any)
    .update({ role: 'customer', is_verified_wholesaler: false })
    .eq('id', userId)
  revalidatePath('/admin/usuarios')
  return { ok: true }
}

export async function setUserRole(userId: string, role: string) {
  const supabase = createAdminClient()
  await (supabase.from('profiles') as any).update({ role }).eq('id', userId)
  revalidatePath('/admin/usuarios')
  return { ok: true }
}

// ── ORDERS ──────────────────────────────────────────────────────────────────

export interface AdminOrder {
  id: string
  status: string
  type: string
  total_amount: number
  shipping_cost: number
  shipping_method: string | null
  shipping_address: Record<string, string> | null
  scheduled_dispatch_date: string | null
  created_at: string
  notes: string | null
  profiles: { full_name: string | null; phone: string | null } | null
}

export async function getOrders(status?: string): Promise<AdminOrder[]> {
  const supabase = createAdminClient()
  let query = (supabase.from('orders') as any)
    .select('*, profiles ( full_name, phone )')
    .order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)
  const { data } = await query
  return (data ?? []) as AdminOrder[]
}

export async function updateOrderStatus(orderId: string, status: string, notes?: string) {
  const supabase = createAdminClient()
  const updates: Record<string, string> = { status }
  if (notes) updates.notes = notes
  await (supabase.from('orders') as any).update(updates).eq('id', orderId)
  revalidatePath('/admin/pedidos')
  return { ok: true }
}

// ── CATEGORIES ────────────────────────────────────────────────────────────────

export interface AdminCategory {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const supabase = createAdminClient()
  const { data } = await (supabase.from('categories') as any).select('*').order('name')
  return (data ?? []) as AdminCategory[]
}

export async function createCategory(data: { name: string; slug: string; description?: string }) {
  const supabase = createAdminClient()
  const { data: created, error } = await (supabase.from('categories') as any)
    .insert(data)
    .select()
    .single()
  revalidatePath('/admin/productos')
  return { ok: !error, data: created, error: error?.message }
}

export async function updateCategoryImageUrl(categoryId: string, imageUrl: string | null) {
  const supabase = createAdminClient()
  const { error } = await (supabase.from('categories') as any)
    .update({ image_url: imageUrl })
    .eq('id', categoryId)
  revalidatePath('/admin/configuracion')
  revalidatePath('/')
  return { ok: !error, error: error?.message }
}

// ── PRODUCTS ─────────────────────────────────────────────────────────────────

export interface AdminProduct {
  id: string
  name: string
  slug: string
  description: string | null
  retail_price: number
  wholesale_price: number
  wholesale_min_qty: number
  is_active: boolean
  is_pack: boolean
  pack_slots: number
  category_id: string | null
  categories: { name: string } | null
  created_at: string
  is_wholesale_only: boolean
  wholesale_category: string | null
  min_qty_per_variant: number
}

export interface AdminVariant {
  id: string
  product_id: string
  fragrance_id: string
  stock: number
  image_url: string | null
  is_active: boolean
  fragrances: { id: string; name: string } | null
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const supabase = createAdminClient()
  const { data } = await (supabase.from('products') as any)
    .select('*, categories(name)')
    .order('name')
  return (data ?? []) as AdminProduct[]
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const supabase = createAdminClient()
  const { data } = await (supabase.from('products') as any)
    .select('*, categories(name)')
    .eq('id', id)
    .single()
  return data as AdminProduct | null
}

export async function getProductVariants(productId: string): Promise<AdminVariant[]> {
  const supabase = createAdminClient()
  const { data } = await (supabase.from('product_variants') as any)
    .select('*, fragrances(id, name)')
    .eq('product_id', productId)
    .order('fragrances(name)')
  return (data ?? []) as AdminVariant[]
}

export async function createProduct(input: {
  name: string
  slug: string
  description?: string
  retail_price: number
  wholesale_price: number
  wholesale_min_qty?: number
  category_id?: string
  is_pack?: boolean
  pack_slots?: number
  is_wholesale_only?: boolean
  wholesale_category?: string
  min_qty_per_variant?: number
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = createAdminClient()
  const { data, error } = await (supabase.from('products') as any)
    .insert({ ...input, is_active: true })
    .select('id')
    .single()
  revalidatePath('/admin/productos')
  revalidatePath('/productos')
  return { ok: !error, id: data?.id, error: error?.message }
}

export async function updateProduct(id: string, input: Partial<{
  name: string
  slug: string
  description: string
  retail_price: number
  wholesale_price: number
  wholesale_min_qty: number
  category_id: string
  is_pack: boolean
  pack_slots: number
  is_active: boolean
  image_url: string | null
  gallery_urls: string[]
  is_wholesale_only: boolean
  wholesale_category: string | null
  min_qty_per_variant: number
}>) {
  const supabase = createAdminClient()
  const { error } = await (supabase.from('products') as any).update(input).eq('id', id)
  revalidatePath('/admin/productos')
  revalidatePath('/productos')
  return { ok: !error, error: error?.message }
}

export async function updateProductImages(
  productId: string,
  imageUrl: string | null,
  galleryUrls?: string[]
) {
  return updateProduct(productId, {
    image_url: imageUrl,
    ...(galleryUrls !== undefined ? { gallery_urls: galleryUrls } : {}),
  })
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  return updateProduct(productId, { is_active: isActive })
}

// ── LOGO / SITE SETTINGS ──────────────────────────────────────────────────────

export async function getLogo(): Promise<string | null> {
  const supabase = createAdminClient()
  const { data } = await (supabase.from('site_settings') as any)
    .select('value')
    .eq('key', 'logo_url')
    .single()
  return data?.value ?? null
}

export async function setLogo(url: string) {
  const supabase = createAdminClient()
  await (supabase.from('site_settings') as any)
    .upsert({ key: 'logo_url', value: url })
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function getSiteSettings(): Promise<Record<string, string>> {
  const supabase = createAdminClient()
  const { data } = await (supabase.from('site_settings') as any).select('*')
  const settings: Record<string, string> = {}
  data?.forEach((s: any) => {
    settings[s.key] = s.value
  })
  return settings
}

export async function updateSiteSetting(key: string, value: string) {
  const supabase = createAdminClient()
  await (supabase.from('site_settings') as any).upsert({ key, value })
  revalidatePath('/')
  return { ok: true }
}


// ── PRODUCT VARIANTS ──────────────────────────────────────────────────────────

export async function upsertVariant(input: {
  product_id: string
  fragrance_id: string
  stock: number
  image_url?: string | null
  is_active?: boolean
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = createAdminClient()
  const { data, error } = await (supabase.from('product_variants') as any)
    .upsert(input, { onConflict: 'product_id,fragrance_id' })
    .select('id')
    .single()
  revalidatePath('/admin/productos')
  revalidatePath('/productos')
  return { ok: !error, id: data?.id, error: error?.message }
}

export async function bulkUpsertVariants(
  productId: string,
  fragranceIds: string[]
): Promise<{ ok: boolean; created: number; error?: string }> {
  const supabase = createAdminClient()
  const rows = fragranceIds.map((fragrance_id) => ({
    product_id: productId,
    fragrance_id,
    stock: 0,
    is_active: true,
  }))
  const { data, error } = await (supabase.from('product_variants') as any)
    .upsert(rows, { onConflict: 'product_id,fragrance_id', ignoreDuplicates: true })
    .select('id')
  revalidatePath('/admin/productos')
  revalidatePath('/productos')
  return { ok: !error, created: data?.length ?? 0, error: error?.message }
}


export async function updateVariantImage(variantId: string, imageUrl: string | null) {
  const supabase = createAdminClient()
  const { error } = await (supabase.from('product_variants') as any)
    .update({ image_url: imageUrl })
    .eq('id', variantId)
  revalidatePath('/admin/productos')
  revalidatePath('/productos')
  return { ok: !error, error: error?.message }
}

export async function updateVariantStock(variantId: string, stock: number) {
  const supabase = createAdminClient()
  await (supabase.from('product_variants') as any)
    .update({ stock })
    .eq('id', variantId)
  revalidatePath('/admin/productos')
  return { ok: true }
}

export async function toggleVariantActive(variantId: string, isActive: boolean) {
  const supabase = createAdminClient()
  await (supabase.from('product_variants') as any)
    .update({ is_active: isActive })
    .eq('id', variantId)
  revalidatePath('/admin/productos')
  return { ok: true }
}

export async function deleteVariant(variantId: string) {
  const supabase = createAdminClient()
  await (supabase.from('product_variants') as any).delete().eq('id', variantId)
  revalidatePath('/admin/productos')
  return { ok: true }
}

// ── FRAGRANCES ────────────────────────────────────────────────────────────────

export interface AdminFragrance {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

export async function getAdminFragrances(): Promise<AdminFragrance[]> {
  const supabase = createAdminClient()
  const { data } = await (supabase.from('fragrances') as any).select('*').order('name')
  return (data ?? []) as AdminFragrance[]
}

export async function createFragrance(name: string, description?: string) {
  const supabase = createAdminClient()
  const { error } = await (supabase.from('fragrances') as any)
    .insert({ name, description: description ?? null, is_active: true })
  revalidatePath('/admin/fragancias')
  return { ok: !error, error: error?.message }
}

export async function toggleFragranceActive(fragranceId: string, isActive: boolean) {
  const supabase = createAdminClient()
  await (supabase.from('fragrances') as any).update({ is_active: isActive }).eq('id', fragranceId)
  revalidatePath('/admin/fragancias')
  return { ok: true }
}

export async function updateFragranceName(fragranceId: string, name: string) {
  const supabase = createAdminClient()
  const { error } = await (supabase.from('fragrances') as any)
    .update({ name: name.trim() })
    .eq('id', fragranceId)
  revalidatePath('/admin/fragancias')
  return { ok: !error, error: error?.message }
}

export async function deleteFragrance(fragranceId: string) {
  const supabase = createAdminClient()
  // This will cascade-delete product_variants that reference this fragrance
  const { error } = await (supabase.from('fragrances') as any)
    .delete()
    .eq('id', fragranceId)
  revalidatePath('/admin/fragancias')
  revalidatePath('/admin/productos')
  return { ok: !error, error: error?.message }
}


// ── STORAGE / IMAGES ──────────────────────────────────────────────────────────

export async function getStorageUploadUrl(fileName: string, contentType: string) {
  const supabase = createAdminClient()
  const path = `variants/${Date.now()}_${fileName}`
  const { data, error } = await supabase.storage
    .from('products')
    .createSignedUploadUrl(path)
  return { ok: !error, signedUrl: data?.signedUrl, path, token: data?.token, error: error?.message }
}

export async function getPublicImageUrl(path: string): Promise<string> {
  const supabase = createAdminClient()
  const { data } = supabase.storage.from('products').getPublicUrl(path)
  return data.publicUrl
}

// ── DASHBOARD STATS ────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const supabase = createAdminClient()
  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalUsers },
    { count: pendingWholesalers },
  ] = await Promise.all([
    (supabase.from('orders') as any).select('*', { count: 'exact', head: true }),
    (supabase.from('orders') as any).select('*', { count: 'exact', head: true }).in('status', ['pending', 'producing']),
    (supabase.from('profiles') as any).select('*', { count: 'exact', head: true }),
    (supabase.from('profiles') as any).select('*', { count: 'exact', head: true }).eq('role', 'customer').eq('is_verified_wholesaler', false),
  ])
  return {
    totalOrders: totalOrders ?? 0,
    pendingOrders: pendingOrders ?? 0,
    totalUsers: totalUsers ?? 0,
    pendingWholesalers: pendingWholesalers ?? 0,
  }
}

// ── WHOLESALE TIERS ──────────────────────────────────────────────────────────

export interface WholesaleTier {
  id: string
  product_id: string
  min_total_qty: number
  fixed_total_price: number | null
  unit_price: number | null
  label: string | null
}

export async function getWholesaleTiers(productId: string): Promise<WholesaleTier[]> {
  const supabase = createAdminClient()
  const { data } = await (supabase.from('wholesale_tiers') as any)
    .select('*')
    .eq('product_id', productId)
    .order('min_total_qty', { ascending: true })
  return data ?? []
}

export async function upsertWholesaleTier(input: Partial<WholesaleTier>) {
  const supabase = createAdminClient()
  const { error } = await (supabase.from('wholesale_tiers') as any).upsert(input)
  revalidatePath('/admin/productos/[id]')
  return { ok: !error, error: error?.message }
}

export async function deleteWholesaleTier(id: string) {
  const supabase = createAdminClient()
  const { error } = await (supabase.from('wholesale_tiers') as any).delete().eq('id', id)
  return { ok: !error, error: error?.message }
}
