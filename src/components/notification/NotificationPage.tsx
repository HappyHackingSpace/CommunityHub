'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationsApi } from '@/hooks/useSimpleApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  Users, 
  Calendar, 
  FileText,
  X,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function NotificationPage() {
  const { user } = useAuth();
  const { 
    notifications, 
    isLoading, 
    error,
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotificationsApi();
  
  const [activeTab, setActiveTab] = useState('all');

  // Calculate unread count
 const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (user) {
     fetchNotifications({ userId: user.id });
    }
  }, [user]); 

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'meeting': return <Calendar className="h-4 w-4 text-green-500" />;
      case 'club': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'border-l-blue-500';
      case 'meeting': return 'border-l-green-500';
      case 'club': return 'border-l-purple-500';
      default: return 'border-l-gray-300';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.is_read;
    if (activeTab === 'read') return notification.is_read;
    return true;
  });

  const handleNotificationClick = async (notificationId: string, actionUrl?: string) => {
    try {
      await markAsRead(notificationId);
      
      if (actionUrl) {
        window.location.href = actionUrl;
      }
    } catch (error) {
      console.error('Notification mark as read error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      deleteNotification(notificationId);
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bildirimler</h1>
          <p className="text-gray-600">Tüm bildirimlerinizi buradan takip edebilirsiniz</p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Tümünü Okundu İşaretle ({unreadCount})
            </Button>
          )}
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Ayarlar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Tümü ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Okunmamış ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            Okunmuş ({notifications.length - unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
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
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'unread' ? 'Okunmamış bildirim yok' :
                 activeTab === 'read' ? 'Okunmuş bildirim yok' : 'Bildirim bulunmuyor'}
              </h3>
              <p className="text-gray-500">
                Yeni bildirimler geldiğinde burada görünecek
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-shadow border-l-4",
                  !notification.is_read && "bg-blue-50",
                  getNotificationTypeColor(notification.type)
                )}
                onClick={() => handleNotificationClick(notification.id, notification.actionUrl)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <h3 className={cn(
                          "text-sm",
                          !notification.is_read && "font-semibold text-gray-900"
                        )}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {format(new Date(notification.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                          </span>
                          {notification.actionUrl && (
                            <span className="text-xs text-blue-600">
                              Tıklayarak görüntüle
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}