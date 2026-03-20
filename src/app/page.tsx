import Link from 'next/link';
import Image from 'next/image';
import { getLogo, getAdminCategories, getSiteSettings } from '@/lib/admin/actions';
import { Sparkles, Package, TruckIcon, Leaf } from 'lucide-react';


const categories = [
  {
    name: 'Sahumerios',
    slug: 'sahumerios',
    description: 'Varas artesanales en decenas de fragancias',
    color: '#3dbdb5',
    emoji: '🌿',
  },
  {
    name: 'Conitos',
    slug: 'conitos',
    description: 'Pepas y conos de sahumado para tu espacio',
    color: '#e8893a',
    emoji: '🌸',
  },
  {
    name: 'Sahumos',
    slug: 'sahumos',
    description: 'Pasta de sahumado pura y natural',
    color: '#c8a97a',
    emoji: '✨',
  },
  {
    name: 'Packs',
    slug: 'packs',
    description: 'Armá tu pack con las fragancias que quieras',
    color: '#8b6fb5',
    emoji: '🎁',
  },
];

const features = [
  {
    icon: <Leaf size={24} />,
    title: 'Artesanal 100%',
    desc: 'Cada producto elaborado a mano con ingredientes naturales.',
  },
  {
    icon: <Package size={24} />,
    title: 'Packs personalizados',
    desc: 'Elegí las fragancias que querés en cada pack.',
  },
  {
    icon: <TruckIcon size={24} />,
    title: 'Envíos a todo el país',
    desc: 'Por correo o moto en CABA y GBA.',
  },
  {
    icon: <Sparkles size={24} />,
    title: 'Precios mayoristas',
    desc: 'Accedé a lista de precios especial para revendedores.',
  },
];


