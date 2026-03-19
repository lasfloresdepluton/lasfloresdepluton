'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus } from '@/lib/admin/actions'
import type { AdminOrder } from '@/lib/admin/actions'
import { formatPrice } from '@/utils/helpers'
import { Loader2, ChevronDown } from 'lucide-react'

const STATUSES = [
  { value: 'pending',       label: 'Pendiente',        color: '#f5c842' },
  { value: 'producing',     label: 'En producción',    color: '#e8893a' },
  { value: 'ready_to_ship', label: 'Listo para envío', color: '#3dbdb5' },
  { value: 'shipped',       label: 'Enviado',          color: '#8b6fb5' },
  { value: 'delivered',     label: 'Entregado',        color: '#4caf50' },
  { value: 'cancelled',     label: 'Cancelado',        color: '#e87070' },
]

function StatusBadge({ status }: { status: string }) {
  const s = STATUSES.find((x) => x.value === status)
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `${s?.color ?? '#aaa'}22`, color: s?.color ?? '#aaa' }}
    >
      {s?.label ?? status}
    </span>
  )
}

function OrderRow({ order }: { order: AdminOrder }) {
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(order.status)
  const [pending, startTransition] = useTransition()

  function handleUpdate() {
    startTransition(async () => {
      await updateOrderStatus(order.id, selectedStatus)
    })
  }

  const addr = order.shipping_address as Record<string, string> | null

  return (
    <>
      <tr
        className="border-t cursor-pointer hover:bg-white/5 transition-colors"
        style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)' }}
        onClick={() => setOpen(!open)}
      >
        <td className="px-4 py-3">
          <p className="font-medium text-xs" style={{ color: '#3dbdb5' }}>#{order.id.slice(0,8)}</p>
        </td>
        <td className="px-4 py-3">{order.profiles?.full_name ?? 'Sin nombre'}</td>
        <td className="px-4 py-3 hidden md:table-cell">
          <span className="capitalize text-xs px-2 py-0.5 rounded-full"
            style={{ background: order.type === 'wholesale' ? 'rgba(61,189,181,0.15)' : 'rgba(200,169,122,0.15)',
                     color: order.type === 'wholesale' ? '#3dbdb5' : '#c8a97a' }}>
            {order.type === 'wholesale' ? 'Mayor' : 'Menor'}
          </span>
        </td>
        <td className="px-4 py-3 font-bold" style={{ color: '#3dbdb5' }}>
          {formatPrice(order.total_amount)}
        </td>
        <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
        <td className="px-4 py-3 hidden lg:table-cell" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
          {order.scheduled_dispatch_date
            ? new Date(order.scheduled_dispatch_date).toLocaleDateString('es-AR')
            : '—'}
        </td>
        <td className="px-4 py-3 text-right">
          <ChevronDown
            size={16}
            style={{ color: 'rgba(255,255,255,0.4)', transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
          />
        </td>
      </tr>

      {/* Expanded detail */}
      {open && (
        <tr>
          <td colSpan={7} className="px-4 pb-4">
            <div
              className="rounded-xl p-4 mt-1 grid grid-cols-1 md:grid-cols-2 gap-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Address */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>DIRECCIÓN</p>
                {addr ? (
                  <div className="text-sm space-y-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    <p>{addr.full_name}</p>
                    <p>{addr.address}</p>
                    <p>{addr.city}, CP {addr.postal_code}, {addr.province}</p>
                    <p>{addr.phone}</p>
                  </div>
                ) : <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Sin dirección</p>}
                <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Envío: <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{order.shipping_method ?? '—'}</strong>
                </p>
              </div>

              {/* Change status */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>CAMBIAR ESTADO</p>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl text-sm"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value} style={{ background: '#1a1408' }}>{s.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleUpdate}
                    disabled={pending || selectedStatus === order.status}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity"
                    style={{
                      background: '#3dbdb5',
                      color: 'white',
                      opacity: (pending || selectedStatus === order.status) ? 0.5 : 1,
                    }}
                  >
                    {pending ? <Loader2 size={14} className="animate-spin" /> : 'Guardar'}
                  </button>
                </div>
                {order.notes && (
                  <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Notas: {order.notes}
                  </p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function OrdersTable({ orders }: { orders: AdminOrder[] }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      {orders.length === 0 ? (
        <div className="px-6 py-12 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
          No hay pedidos con este estado.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Tipo</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Despacho</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
