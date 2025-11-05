// Meeting Detail Page

'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useMeeting, useDeleteMeeting } from '@/features/meetings/hooks/useMeetings';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { ErrorMessage } from '@/shared/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  Users,
  Edit,
  Trash2,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params.id as string;
  const { user } = useAuthStore();
  const { meeting, isLoading, error } = useMeeting(meetingId);
  const deleteMutation = useDeleteMeeting();

  const handleDelete = async () => {
    if (!confirm('Bu toplantıyı silmek istediğinizden emin misiniz?')) return;

    deleteMutation.mutate(meetingId, {
      onSuccess: () => {
        router.push('/meetings');
      },
    });
  };

  const statusConfig = {
    scheduled: { label: 'Planlandı', className: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'Devam Ediyor', className: 'bg-green-100 text-green-800' },
    completed: { label: 'Tamamlandı', className: 'bg-gray-100 text-gray-800' },
    cancelled: { label: 'İptal Edildi', className: 'bg-red-100 text-red-800' },
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner text="Toplantı detayları yükleniyor..." />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push('/meetings')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Toplantılara Dön
        </Button>
        <ErrorMessage
          message={error?.message || 'Toplantı bulunamadı'}
        />
      </div>
    );
  }

  const isOrganizer = user?.id === meeting.organizerId;
  const status = statusConfig[meeting.status] || statusConfig.scheduled;

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => router.push('/meetings')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Toplantılara Dön
      </Button>

      <PageHeader
        title={meeting.title}
        actions={
          isOrganizer && meeting.status !== 'cancelled' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/meetings/${meetingId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                İptal Et
              </Button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {meeting.title}
              </h2>
              <Badge className={status.className}>
                {status.label}
              </Badge>
            </div>

            {meeting.description && (
              <p className="text-gray-600 mb-6">{meeting.description}</p>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Tarih ve Saat</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(meeting.startTime), 'PPP', { locale: tr })} -{' '}
                    {format(new Date(meeting.startTime), 'p', { locale: tr })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Süre</p>
                  <p className="text-sm text-gray-600">{meeting.duration} dakika</p>
                </div>
              </div>

              {meeting.meetingUrl && (
                <div className="flex items-center gap-3 text-gray-700">
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">Toplantı Linki</p>
                    <a
                      href={meeting.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {meeting.meetingUrl}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Participants */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Katılımcılar ({meeting.participants.length})
            </h3>

            <div className="space-y-3">
              {meeting.participants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={participant.userId} />
                      <AvatarFallback>
                        {participant.userId.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {participant.userId}
                        {participant.userId === meeting.organizerId && (
                          <Badge variant="outline" className="ml-2">
                            Organizatör
                          </Badge>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {participant.status === 'accepted' ? 'Katılacak' :
                         participant.status === 'declined' ? 'Katılmayacak' :
                         'Beklemede'}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={participant.status === 'accepted' ? 'default' : 'secondary'}
                  >
                    {participant.status === 'accepted' ? '✓' :
                     participant.status === 'declined' ? '✗' : '?'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Toplantı Detayları
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Oluşturulma</p>
                <p className="font-medium">
                  {format(new Date(meeting.createdAt), 'PPP', { locale: tr })}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Son Güncelleme</p>
                <p className="font-medium">
                  {format(new Date(meeting.updatedAt), 'PPP', { locale: tr })}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Toplantı ID</p>
                <p className="font-mono text-xs">{meeting.id}</p>
              </div>
            </div>
          </Card>

          {meeting.meetingUrl && meeting.status !== 'cancelled' && (
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Toplantıya Katıl
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Toplantı başladığında buradan katılabilirsiniz.
              </p>
              <Button
                className="w-full"
                onClick={() => window.open(meeting.meetingUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Toplantıya Katıl
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
