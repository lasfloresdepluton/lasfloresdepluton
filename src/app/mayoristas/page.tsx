import NavbarWrapper from '@/components/layout/NavbarWrapper'
import Link from 'next/link'
import { Store, Clock, Shield, MessageCircle, FileText } from 'lucide-react'
import { getSession, getProfile } from '@/lib/auth/actions'
import { getWholesaleProducts, WholesaleProduct, getFragrances, Fragrance } from '@/lib/products/actions'
import WholesaleQuickOrder from '@/components/shop/WholesaleQuickOrder'

export default async function MayoristasPage() {
  const user = await getSession()
  let isWholesaler = false
  let profile = null

  if (user) {
    profile = await getProfile(user.id) as { role: string; is_verified_wholesaler: boolean } | null
    isWholesaler = profile?.role === 'wholesaler' && !!profile?.is_verified_wholesaler
  }

  // If verified wholesaler, show the quick order table
  if (isWholesaler) {
    const [products, fragrances] = await Promise.all([
      getWholesaleProducts(),
      getFragrances()
    ])
    return (
      <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
        <NavbarWrapper />
        <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#3dbdb51a] text-[#3dbdb5]">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="font-display text-3xl font-black text-gray-900 leading-tight">Lista Mayorista 2026</h1>
                <p className="text-gray-500 font-medium italic">Marzo - Vigente hasta 31/03</p>
              </div>
            </div>
            <div className="bg-[#E8893A14] border border-[#E8893A40] p-4 rounded-2xl flex items-start gap-3 max-w-sm">
              <Clock size={18} className="text-[#E8893A] mt-1 shrink-0" />
              <p className="text-xs text-[#E8893A] font-medium leading-relaxed">
                Producción artesanal a pedido. <br />Plazo despacho: <strong>10 días hábiles</strong>.
              </p>
            </div>
          </div>
          
          <WholesaleQuickOrder products={products} fragrances={fragrances} />
        </div>
      </div>
    )
  }

  // Otherwise show the landing page
  return (
    <div style={{ background: 'var(--bg-cream)', minHeight: '100vh' }}>
      <NavbarWrapper />
      {/* ... previous landing page content ... */}
      <div
        className="pt-28 pb-16 px-6 text-center relative overflow-hidden"
        style={{ background: 'var(--text-dark)' }}
      >
        <div className="blob blob-teal animate-float" style={{ width: 400, height: 400, top: -100, right: -100 }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="badge-teal mb-6 inline-block">✦ Programa Mayorista</span>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
            Revendé Las Flores
            <br />
            <span style={{ color: 'var(--accent-teal)' }}>de Plutón</span>
          </h1>
          <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Accedé a precios especiales de lista mayorista con producción a pedido.
            Ideal para tiendas esotéricas, mercados y revendedores.
          </p>
          <Link
            href="https://wa.me/5491100000000?text=Hola,%20quiero%20info%20sobre%20precios%20mayoristas%20de%20Las%20Flores%20de%20Plutón"
            target="_blank"
            className="btn-primary py-4 px-8 text-base inline-flex"
          >
            <MessageCircle size={18} /> Consultá por WhatsApp
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl text-center mb-12" style={{ color: 'var(--text-dark)' }}>
          ¿Cómo funciona?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <MessageCircle size={28} />,
              step: '01',
              title: 'Contactanos',
              desc: 'Escribinos por WhatsApp o completá el formulario de registro. Te pediremos algunos datos de tu negocio.',
            },
            {
              icon: <Shield size={28} />,
              step: '02',
              title: 'Verificación',
              desc: 'Verificamos tu cuenta manualmente. Una vez aprobada, tu perfil cambia a "Mayorista" y ya podés ver los precios de lista.',
            },
            {
              icon: <Store size={28} />,
              step: '03',
              title: '¡A vender!',
              desc: 'Hacé tus pedidos online. La producción es artesanal, con despacho en 10 días hábiles.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl p-6"
              style={{ background: 'white', border: '1px solid var(--border-paper)', boxShadow: 'var(--shadow-soft)' }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(61,189,181,0.12)', color: 'var(--accent-teal)' }}
                >
                  {item.icon}
                </div>
                <span
                  className="font-display text-3xl font-black opacity-15 mt-1"
                  style={{ color: 'var(--accent-teal)' }}
                >
                  {item.step}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-medium)' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="mb-4 font-display text-2xl" style={{ color: 'var(--text-dark)' }}>
            ¿Listo para empezar?
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="https://wa.me/5491100000000"
              target="_blank"
              className="btn-primary py-3.5 px-8"
            >
              <MessageCircle size={16} /> WhatsApp
            </Link>
            <Link href="/registro" className="btn-secondary py-3.5 px-8">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
