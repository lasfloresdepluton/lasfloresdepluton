import AdminShell from '@/components/admin/AdminShell'
import { getAdminProducts, getAdminWholesaleProducts } from '@/lib/admin/actions'
import { ProductsTable } from '@/components/admin/ProductsTable'
import { Package, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminProductsPage() {
  const [retailProducts, wholesaleProducts] = await Promise.all([
    getAdminProducts(),
    getAdminWholesaleProducts()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#3dbdb5]/10 rounded-2xl flex items-center justify-center text-[#3dbdb5]">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-black text-white">Productos</h1>
            <p className="text-sm text-white/50">{retailProducts.length + wholesaleProducts.length} productos en total</p>
          </div>
        </div>
        
        <Link 
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-[#3dbdb5] hover:bg-[#34a39c] text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-[#3dbdb5]/20"
        >
          <Plus size={20} />
          NUEVO PRODUCTO
        </Link>
      </div>

      <ProductsTable retailProducts={retailProducts} wholesaleProducts={wholesaleProducts} />
    </div>
  )
}
