
import ClubList from '@/components/club/ClubList';
import {MainLayout} from '@/components/layout/MainLayout';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ClubsPage() {
  // 🔒 Server-side authentication check
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user || error) {
    redirect('/login');
  }

  return (
    <MainLayout>
      <ClubList />
    </MainLayout>
  );
}