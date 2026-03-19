'use client'

import { useState, useTransition } from 'react'
import { bulkUpsertVariants } from '@/lib/admin/actions'
import type { AdminFragrance } from '@/lib/admin/actions'
import { X, CheckSquare, Square, Loader2, Sparkles, Info, Check } from 'lucide-react'

interface Props {
  productId: string
  productName: string
  fragrances: AdminFragrance[]        // only available (not yet assigned) fragrances
  onDone: () => void
  onClose: () => void
}

export default function BulkAddModal({ productId, productName, fragrances, onDone, onClose }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [step, setStep] = useState<'select' | 'confirm' | 'done'>('select')
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<{ created: number } | null>(null)
  const [error, setError] = useState('')

  const allSelected = selected.size === fragrances.length && fragrances.length > 0

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(fragrances.map((f) => f.id)))
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleConfirm() {
    setStep('confirm')
  }

  function handleCreate() {
    setError('')
    startTransition(async () => {
      const res = await bulkUpsertVariants(productId, Array.from(selected))
      if (!res.ok) {
        setError(res.error ?? 'Error desconocido')
        setStep('select')
        return
      }
      setResult({ created: res.created })
      setStep('done')
    })
  }

  const labelStyle = {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: '#16120a',
          border: '1px solid rgba(200,169,122,0.2)',
          maxHeight: '90vh',
        }}
      >
        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(61,189,181,0.2)', color: '#3dbdb5' }}>
              <Sparkles size={15} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Agregar fragancias en bloque</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{productName}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)' }}>
            <X size={20} />
          </button>
        </div>

        {/* ── STEP: SELECT ────────────────────────────────────────── */}
        {step === 'select' && (
          <>
            {/* Instruction banner */}
            <div
              className="mx-5 mt-4 rounded-xl px-4 py-3 flex gap-3"
              style={{ background: 'rgba(61,189,181,0.08)', border: '1px solid rgba(61,189,181,0.2)' }}
            >
              <Info size={16} style={{ color: '#3dbdb5', flexShrink: 0, marginTop: 2 }} />
              <div className="text-xs space-y-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <p><strong style={{ color: '#3dbdb5' }}>¿Qué hace esto?</strong></p>
                <p>Seleccioná todas las fragancias que ofrece <strong style={{ color: 'white' }}>{productName}</strong>.</p>
                <p>Se van a crear las variantes con <strong>stock en 0</strong>. Después podrás subir la foto de cada una desde el editor.</p>
                <p className="pt-1" style={{ color: '#f5c842' }}>
                  ⚠ Si una fragancia ya existe en el producto, se omite automáticamente.
                </p>
              </div>
            </div>

            {/* Select all */}
            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
              <p style={labelStyle}>FRAGANCIAS DISPONIBLES ({fragrances.length})</p>
              <button
                onClick={toggleAll}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(61,189,181,0.12)', color: '#3dbdb5' }}
              >
                {allSelected ? <CheckSquare size={13} /> : <Square size={13} />}
                {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
            </div>

            {/* Fragrance checklist */}
            <div className="flex-1 overflow-y-auto px-5 pb-2">
              {fragrances.length === 0 ? (
                <div className="py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Todas las fragancias ya están asignadas a este producto.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {fragrances.map((f) => {
                    const checked = selected.has(f.id)
                    return (
                      <button
                        key={f.id}
                        onClick={() => toggle(f.id)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-all"
                        style={{
                          background: checked ? 'rgba(61,189,181,0.18)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${checked ? 'rgba(61,189,181,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          color: checked ? '#3dbdb5' : 'rgba(255,255,255,0.7)',
                        }}
                      >
                        {checked
                          ? <CheckSquare size={15} style={{ flexShrink: 0 }} />
                          : <Square size={15} style={{ flexShrink: 0, opacity: 0.4 }} />}
                        <span className="font-medium truncate">{f.name}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {error && (
              <div className="mx-5 mt-2 text-sm px-4 py-3 rounded-xl"
                style={{ background: 'rgba(232,112,112,0.15)', color: '#e87070' }}>{error}</div>
            )}

            {/* Footer */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {selected.size} seleccionada{selected.size !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={selected.size === 0}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: selected.size > 0 ? '#3dbdb5' : 'rgba(61,189,181,0.2)',
                    color: 'white',
                    opacity: selected.size === 0 ? 0.5 : 1,
                  }}
                >
                  Continuar →
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── STEP: CONFIRM ───────────────────────────────────────── */}
        {step === 'confirm' && (
          <>
            <div className="px-5 py-6 space-y-5 flex-1">
              <div
                className="rounded-xl px-4 py-4 space-y-2"
                style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.25)' }}
              >
                <p className="text-sm font-semibold" style={{ color: '#f5c842' }}>Confirmá la operación</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Se van a crear <strong style={{ color: 'white' }}>{selected.size} variante{selected.size !== 1 ? 's' : ''}</strong> para <strong style={{ color: 'white' }}>{productName}</strong>:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Array.from(selected).map((id) => {
                    const f = fragrances.find((x) => x.id === id)
                    return f ? (
                      <span key={id} className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(61,189,181,0.15)', color: '#3dbdb5' }}>
                        {f.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>

              <div
                className="rounded-xl px-4 py-3 text-xs space-y-1"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
              >
                <p>✅ Stock inicial: <strong style={{ color: 'white' }}>0</strong> por variante</p>
                <p>✅ Estado: <strong style={{ color: 'white' }}>Activo</strong></p>
                <p>📷 Foto: <strong style={{ color: '#f5c842' }}>Sin foto</strong> — las subís después desde el editor</p>
                <p>🔁 Si una fragancia ya existe en el producto, se omite sin error.</p>
              </div>
            </div>

            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <button
                onClick={() => setStep('select')}
                className="text-sm px-4 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
              >
                ← Volver
              </button>
              <button
                onClick={handleCreate}
                disabled={pending}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold"
                style={{ background: '#3dbdb5', color: 'white' }}
              >
                {pending
                  ? <><Loader2 size={14} className="animate-spin" /> Creando...</>
                  : <>Confirmar y crear {selected.size} variante{selected.size !== 1 ? 's' : ''}</>}
              </button>
            </div>
          </>
        )}

        {/* ── STEP: DONE ──────────────────────────────────────────── */}
        {step === 'done' && (
          <>
            <div className="px-5 py-10 text-center space-y-4 flex-1">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(76,175,80,0.15)' }}>
                <Check size={32} style={{ color: '#4caf50' }} />
              </div>
              <div>
                <p className="text-white font-bold text-lg">
                  {result?.created} variante{(result?.created ?? 0) !== 1 ? 's' : ''} creada{(result?.created ?? 0) !== 1 ? 's' : ''}
                </p>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Ahora podés subir la foto de cada fragancia haciendo click en el cuadro de imagen.
                </p>
              </div>
              <div
                className="rounded-xl px-4 py-3 text-xs text-left space-y-1"
                style={{ background: 'rgba(61,189,181,0.07)', border: '1px solid rgba(61,189,181,0.2)', color: 'rgba(61,189,181,0.8)' }}
              >
                <p>💡 <strong>Próximo paso:</strong></p>
                <p>Hacé click en el cuadro de foto de cada fragancia → seleccioná la imagen correspondiente → se sube automáticamente.</p>
                <p className="pt-1">Recordá: cada fragancia tiene su propia foto específica para este producto (el Sándalo en Sahumerio tiene una foto distinta que el Sándalo en Conito).</p>
              </div>
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={onDone}
                className="w-full py-3 rounded-xl font-semibold text-sm"
                style={{ background: '#3dbdb5', color: 'white' }}
              >
                Listo, ir al editor →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
