'use client'

import { useState, useTransition } from 'react'
import {
  createFragrance,
  toggleFragranceActive,
  deleteFragrance,
  updateFragranceName,
} from '@/lib/admin/actions'
import type { AdminFragrance } from '@/lib/admin/actions'
import { Loader2, Plus, Eye, EyeOff, Trash2, Pencil, Check, X } from 'lucide-react'

export default function FragranceManager({ fragrances: initial }: { fragrances: AdminFragrance[] }) {
  const [fragrances, setFragrances] = useState(initial)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [pending, startTransition] = useTransition()

  // Per-row state
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)   // confirm step

  // ── Create ─────────────────────────────────────────────────────────────────
  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    startTransition(async () => {
      const res = await createFragrance(name.trim(), description.trim() || undefined)
      if (res.ok) {
        // optimistic: reload page to fetch DB-generated ID
        setName('')
        setDescription('')
        window.location.reload()
      }
    })
  }

  // ── Toggle active ──────────────────────────────────────────────────────────
  function handleToggle(f: AdminFragrance) {
    setLoadingId(f.id)
    startTransition(async () => {
      await toggleFragranceActive(f.id, !f.is_active)
      setFragrances((prev) =>
        prev.map((x) => (x.id === f.id ? { ...x, is_active: !f.is_active } : x))
      )
      setLoadingId(null)
    })
  }

  // ── Rename ─────────────────────────────────────────────────────────────────
  function startEdit(f: AdminFragrance) {
    setEditId(f.id)
    setEditName(f.name)
  }

  function handleRename(f: AdminFragrance) {
    if (!editName.trim() || editName.trim() === f.name) { setEditId(null); return }
    setLoadingId(f.id)
    startTransition(async () => {
      const res = await updateFragranceName(f.id, editName.trim())
      if (res.ok) {
        setFragrances((prev) =>
          prev.map((x) => (x.id === f.id ? { ...x, name: editName.trim() } : x))
        )
      }
      setEditId(null)
      setLoadingId(null)
    })
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function handleConfirmDelete(f: AdminFragrance) {
    setLoadingId(f.id)
    setDeletingId(null)
    startTransition(async () => {
      const res = await deleteFragrance(f.id)
      if (res.ok) {
        setFragrances((prev) => prev.filter((x) => x.id !== f.id))
      }
      setLoadingId(null)
    })
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.08)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '0.75rem',
    padding: '0.45rem 0.75rem',
    fontSize: '0.875rem',
  }

  return (
    <div className="space-y-6">
      {/* ── Create form ─────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleCreate}
        className="rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-sm font-semibold text-white mb-3">Nueva fragancia</p>
        <div className="flex gap-3 flex-wrap">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre (ej: Sándalo)"
            required
            style={{ ...inputStyle, flex: '1 1 140px' }}
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            style={{ ...inputStyle, flex: '2 1 200px' }}
          />
          <button
            type="submit"
            disabled={pending || !name.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: '#3dbdb5', color: 'white', opacity: (pending || !name.trim()) ? 0.5 : 1 }}
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Agregar
          </button>
        </div>
      </form>

      {/* ── Fragrance table ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}>
              <th className="px-4 py-3 text-left">Fragancia</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {fragrances.map((f) => {
              const isLoading = loadingId === f.id && pending
              const isEditing = editId === f.id
              const isConfirmingDelete = deletingId === f.id

              return (
                <tr
                  key={f.id}
                  className="border-t"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)' }}
                >
                  {/* Name / edit field */}
                  <td className="px-4 py-2.5">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleRename(f); if (e.key === 'Escape') setEditId(null) }}
                          style={{ ...inputStyle, width: 160 }}
                        />
                        <button onClick={() => handleRename(f)} className="p-1.5 rounded-lg"
                          style={{ background: 'rgba(61,189,181,0.15)', color: '#3dbdb5' }}>
                          <Check size={13} />
                        </button>
                        <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{f.name}</span>
                        <button onClick={() => startEdit(f)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded"
                          style={{ color: 'rgba(255,255,255,0.3)' }}
                          title="Renombrar">
                          <Pencil size={12} />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: f.is_active ? 'rgba(76,175,80,0.15)' : 'rgba(232,112,112,0.15)',
                        color: f.is_active ? '#4caf50' : '#e87070',
                      }}>
                      {f.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-2.5">
                    {isLoading ? (
                      <Loader2 size={14} className="animate-spin" style={{ color: '#3dbdb5' }} />
                    ) : isConfirmingDelete ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: '#e87070' }}>¿Eliminar?</span>
                        <button
                          onClick={() => handleConfirmDelete(f)}
                          className="text-xs px-2 py-1 rounded-lg font-semibold"
                          style={{ background: 'rgba(232,112,112,0.2)', color: '#e87070' }}
                        >Sí, eliminar</button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="text-xs px-2 py-1 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                        >Cancelar</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* Edit */}
                        <button
                          onClick={() => startEdit(f)}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                          style={{ background: 'rgba(61,189,181,0.1)', color: '#3dbdb5' }}
                          title="Renombrar"
                        >
                          <Pencil size={11} /> Editar
                        </button>

                        {/* Toggle active */}
                        <button
                          onClick={() => handleToggle(f)}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                          style={{
                            background: f.is_active ? 'rgba(232,112,112,0.1)' : 'rgba(76,175,80,0.1)',
                            color: f.is_active ? '#e87070' : '#4caf50',
                          }}
                        >
                          {f.is_active ? <><EyeOff size={11}/> Ocultar</> : <><Eye size={11}/> Activar</>}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeletingId(f.id)}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                          style={{ background: 'rgba(232,112,112,0.08)', color: '#e87070' }}
                          title="Eliminar fragancia"
                        >
                          <Trash2 size={11} /> Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        ⚠ Eliminar una fragancia la quita de TODOS los productos a los que estaba asignada.
      </p>
    </div>
  )
}
