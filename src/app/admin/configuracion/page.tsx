import LogoUploader from '@/components/admin/LogoUploader'
import CategoryManager from '@/components/admin/CategoryManager'
import HomeContentManager from '@/components/admin/HomeContentManager'
import { getLogo, getAdminCategories, getSiteSettings } from '@/lib/admin/actions'
import { Settings, Image as ImageIcon, Layout } from 'lucide-react'

export default async function AdminConfigPage() {
  const [logoUrl, categories, settings] = await Promise.all([
    getLogo(),
    getAdminCategories(),
    getSiteSettings(),
  ])

  return (
    <div className="space-y-8 max-w-4xl pb-20">
      <div className="flex items-center gap-3">
        <Settings size={20} style={{ color: '#3dbdb5' }} />
        <h1 className="font-display text-2xl font-bold text-white">Configuración</h1>
      </div>

      {/* Home Content Section */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-2">
           <Layout size={18} style={{ color: '#3dbdb5' }} />
           <h2 className="font-semibold text-white text-base">Textos de Inicio</h2>
        </div>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
           Personalizá los mensajes y descripciones de la página de inicio.
        </p>
        <HomeContentManager initialSettings={settings} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Logo section */}
        <div
          className="rounded-2xl p-6 h-fit"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h2 className="font-semibold text-white text-base mb-1">Logo de la tienda</h2>
          <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            El logo se muestra en el navbar y en el hero del sitio.
          </p>
          <LogoUploader currentLogoUrl={logoUrl} />
        </div>

        {/* Categories section */}
        <div
          className="rounded-2xl p-6 h-fit"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-1">
             <ImageIcon size={18} style={{ color: '#8b6fb5' }} />
             <h2 className="font-semibold text-white text-base">Imágenes de Categorías</h2>
          </div>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Subí las fotos que representan a cada línea de producto.
          </p>
          <CategoryManager initialCategories={categories} />
        </div>
      </div>
    </div>
  )
}
