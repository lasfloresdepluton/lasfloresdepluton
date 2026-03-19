'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { ShoppingCart, Check, AlertCircle, X } from 'lucide-react'
import { formatPrice } from '@/utils/helpers'
import { useCartStore } from '@/store/cartStore'
import type { ProductWithVariants } from '@/lib/products/actions'

interface FragranceSelectorProps {
  product: ProductWithVariants
  isWholesale?: boolean
}

export default function FragranceSelector({ product, isWholesale = false }: FragranceSelectorProps) {
  const addItem = useCartStore((s) => s.addItem)

  const activeVariants = product.product_variants.filter((v) => v.is_active)
  const price = isWholesale ? product.wholesale_price : product.retail_price

  // ── PACK MODE: counter map { fragrance_id: count } ───────────────────────
  const [packCounts, setPackCounts] = useState<Record<string, number>>({})
  const [added, setAdded] = useState(false)

  // ── SINGLE FRAGRANCE MODE ─────────────────────────────────────────────────
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    activeVariants[0]?.id ?? null
  )
  const selectedVariant = useMemo(
    () => activeVariants.find((v) => v.id === selectedVariantId) ?? null,
    [activeVariants, selectedVariantId]
  )

  // Display image
  const displayImage = product.is_pack
    ? activeVariants[0]?.image_url ?? null
    : (selectedVariant?.image_url ?? null)

  // Pack helpers
  const packSlots = product.pack_slots || 0
  const totalSelected = Object.values(packCounts).reduce((s, n) => s + n, 0)
  const remaining = packSlots - totalSelected
  const packComplete = remaining === 0

  // Click pill: add one unit (if slots remain). Double-click or × removes.
  function clickPill(fragId: string) {
    if (remaining <= 0) {
      // If already have some, add one more by removing oldest to make room
      // (or just ignore if full — user can remove with × button)
      return
    }
    setPackCounts((prev) => ({ ...prev, [fragId]: (prev[fragId] ?? 0) + 1 }))
  }

  function removePill(fragId: string, e: React.MouseEvent) {
    e.stopPropagation()
    setPackCounts((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [fragId]: _, ...rest } = prev
      return rest
    })
  }

  function clearAll() {
    setPackCounts({})
  }

  function buildPackSelections() {
    return Object.entries(packCounts).flatMap(([fid, count]) =>
      Array(count).fill(null).map(() => {
        const v = activeVariants.find((v) => v.fragrance_id === fid)
        return { fragrance_id: fid, fragrance_name: v?.fragrances?.name ?? fid }
      })
    )
  }

  function handleAddToCart() {
    if (product.is_pack) {
      if (!packComplete) return
      addItem({
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: price,
        is_pack: true,
        selected_fragrances: buildPackSelections(),
        image_url: displayImage ?? undefined,
      })
    } else {
      if (!selectedVariant) return
      addItem({
        product_id: product.id,
        product_name: product.name,
        variant_id: selectedVariant.id,
        fragrance_name: selectedVariant.fragrances?.name,
        image_url: selectedVariant.image_url ?? undefined,
        quantity: 1,
        unit_price: price,
        is_pack: false,
      })
    }
    setAdded(true)
    setTimeout(() => { setAdded(false); if (product.is_pack) setPackCounts({}) }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Product image */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-paper)' }}
      >
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover transition-opacity duration-300"
            key={displayImage}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🌿</div>
        )}
        {isWholesale && (
          <div className="absolute top-4 right-4">
            <span className="badge-kraft">Precio Mayorista</span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="font-display text-4xl font-bold" style={{ color: 'var(--accent-teal)' }}>
          {formatPrice(price)}
        </span>
        {isWholesale && (
          <span className="text-sm line-through" style={{ color: 'var(--text-light)' }}>
            {formatPrice(product.retail_price)}
          </span>
        )}
      </div>

      {/* ── PACK BUILDER ────────────────────────────────────────────────────── */}
      {product.is_pack ? (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-dark)' }}>
              Elegí tus {packSlots} fragancias
            </h3>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color: packComplete ? 'var(--accent-teal)' : 'var(--text-light)' }}
              >
                {totalSelected}/{packSlots}
              </span>
              {totalSelected > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(232,112,112,0.12)', color: '#c0392b' }}
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="w-full h-1.5 rounded-full mb-4 overflow-hidden"
            style={{ background: 'var(--bg-paper)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${packSlots > 0 ? Math.min(100, (totalSelected / packSlots) * 100) : 0}%`,
                background: 'var(--accent-teal)',
              }}
            />
          </div>

          {/* Pills — clicking adds one, × removes all of that fragrance */}
          <div className="flex flex-wrap gap-2">
            {activeVariants.map((v) => {
              const count = packCounts[v.fragrance_id] ?? 0
              const isSelected = count > 0
              const canAdd = remaining > 0

              return (
                <button
                  key={v.id}
                  onClick={() => clickPill(v.fragrance_id)}
                  disabled={!canAdd && !isSelected}
                  className={`fragrance-pill ${isSelected ? 'selected' : ''}`}
                  style={{
                    opacity: !canAdd && !isSelected ? 0.45 : 1,
                    cursor: !canAdd && !isSelected ? 'not-allowed' : 'pointer',
                    paddingRight: isSelected ? '6px' : undefined,
                  }}
                  title={canAdd ? `Agregar ${v.fragrances?.name}` : isSelected ? 'Pack completo — usá × para quitar' : 'Pack completo'}
                >
                  {v.fragrances?.name}
                  {isSelected && (
                    <>
                      <span
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold"
                        style={{ background: 'rgba(255,255,255,0.25)', fontSize: '0.65rem' }}
                      >
                        {count}
                      </span>
                      <span
                        onClick={(e) => removePill(v.fragrance_id, e)}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-white/20 transition-colors"
                        title="Quitar esta fragancia"
                      >
                        <X size={9} />
                      </span>
                    </>
                  )}
                </button>
              )
            })}
          </div>

          {/* Helper text */}
          {totalSelected === 0 ? (
            <p className="text-xs mt-3" style={{ color: 'var(--text-light)' }}>
              Hacé click en una fragancia para agregarla. Podés repetir la misma fragancia.
            </p>
          ) : !packComplete ? (
            <p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: 'var(--text-light)' }}>
              <AlertCircle size={12} />
              Faltan {remaining} fragancia{remaining !== 1 ? 's' : ''}
            </p>
          ) : (
            <p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: 'var(--accent-teal)' }}>
              <Check size={12} /> ¡Pack completo! Ya podés agregar al carrito.
            </p>
          )}
        </div>
      ) : (
        /* ── SINGLE FRAGRANCE ─────────────────────────────────────────────── */
        <div>
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-dark)' }}>
            Elegí tu fragancia
          </h3>
          <div className="flex flex-wrap gap-2">
            {activeVariants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariantId(v.id)}
                className={`fragrance-pill ${selectedVariantId === v.id ? 'selected' : ''} ${v.stock === 0 ? 'disabled' : ''}`}
                disabled={v.stock === 0}
              >
                {v.fragrances?.name}
                {v.stock === 0 && ' (sin stock)'}
              </button>
            ))}
          </div>
          {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--accent-orange)' }}>
              <AlertCircle size={13} /> Solo {selectedVariant.stock} en stock
            </p>
          )}
        </div>
      )}

      {/* Add to cart */}
      <button
        onClick={handleAddToCart}
        disabled={product.is_pack ? !packComplete : !selectedVariant || selectedVariant.stock === 0}
        className="btn-primary w-full py-4 text-base"
        style={{
          opacity: (product.is_pack ? !packComplete : !selectedVariant || selectedVariant.stock === 0) ? 0.5 : 1,
        }}
      >
        {added ? (
          <><Check size={18} /> ¡Agregado al carrito!</>
        ) : (
          <>
            <ShoppingCart size={18} />
            {product.is_pack
              ? (packComplete ? 'Agregar pack al carrito' : `Falta elegir ${remaining} fragancia${remaining !== 1 ? 's' : ''}`)
              : 'Agregar al carrito'}
          </>
        )}
      </button>
    </div>
  )
}
