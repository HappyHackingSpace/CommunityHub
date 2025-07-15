// src/components/layout/Sidebar.tsx - PERFORMANCE OPTIMIZED
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useEffect, useCallback, memo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClubStore } from '@/store';
import { startClubBackgroundSync, stopClubBackgroundSync } from '@/store/clubStore';
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
] as const;

// 🚀 PERFORMANCE: Memoized navigation item component
const NavigationItem = memo(({ 
  item, 
  pathname, 
  hasAccess 
}: { 
  item: (typeof navigationItems)[number]; 
  pathname: string; 
  hasAccess: boolean; 
}) => {
  if (!hasAccess) return null;
  
  const Icon = item.icon;
  const isActive = pathname === item.href;
  
  return (
    <Link
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
});

NavigationItem.displayName = 'NavigationItem';

// 🚀 PERFORMANCE: Memoized club item component
const ClubItem = memo(({ 
  club, 
  isActive, 
  isLeader 
}: { 
  club: { id: string; name: string; leaderId?: string; memberIds?: string[] }; 
  isActive: boolean; 
  isLeader: boolean; 
}) => (
  <Link
    href={`/clubs/${club.id}`}
    className={cn(
      "block px-3 py-2 rounded-lg text-sm transition-colors",
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-gray-600 hover:bg-gray-50"
    )}
  >
    <div className="flex items-center justify-between">
      <span className="truncate">{club.name}</span>
      {isLeader && (
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
          Lider
        </span>
      )}
    </div>
  </Link>
));

ClubItem.displayName = 'ClubItem';

// 🚀 PERFORMANCE: Memoized clubs section component
const ClubsSection = memo(({ 
  userClubs, 
  pathname, 
  userId, 
  isLoading, 
  canCreateClub,
  onRetry 
}: {
  userClubs: { id: string; name: string; leaderId?: string; memberIds?: string[] }[];
  pathname: string;
  userId: string;
  isLoading: boolean;
  canCreateClub: boolean;
  onRetry: () => void;
}) => {
  const renderClubsList = useCallback(() => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      );
    }

    if (userClubs.length > 0) {
      return (
        <div className="space-y-2">
          {userClubs.map((club) => (
            <ClubItem
              key={club.id}
              club={club}
              isActive={pathname === `/clubs/${club.id}`}
             isLeader={club.leaderId === userId}
           />
         ))}
       </div>
     );
   }

   // No clubs state
   return (
     <div className="text-center py-4">
       <p className="text-xs text-gray-500 mb-2">Henüz kulüp üyeliğiniz yok</p>
       <Link href="/clubs" className="text-xs text-blue-600 hover:underline">
         Kulüplere gözat →
       </Link>
     </div>
   );
 }, [userClubs, pathname, userId, isLoading]);

 return (
   <div className="px-6 py-4 border-t border-gray-200">
     <div className="flex items-center justify-between mb-4">
       <h3 className="text-sm font-semibold text-gray-900">
         Kulüplerim 
         {isLoading && <span className="text-xs text-gray-500 ml-2">(yükleniyor...)</span>}
       </h3>
       {canCreateClub && (
         <Button variant="ghost" size="sm" className="p-1">
           <Plus className="h-4 w-4" />
         </Button>
       )}
     </div>

     {renderClubsList()}

     {!isLoading && userClubs.length === 0 && (
       <div className="text-center py-4">
         <p className="text-xs text-gray-500 mb-2">Kulüpler yüklenemedi</p>
         <button 
           onClick={onRetry}
           className="text-xs text-blue-600 hover:underline"
         >
           Tekrar dene
         </button>
       </div>
     )}
   </div>
 );
});

ClubsSection.displayName = 'ClubsSection';

