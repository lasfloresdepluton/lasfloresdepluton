'use client'

import { useState, useTransition } from 'react'
import { approveWholesaler, revokeWholesaler } from '@/lib/admin/actions'
import type { AdminUser } from '@/lib/admin/actions'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin:       { label: 'Admin',      color: '#f5c842' },
  wholesaler:  { label: 'Mayorista',  color: '#3dbdb5' },
  customer:    { label: 'Cliente',    color: 'rgba(255,255,255,0.4)' },
}

export default function UsersTable({ users }: { users: AdminUser[] }) {
  const [pending, startTransition] = useTransition()
  const [actionId, setActionId] = useState<string | null>(null)

  function handleApprove(userId: string) {
    setActionId(userId)
    startTransition(async () => {
      await approveWholesaler(userId)
      setActionId(null)
    })
  }

  function handleRevoke(userId: string) {
    setActionId(userId)
    startTransition(async () => {
      await revokeWholesaler(userId)
      setActionId(null)
    })
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Teléfono</th>
            <th className="px-4 py-3 text-left hidden lg:table-cell">Ciudad</th>
            <th className="px-4 py-3 text-left">Rol</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Registrado</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const roleInfo = ROLE_LABELS[user.role] ?? { label: user.role, color: '#aaa' }
            const isLoading = actionId === user.id && pending

            return (
              <tr
                key={user.id}
                className="border-t"
                style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)' }}
              >
                <td className="px-4 py-3">
                  <p className="font-medium">{user.full_name ?? 'Sin nombre'}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {user.id.slice(0, 8)}...
                  </p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {user.phone ?? '—'}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {user.city ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: `${roleInfo.color}22`, color: roleInfo.color }}
                  >
                    {roleInfo.label}
                    {user.is_verified_wholesaler && ' ✓'}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {new Date(user.created_at).toLocaleDateString('es-AR')}
                </td>
                <td className="px-4 py-3">
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" style={{ color: '#3dbdb5' }} />
                  ) : user.is_verified_wholesaler ? (
                    <button
                      onClick={() => handleRevoke(user.id)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                      style={{ background: 'rgba(232,112,112,0.15)', color: '#e87070' }}
                      title="Revocar acceso mayorista"
                    >
                      <XCircle size={13} /> Revocar
                    </button>
                  ) : user.role !== 'admin' ? (
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                      style={{ background: 'rgba(61,189,181,0.15)', color: '#3dbdb5' }}
                      title="Aprobar como mayorista"
                    >
                      <CheckCircle size={13} /> Aprobar
                    </button>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
