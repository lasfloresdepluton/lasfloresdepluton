import AdminShell from '@/components/admin/AdminShell'
import ProductForm from '@/components/admin/ProductForm'
import { getAdminCategories } from '@/lib/admin/actions'
import { ChevronLeft, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function NuevoProductoPage() {
  const categories = await getAdminCategories()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/productos"
          className="flex items-center gap-1 text-sm"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <ChevronLeft size={16} /> Productos
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
        <h1 className="font-display text-xl font-bold text-white">Nuevo producto</h1>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Paso 1: Completá los datos del producto. Después podrás agregar las fragancias y subir las fotos de cada una.
        </p>
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}
