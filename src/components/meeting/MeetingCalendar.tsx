'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMeetingsApi } from '@/hooks/useSimpleApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface MeetingCalendarProps {
  clubId?: string;
}

export default function MeetingCalendar({ clubId }: MeetingCalendarProps) {
  const { user } = useAuth();
  const { meetings, isLoading, fetchMeetings } = useMeetingsApi();

  useEffect(() => {
    if (user) {
      const options: any = {};
      if (clubId) options.clubId = clubId;
      fetchMeetings(options);
    }
  }, [clubId, user?.id]);

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

  // Group meetings by date
  const groupedMeetings = meetings.reduce((groups: any, meeting) => {
    const date = format(new Date(meeting.start_time), 'yyyy-MM-dd'); // 🔧 Fixed: use start_time
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(meeting);
    return groups;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedMeetings).sort();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
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
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <Card key={date} className="overflow-hidden">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              {format(new Date(date), 'dd MMMM yyyy, EEEE', { locale: tr })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {groupedMeetings[date].map((meeting: any, index: number) => (
                <div 
                  key={meeting.id} 
                  className={`p-4 border-l-4 border-blue-200 ${
                    index < groupedMeetings[date].length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                    <Badge className={getStatusColor(meeting.status)}>
                      {getStatusName(meeting.status)}
                    </Badge>
                  </div>
                  
                  {meeting.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {meeting.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {format(new Date(meeting.start_time), 'HH:mm', { locale: tr })} - 
                      {meeting.end_time && format(new Date(meeting.end_time), 'HH:mm', { locale: tr })}
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      {meeting.participants?.length || 0} katılımcı
                    </div>
                    
                    {meeting.location && (
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {meeting.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
