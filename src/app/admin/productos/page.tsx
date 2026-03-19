import AdminShell from '@/components/admin/AdminShell'
import { getAdminProducts } from '@/lib/admin/actions'
import { ProductsTable } from '@/components/admin/ProductsTable'
import { Package, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminProductsPage() {
  const products = await getAdminProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(61,189,181,0.15)', color: '#3dbdb5' }}>
            <Package size={20} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Productos</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
              {products.length} producto{products.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: '#3dbdb5', color: 'white' }}
        >
          <Plus size={16} /> Nuevo producto
        </Link>
      </div>

      <ProductsTable products={products} />
    </div>
  )
}
