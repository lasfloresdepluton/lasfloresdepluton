import Navbar from './Navbar';
import { getLogo } from '@/lib/admin/actions';

export default async function NavbarWrapper({ cartCount }: { cartCount?: number }) {
  const logoUrl = await getLogo();
  return <Navbar cartCount={cartCount} logoUrl={logoUrl} />;
}
