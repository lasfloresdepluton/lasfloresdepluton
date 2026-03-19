'use client'

import { useState } from 'react'
import { Layout, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { updateSiteSetting } from '@/lib/admin/actions'

interface Props {
  initialSettings: Record<string, string>
}

const FIELDS = [
  { key: 'hero_badge', label: 'Etiqueta Hero (Badge)', placeholder: '✦ Artesanal · Natural · Único' },
  { key: 'hero_description', label: 'Descripción Hero', placeholder: 'Sahumerios artesanales para purificar tu espacio...' },
  { key: 'hero_btn_primary', label: 'Botón Principal', placeholder: 'Explorar productos' },
  { key: 'hero_btn_secondary', label: 'Botón Secundario', placeholder: 'Soy mayorista' },
  { key: 'section_products_title', label: 'Título Sección Productos', placeholder: 'Nuestros productos' },
  { key: 'section_products_desc', label: 'Descripción Sección Productos', placeholder: 'Cada pieza elaborada a mano...' },
]

export default function HomeContentManager({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  async function handleSave(key: string, value: string) {
    setSavingKey(key)
    const res = await updateSiteSetting(key, value)
    if (res.ok) {
       setLastSaved(key)
       setTimeout(() => setLastSaved(null), 3000)
    } else {
       alert('Error al guardar: ' + key)
    }
    setSavingKey(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">
                {f.label}
              </label>
              {lastSaved === f.key && (
                <span className="text-[10px] text-green-400 font-bold flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 size={10} /> GUARDADO
                </span>
              )}
            </div>
            
            <div className="relative group">
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all resize-none overflow-hidden min-h-[44px]"
                placeholder={f.placeholder}
                value={settings[f.key] || ''}
                rows={f.key.includes('desc') ? 3 : 1}
                onChange={(e) => {
                  setSettings(prev => ({ ...prev, [f.key]: e.target.value }))
                }}
                onBlur={(e) => {
                   if (e.target.value !== initialSettings[f.key]) {
                      handleSave(f.key, e.target.value)
                   }
                }}
              />
              <div className="absolute right-3 bottom-3 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                 {savingKey === f.key ? (
                    <Loader2 size={14} className="animate-spin text-teal-400" />
                 ) : (
                    <Save size={14} className="text-teal-400/50" />
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-4 p-4 rounded-xl border border-teal-500/20 bg-teal-500/5 flex items-start gap-3">
         <Layout size={18} className="text-teal-400 mt-0.5" />
         <div className="space-y-1">
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest">Vista Previa Automática</h4>
            <p className="text-xs text-teal-400/60 leading-relaxed">
               Los cambios se guardan automáticamente al salir del campo de texto y se verán reflejados inmediatamente en la página de inicio.
            </p>
         </div>
      </div>
    </div>
  )
}
