'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, Loader2, Check, ImagePlus } from 'lucide-react'
import { setLogo } from '@/lib/admin/actions'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  currentLogoUrl?: string | null
}

export default function LogoUploader({ currentLogoUrl }: Props) {
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  async function handleUpload(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `logo/logo.${ext}`

    // Use supabase client for upload (handles auth headers)
    const { data, error } = await supabase.storage
      .from('brand')
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      })

    if (error) {
      console.error('Logo upload error:', error)
      alert('Error al subir el logo: ' + error.message)
    } else if (data) {
      const { data: { publicUrl } } = supabase.storage.from('brand').getPublicUrl(path)
      // Add timestamp to bypass browser cache
      const finalUrl = `${publicUrl}?t=${Date.now()}`
      setLogoUrl(finalUrl)
      await setLogo(finalUrl)
      router.refresh()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setUploading(false)
  }

  return (
    <div className="space-y-5">
      <div
        className="rounded-xl px-4 py-3 text-xs"
        style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.25)', color: 'rgba(245,200,66,0.9)' }}
      >
        💡 Subí acá tu logo. Cuando lo actualizás, se actualiza en toda la página automáticamente.
        Formatos admitidos: PNG, JPG, SVG, WebP. Se recomienda fondo transparente (PNG o SVG).
      </div>

      <div className="flex items-start gap-6 flex-wrap">
        {/* Preview */}
        <div
          className="w-40 h-40 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer group relative"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: logoUrl ? '1px solid rgba(255,255,255,0.1)' : '2px dashed rgba(255,255,255,0.2)',
          }}
          onClick={() => !uploading && fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 size={28} className="animate-spin" style={{ color: '#3dbdb5' }} />
          ) : logoUrl ? (
            <>
              <Image src={logoUrl} alt="Logo" fill className="object-contain p-3" sizes="160px" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <ImagePlus size={20} color="white" />
                <span className="text-white text-xs font-medium">Cambiar logo</span>
              </div>
            </>
          ) : (
            <div className="text-center flex flex-col items-center gap-2">
              <Upload size={24} style={{ color: 'rgba(255,255,255,0.25)' }} />
              <p className="text-xs px-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Hacé click para subir tu logo
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-3 py-2">
          <p className="text-sm text-white font-medium">
            {logoUrl ? 'Logo cargado ✓' : 'Sin logo cargado'}
          </p>
          {logoUrl && (
            <p className="text-xs break-all" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {logoUrl.split('?')[0]}
            </p>
          )}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: '#3dbdb5', color: 'white', opacity: uploading ? 0.5 : 1 }}
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {logoUrl ? 'Actualizar logo' : 'Subir logo'}
            </button>
            {saved && (
              <span
                className="flex items-center gap-1 text-sm px-3 py-2 rounded-xl"
                style={{ background: 'rgba(76,175,80,0.15)', color: '#4caf50' }}
              >
                <Check size={13} /> Logo actualizado
              </span>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
      />
    </div>
  )
}
