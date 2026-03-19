'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Sparkles } from 'lucide-react'
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

  const handleQuickAdd = () => {
    if (product.is_pack) {
      // Packs need full selector — just redirect
      return
    }
    if (!firstVariant) return

    addItem({
      product_id: product.id,
      product_name: product.name,
      variant_id: firstVariant.id,
      fragrance_name: firstVariant.fragrances?.name,
      image_url: imageUrl ?? undefined,
      quantity: 1,
      unit_price: price,
      is_pack: false,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="product-card group flex flex-col">
      {/* Image area */}
      <Link href={`/productos/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-108"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ background: 'var(--bg-paper)' }}
          >
            🌿
          </div>
        )}

        {/* Pack badge */}
        {product.is_pack && (
          <div className="absolute top-3 left-3">
            <span className="badge-teal flex items-center gap-1">
              <Sparkles size={11} /> Pack
            </span>
          </div>
        )}

        {/* Wholesale badge */}
        {isWholesale && (
          <div className="absolute top-3 right-3">
            <span className="badge-kraft">Mayor</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/productos/${product.slug}`}>
          <h3
            className="font-display text-base font-bold mb-1 line-clamp-1 hover:text-[color:var(--accent-teal)] transition-colors"
            style={{ color: 'var(--text-dark)' }}
          >
            {product.name}
          </h3>
        </Link>

        {product.categories && (
          <p className="text-xs mb-2" style={{ color: 'var(--text-light)' }}>
            {product.categories.name}
          </p>
        )}

        {/* Fragrance count */}
        <p className="text-xs mb-3" style={{ color: 'var(--text-light)' }}>
          {product.product_variants.filter((v) => v.is_active).length} fragancias disponibles
        </p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="font-bold text-lg" style={{ color: 'var(--accent-teal)' }}>
            {formatPrice(price)}
          </span>

          {product.is_pack ? (
            <Link
              href={`/productos/${product.slug}`}
              className="btn-primary py-2 px-4 text-xs"
            >
              Armar pack
            </Link>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="btn-primary py-2 px-3 text-xs"
              disabled={!firstVariant}
            >
              {added ? (
                '✓ Agregado'
              ) : (
                <>
                  <ShoppingCart size={14} />
                  Agregar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
