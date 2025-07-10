'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotificationStore } from '@/store/notificationStore';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
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

export default function NotificationCenter() {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotificationStore();
  
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
    }
  }, [user, fetchNotifications]);

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
    if (activeTab === 'unread') return !notification.isRead;
    if (activeTab === 'read') return notification.isRead;
    return true;
  });

  const handleNotificationClick = async (notificationId: string, actionUrl?: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          userId: user?.id,
          action: 'mark_read'
        }),
      });
      
      markAsRead(notificationId);
      
      if (actionUrl) {
        window.location.href = actionUrl;
      }
    } catch (error) {
      console.error('Notification mark as read error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      await Promise.all(
        unreadNotifications.map(notification =>
          fetch('/api/notifications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              notificationId: notification.id,
              userId: user?.id,
              action: 'mark_read'
            }),
          })
        )
      );
      
      markAllAsRead();
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // Note: Implement delete API endpoint if needed
      deleteNotification(notificationId);
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  // Header dropdown version
  const NotificationDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Bildirimler</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Tümünü okundu işaretle
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={cn(
                "p-3 cursor-pointer border-l-4",
                !notification.isRead && "bg-blue-50",
                getNotificationTypeColor(notification.type)
              )}
              onClick={() => handleNotificationClick(notification.id, notification.actionUrl)}
            >
              <div className="flex w-full">
                <div className="mr-3 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm",
                    !notification.isRead && "font-semibold"
                  )}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(notification.createdAt), 'dd MMM HH:mm', { locale: tr })}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        
        {notifications.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <Bell className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm">Bildirim bulunmuyor</p>
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Button variant="ghost" className="w-full justify-start text-sm">
            Tüm bildirimleri görüntüle
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Full page version
  const NotificationPage = () => (
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
                  !notification.isRead && "bg-blue-50",
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
                          !notification.isRead && "font-semibold text-gray-900"
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
                      {!notification.isRead && (
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

  // Return the dropdown version by default
  // You can use NotificationPage for a dedicated page
  return <NotificationDropdown />;
}