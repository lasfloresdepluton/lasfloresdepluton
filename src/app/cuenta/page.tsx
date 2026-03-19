import { getSession, getProfile } from '@/lib/auth/actions';
import { getUserOrders } from '@/lib/user/actions';
import { redirect } from 'next/navigation';
import AccountView from '@/components/user/AccountView';

export default async function AccountPage() {
  const user = await getSession();
  
  if (!user) {
    redirect('/login?redirect=/cuenta');
  }

  const [profile, orders] = await Promise.all([
    getProfile(user.id),
    getUserOrders(user.id)
  ]);

  return (
    <div className="pt-24 pb-12 bg-[#F5F0E8] min-h-screen">
      <AccountView profile={profile} orders={orders} />
    </div>
  );
}