export default async function HomePage() {
  const [logoUrl, dbCategories, settings] = await Promise.all([
    getLogo(),
    getAdminCategories(),
    getSiteSettings(),
  ])

  // Map of static metadata for categories (emojis/colors)
  const categoryMetadata: Record<string, { color: string; emoji: string }> = {
    'sahumerios': { color: '#3dbdb5', emoji: '🌿' },
    'conitos': { color: '#e8893a', emoji: '🌸' },
    'sahumos': { color: '#c8a97a', emoji: '✨' },
    'packs': { color: '#8b6fb5', emoji: '🎁' },
    'eco-tibetana': { color: '#3dbdb5', emoji: '🍃' },
    'especialidades': { color: '#f5c842', emoji: '🏺' },
    'defumacion': { color: '#c8a97a', emoji: '✨' },
    'palo-santo': { color: '#e87070', emoji: '🪵' },
  }

  const displayCategories = [
    ...dbCategories.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image_url: cat.image_url,
      color: categoryMetadata[cat.slug]?.color || '#3dbdb5',
      emoji: categoryMetadata[cat.slug]?.emoji || '✦'
    })),
    ...(!dbCategories.find((c) => c.slug === 'packs') ? [{
      name: 'Packs',
      slug: 'packs',
      description: 'Armá tu pack con las fragancias que quieras',
      image_url: null,
      color: '#8b6fb5',
      emoji: '🎁'
    }] : [])
  ].slice(0, 4)

  return (
    <div style={{ background: 'var(--bg-cream)', minHeight: '100vh' }}>


      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        style={{ background: 'linear-gradient(160deg, #f5f0e8 0%, #ede8dc 50%, #e8e0d0 100%)' }}
      >
        {/* Organic blobs */}
        <div
          className="blob blob-teal animate-float"
          style={{ width: 500, height: 500, top: -100, right: -150 }}
        />
        <div
          className="blob blob-orange animate-float"
          style={{ width: 300, height: 300, bottom: 50, left: -100, animationDelay: '1.5s' }}
        />
        <div
          className="blob blob-yellow animate-float"
          style={{ width: 200, height: 200, top: '30%', left: '10%', animationDelay: '0.8s' }}
        />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Brand Presentation: Logo OR Text Title */}
          {logoUrl ? (
            <h1 className="flex justify-center mb-8 animate-fade-in-up">
              <div className="relative h-64 md:h-[340px] w-full max-w-4xl">
                <Image
                  src={logoUrl}
                  alt={settings.hero_title || "Las Flores de Plutón"}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </h1>
          ) : (
            <h1
              className="font-display text-5xl md:text-7xl font-black leading-tight mb-6 animate-fade-in-up"
              style={{ color: 'var(--text-dark)', animationDelay: '0.1s' }}
            >
              {settings.hero_title || "Las Flores"}
              <br />
              <span style={{ color: 'var(--accent-teal)' }}>de Plutón</span>
            </h1>
          )}

          {/* Badge */}
          <span className="badge-teal mb-10 inline-block animate-fade-in-up">
            {settings.hero_badge || "✦ Artesanal · Natural · Único"}
          </span>

          <p
            className="text-lg md:text-xl mb-10 animate-fade-in-up"
            style={{ color: 'var(--text-medium)', maxWidth: 520, margin: '0 auto 2.5rem', animationDelay: '0.2s' }}
          >
            {settings.hero_description || "Sahumerios artesanales para purificar tu espacio. Elegí tus fragancias favoritas y armá tu pack ideal."}
          </p>

          <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/productos" className="btn-primary text-base px-8 py-4">
              {settings.hero_btn_primary || "Explorar productos"}
            </Link>
            <Link href="/mayoristas" className="btn-secondary text-base px-8 py-4">
              {settings.hero_btn_secondary || "Soy mayorista"}
            </Link>
          </div>

          {/* Floating incense sticks visual */}
          <div className="mt-16 flex justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            {['#3dbdb5', '#e8893a', '#f5c842', '#e87070', '#8b6fb5', '#3dbdb5', '#c8a97a'].map((color, i) => (
              <div
                key={i}
                className="rounded-full animate-float"
                style={{
                  width: 8,
                  height: 80 + (i % 3) * 24,
                  background: `linear-gradient(to bottom, ${color}, ${color}88)`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${3 + i * 0.3}s`,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── RIPPED PAPER TRANSITION ────────────────────────────────────── */}
      <div className="ripped-paper py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl mb-3" style={{ color: 'var(--text-dark)' }}>
              {settings.section_products_title || "Nuestros productos"}
            </h2>
            <p style={{ color: 'var(--text-medium)' }}>
              {settings.section_products_desc || "Cada pieza elaborada a mano, con amor y fragancias naturales."}
            </p>
          </div>

          {/* Category grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {displayCategories.map((cat, i) => (
              <Link
                href={`/productos?categoria=${cat.slug}`}
                key={cat.slug}
                className="product-card group block text-center p-6 overflow-hidden"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto transition-transform group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden shrink-0"
                  style={{ background: cat.image_url ? 'none' : `${cat.color}22` }}
                >
                  {cat.image_url ? (
                    <Image 
                      src={cat.image_url} 
                      alt={cat.name} 
                      fill 
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    cat.emoji
                  )}
                </div>
                <h3
                  className="font-display text-lg font-bold mb-1"
                  style={{ color: cat.color }}
                >
                  {cat.name}
                </h3>
                <p className="text-sm line-clamp-2" style={{ color: 'var(--text-light)' }}>
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: 'var(--text-dark)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="font-display text-4xl text-white mb-3"
            >
              ¿Por qué elegirnos?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <div
                key={i}
                className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(61,189,181,0.15)', color: 'var(--accent-teal)' }}
                >
                  {feat.icon}
                </div>
                <h3 className="font-display text-lg text-white mb-2">{feat.title}</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACK CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center" style={{ background: 'var(--bg-cream)' }}>
        <div className="max-w-2xl mx-auto">
          <span className="badge-kraft mb-6 inline-block">✦ Especial</span>
          <h2 className="font-display text-4xl md:text-5xl font-black mb-6" style={{ color: 'var(--text-dark)' }}>
            Armá tu pack
            <br />
            <span style={{ color: 'var(--accent-teal)' }}>a tu medida</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: 'var(--text-medium)' }}>
            Elegí cualquier combinación de fragancias para tu pack de 10.
            Sándalo, lavanda, rosas, jazmín… ¡tus preferidas!
          </p>
          <Link href="/productos?categoria=packs" className="btn-primary text-lg px-10 py-4">
            Armar mi pack →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer
        className="py-10 px-6 text-center text-sm"
        style={{ background: 'var(--bg-paper)', borderTop: '1px solid var(--border-paper)', color: 'var(--text-light)' }}
      >
        <p className="font-display text-base mb-2" style={{ color: 'var(--text-dark)' }}>
          Las Flores de Plutón
        </p>
        <p>© {new Date().getFullYear()} · Sahumerios artesanales · CABA, Argentina</p>
        <div className="flex justify-center gap-4 mt-4">
          <Link href="/terminos" className="hover:text-[color:var(--accent-teal)] transition-colors">
            Términos y condiciones
          </Link>
          <span>·</span>
          <Link href="/privacidad" className="hover:text-[color:var(--accent-teal)] transition-colors">
            Privacidad
          </Link>
        </div>
      </footer>
    </div>
  );
}
