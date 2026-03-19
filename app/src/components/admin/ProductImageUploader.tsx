'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, Trash2, Upload, X } from 'lucide-react'
import { updateProductImages } from '@/lib/admin/actions'
import { createClient } from '@/lib/supabase/client'

interface Props {
  productId: string
  productName: string
  initialImageUrl?: string | null
  initialGallery?: string[]
}

export default function ProductImageUploader({
  productId,
  productName,
  initialImageUrl,
  initialGallery = [],
}: Props) {
  const [mainImage, setMainImage] = useState<string | null>(initialImageUrl ?? null)
  const [gallery, setGallery] = useState<string[]>(initialGallery)
  const [uploadingMain, setUploadingMain] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const mainRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleMainUpload(file: File) {
    setUploadingMain(true)
    const ext = file.name.split('.').pop()
    const path = `main/${productId}/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('products')
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
      })

    if (error) {
       console.error('Main photo upload error:', error)
       alert('Error al subir la foto principal: ' + error.message)
    } else if (data) {
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)
      setMainImage(publicUrl)
      setSaved(false)
    }
    setUploadingMain(false)
  }

  async function handleGalleryUpload(files: FileList) {
    setUploadingGallery(true)
    const newUploads: string[] = []

    for (const f of Array.from(files)) {
      const ext = f.name.split('.').pop()
      const path = `gallery/${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from('products').upload(path, f, {
        contentType: f.type,
      })
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)
        newUploads.push(publicUrl)
      } else {
        console.error('Gallery upload error:', error)
      }
    }

    setGallery((prev) => [...prev, ...newUploads])
    setSaved(false)
    setUploadingGallery(false)
  }

  function removeFromGallery(url: string) {
    setGallery((prev) => prev.filter((u) => u !== url))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    const res = await updateProductImages(productId, mainImage, gallery)
    if (res.ok) {
       setSaved(true)
       setTimeout(() => setSaved(false), 2000)
    } else {
       alert('Error al guardar: ' + res.error)
    }
    setSaving(false)
  }

  const labelStyle = {
    color: 'rgba(255,255,255,0.45)',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    marginBottom: '0.5rem',
    display: 'block',
  }

  return (
    <div className="space-y-6">
      {/* ── Explanation banner ────────────────────────────────────────────── */}
      <div
        className="rounded-xl px-4 py-3 text-xs"
        style={{ background: 'rgba(61,189,181,0.07)', border: '1px solid rgba(61,189,181,0.2)', color: 'rgba(61,189,181,0.8)' }}
      >
        💡 <strong>Foto principal</strong>: se muestra en la grilla de productos y en el tope de la página de producto.<br />
        <strong>Galería</strong>: fotos adicionales visibles en el detalle del producto (ideal para mostrar diferentes ángulos o fragancias).
        Los productos <strong>sin fragancia específica</strong> (como Sahumo Herbal) solo necesitan estas fotos generales.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Foto principal ────────────────────────────────────────────── */}
        <div>
          <span style={labelStyle}>Foto principal</span>
          <div
            className="relative aspect-square rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer group"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: mainImage ? 'none' : '2px dashed rgba(255,255,255,0.2)',
            }}
            onClick={() => !uploadingMain && mainRef.current?.click()}
          >
            {uploadingMain ? (
              <Loader2 size={28} className="animate-spin" style={{ color: '#3dbdb5' }} />
            ) : mainImage ? (
              <>
                <Image src={mainImage} alt={productName} fill className="object-cover" sizes="400px" />
                <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <ImagePlus size={22} color="white" />
                  <span className="text-white text-xs font-medium">Cambiar foto</span>
                </div>
              </>
            ) : (
              <div className="text-center flex flex-col items-center gap-2">
                <Upload size={28} style={{ color: 'rgba(255,255,255,0.25)' }} />
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Hacé click para subir<br />la foto principal
                </p>
              </div>
            )}
          </div>
          {mainImage && (
            <button
              onClick={() => { setMainImage(null); setSaved(false) }}
              className="mt-2 flex items-center gap-1 text-xs"
              style={{ color: '#e87070' }}
            >
              <Trash2 size={12} /> Quitar foto principal
            </button>
          )}
          <input
            ref={mainRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMainUpload(f) }}
          />
        </div>

        {/* ── Galería ───────────────────────────────────────────────────── */}
        <div>
          <span style={labelStyle}>Galería ({gallery.length} fotos)</span>
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((url) => (
              <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
                <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                <button
                  onClick={() => removeFromGallery(url)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.7)' }}
                >
                  <X size={10} color="white" />
                </button>
              </div>
            ))}

            {/* Upload more tile */}
            <div
              className="aspect-square rounded-xl flex items-center justify-center cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '2px dashed rgba(255,255,255,0.15)',
              }}
              onClick={() => !uploadingGallery && galleryRef.current?.click()}
            >
              {uploadingGallery ? (
                <Loader2 size={16} className="animate-spin" style={{ color: '#3dbdb5' }} />
              ) : (
                <div className="text-center">
                  <ImagePlus size={18} style={{ color: 'rgba(255,255,255,0.3)', margin: '0 auto 4px' }} />
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Agregar</p>
                </div>
              )}
            </div>
          </div>
          <input
            ref={galleryRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files?.length) handleGalleryUpload(e.target.files) }}
          />
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold mt-4"
        style={{ background: saved ? 'rgba(76,175,80,0.2)' : '#3dbdb5', color: 'white' }}
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : null}
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar imágenes'}
      </button>
    </div>
  )
}
