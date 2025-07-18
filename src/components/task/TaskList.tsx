'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Clock, FileText, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useTaskStore } from '@/store/taskStore';

interface TaskListProps {
  clubId?: string;
  userId?: string;
}

export default function TaskList({ clubId, userId }: TaskListProps) {
  const { user } = useAuth();
  const { 
    tasks, 
    isLoading, 
    error, 
    cacheStatus, 
    fetchTasks, 
    fetchTasksByUser, 
    refreshIfStale 
  } = useTaskStore();

  useEffect(() => {
    if (clubId) {
      fetchTasks(clubId);
    } else if (userId) {
      fetchTasksByUser(userId);
    } else if (user) {
      fetchTasksByUser(user.id);
    }
  }, [clubId, userId, user, fetchTasks, fetchTasksByUser]);

  // Handle refresh button click
  const handleRefresh = () => {
    if (clubId) {
      fetchTasks(clubId, true); // Force refresh
    } else if (userId) {
      fetchTasksByUser(userId, true);
    } else if (user?.id) {
      fetchTasksByUser(user.id, true);
    }
  };

  // Handle retry from stale state
 const handleRetryStale = () => {
    if (clubId) {
      refreshIfStale(clubId);
    } else if (userId || user?.id) {
      refreshIfStale(undefined, userId || user?.id);
    }
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

  // Cache status indicator
  const renderCacheStatus = () => {
    if (cacheStatus === 'stale' && tasks.length > 0) {
      return (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WifiOff className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              {error || 'Veriler güncel olmayabilir - eski veriler gösteriliyor'}
            </span>
          </div>
          <Button 
            onClick={handleRetryStale}
            size="sm" 
            variant="outline"
            disabled={isLoading}
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
          >
            {isLoading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Yenile
          </Button>
        </div>
      );
    }
    
    if (error && tasks.length === 0) {
      return (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WifiOff className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
          <Button 
            onClick={handleRefresh}
            size="sm" 
            variant="outline"
            disabled={isLoading}
            className="text-red-700 border-red-300 hover:bg-red-100"
          >
            {isLoading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Tekrar Dene
          </Button>
        </div>
      );
    }

    return null;
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="space-y-4">
        {renderCacheStatus()}
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
      <div>
        {renderCacheStatus()}
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz görev bulunmuyor
          </h3>
          <p className="text-gray-500">
            {error ? 'Bağlantı sorunu nedeniyle görevler yüklenemedi.' : 'Görevler eklendiğinde burada görünecek.'}
          </p>
          {error && (
            <Button 
              onClick={handleRefresh}
              className="mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Tekrar Dene
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderCacheStatus()}
      
      {/* Show loading indicator for stale data refresh */}
      {isLoading && cacheStatus === 'stale' && (
        <div className="flex items-center justify-center py-2">
          <RefreshCw className="h-4 w-4 animate-spin mr-2 text-blue-600" />
          <span className="text-sm text-blue-600">Güncel veriler getiriliyor...</span>
        </div>
      )}
      
      {tasks.map((task) => (
        <Card key={task.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Bitiş: {format(new Date(task.dueDate), 'dd MMM yyyy', { locale: tr })}
                    </span>
                  </div>
                  {task.assignedTo && (
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>Atanan: {task.assignedTo}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Badge className={getStatusColor(task.status)}>
                  {getStatusName(task.status)}
                </Badge>
                {task.priority && (
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                    <span className="text-xs text-gray-500">{getPriorityName(task.priority)}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{task.description}</p>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>
                  Oluşturuldu: {format(new Date(task.createdAt), 'dd MMM yyyy', { locale: tr })}
                </span>
              </div>
              {task.status === 'pending' && (
                <Button size="sm" variant="outline">
                  Göreve Başla
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
