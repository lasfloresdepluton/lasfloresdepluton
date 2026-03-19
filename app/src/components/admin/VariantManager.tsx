'use client'

import { useState, useTransition, useRef } from 'react'
import Image from 'next/image'
import { updateVariantImage, updateVariantStock, toggleVariantActive, deleteVariant } from '@/lib/admin/actions'
import type { AdminVariant, AdminFragrance } from '@/lib/admin/actions'
import { Upload, Loader2, Trash2, Eye, EyeOff, ImagePlus, Check, Layers } from 'lucide-react'
import BulkAddModal from './BulkAddModal'
import { createClient } from '@/lib/supabase/client'

interface Props {
  productId: string
  productName: string
  initialVariants: AdminVariant[]
  fragrances: AdminFragrance[]       // All active fragrances in system
}

// ── Single variant row ──────────────────────────────────────────────────────

function VariantRow({
  variant,
  productId,
  onDeleted,
}: {
  variant: AdminVariant
  productId: string
  onDeleted: (id: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [imgUrl, setImgUrl] = useState(variant.image_url)
  const [uploading, setUploading] = useState(false)
  const [pending, startTransition] = useTransition()
  const [stock, setStock] = useState(String(variant.stock))
  const [stockSaved, setStockSaved] = useState(false)
  const [active, setActive] = useState(variant.is_active)
  const supabase = createClient()

  async function handleImageUpload(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `variants/${productId}/${Date.now()}.${ext}`

    // Use supabase browser client for upload (handles auth session automatically)
    const { data, error } = await supabase.storage
      .from('products')
      .upload(path, file, {
        contentType: file.type,
      })

    if (error) {
      console.error('Variant image upload error:', error)
      alert(`Error al subir imagen: ${error.message}`)
    } else if (data) {
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)
      await updateVariantImage(variant.id, publicUrl)
      setImgUrl(publicUrl)
    }
    setUploading(false)
  }

  function handleStockSave() {
    startTransition(async () => {
      await updateVariantStock(variant.id, parseInt(stock) || 0)
      setStockSaved(true)
      setTimeout(() => setStockSaved(false), 1500)
    })
  }

  function handleToggle() {
    startTransition(async () => {
      await toggleVariantActive(variant.id, !active)
      setActive((a) => !a)
    })
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar la fragancia "${variant.fragrances?.name}" de este producto?`)) return
    startTransition(async () => {
      await deleteVariant(variant.id)
      onDeleted(variant.id)
    })
  }

  return (
    <div
      className="rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start"
      style={{
        background: active ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
        opacity: active ? 1 : 0.6,
      }}
    >
      {/* Image upload tile */}
      <div
        className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative cursor-pointer group"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: imgUrl ? 'none' : '2px dashed rgba(255,255,255,0.2)',
        }}
        onClick={() => fileRef.current?.click()}
        title="Hacé click para subir o cambiar la foto"
      >
        {uploading ? (
          <Loader2 size={20} className="animate-spin" style={{ color: '#3dbdb5' }} />
        ) : imgUrl ? (
          <>
            <Image src={imgUrl} alt="" fill className="object-cover" sizes="96px" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              <ImagePlus size={18} color="white" />
              <span className="text-white text-xs">Cambiar</span>
            </div>
          </>
        ) : (
          <div className="text-center flex flex-col items-center gap-1 group-hover:scale-105 transition-transform">
            <Upload size={18} style={{ color: 'rgba(255,255,255,0.35)' }} />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Subir foto</p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }}
        />
      </div>

      {/* Controls */}
      <div className="flex-1 space-y-3 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="font-semibold text-white">{variant.fragrances?.name ?? 'Sin fragancia'}</p>
            {!imgUrl && (
              <p className="text-xs mt-0.5" style={{ color: '#f5c842' }}>
                ⚠ Sin foto — hacé click en el cuadro para subir
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleToggle}
              disabled={pending}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
              style={{
                background: active ? 'rgba(232,112,112,0.12)' : 'rgba(76,175,80,0.12)',
                color: active ? '#e87070' : '#4caf50',
              }}
            >
              {active ? <><EyeOff size={12}/> Ocultar</> : <><Eye size={12}/> Activar</>}
            </button>
            <button
              onClick={handleDelete}
              disabled={pending}
              className="p-1.5 rounded-lg"
              style={{ background: 'rgba(232,112,112,0.10)', color: '#e87070' }}
              title="Eliminar fragancia del producto"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Stock:</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="0"
            className="w-20 px-2 py-1 rounded-lg text-sm text-white"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          />
          <button
            onClick={handleStockSave}
            disabled={pending}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
            style={{ background: 'rgba(61,189,181,0.15)', color: '#3dbdb5' }}
          >
            {stockSaved ? <><Check size={12}/> Guardado</> : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main VariantManager ─────────────────────────────────────────────────────

export default function VariantManager({ productId, productName, initialVariants, fragrances }: Props) {
  const [variants, setVariants] = useState(initialVariants)
  const [showBulkModal, setShowBulkModal] = useState(false)

  const usedIds = new Set(variants.map((v) => v.fragrance_id))
  const availableFragrances = fragrances.filter((f) => !usedIds.has(f.id))

  function handleBulkDone() {
    setShowBulkModal(false)
    // Reload to pick up newly created variants from DB
    window.location.reload()
  }

  function handleDeleted(id: string) {
    setVariants((prev) => prev.filter((v) => v.id !== id))
  }

  const withPhoto = variants.filter((v) => v.image_url).length
  const withoutPhoto = variants.length - withPhoto

  return (
    <div className="space-y-4">
      {/* Toolbar row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Stats pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(61,189,181,0.12)', color: '#3dbdb5' }}>
            {variants.length} fragancia{variants.length !== 1 ? 's' : ''}
          </span>
          {withoutPhoto > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(245,200,66,0.12)', color: '#f5c842' }}>
              {withoutPhoto} sin foto
            </span>
          )}
          {withPhoto > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(76,175,80,0.12)', color: '#4caf50' }}>
              {withPhoto} con foto
            </span>
          )}
        </div>

        {/* Bulk add button */}
        {availableFragrances.length > 0 && (
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(61,189,181,0.15)', color: '#3dbdb5', border: '1px solid rgba(61,189,181,0.3)' }}
          >
            <Layers size={15} />
            Agregar en bloque ({availableFragrances.length} disponibles)
          </button>
        )}
      </div>

      {/* Info tip */}
      <div
        className="rounded-xl px-4 py-3 text-xs"
        style={{ background: 'rgba(61,189,181,0.06)', border: '1px solid rgba(61,189,181,0.15)', color: 'rgba(61,189,181,0.75)' }}
      >
        💡 Hacé click en el cuadro de imagen de cada fragancia para subir la foto. Cada fragancia tiene su propia foto en este producto — el <em>Sándalo Sahumerio</em> tiene una foto distinta que el <em>Sándalo Conito</em>.
      </div>

      {/* Variant list */}
      {variants.length === 0 ? (
        <div
          className="rounded-xl px-6 py-12 text-center"
          style={{ border: '2px dashed rgba(255,255,255,0.1)' }}
        >
          <Layers size={32} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto 12px' }} />
          <p className="text-sm text-white font-medium">Sin fragancias todavía</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Usá el botón <strong>"Agregar en bloque"</strong> para asignar todas las fragancias de una vez.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((v) => (
            <VariantRow
              key={v.id}
              variant={v}
              productId={productId}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      {availableFragrances.length === 0 && variants.length > 0 && (
        <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
          ✅ Todas las fragancias disponibles ya están asignadas.
        </p>
      )}

      {/* Bulk add modal */}
      {showBulkModal && (
        <BulkAddModal
          productId={productId}
          productName={productName}
          fragrances={availableFragrances}
          onDone={handleBulkDone}
          onClose={() => setShowBulkModal(false)}
        />
      )}
    </div>
  )
}
