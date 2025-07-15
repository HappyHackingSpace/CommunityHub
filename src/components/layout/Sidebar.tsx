// src/components/layout/Sidebar.tsx - CLUBS FIX
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClubStore } from '@/store';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Settings,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'club_leader', 'member'] },
  { name: 'Kulüpler', href: '/clubs', icon: Users, roles: ['admin', 'club_leader', 'member'] },
  { name: 'Görevler', href: '/tasks', icon: CheckSquare, roles: ['admin', 'club_leader', 'member'] },
  { name: 'Toplantılar', href: '/meetings', icon: Calendar, roles: ['admin', 'club_leader', 'member'] },
  { name: 'Dosyalar', href: '/files', icon: FileText, roles: ['admin', 'club_leader', 'member'] },
  { name: 'Ayarlar', href: '/settings', icon: Settings, roles: ['admin', 'club_leader'] },
  { name: 'Admin Panel', href: '/permissions', icon: Settings, roles: ['admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, isLeader, isAuthenticated } = useAuth();
  const { clubs, fetchClubs, isLoading } = useClubStore();

  // ✅ CLUBS FIX: Kullanıcı authenticated olduğunda clubs fetch et
  useEffect(() => {
    if (isAuthenticated && user && clubs.length === 0 && !isLoading) {
      console.log('🏢 Sidebar: Fetching clubs for user:', user.id);
      fetchClubs();
    }
  }, [isAuthenticated, user, clubs.length, isLoading, fetchClubs]);

  // ✅ CLUBS FIX: User clubs'ları daha güvenli hesapla
  const userClubs = useMemo(() => {
    if (!user || !clubs || clubs.length === 0) {
      console.log('🏢 Sidebar: No user or clubs available');
      return [];
    }

    const filteredClubs = clubs.filter(club => {
      const isMember = club.memberIds && club.memberIds.includes(user.id);
      const isLeader = club.leaderId === user.id;
      return isMember || isLeader;
    });

    console.log('🏢 Sidebar: User clubs:', filteredClubs.length, 'of', clubs.length);
    return filteredClubs;
  }, [clubs, user]);

  const hasAccess = useMemo(() => {
    return (requiredRoles: string[]) => {
      if (!user || !user.role) return false;
      return requiredRoles.includes(user.role);
    };
  }, [user?.role]);

  // ✅ DEBUG: Sidebar state'ini logla
  console.log('🔍 Sidebar Debug:', {
    user: user?.name,
    totalClubs: clubs.length,
    userClubs: userClubs.length,
    isLoading,
    isAuthenticated
  });

  return (
    <div className="bg-white w-64 border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigasyon</h2>
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            if (!hasAccess(item.roles)) return null;
            
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* ✅ CLUBS SECTION FIX */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Kulüplerim 
            {isLoading && <span className="text-xs text-gray-500 ml-2">(yükleniyor...)</span>}
          </h3>
          {(isAdmin || isLeader) && (
            <Button variant="ghost" size="sm" className="p-1">
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* ✅ LOADING STATE */}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ CLUBS LIST */}
        {!isLoading && userClubs.length > 0 && (
          <div className="space-y-2">
            {userClubs.map((club) => (
              <Link
                key={club.id}
                href={`/clubs/${club.id}`}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm transition-colors",
                  pathname === `/clubs/${club.id}`
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{club.name}</span>
                  {club.leaderId === user?.id && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Lider
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ✅ NO CLUBS STATE */}
        {!isLoading && userClubs.length === 0 && clubs.length > 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500 mb-2">Henüz kulüp üyeliğiniz yok</p>
            <Link href="/clubs" className="text-xs text-blue-600 hover:underline">
              Kulüplere gözat →
            </Link>
          </div>
        )}

        {/* ✅ ERROR STATE */}
        {!isLoading && clubs.length === 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500 mb-2">Kulüpler yüklenemedi</p>
            <button 
              onClick={() => fetchClubs()}
              className="text-xs text-blue-600 hover:underline"
            >
              Tekrar dene
            </button>
          </div>
        )}
      </div>
      
      {/* Alt Bilgi */}
      <div className="mt-auto p-6 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p>Community Platform v1.0</p>
          <p className="mt-1">© 2024 Tüm hakları saklıdır</p>
        </div>
      </div>
    </div>
  );
}