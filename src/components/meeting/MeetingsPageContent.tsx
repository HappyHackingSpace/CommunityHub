'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import MeetingList from './MeetingList';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import MeetingForm from './MeetingForm';
import MeetingCalendar from './MeetingCalendar';


export default function MeetingsPageContent() {
  const { user, isAdmin, isLeader } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
const [showCreateForm, setShowCreateForm] = useState(false);
  const canCreateMeeting = isAdmin || isLeader;
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Toplantılar</h1>
          <p className="text-gray-600">Toplantılarınızı görüntüleyin ve yönetin</p>
        </div>
        <div className="flex items-center space-x-2">
           <Button 
            variant="outline"
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {viewMode === 'list' ? 'Takvim Görünümü' : 'Liste Görünümü'}
          </Button>
           {canCreateMeeting && (
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Toplantı
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <MeetingForm 
                  onSuccess={() => setShowCreateForm(false)}
                  onCancel={() => setShowCreateForm(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tüm Toplantılar</TabsTrigger>
          <TabsTrigger value="upcoming">Yaklaşan</TabsTrigger>
          <TabsTrigger value="past">Geçmiş</TabsTrigger>
          {canCreateMeeting && (
            <TabsTrigger value="organized">Düzenlediğim</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {viewMode === 'calendar' ? (
            <MeetingCalendar />
          ) : (
            <MeetingList filter="all" />
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {viewMode === 'calendar' ? (
            <MeetingCalendar />
          ) : (
            <MeetingList filter="upcoming" />
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {viewMode === 'calendar' ? (
            <MeetingCalendar />
          ) : (
            <MeetingList filter="past" />
          )}
        </TabsContent>

        {canCreateMeeting && (
          <TabsContent value="organized" className="space-y-4">
            {viewMode === 'calendar' ? (
              <MeetingCalendar />
            ) : (
              <MeetingList filter="organized" />
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}