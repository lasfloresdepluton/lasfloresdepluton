import { getLogo } from '@/lib/admin/actions'
import LoginForm from '@/components/auth/LoginForm'

export default async function LoginPage() {
  const logoUrl = await getLogo()
  return <LoginForm logoUrl={logoUrl} />
}
