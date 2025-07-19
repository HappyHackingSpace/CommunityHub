'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClubsApi, useTasksApi } from '@/hooks/useSimpleApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, Plus, Calendar, CheckSquare, FileText } from 'lucide-react';
import MeetingList from '../meeting/MeetingList';
import TaskList from '../task/TaskList';
import FileManager from '../file/FileManager';


interface ClubDetailProps {
  clubId: string;
}

export default function ClubDetail({ clubId }: ClubDetailProps) {
  const { user, isLeader, isAdmin } = useAuth();
  const { clubs, isLoading: clubsLoading, fetchClubs } = useClubsApi();
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTasksApi();
  
  // Find current club from clubs array
  const currentClub = clubs.find(club => club.id === clubId);
  const isLoading = clubsLoading || tasksLoading;
  
  useEffect(() => {
    if (clubs.length === 0) {
      fetchClubs();
    }
    fetchTasks({ clubId });
  }, [clubId, clubs.length]); // Removed fetch functions from dependency array

  const isClubLeader = currentClub?.leaderId === user?.id;
  const canManage = isAdmin || isClubLeader;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!currentClub) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Kulüp bulunamadı
        </h3>
        <p className="text-gray-500">
          Aradığınız kulüp mevcut değil veya erişim yetkiniz yok.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Club Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentClub.name}</h1>
            <p className="text-gray-600 mt-2">{currentClub.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={
              currentClub.type === 'education' ? 'bg-blue-100 text-blue-800' :
              currentClub.type === 'social' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }>
              {currentClub.type === 'education' ? 'Eğitim' :
               currentClub.type === 'social' ? 'Sosyal' : 'Proje'}
            </Badge>
            {canManage && (
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Ayarlar
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Users className="mx-auto h-6 w-6 text-gray-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{currentClub.memberCount}</p>
            <p className="text-sm text-gray-600">Üye</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <CheckSquare className="mx-auto h-6 w-6 text-gray-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            <p className="text-sm text-gray-600">Görev</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Calendar className="mx-auto h-6 w-6 text-gray-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900">3</p>
            <p className="text-sm text-gray-600">Toplantı</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <FileText className="mx-auto h-6 w-6 text-gray-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-sm text-gray-600">Dosya</p>
          </div>
        </div>
      </div>

      {/* Club Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">Görevler</TabsTrigger>
          <TabsTrigger value="meetings">Toplantılar</TabsTrigger>
          <TabsTrigger value="files">Dosyalar</TabsTrigger>
          <TabsTrigger value="members">Üyeler</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Görevler</h2>
              {canManage && (
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Görev
                </Button>
              )}
            </div>
            <TaskList clubId={clubId} />
          </div>
        </TabsContent>

       <TabsContent value="meetings">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Toplantılar</h2>
              {canManage && (
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Toplantı
                </Button>
              )}
            </div>
            <MeetingList clubId={clubId} />
          </div>
        </TabsContent>

         <TabsContent value="files">
          <FileManager clubId={clubId} />
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Üyeler</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Üye yönetimi geliştiriliyor...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}