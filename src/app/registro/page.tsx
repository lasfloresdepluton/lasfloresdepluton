import { getLogo } from '@/lib/admin/actions'
import RegisterForm from '@/components/auth/RegisterForm'

export default async function RegisterPage() {
  const logoUrl = await getLogo()
  return <RegisterForm logoUrl={logoUrl} />
}
