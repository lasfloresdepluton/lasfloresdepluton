'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CreditCard, ShoppingCart, Edit2, Sparkles, Wand2, PlusCircle, CheckCircle2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils/helpers'
import { createBrowserClient } from '@supabase/ssr'
import CartEditModal from '@/components/shop/CartEditModal'
import type { ProductWithVariants } from '@/lib/products/actions'

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, replaceItem, addItem, clearCart, is_wholesale } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [upsellProducts, setUpsellProducts] = useState<any[]>([])
  
  // Modal for adding NEW products from upsell
  const [quickAddSlug, setQuickAddSlug] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // Fetch upselling products (Based on current profile)
    async function loadUpsell() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Query table based on wholesale status
      // NOTE: Retail uses 'products', Wholesale uses 'wholesale_products' 
      const table = is_wholesale ? 'wholesale_products' : 'products'
      
      const { data } = await supabase
        .from(table)
        .select(`
          *,
          categories:category_id (id, name, slug),
          product_variants:product_variants (
            id, fragrance_id, image_url, is_active,
            fragrances:fragrance_id (*)
          )
        `)
        .eq('is_active', true)
        .limit(4)

      if (data) {
        // Find existing IDs to avoid recommending what's already in cart
        const inCartIds = items.map(i => i.product_id)
        const filtered = data.filter((p: any) => !inCartIds.includes(p.id))
        setUpsellProducts(filtered)
      }
    }
    loadUpsell()
  }, [is_wholesale, items])

  const currentEditingItem = useMemo(() => {
    return items.find(i => i.id === editingItem) || null
  }, [items, editingItem])

  const handleSaveEdit = (newCounts: Record<string, number>, totalQty: number, totalPrice: number) => {
    if (!currentEditingItem) return

    const selectedFragrances = Object.entries(newCounts).map(([fid, qty]) => {
      // Find from existing item or we preserve name from existing one
      const oldF = currentEditingItem.selected_fragrances?.find(f => (f.id === fid || (f as any).fragrance_id === fid))
      return {
        id: fid,
        name: oldF?.name || 'Fragancia',
        quantity: qty
      }
    })

    replaceItem(currentEditingItem.id, {
      ...currentEditingItem,
      selected_fragrances: selectedFragrances,
      quantity: 1,
      unit_price: totalPrice,
      pack_size: totalQty
    })

    setEditingItem(null)
  }

  const handleQuickAddItem = (product: any, counts: Record<string, number>, totalQty: number, totalPrice: number) => {
    const selectedFragrances = Object.entries(counts).map(([fid, qty]) => ({
      id: fid,
      name: product.product_variants?.find((v: any) => v.fragrance_id === fid || v.id === fid)?.fragrances?.name || 'Fragancia',
      quantity: qty
    }))

    addItem({
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      image_url: product.image_url || undefined,
      quantity: 1,
      unit_price: totalPrice,
      is_pack: true,
      pack_size: totalQty,
      selected_fragrances: selectedFragrances
    })

    setQuickAddSlug(null)
  }

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in zoom-in-95">
        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-6xl shadow-inner relative overflow-hidden group">
           <span className="relative z-10">🛒</span>
           <div className="absolute inset-0 bg-teal-50 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900">Tu carrito está vacío</h1>
          <p className="text-gray-500 max-w-xs mx-auto text-sm">¡Parece que aún no has elegido nada! Te invitamos a ver nuestros productos artesanales.</p>
        </div>
        <Link 
          href="/productos" 
          className="bg-gray-900 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest hover:bg-teal-600 transition-all active:scale-95 shadow-xl shadow-gray-200"
        >
          Explorar Productos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-16">
        
        {/* ITEMS LIST */}
        <div className="flex-1 space-y-10">
          <div className="flex justify-between items-end pb-6 border-b border-gray-100">
            <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Tu Pedido</h1>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                {is_wholesale ? 'Acceso Mayorista' : 'Acceso Minorista'}
              </p>
            </div>
            <button 
              onClick={clearCart}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} className="group-hover:rotate-12 transition-transform" />
              Vaciar
            </button>
          </div>

          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-6 md:p-8 rounded-[3rem] border border-gray-50 shadow-sm flex flex-col md:flex-row gap-8 group hover:shadow-xl hover:border-teal-50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-teal-500/0 group-hover:bg-teal-500/100 transition-all" />

                {/* Image */}
                <div className="relative w-full md:w-44 aspect-square rounded-[2rem] overflow-hidden bg-gray-50 flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">🌿</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-teal-500">
                          {item.is_pack ? `PACK ${item.pack_size}u` : 'PRODUCTO'}
                        </p>
                        <h3 className="text-2xl font-black text-gray-900 leading-tight">{item.product_name}</h3>
                      </div>
                      <div className="flex gap-2">
                        {/* THE EDIT BUTTON - NOW ALWAYS VISIBLE IF ID EXISTS */}
                        {(item.product_slug || item.product_id) && (
                          <button 
                            onClick={() => setEditingItem(item.id)}
                            className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all font-bold text-xs"
                            title="Editar surtido"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Eliminar ítem"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {item.is_pack && item.selected_fragrances && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.selected_fragrances.map((f, idx) => (
                          <div key={idx} className="bg-gray-50 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-gray-100/50">
                            <span className="text-[10px] font-black text-gray-400">{f.quantity}x</span>
                            <span className="text-[11px] font-bold text-gray-600">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-10">
                    <div className="flex items-center gap-6 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 hover:text-gray-900 hover:shadow-md transition-all active:scale-90"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="text-lg font-black text-gray-900 w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 hover:text-gray-900 hover:shadow-md transition-all active:scale-90"
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Subtotal ítem</p>
                      <p className="text-3xl font-black text-teal-600 tracking-tighter">{formatPrice(item.unit_price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* UPSELLING SECTION */}
          {upsellProducts.length > 0 && (
            <div className="pt-20 space-y-8">
               <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-gray-900 whitespace-nowrap">Completa tu {is_wholesale ? 'Stock' : 'Ritual'}</h3>
                  <div className="h-px bg-gray-100 flex-1" />
               </div>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {upsellProducts.map(p => {
                    const displayPrice = is_wholesale ? (p.wholesale_price || p.retail_price) : (p.retail_price || p.wholesale_price)
                    return (
                      <div key={p.id} className="group flex flex-col items-center text-center space-y-4">
                         <Link href={`/productos/${p.slug}`} className="relative w-full aspect-square rounded-[2rem] overflow-hidden bg-gray-50 shadow-sm border border-gray-100 group-hover:shadow-lg transition-all">
                            {p.image_url ? <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>}
                         </Link>
                         <div className="flex-1 w-full px-2">
                            <p className="text-[9px] font-black uppercase text-teal-600 tracking-widest mb-1">
                               {p.categories?.name || (is_wholesale ? 'Mayorista' : 'Retail')}
                            </p>
                            <h4 className="text-xs font-black text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">{p.name}</h4>
                            <p className="text-[10px] font-bold text-gray-400">
                               {displayPrice ? formatPrice(displayPrice) : 'Consultar'}
                            </p>
                         </div>
                         <button 
                           onClick={() => setQuickAddSlug(p.slug)}
                           className="w-full py-3 rounded-2xl bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 active:scale-95 transition-all flex items-center justify-center gap-2 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                         >
                            <PlusCircle size={14} /> Añadir rápido
                         </button>
                      </div>
                    )
                  })}
               </div>
            </div>
          )}

          <Link href="/productos" className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-300 hover:text-teal-600 transition-all hover:translate-x-[-4px]">
            <ArrowLeft size={16} /> Seguir explorando productos
          </Link>
        </div>

        {/* SUMMARY STICKY */}
        <div className="w-full lg:w-96">
          <div className="sticky top-32 space-y-8">
            <div className="bg-gray-900 text-white p-10 rounded-[4rem] shadow-3xl relative overflow-hidden">
              <div className="relative z-10 space-y-10">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl">💳</div>
                   <h2 className="text-3xl font-black tracking-tighter">Resumen</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="text-xs font-bold uppercase tracking-widest">Subtotal Bruto</span>
                    <span className="font-black text-xl text-white">{formatPrice(total())}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="text-xs font-bold uppercase tracking-widest">Envío estimado</span>
                    <span className="text-[10px] font-black uppercase text-teal-400 bg-teal-400/10 px-3 py-1 rounded-full">Calculando...</span>
                  </div>
                  <div className="h-px bg-white/5 w-full" />
                  <div className="flex justify-between items-end pt-4">
                    <div className="space-y-1">
                       <span className="font-black tracking-[0.2em] text-[10px] uppercase text-gray-500">Total a pagar</span>
                       <p className="text-5xl font-black text-white tracking-tighter">{formatPrice(total())}</p>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-teal-500 text-white py-7 rounded-[2.5rem] font-black text-lg uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-teal-400 transition-all active:scale-95 shadow-2xl shadow-teal-500/20 group">
                  Finalizar Pedido
                  <ShoppingBag size={24} className="group-hover:rotate-12 transition-transform" />
                </button>
              </div>
              
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 flex items-start gap-5 shadow-sm">
               <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-[1.5rem] flex items-center justify-center text-3xl shrink-0">✨</div>
               <div className="space-y-1">
                  <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Artesanía Pura</p>
                  <p className="text-[11px] text-gray-400 font-bold leading-relaxed">Cada sahumerio es moldeado a mano con resinas naturales y mucho amor.</p>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* MODALS */}
      {editingItem && currentEditingItem && (
        <CartEditModal 
          item={currentEditingItem}
          isWholesale={is_wholesale}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* QUICK ADD MODAL (from upsell) */}
      {quickAddSlug && (
        <CartEditModal 
          item={{ product_slug: quickAddSlug, product_name: 'Cargando...', id: 'new', product_id: 'new', quantity: 1, unit_price: 0 }}
          isWholesale={is_wholesale}
          onClose={() => setQuickAddSlug(null)}
          onSave={(counts, totalQty, totalPrice) => {
             const p = upsellProducts.find(up => up.slug === quickAddSlug)
             if (p) handleQuickAddItem(p, counts, totalQty, totalPrice)
          }}
        />
      )}
    </div>
  )
}
