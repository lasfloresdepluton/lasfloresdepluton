import AdminShell from '@/components/admin/AdminShell'
import OrdersTable from '@/components/admin/OrdersTable'
import { getOrders } from '@/lib/admin/actions'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

const FILTER_TABS = [
  { value: 'all',            label: 'Todos' },
  { value: 'pending',        label: 'Pendientes' },
  { value: 'producing',      label: 'En producción' },
  { value: 'ready_to_ship',  label: 'Listos' },
  { value: 'shipped',        label: 'Enviados' },
  { value: 'delivered',      label: 'Entregados' },
]

interface PageProps {
  searchParams: Promise<{ estado?: string }>
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const estado = params.estado ?? 'all'
  const orders = await getOrders(estado)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(61,189,181,0.15)', color: '#3dbdb5' }}>
          <ShoppingBag size={20} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Cola de Pedidos</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
            {orders.length} pedido{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/pedidos${tab.value !== 'all' ? `?estado=${tab.value}` : ''}`}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: estado === tab.value
                ? 'rgba(61,189,181,0.25)'
                : 'rgba(255,255,255,0.06)',
              color: estado === tab.value ? '#3dbdb5' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${estado === tab.value ? 'rgba(61,189,181,0.4)' : 'transparent'}`,
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <OrdersTable orders={orders} />
    </div>
  )
}