// 🚀 PERFORMANCE: Main sidebar component with optimizations
function Sidebar() {
 const pathname = usePathname();
 const { user, isAdmin, isLeader, isAuthenticated, initialized } = useAuth();
 const { clubs, fetchClubs, isLoading, cacheStatus, clearCache } = useClubStore();

 // 🚀 PERFORMANCE: Memoized access checker
 const hasAccess = useMemo(() => {
   return (requiredRoles: readonly string[]) => {
     if (!user?.role) return false;
     return requiredRoles.includes(user.role);
   };
 }, [user?.role]);

 // 🚀 PERFORMANCE: Memoized user clubs calculation
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

   console.log('🏢 Sidebar: User clubs filtered:', filteredClubs.length, 'of', clubs.length);
   return filteredClubs;
 }, [clubs, user]);

 // 🚀 PERFORMANCE: Smart data fetching strategy
 useEffect(() => {
   if (!isAuthenticated || !initialized || !user) return;

   console.log('🏢 Sidebar: Checking club data status', {
     clubsCount: clubs.length,
     cacheStatus,
     isLoading
   });

   // Only fetch if we have no data or cache is empty
   if (clubs.length === 0 && cacheStatus === 'empty' && !isLoading) {
     console.log('🏢 Sidebar: Fetching clubs (no data)');
     fetchClubs();
   } else if (cacheStatus === 'stale' && !isLoading) {
     console.log('🏢 Sidebar: Background fetching clubs (stale cache)');
     fetchClubs(); // This will use background sync
   }

   // Start background sync for real-time updates
   startClubBackgroundSync();

   return () => {
     stopClubBackgroundSync();
   };
 }, [isAuthenticated, initialized, user, clubs.length, cacheStatus, isLoading, fetchClubs]);

 // 🚀 PERFORMANCE: Memoized retry handler
 const handleRetry = useCallback(() => {
   clearCache();
   fetchClubs(true); // Force fetch
 }, [clearCache, fetchClubs]);

 // 🚀 PERFORMANCE: Memoized navigation items
 const navigationElements = useMemo(() => {
   return navigationItems.map((item) => (
     <NavigationItem
       key={item.name}
       item={item}
       pathname={pathname}
       hasAccess={hasAccess(item.roles)}
     />
   ));
 }, [pathname, hasAccess]);

 // 🚀 PERFORMANCE: Early return for unauthenticated users
 if (!isAuthenticated || !initialized) {
   return (
     <div className="bg-white w-64 border-r border-gray-200 flex items-center justify-center">
       <div className="animate-pulse text-center">
         <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
         <div className="h-3 bg-gray-200 rounded w-24"></div>
       </div>
     </div>
   );
 }

 // Debug logging (only in development)
 if (process.env.NODE_ENV === 'development') {
   console.log('🔍 Sidebar Debug:', {
     user: user?.name,
     totalClubs: clubs.length,
     userClubs: userClubs.length,
     cacheStatus,
     isLoading,
     isAuthenticated
   });
 }

 return (
   <div className="bg-white w-64 border-r border-gray-200 flex flex-col">
     {/* Navigation Section */}
     <div className="p-6">
       <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigasyon</h2>
       <nav className="space-y-2">
         {navigationElements}
       </nav>
     </div>
     
     {/* Clubs Section */}
     <ClubsSection
       userClubs={userClubs}
       pathname={pathname}
       userId={user?.id || ''}
       isLoading={isLoading}
       canCreateClub={isAdmin || isLeader}
       onRetry={handleRetry}
     />
     
     {/* Footer */}
     <div className="mt-auto p-6 border-t border-gray-200">
       <div className="text-xs text-gray-500">
         <p>Community Platform v1.0</p>
         <p className="mt-1">© 2024 Tüm hakları saklıdır</p>
         {process.env.NODE_ENV === 'development' && (
           <p className="mt-1 text-green-600">
             Cache: {cacheStatus} • Clubs: {clubs.length}
           </p>
         )}
       </div>
     </div>
   </div>
 );
}

export default memo(Sidebar);