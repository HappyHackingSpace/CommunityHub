// Create Meeting Page

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/auth-store';
import { meetingsApi } from '@/lib/meetings-api';
import type { CreateMeetingDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';

function CreateMeetingContent() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateMeetingDto>({
    title: '',
    description: '',
    startTime: '',
    duration: 60,
    meetingUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setIsLoading(true);
      const meeting = await meetingsApi.createMeeting(formData, token);
      router.push(`/meetings/${meeting.id}`);
    } catch (error: any) {
      alert(error.message || 'Toplantı oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/meetings')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Toplantılara Dön
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Yeni Toplantı Oluştur
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Toplantı Başlığı *
              </label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Örn: Haftalık Toplantı"
                minLength={3}
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Toplantı hakkında detaylar..."
                rows={4}
                maxLength={1000}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Zamanı *
                </label>
                <Input
                  required
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Süre (dakika) *
                </label>
                <Input
                  required
                  type="number"
                  min={15}
                  max={480}
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Toplantı URL (Zoom, Google Meet vb.)
              </label>
              <Input
                type="url"
                value={formData.meetingUrl}
                onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                placeholder="https://meet.google.com/..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Oluşturuluyor...' : 'Toplantı Oluştur'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/meetings')}
              >
                İptal
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function CreateMeetingPage() {
  return (
    <ProtectedRoute>
      <CreateMeetingContent />
    </ProtectedRoute>
  );
}
