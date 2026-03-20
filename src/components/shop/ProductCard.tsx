'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Sparkles, Loader2 } from 'lucide-react'
import { formatPrice } from '@/utils/helpers'
import type { ProductWithVariants } from '@/lib/products/actions'
import { useCartStore } from '@/store/cartStore'

interface ProductCardProps {
  product: ProductWithVariants
  isWholesale?: boolean
}

export default function ProductCard({ product, isWholesale = false }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const price = isWholesale ? product.wholesale_price : product.retail_price

  // First active variant with image, or any active variant
  const firstVariant = product.product_variants.find((v) => v.is_active && v.image_url)
    ?? product.product_variants.find((v) => v.is_active)

  const imageUrl = firstVariant?.image_url
  const activeVariants = product.product_variants.filter((v) => v.is_active)
  const variantCount = activeVariants.length

  const handleQuickAdd = () => {
    if (product.is_pack) return
    if (!firstVariant) return

    addItem({
      product_id: product.id,
      product_name: product.name,
      variant_id: firstVariant.id,
      fragrance_name: firstVariant.fragrances?.name || 'Fragancia',
      image_url: imageUrl ?? undefined,
      quantity: 1,
      unit_price: price,
      is_pack: false,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="product-card group flex flex-col bg-white rounded-[32px] overflow-hidden border border-[color:var(--border-paper)] hover:shadow-xl transition-all duration-500">
      {/* Image area */}
      <Link href={`/productos/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-[color:var(--bg-paper)]">
             🌿
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.is_pack && (
            <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
              <Sparkles size={12} /> Pack
            </span>
          )}
          {isWholesale && (
            <span className="bg-[#c8a97a] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
              Mayorista
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4 mb-1">
          <Link href={`/productos/${product.slug}`} className="flex-1">
            <h3 className="font-display text-lg font-bold text-[color:var(--text-dark)] hover:text-[color:var(--accent-teal)] transition-colors line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>
          <span className="font-black text-xl text-[color:var(--accent-teal)] shrink-0">
            {formatPrice(price)}
          </span>
        </div>

        {product.categories && (
          <p className="text-[10px] uppercase font-black tracking-widest text-[color:var(--text-light)] mb-4">
            {product.categories.name}
          </p>
        )}

        {/* Fragrance count */}
        {variantCount > 0 ? (
          <p className="text-xs text-[color:var(--text-medium)] mb-6 flex items-center gap-1.5 font-medium">
             <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
             {variantCount} {variantCount === 1 ? 'aroma disponible' : 'aromas disponibles'}
          </p>
        ) : (
          <p className="text-xs italic text-[color:var(--text-light)] mb-6">
             Consultar disponibilidad
          </p>
        )}

        <div className="mt-auto">
          {product.is_pack ? (
            <Link
              href={`/productos/${product.slug}`}
              className="btn-primary w-full py-4 flex items-center justify-center gap-3 group/btn rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-teal-500/10"
            >
              Armar mi pack
              <Sparkles size={16} className="transition-transform group-hover/btn:scale-125" />
            </Link>
          ) : (
            <button
              onClick={handleQuickAdd}
              disabled={!firstVariant || added}
              className="btn-primary w-full py-4 flex items-center justify-center gap-3 group/btn rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-teal-500/10 transition-all active:scale-95 disabled:opacity-50"
            >
              {added ? (
                <>
                  <CheckIcon size={18} /> ¡Agregado!
                </>
              ) : (
                <>
                  <ShoppingCart size={18} className="transition-transform group-hover/btn:-translate-y-0.5" />
                  Al carrito
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function CheckIcon({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
