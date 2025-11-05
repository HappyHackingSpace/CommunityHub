import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { MeetingResponse } from '@/types';

interface MeetingCardProps {
  meeting: MeetingResponse;
  onClick?: () => void;
  showOrganizer?: boolean;
  currentUserId?: string;
}

export function MeetingCard({
  meeting,
  onClick,
  showOrganizer = false,
  currentUserId
}: MeetingCardProps) {
  const statusConfig = {
    scheduled: { label: 'Planlandı', className: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'Devam Ediyor', className: 'bg-green-100 text-green-800' },
    completed: { label: 'Tamamlandı', className: 'bg-gray-100 text-gray-800' },
    cancelled: { label: 'İptal Edildi', className: 'bg-red-100 text-red-800' },
  };

  const status = statusConfig[meeting.status] || statusConfig.scheduled;
  const isOrganizer = currentUserId === meeting.organizerId;

  return (
    <Card
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {meeting.title}
          </h3>
          {meeting.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {meeting.description}
            </p>
          )}
        </div>
        <Badge className={status.className}>
          {status.label}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {format(new Date(meeting.startTime), 'PPP', { locale: tr })}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {format(new Date(meeting.startTime), 'p', { locale: tr })} ({meeting.duration} dk)
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {meeting.participants.length} katılımcı
        </span>
      </div>

      {(showOrganizer || isOrganizer) && (
        <div className="mt-3 pt-3 border-t">
          <span className="text-xs text-gray-500">
            {isOrganizer ? 'Organizatör: Siz' : `Organizatör: ${meeting.organizerId}`}
          </span>
        </div>
      )}
    </Card>
  );
}
