'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/lib/admin/actions'
import type { AdminCategory } from '@/lib/admin/actions'
import { Loader2, Package, ChevronRight } from 'lucide-react'

interface Props {
  categories: AdminCategory[]
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function ProductForm({ categories }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [description, setDescription] = useState('')
  const [retailPrice, setRetailPrice] = useState('')
  const [wholesalePrice, setWholesalePrice] = useState('')
  const [wholesaleMinQty, setWholesaleMinQty] = useState('1')
  const [categoryId, setCategoryId] = useState('')
  const [isPack, setIsPack] = useState(false)
  const [packSlots, setPackSlots] = useState('10')
  const [isWholesaleOnly, setIsWholesaleOnly] = useState(false)
  const [wholesaleCategory, setWholesaleCategory] = useState('')
  const [minQtyPerVariant, setMinQtyPerVariant] = useState('1')

  function handleNameChange(val: string) {
    setName(val)
    if (!slugManual) setSlug(slugify(val))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!retailPrice || !wholesalePrice) { setError('Ingresá ambos precios.'); return }
    startTransition(async () => {
      const res = await createProduct({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        retail_price: parseFloat(retailPrice),
        wholesale_price: parseFloat(wholesalePrice),
        wholesale_min_qty: parseInt(wholesaleMinQty) || 1,
        category_id: categoryId || undefined,
        is_pack: isPack,
        pack_slots: isPack ? parseInt(packSlots) || 10 : 0,
        is_wholesale_only: isWholesaleOnly,
        wholesale_category: wholesaleCategory || undefined,
        min_qty_per_variant: parseInt(minQtyPerVariant) || 1,
      })
      if (!res.ok) {
        setError(res.error ?? 'Error desconocido')
        return
      }
      // Redirect to the product editor to add variants
      router.push(`/admin/productos/${res.id}`)
    })
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.08)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '0.75rem',
    padding: '0.6rem 0.85rem',
    fontSize: '0.875rem',
    width: '100%',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Name */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
          NOMBRE DEL PRODUCTO *
        </label>
        <input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Ej: Sahumerio Sándalo"
          required
          style={inputStyle}
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
          SLUG (URL) *
        </label>
        <input
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugManual(true) }}
          placeholder="sahumerio-sandalo"
          required
          style={inputStyle}
        />
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
          URL pública: /productos/{slug || '...'}
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
          DESCRIPCIÓN
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Descripción del producto..."
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            PRECIO MINORISTA (ARS) *
          </label>
          <input
            type="number"
            value={retailPrice}
            onChange={(e) => setRetailPrice(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            PRECIO MAYORISTA (ARS) *
          </label>
          <input
            type="number"
            value={wholesalePrice}
            onChange={(e) => setWholesalePrice(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            style={inputStyle}
          />
        </div>
      </div>

      {/* Category + Min Qty */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            CATEGORÍA
          </label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={inputStyle}>
            <option value="" style={{ background: '#1a1408' }}>Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} style={{ background: '#1a1408' }}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            CANT. MÍNIMA MAYORISTA
          </label>
          <input
            type="number"
            value={wholesaleMinQty}
            onChange={(e) => setWholesaleMinQty(e.target.value)}
            min="1"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Pack toggle */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setIsPack(!isPack)}
            className="w-11 h-6 rounded-full flex items-center transition-all duration-200 px-1"
            style={{ background: isPack ? '#3dbdb5' : 'rgba(255,255,255,0.15)', cursor: 'pointer' }}
          >
            <div
              className="w-4 h-4 rounded-full bg-white transition-all duration-200"
              style={{ transform: isPack ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-white">¿Es un pack?</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Habilita la selección múltiple de fragancias
            </p>
          </div>
        </label>

        {isPack && (
          <div className="mt-4">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              CANTIDAD DE FRAGANCIAS EN EL PACK
            </label>
            <input
              type="number"
              value={packSlots}
              onChange={(e) => setPackSlots(e.target.value)}
              min="2"
              max="50"
              style={{ ...inputStyle, maxWidth: 120 }}
            />
          </div>
        )}
      </div>

      {/* Wholesale Settings */}
      <div
        className="rounded-xl p-5 space-y-4 shadow-sm"
        style={{ background: 'rgba(61,189,181,0.06)', border: '1px solid rgba(61,189,181,0.15)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Package size={16} style={{ color: '#3dbdb5' }} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ajustes Mayoristas</h3>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <div
            onClick={() => setIsWholesaleOnly(!isWholesaleOnly)}
            className="w-11 h-6 rounded-full flex items-center transition-all duration-200 px-1"
            style={{ background: isWholesaleOnly ? '#3dbdb5' : 'rgba(255,255,255,0.15)', cursor: 'pointer' }}
          >
            <div
              className="w-4 h-4 rounded-full bg-white transition-all duration-200"
              style={{ transform: isWholesaleOnly ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-white">¿Es exclusivo Mayorista?</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Solo será visible para usuarios registrados como mayoristas
            </p>
          </div>
        </label>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              CATEGORÍA MAYORISTA (AGRUPACIÓN)
            </label>
            <input
              value={wholesaleCategory}
              onChange={(e) => setWholesaleCategory(e.target.value)}
              placeholder="Ej: Clásicos, Especialidades"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              MÍNIMO POR FRAGANCIA
            </label>
            <input
              type="number"
              value={minQtyPerVariant}
              onChange={(e) => setMinQtyPerVariant(e.target.value)}
              min="1"
              placeholder="10"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(232,112,112,0.15)', color: '#e87070', border: '1px solid rgba(232,112,112,0.3)' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending || !name || !slug || !retailPrice || !wholesalePrice}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
        style={{
          background: '#3dbdb5',
          color: 'white',
          opacity: (pending || !name || !slug) ? 0.5 : 1,
        }}
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
        {pending ? 'Creando...' : 'Crear producto → Agregar fragancias'}
        {!pending && <ChevronRight size={16} />}
      </button>
    </form>
  )
}
