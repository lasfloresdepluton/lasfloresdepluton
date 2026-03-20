'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { ShoppingCart, Check, AlertCircle, X, Sparkles, TrendingDown } from 'lucide-react'
import { formatPrice } from '@/utils/helpers'
import { useCartStore } from '@/store/cartStore'
import type { ProductWithVariants } from '@/lib/products/actions'

interface FragranceSelectorProps {
  product: ProductWithVariants
  isWholesale?: boolean
}

export default function FragranceSelector({ product, isWholesale = false }: FragranceSelectorProps) {
  const addItem = useCartStore((s) => s.addItem)
  const setWholesale = useCartStore((s) => s.setWholesale)

  // 1. DETERMINE CAPACITY / TIER (Wholesale exclusive)
  const hasTiers = product.wholesale_tiers && product.wholesale_tiers.length > 0
  const [selectedPackSize, setSelectedPackSize] = useState<number>(() => {
    return product.pack_slots || 100
  })

  // Current price based on selection
  const currentTier = useMemo(() => {
    if (!isWholesale || !hasTiers) return null
    // Find highest tier matched by selectedPackSize
    return [...product.wholesale_tiers].sort((a,b) => b.min_total_qty - a.min_total_qty)
      .find(t => selectedPackSize >= t.min_total_qty)
  }, [isWholesale, hasTiers, product.wholesale_tiers, selectedPackSize])

  const baseWholesalePrice = product.wholesale_price
  const activePrice = currentTier ? (currentTier as any).wholesale_price : (isWholesale ? baseWholesalePrice : product.retail_price)

  const activeVariants = product.product_variants.filter((v) => v.is_active)
  
  // 2. STATE
  const [packCounts, setPackCounts] = useState<Record<string, number>>({})
  const [added, setAdded] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(activeVariants[0]?.id ?? null)

  // 3. LOGIC
  const packSlots = isWholesale ? selectedPackSize : (product.pack_slots || 0)
  const totalSelected = Object.values(packCounts).reduce((s, n) => s + n, 0)
  const remaining = packSlots - totalSelected
  const packComplete = remaining === 0

  const displayImage = product.is_pack
    ? activeVariants[0]?.image_url ?? null
    : (activeVariants.find(v => v.id === selectedVariantId)?.image_url ?? null)

  // Smart Incrementor
  function clickFragrance(fragId: string) {
    if (remaining <= 0) return
    
    setPackCounts((prev) => {
      const current = prev[fragId] || 0
      const jump = product.min_qty_per_variant || 1
      
      let next = current + 1
      // If it's the first click, JUMP to the minimum
      if (current === 0 && jump > 1) {
        next = Math.min(jump, remaining)
      }

      return { ...prev, [fragId]: next }
    })
  }

  function removeOne(fragId: string, e: React.MouseEvent) {
    e.stopPropagation()
    setPackCounts((prev) => {
      const current = prev[fragId] || 0
      if (current <= 0) return prev
      const jump = product.min_qty_per_variant || 1
      
      let next = current - 1
      // If we go below the jump, it goes to 0
      if (current === jump) next = 0
      
      const nextMap = { ...prev, [fragId]: next }
      if (next === 0) delete nextMap[fragId]
      return nextMap
    })
  }

  function handleAddToCart() {
     setErrorMsg(null)
     
     if (product.is_pack || isWholesale) {
        if (!packComplete) {
           setErrorMsg(`Completá el pack con ${remaining} unidades más.`)
           return
        }
        
        // Check minimums per variant
        const minViolation = Object.entries(packCounts).find(([_, count]) => count > 0 && count < (product.min_qty_per_variant || 0))
        if (minViolation) {
           setErrorMsg(`Mínimo ${product.min_qty_per_variant} unidades por fragancia.`)
           return
        }

        setWholesale(isWholesale)
        
        Object.entries(packCounts).forEach(([fid, count]) => {
           const v = activeVariants.find(v => v.fragrance_id === fid || v.id === fid)
           addItem({
              product_id: product.id,
              product_name: product.name,
              variant_id: v?.id || fid,
              fragrance_name: (v as any)?.fragrances?.name || 'Fragancia',
              image_url: (displayImage as any) ?? undefined,
              quantity: count,
              unit_price: isWholesale ? (activePrice / (product.is_exact_total ? selectedPackSize : 1)) : activePrice,
              is_pack: false,
           })
        })
     } else {
        const v = activeVariants.find(v => v.id === selectedVariantId)
        if (!v) return
        addItem({
           product_id: product.id,
           product_name: product.name,
           variant_id: v.id,
           fragrance_name: (v as any).fragrances?.name,
           image_url: (v.image_url as any) ?? undefined,
           quantity: 1,
           unit_price: activePrice,
           is_pack: false,
        })
     }
     setAdded(true)
     setTimeout(() => { 
        setAdded(false)
        setPackCounts({}) 
     }, 2000)
  }

  // Calculate discount for 500u
  const discount500 = useMemo(() => {
     if (!hasTiers) return 0
     const tier500 = product.wholesale_tiers.find(t => t.min_total_qty === 500)
     if (!tier500) return 0
     const originalTotal = (baseWholesalePrice / 100) * 500
     const discountedTotal = tier500.wholesale_price
     return Math.round((1 - discountedTotal / originalTotal) * 100)
  }, [hasTiers, product.wholesale_tiers, baseWholesalePrice])

  return (
    <div className="space-y-8">
      {/* Image Gallery */}
      <div className="relative aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white border border-gray-100 shadow-sm">
        {displayImage ? (
          <Image src={displayImage} alt={product.name} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">🌿</div>
        )}
        {isWholesale && (
          <div className="absolute top-6 right-6">
            <span className="bg-[#c8a97a] text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
               Mayorista
            </span>
          </div>
        )}
      </div>

      {/* WHOLESALE TIER SELECTOR */}
      {isWholesale && hasTiers && (
        <div className="flex gap-3">
           <button 
             onClick={() => { setSelectedPackSize(100); setPackCounts({}); }}
             className={`flex-1 p-4 rounded-2xl border-2 transition-all ${selectedPackSize === 100 ? 'border-teal-500 bg-teal-50/30' : 'border-gray-100 bg-white'}`}
           >
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Pack x 100</p>
              <p className="text-lg font-black text-gray-900">{formatPrice(baseWholesalePrice)}</p>
           </button>
           <button 
             onClick={() => { setSelectedPackSize(500); setPackCounts({}); }}
             className={`flex-1 p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${selectedPackSize === 500 ? 'border-teal-500 bg-teal-50/30' : 'border-gray-100 bg-white'}`}
           >
              <div className="absolute top-1 right-1 bg-orange-500 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                 -{discount500}%
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Pack x 500</p>
              <p className="text-lg font-black text-gray-900">{formatPrice(currentTier?.wholesale_price || 0)}</p>
           </button>
        </div>
      )}

      {/* Main Info */}
      <div>
        <div className="flex items-baseline gap-3 mb-4">
          <span className="font-display text-4xl md:text-5xl font-black text-gray-900">
            {formatPrice(isWholesale ? activePrice : activePrice)}
          </span>
          {!isWholesale && product.retail_price > 0 && (
             <span className="text-sm line-through text-gray-400">{formatPrice(product.retail_price * 1.25)}</span>
          )}
        </div>

        {/* Progress Bar */}
        {(product.is_pack || isWholesale) && (
           <div className="space-y-3 mb-8 bg-white p-5 rounded-3xl border border-gray-100">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                 <span className="text-gray-400">Progreso del Pack</span>
                 <span className={packComplete ? 'text-teal-600' : 'text-gray-900'}>{totalSelected} / {packSlots} u.</span>
              </div>
              <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden p-0.5">
                 <div 
                   className="h-full bg-teal-500 rounded-full transition-all duration-500"
                   style={{ width: `${Math.min(100, (totalSelected/packSlots)*100)}%` }}
                 />
              </div>
              {!packComplete && (
                 <p className="text-[10px] font-bold text-orange-400 flex items-center gap-1.5 uppercase">
                    <AlertCircle size={12} /> Faltan {remaining} unidades para completar
                 </p>
              )}
           </div>
        )}

        {/* FRAGRANCE GRID */}
        <div className="space-y-4">
           <div className="flex justify-between items-end px-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Seleccioná Fragancias</h3>
              {product.min_qty_per_variant > 1 && (
                 <span className="text-[9px] font-black uppercase text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                   Mín. {product.min_qty_per_variant} por aroma
                 </span>
              )}
           </div>
           
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activeVariants.map((v) => {
                 const count = packCounts[v.fragrance_id] || 0
                 const isBelowMin = count > 0 && count < (product.min_qty_per_variant || 1)
                 
                 return (
                    <div
                      key={v.id}
                      className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                         count > 0 ? (isBelowMin ? 'border-orange-200 bg-orange-50/30' : 'border-teal-500 bg-white') : 'border-gray-100 bg-gray-50/30 hover:bg-white hover:border-gray-200 cursor-pointer'
                      }`}
                      onClick={() => count === 0 && clickFragrance(v.fragrance_id)}
                    >
                       <span className={`text-xs font-bold text-center mb-1.5 ${count > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                          {v.fragrances?.name}
                       </span>
                       {count > 0 ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                             <button 
                               onClick={(e) => removeOne(v.fragrance_id, e)} 
                               className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                             >
                                <MinusIcon size={10} />
                             </button>
                             <input 
                               type="number" 
                               value={count}
                               onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0
                                  const maxPossible = count + remaining
                                  const finalVal = Math.min(val, maxPossible)
                                  setPackCounts(p => {
                                     const next = { ...p, [v.fragrance_id]: Math.max(0, finalVal) }
                                     if (finalVal === 0) delete next[v.fragrance_id]
                                     return next
                                  })
                               }}
                               className="w-8 h-5 p-0 text-xs font-black text-teal-600 bg-transparent text-center border-none focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                             />
                             <button 
                               onClick={(e) => { e.stopPropagation(); clickFragrance(v.fragrance_id); }} 
                               className="w-5 h-5 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 hover:bg-teal-100"
                             >
                                <PlusIcon size={10} />
                             </button>
                          </div>
                       ) : (
                          <span className="text-[9px] uppercase font-black text-gray-300">Elegir</span>
                       )}
                    </div>
                  )
              })}
           </div>
        </div>

        {/* FEEDBACK & SUBMIT */}
        <div className="mt-8 space-y-4">
           {errorMsg && (
              <div className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 p-4 rounded-2xl animate-pulse">
                 <AlertCircle size={16} />
                 {errorMsg}
              </div>
           )}
           
           <button 
             onClick={handleAddToCart}
             disabled={added}
             className={`w-full py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${
                !packComplete ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-teal-600'
             }`}
           >
              {added ? (
                 <><Check size={18} /> ¡Agregado!</>
              ) : (
                 <><ShoppingCart size={18} /> Agregar al Carrito</>
              )}
           </button>
        </div>
      </div>
    </div>
  )
}

function PlusIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
}

function MinusIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
}
