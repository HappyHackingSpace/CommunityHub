// src/components/layout/Header.tsx - SIMPLIFIED
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useNotificationsApi, useTasksApi, useClubsApi, useMeetingsApi } from '@/hooks/useSimpleApi';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, LogOut, Settings, User, RefreshCw } from 'lucide-react';
import NotificationCenter from '@/components/notification/NotificationCenter';

export default function Header() {
  const { user, logout } = useAuth();
  const { notifications } = useNotificationsApi();
  const { fetchTasks, isLoading: tasksLoading } = useTasksApi();
  const { fetchClubs, isLoading: clubsLoading } = useClubsApi();
  const { fetchMeetings, isLoading: meetingsLoading } = useMeetingsApi();
  
  // Calculate unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  // Check if any data is being refreshed
  const isRefreshing = tasksLoading || clubsLoading || meetingsLoading;

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

  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        fetchTasks(),
        fetchClubs(),
        fetchMeetings()
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
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
          {/* Manual Refresh Button */}
          <Button
            onClick={handleRefreshAll}
            variant="ghost"
            size="sm"
            disabled={isRefreshing}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            title="Verileri yenile"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline text-xs">
              {isRefreshing ? 'Yenileniyor...' : 'Yenile'}
            </span>
          </Button>

          {/* Notification Center */}
          <NotificationCenter />

      
          
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
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Ayarlar
              </DropdownMenuItem>
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