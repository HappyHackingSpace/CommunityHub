'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useTaskStore } from '@/store/taskStore';

interface TaskListProps {
  clubId?: string;
  userId?: string;
}

export default function TaskList({ clubId, userId }: TaskListProps) {
  const { user } = useAuth();
  const { tasks, isLoading, fetchTasks, fetchTasksByUser } = useTaskStore();

  useEffect(() => {
    if (clubId) {
      fetchTasks(clubId);
    } else if (userId) {
      fetchTasksByUser(userId);
    } else if (user) {
      fetchTasksByUser(user.id);
    }
  }, [clubId, userId, user, fetchTasks, fetchTasksByUser]);

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
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityName = (priority: string) => {
    switch (priority) {
      case 'low': return 'Düşük';
      case 'medium': return 'Orta';
      case 'high': return 'Yüksek';
      default: return priority;
    }
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

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Henüz görev bulunmuyor
        </h3>
        <p className="text-gray-500">
          Yeni görevler oluşturulduğunda burada görünecek
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{task.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}
                  title={`${getPriorityName(task.priority)} öncelik`}
                />
                <Badge className={getStatusColor(task.status)}>
                  {getStatusName(task.status)}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500">
                  <User className="mr-1 h-4 w-4" />
                  Atanan: {task.assignedTo}
                </div>
                <div className="flex items-center text-gray-500">
                  <Calendar className="mr-1 h-4 w-4" />
                  {format(new Date(task.dueDate), 'dd MMMM yyyy', { locale: tr })}
                </div>
              </div>
              
              {task.files && task.files.length > 0 && (
                <div className="flex items-center text-sm text-gray-500">
                  <FileText className="mr-1 h-4 w-4" />
                  {task.files.length} dosya eklendi
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="mr-1 h-3 w-3" />
                  {format(new Date(task.createdAt), 'dd MMM yyyy', { locale: tr })} tarihinde oluşturuldu
                </div>
                <Button variant="outline" size="sm">
                  Detaylar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}