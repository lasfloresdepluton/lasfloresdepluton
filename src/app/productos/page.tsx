import { getProducts, getCategories } from '@/lib/products/actions'
import { getSession, getProfile } from '@/lib/auth/actions'
import NavbarWrapper from '@/components/layout/NavbarWrapper'
import ProductCard from '@/components/shop/ProductCard'
import Link from 'next/link'
import { Filter } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ categoria?: string; buscar?: string }>
}

const categoryEmojis: Record<string, string> = {
  sahumerios: '🌿',
  conitos: '🌸',
  sahumos: '✨',
  packs: '🎁',
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const user = await getSession()
  let isWholesale = false
  if (user) {
    const profile = await getProfile(user.id) as { role: string; is_verified_wholesaler: boolean } | null
    isWholesale = profile?.role === 'wholesaler' && !!profile?.is_verified_wholesaler
  }

  const [products, categories] = await Promise.all([
    getProducts(params.categoria, isWholesale),
    getCategories(),
  ])

  const filtered = params.buscar
    ? products.filter((p) =>
        p.name.toLowerCase().includes(params.buscar!.toLowerCase())
      )
    : products

  return (
    <div style={{ background: 'var(--bg-cream)', minHeight: '100vh' }}>
      <NavbarWrapper />

      {/* Header */}
      <div
        className="pt-28 pb-12 px-6 text-center"
        style={{ background: 'linear-gradient(160deg, var(--bg-cream), var(--bg-paper))' }}
      >
        <h1 className="font-display text-4xl md:text-5xl font-black mb-3" style={{ color: 'var(--text-dark)' }}>
          Nuestros Productos
        </h1>
        <p className="text-base" style={{ color: 'var(--text-medium)' }}>
          Artesanales, naturales, con amor. Elegí tus fragancias.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        {/* Category filter pills */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <div className="flex items-center gap-2 mr-2" style={{ color: 'var(--text-light)' }}>
            <Filter size={16} />
            <span className="text-sm font-medium">Filtrar:</span>
          </div>

          <Link
            href="/productos"
            className={`fragrance-pill ${!params.categoria ? 'selected' : ''}`}
          >
            Todos
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/productos?categoria=${cat.slug}`}
              className={`fragrance-pill ${params.categoria === cat.slug ? 'selected' : ''}`}
            >
              {categoryEmojis[cat.slug] ?? '•'} {cat.name}
            </Link>
          ))}
        </div>

        {/* Wholesale notice */}
        {isWholesale && (
          <div
            className="rounded-2xl px-5 py-3 mb-6 flex items-center gap-3 text-sm font-medium"
            style={{ background: 'rgba(61,189,181,0.1)', border: '1px solid rgba(61,189,181,0.3)', color: 'var(--accent-teal-dark)' }}
          >
            ✦ Estás viendo precios mayoristas
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--text-light)' }}>
            <p className="text-5xl mb-4">🌿</p>
            <p className="font-display text-xl" style={{ color: 'var(--text-medium)' }}>
              No encontramos productos en esta categoría.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} isWholesale={isWholesale} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
