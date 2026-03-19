'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toggleProductActive } from '@/lib/admin/actions'
import type { AdminProduct } from '@/lib/admin/actions'
import { formatPrice } from '@/utils/helpers'
import { Loader2, Eye, EyeOff, Pencil } from 'lucide-react'

interface Props {
  retailProducts: AdminProduct[]
  wholesaleProducts: AdminProduct[]
}

export function ProductsTable({ retailProducts, wholesaleProducts }: Props) {
  const [view, setView] = useState<'retail' | 'wholesale'>('retail')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [actionId, setActionId] = useState<string | null>(null)

  function handleToggle(id: string, isActive: boolean) {
    setActionId(id)
    startTransition(async () => {
      await toggleProductActive(id, !isActive)
      setActionId(null)
    })
  }

  const filtered = view === 'retail' ? retailProducts : wholesaleProducts

  return (
    <div className="space-y-4">
      {/* List Toggle */}
      <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-white/10">
        <button
          onClick={() => setView('retail')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            view === 'retail' ? 'bg-[#3dbdb5] text-white shadow-lg' : 'text-white/40 hover:text-white/70'
          }`}
        >
          LISTA MINORISTA
        </button>
        <button
          onClick={() => setView('wholesale')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            view === 'wholesale' ? 'bg-[#c8a97a] text-white shadow-lg' : 'text-white/40 hover:text-white/70'
          }`}
        >
          LISTA MAYORISTA
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
            No hay productos en la lista {view === 'retail' ? 'minorista' : 'mayorista'}.
          </div>
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}>
              <th className="px-4 py-3 text-left">Producto</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">
                {view === 'retail' ? 'Categoría' : 'Categoría Mayorista'}
              </th>
              <th className="px-4 py-3 text-left">
                {view === 'retail' ? 'Precio min.' : 'P.U. Mayorista'}
              </th>
              {view === 'wholesale' && (
                <th className="px-4 py-3 text-left hidden lg:table-cell">Reglas</th>
              )}
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const isLoading = actionId === p.id && pending
              return (
                <tr
                  key={p.id}
                  className="border-t"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)' }}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.name}</p>
                    {p.is_pack && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(139,111,181,0.2)', color: '#8b6fb5' }}>
                        Pack {p.pack_slots}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {view === 'retail' 
                      ? (p.categories?.name ?? '—')
                      : (p.wholesale_category ?? '—')}
                   </td>
                   <td className="px-4 py-3 font-semibold" style={{ color: view === 'retail' ? '#3dbdb5' : '#c8a97a' }}>
                    {formatPrice(view === 'retail' ? p.retail_price : p.wholesale_price)}
                   </td>
                   {view === 'wholesale' && (
                     <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-col gap-1">
                           <span className="text-[10px] opacity-40 uppercase font-black">Mínimo x Fragancia</span>
                           <span className="text-xs font-bold text-[#c8a97a]">{p.min_qty_per_variant} u.</span>
                        </div>
                     </td>
                   )}
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: p.is_active ? 'rgba(76,175,80,0.15)' : 'rgba(232,112,112,0.15)',
                        color: p.is_active ? '#4caf50' : '#e87070',
                      }}>
                      {p.is_active ? 'Activo' : 'Oculto'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Edit link */}
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(61,189,181,0.12)', color: '#3dbdb5' }}
                        title="Editar producto y fragancias"
                      >
                        <Pencil size={12} /> Editar
                      </Link>

                      {/* Toggle active */}
                      {isLoading ? (
                        <Loader2 size={14} className="animate-spin" style={{ color: '#3dbdb5' }} />
                      ) : (
                        <button
                          onClick={() => handleToggle(p.id, p.is_active)}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                          style={{
                            background: p.is_active ? 'rgba(232,112,112,0.12)' : 'rgba(76,175,80,0.12)',
                            color: p.is_active ? '#e87070' : '#4caf50',
                          }}
                        >
                          {p.is_active ? <><EyeOff size={12}/> Ocultar</> : <><Eye size={12}/> Activar</>}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      </div>
    </div>
  )
}
