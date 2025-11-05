// Dashboard Page - Ana sayfa

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { meetingsService } from '@/features/meetings/services/meetings.service';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { EmptyState } from '@/shared/components/common/EmptyState';
import type { MeetingResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Users, Plus, FileText, CheckSquare, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUpcomingMeetings();
  }, [token]);

  const loadUpcomingMeetings = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const meetings = await meetingsService.getUpcomingMeetings(token);
      setUpcomingMeetings(meetings.slice(0, 5)); // İlk 5 toplantı
    } catch (error) {
      console.error('Toplantılar yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Yeni Toplantı',
      description: 'Toplantı oluştur ve katılımcı davet et',
      icon: Plus,
      color: 'blue',
      href: '/meetings/new',
    },
    {
      title: 'Tüm Toplantılar',
      description: 'Toplantılarını görüntüle ve yönet',
      icon: Calendar,
      color: 'green',
      href: '/meetings',
    },
    {
      title: 'Görevler',
      description: 'Görevlerini takip et',
      icon: CheckSquare,
      color: 'purple',
      href: '/tasks',
    },
    // {
    //   title: 'Kulüpler',
    //   description: 'Kulüp etkinliklerine katıl',
    //   icon: Users,
    //   color: 'orange',
    //   href: '/clubs',
    // },
    // {
    //   title: 'Dosyalar',
    //   description: 'Dosyaları görüntüle ve paylaş',
    //   icon: FileText,
    //   color: 'indigo',
    //   href: '/files',
    // },
    // {
    //   title: 'Akış',
    //   description: 'Son aktiviteleri gör',
    //   icon: Activity,
    //   color: 'pink',
    //   href: '/feed',
    // },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    pink: 'bg-pink-100 text-pink-600',
  };

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Hoş geldin, {user?.displayName?.split(' ')[0]}! 👋
        </h2>
        <p className="text-gray-600">
          Bugün {upcomingMeetings.length} yaklaşan toplantın var.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action) => (
          <Card
            key={action.href}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(action.href)}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${colorClasses[action.color as keyof typeof colorClasses]}`}>
                <action.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Upcoming Meetings */}
      <div>
        <PageHeader
          title="Yaklaşan Toplantılar"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/meetings')}
            >
              Tümünü Gör
            </Button>
          }
        />

        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner text="Toplantılar yükleniyor..." />
          </div>
        ) : upcomingMeetings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Yaklaşan toplantı yok"
            message="Henüz yaklaşan bir toplantın bulunmuyor."
            actionLabel="Toplantı Oluştur"
            onAction={() => router.push('/meetings/new')}
          />
        ) : (
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <Card
                key={meeting.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/meetings/${meeting.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {meeting.title}
                    </h4>
                    {meeting.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {meeting.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(meeting.startTime), 'PPP', { locale: tr })}
                      </span>
                      <span>
                        {format(new Date(meeting.startTime), 'p', { locale: tr })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {meeting.participants.length} katılımcı
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      meeting.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : meeting.status === 'in_progress'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {meeting.status === 'scheduled' ? 'Planlandı' :
                       meeting.status === 'in_progress' ? 'Devam Ediyor' :
                       meeting.status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
