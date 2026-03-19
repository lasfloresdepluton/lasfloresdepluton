import { getProductBySlug } from '@/lib/products/actions'
import { getSession, getProfile } from '@/lib/auth/actions'
import NavbarWrapper from '@/components/layout/NavbarWrapper'
import FragranceSelector from '@/components/shop/FragranceSelector'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Truck, Clock } from 'lucide-react'
import { getDispatchDate } from '@/utils/helpers'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [product, user] = await Promise.all([
    getProductBySlug(slug),
    getSession(),
  ])

  if (!product) notFound()

  let isWholesale = false
  if (user) {
    const profile = await getProfile(user.id) as { role: string; is_verified_wholesaler: boolean } | null
    isWholesale = profile?.role === 'wholesaler' && !!profile?.is_verified_wholesaler
  }

  const retailDispatch = getDispatchDate('retail')
  const wholesaleDispatch = getDispatchDate('wholesale')

  return (
    <div style={{ background: 'var(--bg-cream)', minHeight: '100vh' }}>
      <NavbarWrapper />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--text-light)' }}>
          <Link href="/productos" className="flex items-center gap-1 hover:text-[color:var(--accent-teal)] transition-colors">
            <ChevronLeft size={16} /> Productos
          </Link>
          {product.categories && (
            <>
              <span>/</span>
              <Link
                href={`/productos?categoria=${product.categories.slug}`}
                className="hover:text-[color:var(--accent-teal)] transition-colors"
              >
                {product.categories.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: 'var(--text-dark)' }}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left — Fragrance selector (client component handles image + picker) */}
          <FragranceSelector product={product} isWholesale={isWholesale} />

          {/* Right — Product info */}
          <div className="space-y-6">
            <div>
              {product.categories && (
                <span className="badge-teal mb-3 inline-block">{product.categories.name}</span>
              )}
              <h1 className="font-display text-3xl md:text-4xl font-black mb-2" style={{ color: 'var(--text-dark)' }}>
                {product.name}
              </h1>
              {product.description && (
                <p className="leading-relaxed" style={{ color: 'var(--text-medium)' }}>
                  {product.description}
                </p>
              )}
            </div>

            {/* Pack info */}
            {product.is_pack && product.pack_slots > 0 && (
              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(61,189,181,0.08)', border: '1px solid rgba(61,189,181,0.25)' }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent-teal-dark)' }}>
                  ✦ Pack personalizable — {product.pack_slots} fragancias a elección
                </p>
                <p className="text-sm" style={{ color: 'var(--text-medium)' }}>
                  Podés repetir fragancias. Cada combinación es única y artesanal.
                </p>
              </div>
            )}

            {/* SLA / Dispatch info */}
            <div
              className="rounded-2xl p-4 space-y-2"
              style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-paper)' }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                Información de envío
              </p>
              <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-medium)' }}>
                <Clock size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-teal)' }} />
                <span>
                  <strong>Minorista:</strong> despacho estimado el{' '}
                  <strong>{retailDispatch.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
                </span>
              </div>
              {isWholesale && (
                <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-medium)' }}>
                  <Clock size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-orange)' }} />
                  <span>
                    <strong>Mayorista:</strong> producción artesanal — despacho estimado el{' '}
                    <strong>{wholesaleDispatch.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
                  </span>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-medium)' }}>
                <Truck size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-teal)' }} />
                <span>Correo argentino a todo el país. Motomensajería en CABA y GBA.</span>
              </div>
            </div>

            {/* Wholesale access link */}
            {!isWholesale && (
              <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                ¿Revendés productos?{' '}
                <Link href="/mayoristas" style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>
                  Conocé nuestros precios mayoristas →
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
