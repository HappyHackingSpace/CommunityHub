'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMeetingsApi, useClubsApi } from '@/hooks/useSimpleApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Video, MapPin, X } from 'lucide-react';

interface MeetingFormProps {
  clubId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MeetingForm({ clubId, onSuccess, onCancel }: MeetingFormProps) {
  const { user } = useAuth();
  const { createMeeting, isLoading } = useMeetingsApi();
  const { clubs } = useClubsApi();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clubId: clubId || '',
    startDate: '',
    startTime: '',
    duration: 60,
    meetingLink: '',
    location: '',
    participants: [] as string[]
  });
  
  const [error, setError] = useState<string | null>(null);

  const selectedClub = clubs.find(c => c.id === formData.clubId);
  const availableParticipants = selectedClub?.memberIds || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + (formData.duration * 60000));

      const meetingData = {
        title: formData.title,
        description: formData.description,
        club_id: formData.clubId,
        organizer_id: user.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        duration: formData.duration,
        meeting_link: formData.meetingLink || null,
        location: formData.location || null,
        status: 'scheduled' as const,
        agenda: [],
        recurrence: null,
        participants: formData.participants
      };

      await createMeeting(meetingData);
      onSuccess?.();
    } catch (err) {
      setError('Toplantı oluşturulurken hata oluştu');
    }
  };

  const addParticipant = (userId: string) => {
    if (!formData.participants.includes(userId)) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, userId]
      }));
    }
  };

  const removeParticipant = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(id => id !== userId)
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Yeni Toplantı Oluştur</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Temel Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Toplantı Başlığı</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Toplantı başlığını girin"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Açıklama</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Toplantı açıklaması (isteğe bağlı)"
                rows={3}
              />
            </div>

            {!clubId && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Kulüp</label>
                <Select
                  value={formData.clubId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, clubId: value, participants: [] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kulüp seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Tarih ve Saat */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="inline mr-1 h-4 w-4" />
                Tarih
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="inline mr-1 h-4 w-4" />
                Saat
              </label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Süre (dakika)</label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 dakika</SelectItem>
                  <SelectItem value="60">1 saat</SelectItem>
                  <SelectItem value="90">1.5 saat</SelectItem>
                  <SelectItem value="120">2 saat</SelectItem>
                  <SelectItem value="180">3 saat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lokasyon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Video className="inline mr-1 h-4 w-4" />
                Online Link (isteğe bağlı)
              </label>
              <Input
                value={formData.meetingLink}
                onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                placeholder="Zoom, Google Meet vb. linki"
                type="url"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <MapPin className="inline mr-1 h-4 w-4" />
                Fiziksel Konum (isteğe bağlı)
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Toplantı odası, adres vb."
              />
            </div>
          </div>

          {/* Katılımcılar */}
          {selectedClub && (
            <div>
              <label className="block text-sm font-medium mb-2">
                <Users className="inline mr-1 h-4 w-4" />
                Katılımcılar
              </label>
              
              <Select onValueChange={addParticipant}>
                <SelectTrigger>
                  <SelectValue placeholder="Katılımcı ekle" />
                </SelectTrigger>
                <SelectContent>
                  {availableParticipants
                    .filter((id: string) => !formData.participants.includes(id) && id !== user?.id)
                    .map((userId: string) => (
                      <SelectItem key={userId} value={userId}>
                        Kullanıcı {userId}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {formData.participants.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.participants.map((userId) => (
                    <Badge key={userId} variant="secondary" className="pr-1">
                      Kullanıcı {userId}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0 text-gray-500 hover:text-red-600"
                        onClick={() => removeParticipant(userId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Butonları */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                İptal
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Oluşturuluyor...' : 'Toplantı Oluştur'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}