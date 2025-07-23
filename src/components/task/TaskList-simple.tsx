'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Clock, FileText, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useTasksApi } from '@/hooks/useSimpleApi';
import { Task } from '@/types';

interface TaskListProps {
  clubId?: string;
  userId?: string;
}


 interface TaskAttachment {
   id: string;
   name: string;
   url?: string;
 }

 interface TaskFetchOptions {
   clubId?: string;
   userId?: string;
 }

export default function TaskList({ clubId, userId }: TaskListProps) {
  const { user } = useAuth();
  const { 
    tasks, 
    isLoading, 
    error, 
    fetchTasks 
  } = useTasksApi();

  useEffect(() => {
     const options: TaskFetchOptions = {};
    if (clubId) {
      options.clubId = clubId;
    } else if (userId) {
      options.userId = userId;
    } else if (user) {
      options.userId = user.id;
    }
    fetchTasks(options);
  }, [clubId, userId, user]); // Removed fetchTasks from dependency array

  const buildFetchOptions = () => {
    const options: TaskFetchOptions = {};
    if (clubId) {
      options.clubId = clubId;
    } else if (userId) {
      options.userId = userId;
    } else if (user?.id) {
      options.userId = user.id;
    }
    return options;
  };
  useEffect(() => {
    fetchTasks(buildFetchOptions());
  }, [clubId, userId, user]);
  const handleRefresh = () => {
    fetchTasks(buildFetchOptions());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'in_progress': return 'Devam Ediyor';
      case 'submitted': return 'Teslim Edildi';
      case 'completed': return 'Tamamlandı';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityName = (priority: string) => {
    switch (priority) {
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return priority;
    }
  };

  if (error && tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Görevler yüklenemedi
        </h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Tekrar Dene
        </Button>
      </div>
    );
  }

  if (isLoading && tasks.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Henüz görev bulunmuyor
        </h3>
        <p className="text-gray-500">
          {clubId ? 'Bu kulüpte henüz görev oluşturulmamış.' : 'Size atanmış bir görev bulunmuyor.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Görevler ({tasks.length})
        </h3>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Tasks list */}
      {tasks.map((task: Task) => (
        <Card key={task.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg text-gray-900">{task.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(task.status)}>
                  {getStatusName(task.status)}
                </Badge>
                <Badge className={getPriorityColor(task.priority)}>
                  {getPriorityName(task.priority)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{task.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Atanan: {task.assignedTo || 'Belirlenmemiş'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Başlangıç: {task.createdAt ? format(new Date(task.createdAt), 'dd MMM yyyy', { locale: tr }) : 'Belirlenmemiş'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>
                  Bitiş: {task.dueDate ? format(new Date(task.dueDate), 'dd MMM yyyy', { locale: tr }) : 'Belirlenmemiş'}
                </span>
              </div>
            </div>

            {task.files && task.files.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ekler:</h4>
                <div className="flex flex-wrap gap-2">
                  {task.files.map((file, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <FileText className="mr-1 h-3 w-3" />
                      {file.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* Loading indicator when refreshing */}
      {isLoading && tasks.length > 0 && (
        <div className="text-center py-4">
          <RefreshCw className="h-4 w-4 animate-spin mx-auto text-gray-400" />
        </div>
      )}
    </div>
  );
}
