import AdminShell from '@/components/admin/AdminShell'
import FragranceManager from '@/components/admin/FragranceManager'
import { getAdminFragrances } from '@/lib/admin/actions'
import { Leaf } from 'lucide-react'

export default async function AdminFragrancesPage() {
  const fragrances = await getAdminFragrances()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(61,189,181,0.15)', color: '#3dbdb5' }}>
          <Leaf size={20} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Fragancias</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
            {fragrances.length} fragancias en el sistema
          </p>
        </div>
      </div>
      <FragranceManager fragrances={fragrances} />
    </div>
  )
}
