import { MeetingCard } from './MeetingCard';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { EmptyState } from '@/shared/components/common/EmptyState';
import { Calendar } from 'lucide-react';
import type { MeetingResponse } from '@/types';

interface MeetingListProps {
  meetings: MeetingResponse[];
  isLoading: boolean;
  onMeetingClick: (meeting: MeetingResponse) => void;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  currentUserId?: string;
  showOrganizer?: boolean;
}

export function MeetingList({
  meetings,
  isLoading,
  onMeetingClick,
  emptyTitle = 'Henüz toplantı yok',
  emptyMessage = 'İlk toplantını oluştur veya bir toplantıya davet al.',
  emptyActionLabel,
  onEmptyAction,
  currentUserId,
  showOrganizer = false,
}: MeetingListProps) {
  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner text="Toplantılar yükleniyor..." />
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title={emptyTitle}
        message={emptyMessage}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          onClick={() => onMeetingClick(meeting)}
          currentUserId={currentUserId}
          showOrganizer={showOrganizer}
        />
      ))}
    </div>
  );
}
