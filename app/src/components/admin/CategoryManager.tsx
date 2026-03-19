'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Upload, Loader2, Check, LayoutGrid, Trash2 } from 'lucide-react'
import { updateCategoryImageUrl } from '@/lib/admin/actions'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
  image_url: string | null
}

interface Props {
  initialCategories: Category[]
}

export default function CategoryManager({ initialCategories }: Props) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function handleUpload(categoryId: string, file: File) {
    setUploadingId(categoryId)
    const ext = file.name.split('.').pop()
    const path = `categories/${categoryId}_${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('brand') // Use the same brand bucket or separate one
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      })

    if (error) {
      console.error('Category upload error:', error)
      alert('Error al subir la imagen: ' + error.message)
    } else if (data) {
      const { data: { publicUrl } } = supabase.storage.from('brand').getPublicUrl(path)
      const res = await updateCategoryImageUrl(categoryId, publicUrl)
      if (res.ok) {
        setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, image_url: publicUrl } : c))
        setSuccessId(categoryId)
        setTimeout(() => setSuccessId(null), 3000)
        router.refresh()
      } else {
        alert('Error al guardar en BD: ' + res.error)
      }
    }
    setUploadingId(null)
  }

  async function handleRemove(categoryId: string) {
    if (!confirm('¿Quitar imagen de esta categoría?')) return
    const res = await updateCategoryImageUrl(categoryId, null)
    if (res.ok) {
       setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, image_url: null } : c))
       router.refresh()
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((cat) => (
        <div 
          key={cat.id} 
          className="rounded-2xl p-4 transition-all"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <h3 className="text-white font-semibold text-sm truncate">{cat.name}</h3>
          </div>

          <div
            className="relative aspect-square rounded-xl overflow-hidden flex items-center justify-center cursor-pointer group mb-3"
            style={{
              background: 'rgba(0,0,0,0.2)',
              border: cat.image_url ? 'none' : '2px dashed rgba(255,255,255,0.08)',
            }}
            onClick={() => {
               if (uploadingId) return
               const input = document.createElement('input')
               input.type = 'file'
               input.accept = 'image/*'
               input.onchange = (e) => {
                 const file = (e.target as HTMLInputElement).files?.[0]
                 if (file) handleUpload(cat.id, file)
               }
               input.click()
            }}
          >
            {uploadingId === cat.id ? (
              <Loader2 size={24} className="animate-spin text-teal-400" />
            ) : cat.image_url ? (
              <>
                <Image src={cat.image_url} alt={cat.name} fill className="object-cover" sizes="200px" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                   <Upload size={20} className="text-white mb-1" />
                   <span className="text-[10px] text-white font-medium uppercase tracking-wider">Cambiar imagen</span>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <Upload size={20} className="mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.15)' }} />
                <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>Subir imagen</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 min-h-[24px]">
            {successId === cat.id ? (
              <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                <Check size={10} /> GUARDADO
              </span>
            ) : cat.image_url ? (
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(cat.id) }}
                className="text-[10px] font-bold text-red-400/60 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 size={10} /> QUITAR IMAGEN
              </button>
            ) : (
               <span className="text-[10px] text-white/20 font-medium">PENDIENTE</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
