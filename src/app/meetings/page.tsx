
import MainLayout from '@/components/layout/MainLayout';
import MeetingsPageContent from '@/components/meeting/MeetingsPageContent';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function MeetingsPage() {
  // 🔒 Server-side authentication check
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user || error) {
    redirect('/login');
  }

  return (
    <MainLayout>
      <MeetingsPageContent />
    </MainLayout>
  );
}