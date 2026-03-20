'use client'

import React, { useEffect, useState } from 'react'
import { X, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import FragranceSelector from './FragranceSelector'
import type { CartItem } from '@/store/cartStore'
import type { ProductWithVariants } from '@/lib/products/actions'

interface Props {
  item: Partial<CartItem> 
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

      // DETERMINING THE CORRECT TABLE (CRUCIAL FIX)
      // Products in wholesale are in 'wholesale_products'
      const table = isWholesale ? 'wholesale_products' : 'products'
      
      let query = supabase.from(table).select(`
          *,
          categories:category_id (id, name, slug),
          product_variants (
            id, fragrance_id, image_url, is_active,
            fragrances:fragrance_id (*)
          )
        `)
      
      if (slug) query = query.eq('slug', slug)
      else query = query.eq('id', id)

      const { data, error: queryError } = await query.single()

      if (queryError || !data) {
        // Fallback: If not in the selected table, try the other table
        const otherTable = isWholesale ? 'products' : 'wholesale_products'
        const { data: fallbackData, error: fallbackError } = await supabase
          .from(otherTable)
          .select(`
            *,
            categories:category_id (id, name, slug),
            product_variants (
              id, fragrance_id, image_url, is_active,
              fragrances:fragrance_id (*)
            )
          `)
          .eq(slug ? 'slug' : 'id', slug || id)
          .single()

        if (fallbackError || !fallbackData) {
          console.error('Modal Full Failure:', queryError, fallbackError)
          setError("No pudimos encontrar el producto en el catálogo.")
          setTimeout(onClose, 2500)
          return
        }
        setProduct(fallbackData as any)
      } else {
        setProduct(data as any)
      }
      
      setLoading(false)
    }

    loadProduct()
  }, [item.product_slug, item.product_id, isWholesale, onClose])

  const initialSelection = React.useMemo(() => {
    if (!item.selected_fragrances) return {}
    const counts: Record<string, number> = {}
    item.selected_fragrances.forEach(f => {
      counts[f.id || (f as any).fragrance_id] = f.quantity
    })
    return counts
  }, [item.selected_fragrances])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-gray-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">Configurar Surtido</h2>
            <p className="text-xs font-black uppercase tracking-widest text-teal-600">
               {loading ? 'Sincronizando...' : (product?.name || item.product_name)}
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-50/30">
          {error ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-orange-600 p-10 text-center">
               <AlertCircle size={48} />
               <p className="text-sm font-black uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          ) : loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-gray-400">
               <Loader2 size={40} className="animate-spin text-teal-500" />
               <p className="text-xs font-black uppercase tracking-widest text-center">Iniciando editor de packs...</p>
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
              {item.id === 'new' ? 'Se agregará a tu pedido actual' : 'Tus cambios se aplicarán al confirmar el pack'}
           </p>
        </div>
      </div>
    </div>
  )
}
