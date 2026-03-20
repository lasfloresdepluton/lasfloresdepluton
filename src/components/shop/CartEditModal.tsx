'use client'

import React, { useEffect, useState } from 'react'
import { X, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import FragranceSelector from './FragranceSelector'
import type { CartItem } from '@/store/cartStore'
import type { ProductWithVariants } from '@/lib/products/actions'

interface Props {
  item: Partial<CartItem> // Support partial items for new additions
  isWholesale: boolean
  onClose: () => void
  onSave: (newCounts: Record<string, number>, total: number, price: number) => void
}

export default function CartEditModal({ item, isWholesale, onClose, onSave }: Props) {
  const [product, setProduct] = useState<ProductWithVariants | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProduct() {
      // If we don't have a slug, we might have an ID for old items or nothing.
      const slug = item.product_slug
      const id = item.product_id

      if (!slug && !id) {
        onClose()
        return
      }
      
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      let query = supabase.from('products').select(`
          *,
          categories:category_id (id, name, slug),
          product_variants (
            id, fragrance_id, image_url, is_active,
            fragrances:fragrance_id (*)
          )
        `)
      
      if (slug) query = query.eq('slug', slug)
      else query = query.eq('id', id)

      const { data, error } = await query.single()

      if (error || !data) {
        console.error('Modal Load Error:', error)
        setError("No pudimos cargar el producto. Intenta de nuevo.")
        setTimeout(onClose, 2000)
        return
      }

      setProduct(data as any)
      setLoading(false)
    }

    loadProduct()
  }, [item.product_slug, item.product_id, onClose])

  const initialSelection = React.useMemo(() => {
    if (!item.selected_fragrances) return {}
    const counts: Record<string, number> = {}
    item.selected_fragrances.forEach(f => {
      counts[fid_from_item(f)] = f.quantity
    })
    return counts
  }, [item.selected_fragrances])

  function fid_from_item(f: any) {
    return f.id || f.fragrance_id
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-gray-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">Configurar Surtido</h2>
            <p className="text-xs font-black uppercase tracking-widest text-teal-600">
               {loading ? 'Cargando producto...' : (product?.name || item.product_name)}
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-50/30">
          {error ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-orange-600">
               <AlertCircle size={40} />
               <p className="text-xs font-black uppercase tracking-widest">{error}</p>
            </div>
          ) : loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-gray-400">
               <Loader2 size={40} className="animate-spin text-teal-500" />
               <p className="text-xs font-black uppercase tracking-widest text-center">Iniciando editor artesanal...</p>
            </div>
          ) : product ? (
            <div className="max-w-2xl mx-auto">
              <FragranceSelector 
                product={product} 
                isWholesale={isWholesale}
                initialSelection={initialSelection}
                onConfirm={onSave}
              />
            </div>
          ) : null}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-teal-50 border-t border-teal-100 flex items-center justify-center gap-3">
           <Sparkles size={16} className="text-teal-600" />
           <p className="text-[10px] font-black uppercase tracking-widest text-teal-800">
              {item.id === 'new' ? 'Se agregará como un nuevo ítem en tu pedido' : 'Tus cambios se aplicarán al confirmar'}
           </p>
        </div>
      </div>
    </div>
  )
}
