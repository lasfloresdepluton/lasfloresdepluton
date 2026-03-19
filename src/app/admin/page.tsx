import AdminShell from '@/components/admin/AdminShell'
import { getDashboardStats, getOrders } from '@/lib/admin/actions'
import { formatPrice } from '@/utils/helpers'
import { Users, ShoppingBag, Clock, TrendingUp } from 'lucide-react'

function StatCard({
  label, value, icon: Icon, color, sub,
}: { label: string; value: string | number; icon: React.ElementType; color: string; sub?: string }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, color }}
        >
          <Icon size={18} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</p>}
    </div>
  )
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:       { label: 'Pendiente',       color: '#f5c842' },
  producing:     { label: 'En producción',   color: '#e8893a' },
  ready_to_ship: { label: 'Listo para env.', color: '#3dbdb5' },
  shipped:       { label: 'Enviado',         color: '#8b6fb5' },
  delivered:     { label: 'Entregado',       color: '#4caf50' },
  cancelled:     { label: 'Cancelado',       color: '#e87070' },
}

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(),
    getOrders(),
  ])

  const recent5 = recentOrders.slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pedidos totales"   value={stats.totalOrders}       icon={ShoppingBag}  color="#3dbdb5" />
        <StatCard label="En producción"     value={stats.pendingOrders}     icon={Clock}        color="#e8893a" sub="pendientes + en producción" />
        <StatCard label="Usuarios"          value={stats.totalUsers}        icon={Users}        color="#8b6fb5" />
        <StatCard label="Clientes pendientes" value={stats.pendingWholesalers} icon={TrendingUp} color="#f5c842" sub="esperan aprobación mayorista" />
      </div>

      {/* Recent orders */}
      <div>
        <h2 className="text-white font-semibold mb-4">Últimos pedidos</h2>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {recent5.length === 0 ? (
            <div className="px-6 py-10 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
              No hay pedidos aún.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recent5.map((order) => {
                  const st = STATUS_LABELS[order.status] ?? { label: order.status, color: '#aaa' }
                  return (
                    <tr
                      key={order.id}
                      className="border-t"
                      style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
                    >
                      <td className="px-4 py-3">{order.profiles?.full_name ?? 'Sin nombre'}</td>
                      <td className="px-4 py-3 capitalize">{order.type}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#3dbdb5' }}>
                        {formatPrice(order.total_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: `${st.color}22`, color: st.color }}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {new Date(order.created_at).toLocaleDateString('es-AR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
