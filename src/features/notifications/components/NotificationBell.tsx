'use client';

import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationList } from './NotificationList';

export function NotificationBell() {
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    archive,
  } = useNotifications();

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="p-2 flex justify-between items-center">
          <p className="font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <NotificationList
          notifications={notifications || []}
          isLoading={isLoading}
          onMarkAsRead={markAsRead}
          onArchive={archive}
        />
        <DropdownMenuSeparator />
        <div className="p-1">
            <Button variant="outline" size="sm" className="w-full">
                View all notifications
            </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
