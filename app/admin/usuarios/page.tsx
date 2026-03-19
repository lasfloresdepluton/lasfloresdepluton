import AdminShell from '@/components/admin/AdminShell'
import UsersTable from '@/components/admin/UsersTable'
import { getUsers } from '@/lib/admin/actions'
import { Users } from 'lucide-react'

export default async function AdminUsersPage() {
  const users = await getUsers()

  const pending = users.filter((u) => u.role === 'customer' && !u.is_verified_wholesaler)
  const wholesalers = users.filter((u) => u.is_verified_wholesaler)
  const others = users.filter((u) => !u.is_verified_wholesaler && u.role !== 'customer' && u.role !== 'admin')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(61,189,181,0.15)', color: '#3dbdb5' }}
        >
          <Users size={20} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Usuarios</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Pending wholesaler approvals — shown prominently */}
      {pending.length > 0 && (
        <section>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl mb-3"
            style={{ background: 'rgba(245,200,66,0.12)', border: '1px solid rgba(245,200,66,0.3)' }}
          >
            <span style={{ color: '#f5c842', fontSize: '0.85rem', fontWeight: 600 }}>
              ⚠ {pending.length} solicitud{pending.length !== 1 ? 'es' : ''} de acceso mayorista pendiente{pending.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Estos usuarios se registraron y pueden estar esperando acceso mayorista. Aprobá o ignoralos.
          </p>
          <UsersTable users={pending} />
        </section>
      )}

      {/* Mayoristas activos */}
      <section>
        <h2 className="text-white font-semibold mb-3 text-sm">
          Mayoristas activos ({wholesalers.length})
        </h2>
        {wholesalers.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Ninguno aún.</p>
        ) : (
          <UsersTable users={wholesalers} />
        )}
      </section>

      {/* Todos los clientes */}
      <section>
        <h2 className="text-white font-semibold mb-3 text-sm">
          Todos los usuarios ({users.length})
        </h2>
        <UsersTable users={users} />
      </section>
    </div>
  )
}
