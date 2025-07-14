'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
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
  { name: 'Ayarlar', href: '/settings', icon: Settings, roles: ['admin', 'club_leader'] }, // ✅ member kaldırıldı
  { name: 'Admin Panel', href: '/permissions', icon: Settings, roles: ['admin'] }, // ✅ sadece admin
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, isLeader } = useAuth();
  const { clubs } = useClubStore();

  // Memoize computed values to prevent unnecessary re-renders
  const userClubs = useMemo(() => {
    return clubs.filter(club => 
      club.memberIds.includes(user?.id || '') || club.leaderId === user?.id
    );
  }, [clubs, user?.id]);

 const hasAccess = useMemo(() => {
  return (requiredRoles: string[]) => {
    if (!user || !user.role) return false;
    
    // ✅ Explicit role check
    return requiredRoles.includes(user.role);
  };
}, [user?.role]);

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
      
      {/* Kulüpler Bölümü */}
      {userClubs.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Kulüplerim</h3>
            {(isAdmin || isLeader) && (
              <Button variant="ghost" size="sm" className="p-1">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
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
        </div>
      )}
      
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