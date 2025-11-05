// Meetings List Page

'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useMeetings } from '@/features/meetings/hooks/useMeetings';
import { MeetingList } from '@/features/meetings/components/MeetingList';
import { PageHeader } from '@/shared/components/common/PageHeader';
import type { MeetingResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

export default function MeetingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { meetings, isLoading } = useMeetings();

  const { myOrganizedMeetings, myParticipatingMeetings, scheduledMeetings } = useMemo(() => {
    return {
      myOrganizedMeetings: meetings.filter((m) => m.organizerId === user?.id),
      myParticipatingMeetings: meetings.filter((m) =>
        m.organizerId !== user?.id && m.participants.some(p => p.userId === user?.id)
      ),
      scheduledMeetings: meetings.filter((m) => m.status === 'scheduled'),
    };
  }, [meetings, user?.id]);

  const handleMeetingClick = (meeting: MeetingResponse) => {
    router.push(`/meetings/${meeting.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Toplantılarım"
        description="Tüm toplantılarını görüntüle ve yönet"
        actions={
          <Button onClick={() => router.push('/meetings/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Toplantı
          </Button>
        }
      />

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            Tümü ({meetings.length})
          </TabsTrigger>
          <TabsTrigger value="organized">
            Düzenlediğim ({myOrganizedMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="participating">
            Katıldığım ({myParticipatingMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Yaklaşan ({scheduledMeetings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <MeetingList
            meetings={meetings}
            isLoading={isLoading}
            onMeetingClick={handleMeetingClick}
            emptyActionLabel="Toplantı Oluştur"
            onEmptyAction={() => router.push('/meetings/new')}
            currentUserId={user?.id}
            showOrganizer
          />
        </TabsContent>

        <TabsContent value="organized">
          <MeetingList
            meetings={myOrganizedMeetings}
            isLoading={isLoading}
            onMeetingClick={handleMeetingClick}
            emptyTitle="Henüz düzenlediğiniz toplantı yok"
            emptyMessage="İlk toplantınızı oluşturun."
            emptyActionLabel="Toplantı Oluştur"
            onEmptyAction={() => router.push('/meetings/new')}
            currentUserId={user?.id}
          />
        </TabsContent>

        <TabsContent value="participating">
          <MeetingList
            meetings={myParticipatingMeetings}
            isLoading={isLoading}
            onMeetingClick={handleMeetingClick}
            emptyTitle="Henüz katıldığınız toplantı yok"
            emptyMessage="Bir toplantıya davet bekleyin."
            currentUserId={user?.id}
          />
        </TabsContent>

        <TabsContent value="upcoming">
          <MeetingList
            meetings={scheduledMeetings}
            isLoading={isLoading}
            onMeetingClick={handleMeetingClick}
            emptyTitle="Yaklaşan toplantı yok"
            emptyMessage="Tüm toplantılarınız tamamlandı veya iptal edildi."
            currentUserId={user?.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
