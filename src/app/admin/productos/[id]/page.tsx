import AdminShell from '@/components/admin/AdminShell'
import VariantManager from '@/components/admin/VariantManager'
import ProductImageUploader from '@/components/admin/ProductImageUploader'
import { getAdminProduct, getProductVariants, getAdminFragrances } from '@/lib/admin/actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ExternalLink, Package, Image as ImageIcon } from 'lucide-react'
import { formatPrice } from '@/utils/helpers'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductEditorPage({ params }: Props) {
  const { id } = await params
  const [product, variants, fragrances] = await Promise.all([
    getAdminProduct(id),
    getProductVariants(id),
    getAdminFragrances(),
  ])

  if (!product) notFound()

  const activeFragrances = fragrances.filter((f) => f.is_active)

  // Type assertion for new fields (added via migration)
  const p = product as typeof product & { image_url?: string | null; gallery_urls?: string[] }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos"
            className="flex items-center gap-1 text-sm"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <ChevronLeft size={16} /> Productos
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <h1 className="font-display text-xl font-bold text-white">{product.name}</h1>
        </div>
        <Link
          href={`/productos/${product.slug}`}
          target="_blank"
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(61,189,181,0.12)', color: '#3dbdb5' }}
        >
          <ExternalLink size={12} /> Ver en tienda
        </Link>
      </div>

      {/* Product summary card */}
      <div
        className="rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Precio minorista</p>
          <p className="font-bold text-white mt-0.5">{formatPrice(product.retail_price)}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Precio mayorista</p>
          <p className="font-bold mt-0.5" style={{ color: '#3dbdb5' }}>{formatPrice(product.wholesale_price)}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Categoría</p>
          <p className="text-white text-sm mt-0.5">{product.categories?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Tipo</p>
          <p className="text-white text-sm mt-0.5">
            {product.is_pack ? `Pack de ${product.pack_slots}` : 'Producto individual'}
          </p>
        </div>
      </div>

      {/* ── SECTION 1: General product images ────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon size={16} style={{ color: '#f5c842' }} />
          <h2 className="font-semibold text-white">
            Fotos generales del producto
          </h2>
        </div>
        <ProductImageUploader
          productId={product.id}
          productName={product.name}
          initialImageUrl={p.image_url}
          initialGallery={p.gallery_urls ?? []}
        />
      </div>

      {/* ── SECTION 2: Fragrance variants (only for fragrance products) ───────── */}
      {product.is_pack || activeFragrances.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} style={{ color: '#3dbdb5' }} />
            <h2 className="font-semibold text-white">
              Fragancias y fotos por variante
              <span className="ml-2 text-sm font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>
                ({variants.length} variante{variants.length !== 1 ? 's' : ''})
              </span>
            </h2>
          </div>
          <VariantManager
            productId={product.id}
            productName={product.name}
            initialVariants={variants}
            fragrances={activeFragrances}
          />
        </div>
      ) : (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
        >
          Este producto no tiene variantes de fragancia. Las fotos generales de arriba son suficientes.
        </div>
      )}
    </div>
  )
}
