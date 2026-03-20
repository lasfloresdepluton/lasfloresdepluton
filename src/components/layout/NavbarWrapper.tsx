import Navbar from './Navbar';
import { getLogo } from '@/lib/admin/actions';

export default async function NavbarWrapper() {
  const logoUrl = await getLogo();
  return <Navbar logoUrl={logoUrl} />;
}
