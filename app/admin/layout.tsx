import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 1. Get authenticated user via cookie-aware client
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  console.log('[AdminLayout] user:', user?.id ?? 'NULL', '| authError:', authError?.message ?? 'none')

  if (!user) {
    console.log('[AdminLayout] → redirect to login (no user)')
    redirect('/login?redirect=/admin')
  }

  // 2. Check role using the service-role admin client (bypasses RLS)
  const adminClient = createAdminClient()
  const { data: profile, error: profileError } = await (adminClient.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single()

  console.log('[AdminLayout] profile:', JSON.stringify(profile), '| profileError:', profileError?.message ?? 'none')

  if (profileError || !profile || profile.role !== 'admin') {
    console.log('[AdminLayout] → redirect to / (role check failed, role=', profile?.role, ')')
    redirect('/')
  }

  console.log('[AdminLayout] ✅ Admin access granted')
  
  const { getLogo } = await import('@/lib/admin/actions')
  const logoUrl = await getLogo()
  const AdminShell = (await import('@/components/admin/AdminShell')).default

  return <AdminShell logoUrl={logoUrl}>{children}</AdminShell>
}
