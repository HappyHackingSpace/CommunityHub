'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMeetingStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Video, MapPin, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface MeetingListProps {
  clubId?: string;
  showActions?: boolean;
  filter?: 'all' | 'upcoming' | 'past' | 'organized';
}

export default function MeetingList({ clubId, showActions = true, filter = 'all' }: MeetingListProps) {
  const { user } = useAuth();
  const { meetings, isLoading, fetchMeetings, updateMeetingResponse } = useMeetingStore();

  useEffect(() => {
    if (user) {
      fetchMeetings(clubId, user.id);
    }
  }, [clubId, user, fetchMeetings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Zamanlandı';
      case 'ongoing': return 'Devam Ediyor';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const now = new Date();
    const meetingStart = new Date(meeting.startTime);
    
    switch (filter) {
      case 'upcoming':
        return meetingStart > now && meeting.status !== 'cancelled';
      case 'past':
        return meetingStart < now || meeting.status === 'completed';
      case 'organized':
        return meeting.organizerId === user?.id;
      default:
        return true;
    }
  });

  const getUserResponse = (meeting: any, userId: string) => {
    const participant = meeting.meeting_participants?.find(
      (p: any) => p.user_id === userId
    );
    return participant?.response || 'pending';
  };

  const handleResponse = async (meetingId: string, response: 'accepted' | 'declined') => {
    if (!user) return;
    await updateMeetingResponse(meetingId, response);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Henüz toplantı bulunmuyor
        </h3>
        <p className="text-gray-500">
          Yeni toplantılar oluşturulduğunda burada görünecek
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => {
        const userResponse = user ? getUserResponse(meeting, user.id) : 'pending';
        const isOrganizer = meeting.organizerId === user?.id;
        
        return (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{meeting.title}</CardTitle>
                <Badge className={getStatusColor(meeting.status)}>
                  {getStatusName(meeting.status)}
                </Badge>
              </div>
              {meeting.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {meeting.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(meeting.startTime), 'dd MMMM yyyy', { locale: tr })}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="mr-2 h-4 w-4" />
                    {format(new Date(meeting.startTime), 'HH:mm', { locale: tr })} - 
                    {format(new Date(meeting.endTime), 'HH:mm', { locale: tr })}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="mr-2 h-4 w-4" />
                    {meeting.participants?.length || 0} katılımcı
                  </div>
                  {meeting.meetingLink && (
                    <div className="flex items-center text-gray-600">
                      <Video className="mr-2 h-4 w-4" />
                      Online toplantı
                    </div>
                  )}
                  {meeting.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="mr-2 h-4 w-4" />
                      {meeting.location}
                    </div>
                  )}
                </div>

                {!isOrganizer && userResponse === 'pending' && showActions && (
                  <div className="flex items-center space-x-2 pt-2 border-t">
                    <span className="text-sm text-gray-600 mr-2">Katılacak mısınız?</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleResponse(meeting.id, 'accepted')}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Evet
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleResponse(meeting.id, 'declined')}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Hayır
                    </Button>
                  </div>
                )}

                {!isOrganizer && userResponse !== 'pending' && (
                  <div className="pt-2 border-t">
                    <Badge variant={userResponse === 'accepted' ? 'default' : 'secondary'}>
                      {userResponse === 'accepted' ? 'Katılıyorsunuz' : 'Katılmıyorsunuz'}
                    </Badge>
                  </div>
                )}

                {isOrganizer && (
                  <div className="pt-2 border-t">
                    <Badge variant="outline">Organizatör</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}