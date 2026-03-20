'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { ShoppingCart, Check, AlertCircle, Trash2, Copy, Plus, Minus } from 'lucide-react'
import { formatPrice } from '@/utils/helpers'
import { useCartStore } from '@/store/cartStore'
import type { ProductWithVariants } from '@/lib/products/actions'

interface DraftPack {
  id: string
  counts: Record<string, number>
  totalUnits: number
  pricePerPack: number
}

interface FragranceSelectorProps {
  product: ProductWithVariants
  isWholesale?: boolean
}

export default function FragranceSelector({ product, isWholesale = false }: FragranceSelectorProps) {
  const addItem = useCartStore((s) => s.addItem)
  const setWholesale = useCartStore((s) => s.setWholesale)

  // 1. CAPACITY & TIERS
  const hasTiers = product.wholesale_tiers && product.wholesale_tiers.length > 0
  const [selectedPackSize, setSelectedPackSize] = useState<number>(() => {
    return product.pack_slots || product.min_total_qty || 100
  })

  const currentTier = useMemo(() => {
    if (!isWholesale || !hasTiers) return null
    return [...product.wholesale_tiers].sort((a,b) => b.min_total_qty - a.min_total_qty)
      .find(t => selectedPackSize >= t.min_total_qty)
  }, [isWholesale, hasTiers, product.wholesale_tiers, selectedPackSize])

  const activePrice = currentTier ? (currentTier as any).wholesale_price : (isWholesale ? product.wholesale_price : product.retail_price)
  const activeVariants = product.product_variants.filter((v) => v.is_active)
  
  // 2. STATE
  const [packCounts, setPackCounts] = useState<Record<string, number>>({})
  const [draftPacks, setDraftPacks] = useState<DraftPack[]>([])
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

  // Handlers
  function clickFragrance(fragId: string) {
    if (remaining <= 0) return
    setPackCounts((prev) => {
      const current = prev[fragId] || 0
      const jump = product.min_qty_per_variant || 1
      let next = current + 1
      if (current === 0 && jump > 1) next = Math.min(jump, remaining)
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
      if (current === jump) next = 0
      const nextMap = { ...prev, [fragId]: next }
      if (next === 0) delete nextMap[fragId]
      return nextMap
    })
  }

  function confirmPackAndAddAnother() {
    setErrorMsg(null)
    if (!packComplete) {
      setErrorMsg(`Completá las ${remaining} unidades restantes para guardar este pack.`)
      return
    }

    const minViolation = Object.entries(packCounts).find(([_, count]) => count > 0 && count < (product.min_qty_per_variant || 0))
    if (minViolation) {
      setErrorMsg(`Mínimo ${product.min_qty_per_variant} unidades por fragancia.`)
      return
    }

    const newDraft: DraftPack = {
      id: Math.random().toString(36).substr(2, 9),
      counts: { ...packCounts },
      totalUnits: totalSelected,
      pricePerPack: activePrice
    }

    setDraftPacks(prev => [...prev, newDraft])
    setPackCounts({})
  }

  function duplicatePack(draftId: string) {
    const original = draftPacks.find(p => p.id === draftId)
    if (original) {
      setDraftPacks(prev => [...prev, { ...original, id: Math.random().toString(36).substr(2, 9) }])
    }
  }

  function removeDraft(draftId: string) {
    setDraftPacks(prev => prev.filter(p => p.id !== draftId))
  }

  function handleAddAllToCart() {
    setErrorMsg(null)
    const allPacks = [...draftPacks]
    
    if (totalSelected > 0) {
      if (packComplete) {
        allPacks.push({
          id: 'current',
          counts: packCounts,
          totalUnits: totalSelected,
          pricePerPack: activePrice
        })
      } else {
        setErrorMsg("Tienes una selección incompleta. Completala o borrala antes de finalizar.")
        return
      }
    }

    if (allPacks.length === 0) return

    setWholesale(isWholesale)
    
    allPacks.forEach(pack => {
      // Map current counts to the structured SelectedFragrance array
      const selectedFragrances = Object.entries(pack.counts).map(([fid, qty]) => {
         const v = activeVariants.find(v => v.fragrance_id === fid || v.id === fid)
         return {
            id: fid,
            name: (v as any)?.fragrances?.name || 'Fragancia',
            quantity: qty
         }
      })

      addItem({
        product_id: product.id,
        product_name: product.name,
        image_url: (displayImage as any) ?? undefined,
        quantity: 1, // We add each logical "Pack" as 1 quantity unit
        unit_price: pack.pricePerPack,
        is_pack: true,
        pack_size: pack.totalUnits,
        selected_fragrances: selectedFragrances
      })
    })

    setAdded(true)
    setDraftPacks([])
    setPackCounts({})
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Product Image */}
      <div className="relative aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white border border-gray-100 shadow-sm">
        {displayImage ? (
          <Image src={displayImage} alt={product.name} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">🌿</div>
        )}
      </div>

      {/* Main Builder Section */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-baseline">
           <h2 className="text-xl font-black text-gray-900">Armá tu Surtido</h2>
           <span className="text-2xl font-black text-teal-600">{formatPrice(activePrice)}</span>
        </div>

        {/* Progress Bar */}
        {(product.is_pack || isWholesale) && (
           <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                 <span>Progreso del pack</span>
                 <span className={packComplete ? 'text-teal-600' : 'text-gray-900'}>{totalSelected} / {packSlots} u.</span>
              </div>
              <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden p-0.5">
                 <div 
                   className="h-full bg-teal-500 rounded-full transition-all duration-500"
                   style={{ width: `${Math.min(100, (totalSelected/packSlots)*100)}%` }}
                 />
              </div>
           </div>
        )}

        {/* Fragrance Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2">
          {activeVariants.map((v) => {
            const count = packCounts[v.fragrance_id] || 0
            return (
              <div
                key={v.id}
                onClick={() => count === 0 && clickFragrance(v.fragrance_id)}
                className={`group p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                  count > 0 ? 'border-teal-500 bg-teal-50/20' : 'border-gray-100 hover:border-gray-200 cursor-pointer'
                }`}
              >
                <span className="text-[11px] font-bold text-gray-700 text-center leading-tight">{v.fragrances?.name}</span>
                {count > 0 ? (
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <button onClick={e => removeOne(v.fragrance_id, e)} className="p-1 rounded-lg bg-white shadow-sm hover:bg-red-50 hover:text-red-500"><Minus size={12} /></button>
                    <span className="text-xs font-black text-teal-600 w-4 text-center">{count}</span>
                    <button onClick={() => clickFragrance(v.fragrance_id)} className="p-1 rounded-lg bg-white shadow-sm hover:bg-teal-100 hover:text-teal-600"><Plus size={12} /></button>
                  </div>
                ) : (
                  <span className="text-[9px] font-black uppercase text-gray-300">Sumar</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Confirm Pack Button */}
        <button
          onClick={confirmPackAndAddAnother}
          disabled={!packComplete}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            packComplete ? 'bg-teal-500 text-white shadow-lg shadow-teal-100 hover:bg-teal-600' : 'bg-gray-100 text-gray-400'
          }`}
        >
          {packComplete ? '✓ Confirmar este pack y armar otro' : `Faltan ${remaining} unidades`}
        </button>
      </div>

      {/* MY DRAFTS SECTION */}
      {draftPacks.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
           <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 px-2">Tus Packs Listos</h3>
           <div className="space-y-3">
              {draftPacks.map((pack, idx) => (
                <div key={pack.id} className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm group">
                   <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-black text-sm">
                      #{idx + 1}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate">Pack de {pack.totalUnits} unidades</p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {Object.entries(pack.counts).map(([fid, count]) => {
                           const v = activeVariants.find(v => v.fragrance_id === fid)
                           return `${v?.fragrances?.name} x${count}`
                        }).join(', ')}
                      </p>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => duplicatePack(pack.id)}
                        className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                        title="Duplicar pack"
                      >
                         <Copy size={16} />
                      </button>
                      <button 
                        onClick={() => removeDraft(pack.id)}
                        className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Eliminar pack"
                      >
                         <Trash2 size={16} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <div className="p-4 bg-orange-50 rounded-2xl flex items-center gap-3 text-orange-600 animate-shake">
           <AlertCircle size={20} className="shrink-0" />
           <p className="text-xs font-black uppercase">{errorMsg}</p>
        </div>
      )}

      {/* FINAL ACTION */}
      {(draftPacks.length > 0 || packComplete) && (
        <button
          onClick={handleAddAllToCart}
          disabled={added}
          className="w-full py-6 rounded-[2rem] bg-gray-900 text-white font-black text-base uppercase tracking-widest shadow-2xl transition-all active:scale-95 hover:bg-teal-600 flex items-center justify-center gap-3"
        >
          {added ? (
            <><Check size={20} /> ¡Todo al carrito!</>
          ) : (
            <>
              <ShoppingCart size={20} /> 
              Agregar {draftPacks.length + (packComplete ? 1 : 0)} pack{draftPacks.length + (packComplete ? 1 : 0) !== 1 ? 's' : ''} al pedido
            </>
          )}
        </button>
      )}
    </div>
  )
}
