// src/components/layout/Header.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, LogOut, Settings, User, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import NotificationCenter from '@/components/notification/NotificationCenter';
import { useGlobalCacheManager } from '@/lib/cache-manager';
import { useTaskStore } from '@/store/taskStore';
import { useClubStore } from '@/store/clubStore';
import { useMeetingStore } from '@/store/meetingStore';

export default function Header() {
  const { user, isAdmin, isLeader, logout } = useAuth();
  const { unreadCount } = useNotificationStore();
  const { forceRefreshAll } = useGlobalCacheManager();
  
  // Get cache statuses
  const taskCacheStatus = useTaskStore(state => state.cacheStatus);
  const clubCacheStatus = useClubStore(state => state.cacheStatus);
  const meetingCacheStatus = useMeetingStore(state => state.cacheStatus);
  
  const taskIsLoading = useTaskStore(state => state.isLoading);
  const clubIsLoading = useClubStore(state => state.isLoading);
  const meetingIsLoading = useMeetingStore(state => state.isLoading);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Yönetici';
      case 'club_leader': return 'Kulüp Lideri';
      case 'member': return 'Üye';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'club_leader': return 'bg-blue-500';
      case 'member': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Check if any cache is stale
  const hasStaleData = taskCacheStatus === 'stale' || clubCacheStatus === 'stale' || meetingCacheStatus === 'stale';
  const isRefreshing = taskIsLoading || clubIsLoading || meetingIsLoading;

   const handleRefreshAll = async () => {
    try {
      await forceRefreshAll();
    } catch (error) {
      console.error('Failed to refresh cache:', error);
     
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Community Platform</h1>
          {user && (
            <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
              {getRoleDisplayName(user.role)}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Cache Status Indicator */}
          {hasStaleData && (
            <Button
              onClick={handleRefreshAll}
              variant="ghost"
              size="sm"
              disabled={isRefreshing}
              className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              title="Veriler güncel değil - yenilemek için tıklayın"
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              <span className="hidden md:inline text-xs">
                {isRefreshing ? 'Yenileniyor...' : 'Eski Veri'}
              </span>
            </Button>
          )}

          {/* Notification Center */}
          <NotificationCenter />

           {/* Notification Bell */}
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

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Ayarlar
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}