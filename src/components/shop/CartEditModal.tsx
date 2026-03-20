'use client'

import React, { useEffect, useState } from 'react'
import { X, Loader2, Sparkles } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import FragranceSelector from './FragranceSelector'
import type { CartItem } from '@/store/cartStore'
import type { ProductWithVariants } from '@/lib/products/actions'

interface Props {
  item: CartItem
  isWholesale: boolean
  onClose: () => void
  onSave: (newCounts: Record<string, number>, total: number, price: number) => void
}

export default function CartEditModal({ item, isWholesale, onClose, onSave }: Props) {
  const [product, setProduct] = useState<ProductWithVariants | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProduct() {
      if (!item.product_slug) {
        onClose()
        return
      }
      
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (id, name, slug),
          product_variants (
            id, fragrance_id, image_url, is_active,
            fragrances:fragrance_id (*)
          )
        `)
        .eq('slug', item.product_slug)
        .single()

      if (error || !data) {
        onClose()
        return
      }

      setProduct(data as any)
      setLoading(false)
    }

    loadProduct()
  }, [item.product_slug, onClose])

  const initialSelection = React.useMemo(() => {
    if (!item.selected_fragrances) return {}
    const counts: Record<string, number> = {}
    item.selected_fragrances.forEach(f => {
      counts[f.id] = f.quantity
    })
    return counts
  }, [item.selected_fragrances])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-gray-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl relative flex flex-col">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">Editar Surtido</h2>
            <p className="text-xs font-black uppercase tracking-widest text-teal-600">{item.product_name}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-50/30">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-gray-400">
               <Loader2 size={40} className="animate-spin text-teal-500" />
               <p className="text-xs font-black uppercase tracking-widest">Cargando selector...</p>
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
           <p className="text-[10px] font-black uppercase tracking-widest text-teal-800">Tus cambios se aplicarán al cerrar la edición</p>
        </div>
      </div>
    </div>
  )
}
