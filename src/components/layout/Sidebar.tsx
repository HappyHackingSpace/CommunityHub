// src/components/layout/Sidebar.tsx - ZERO RE-RENDER VERSION
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useEffect, useCallback, memo, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClubStore } from '@/store'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Users, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Settings,
  Plus,
  ChevronDown,
  Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// 🚀 PERFORMANCE: Static navigation configuration
const NAVIGATION_CONFIG = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'club_leader', 'member'] },
  { name: 'Kulüpler', href: '/clubs', icon: Users, roles: ['admin', 'club_leader', 'member'] },
  { name: 'Görevler', href: '/tasks', icon: CheckSquare, roles: ['admin', 'club_leader', 'member'] },
  { name: 'Toplantılar', href: '/meetings', icon: Calendar, roles: ['admin', 'club_leader', 'member'] },
  { name: 'Dosyalar', href: '/files', icon: FileText, roles: ['admin', 'club_leader', 'member'] },
  { name: 'Ayarlar', href: '/settings', icon: Settings, roles: ['admin', 'club_leader'] },
  { name: 'Admin Panel', href: '/permissions', icon: Settings, roles: ['admin'] },
] as const

// 🚀 PERFORMANCE: Memoized navigation item with exact props comparison
const NavigationItem = memo(({ 
  item, 
  pathname, 
  hasAccess 
}: { 
  item: (typeof NAVIGATION_CONFIG)[number]
  pathname: string
  hasAccess: boolean
}) => {
  if (!hasAccess) return null
  
  const Icon = item.icon
  const isActive = pathname === item.href
  
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
  )
}, (prevProps, nextProps) => {
  // 🚀 CUSTOM COMPARISON: Only re-render if pathname or access changes
  return prevProps.pathname === nextProps.pathname && 
         prevProps.hasAccess === nextProps.hasAccess
})

NavigationItem.displayName = 'NavigationItem'

// 🚀 PERFORMANCE: Virtualized club item with role badge
const ClubItem = memo(({ 
  club, 
  isActive, 
  userRole,
  userId 
}: { 
  club: {
    id: string
    name: string
    leaderId?: string
    memberIds?: string[]
    memberCount?: number
  }
  isActive: boolean
  userRole: string
  userId: string
}) => {
  const isLeader = club.leaderId === userId
  
  return (
    <Link
      href={`/clubs/${club.id}`}
      className={cn(
        "block px-3 py-2 rounded-lg text-sm transition-colors group",
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-600 hover:bg-gray-50"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="truncate flex-1 mr-2">{club.name}</span>
        <div className="flex items-center space-x-1">
          {isLeader && (
            <Crown className="h-3 w-3 text-yellow-500"  />
          )}
          <span className="text-xs text-gray-400">
            {club.memberCount || 0}
          </span>
        </div>
      </div>
    </Link>
  )
}, (prevProps, nextProps) => {
  // 🚀 PERFORMANCE: Only re-render if club data or active state changes
  return prevProps.club.id === nextProps.club.id &&
         prevProps.club.name === nextProps.club.name &&
         prevProps.club.memberCount === nextProps.club.memberCount &&
         prevProps.isActive === nextProps.isActive &&
         prevProps.club.leaderId === nextProps.club.leaderId
})

ClubItem.displayName = 'ClubItem'

// 🚀 PERFORMANCE: Virtualized clubs list with smart loading
const ClubsList = memo(({ 
  userClubs, 
  pathname, 
  userId, 
  isLoading,
  userRole,
  onRetry 
}: {
  userClubs: Array<{
    id: string
    name: string
    leaderId?: string
    memberIds?: string[]
    memberCount?: number
  }>
  pathname: string
  userId: string
  isLoading: boolean
  userRole: string
  onRetry: () => void
}) => {
  // 🚀 PERFORMANCE: Virtual scrolling for large club lists
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 })
  
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    
    const itemHeight = 44 // Approximate height of each club item
    const containerHeight = container.clientHeight
    const scrollTop = container.scrollTop
    
    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + 2, userClubs.length)
    
    setVisibleRange({ start, end })
  }, [userClubs.length])
  
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      handleScroll() // Initial calculation
      
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  if (isLoading && userClubs.length === 0) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (userClubs.length === 0) {
    return null // Let parent handle empty state
  }

  const visibleClubs = userClubs.slice(visibleRange.start, visibleRange.end)
  const totalHeight = userClubs.length * 44 // Virtual height

  return (
    <div 
      ref={containerRef}
      className="max-h-64 overflow-y-auto"
      style={{ contain: 'layout style paint' }} // CSS containment for performance
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${visibleRange.start * 44}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleClubs.map((club, index) => (
            <div key={club.id} style={{ height: 44 }}>
              <ClubItem
                club={club}
                isActive={pathname === `/clubs/${club.id}`}
                userRole={userRole}
                userId={userId}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // 🚀 PERFORMANCE: Deep comparison for clubs array
  if (prevProps.userClubs.length !== nextProps.userClubs.length) return false
  if (prevProps.pathname !== nextProps.pathname) return false
  if (prevProps.isLoading !== nextProps.isLoading) return false
  
  // Check if any club data changed
  for (let i = 0; i < prevProps.userClubs.length; i++) {
    const prev = prevProps.userClubs[i]
    const next = nextProps.userClubs[i]
    if (prev.id !== next.id || prev.name !== next.name || prev.memberCount !== next.memberCount) {
      return false
    }
  }
  
  return true
})

ClubsList.displayName = 'ClubsList'

// 🚀 PERFORMANCE: Main sidebar with intelligent re-render prevention
const Sidebar = memo(() => {
  const pathname = usePathname()
  const { user, isAdmin, isLeader, isAuthenticated, initialized } = useAuth()
  const { clubs, fetchClubs, isLoading, cacheStatus, clearCache } = useClubStore()
  
  // 🚀 PERFORMANCE: Ref for tracking component state
  const lastFetchRef = useRef<number>(0)
  const retryCountRef = useRef<number>(0)
  const MAX_RETRIES = 3

  // 🚀 PERFORMANCE: Memoized access checker (only recalculates if role changes)
  const hasAccess = useMemo(() => {
    const userRole = user?.role
    return (requiredRoles: readonly string[]) => {
      if (!userRole) return false
      return requiredRoles.includes(userRole)
    }
  }, [user?.role])

  // 🚀 PERFORMANCE: Memoized user clubs with intelligent filtering
  const userClubs = useMemo(() => {
    if (!user || !clubs || clubs.length === 0) {
      return []
    }

    const filteredClubs = clubs.filter(club => {
     const isMember = club.memberIds?.includes(user.id)
      const isLeader = club.leaderId === user.id
      return isMember || isLeader
    }).map(club => ({
      id: club.id,
      name: club.name,
      leaderId: club.leaderId,
      memberIds: club.memberIds,
      memberCount: club.memberCount
    }))

    // 🚀 PERFORMANCE: Sort by leadership status and name
    return filteredClubs.sort((a, b) => {
      const aIsLeader = a.leaderId === user.id
      const bIsLeader = b.leaderId === user.id
      
      if (aIsLeader && !bIsLeader) return -1
      if (!aIsLeader && bIsLeader) return 1
      
      return a.name.localeCompare(b.name, 'tr')
    })
  }, [clubs, user])

  // 🚀 PERFORMANCE: Smart data fetching with exponential backoff
  useEffect(() => {
    if (!isAuthenticated || !initialized || !user) return

    const now = Date.now()
    const timeSinceLastFetch = now - lastFetchRef.current
    
    // Only fetch if we have no clubs and not currently loading
    const shouldFetch = clubs.length === 0 && 
                       !isLoading && 
                       timeSinceLastFetch > 1000 // Prevent rapid refetches

    if (shouldFetch && retryCountRef.current < MAX_RETRIES) {
      console.log('🏢 Sidebar: Fetching clubs (smart fetch)', { cacheStatus, clubsLength: clubs.length })
      lastFetchRef.current = now
      retryCountRef.current++
      
      fetchClubs().catch(error => {
        console.error('🏢 Sidebar: Fetch failed, will retry with backoff')
        // Exponential backoff retry only if no data available
        if (clubs.length === 0) {
          setTimeout(() => {
            if (retryCountRef.current < MAX_RETRIES) {
              fetchClubs()
            }
          }, Math.pow(2, retryCountRef.current) * 1000)
        }
      })
    }

    // Reset retry count on successful data
    if (clubs.length > 0) {
      retryCountRef.current = 0
    }
  }, [isAuthenticated, initialized, user, clubs.length, isLoading, cacheStatus, fetchClubs])

  // 🚀 PERFORMANCE: Memoized retry handler with rate limiting
  const handleRetry = useCallback(() => {
    const now = Date.now()
    if (now - lastFetchRef.current < 2000) return // Rate limit: max 1 retry per 2 seconds
    
    console.log('🏢 Sidebar: Manual retry triggered')
    clearCache()
    retryCountRef.current = 0
    lastFetchRef.current = now
    fetchClubs(true)
  }, [clearCache, fetchClubs])

  // 🚀 PERFORMANCE: Memoized navigation items (only recalculates if role changes)
  const navigationElements = useMemo(() => {
    return NAVIGATION_CONFIG.map((item) => (
      <NavigationItem
        key={item.name}
        item={item}
        pathname={pathname}
        hasAccess={hasAccess(item.roles)}
      />
    ))
  }, [pathname, hasAccess])

  // 🚀 PERFORMANCE: Early return for unauthenticated state
  if (!isAuthenticated || !initialized) {
    return (
      <div className="bg-white w-64 border-r border-gray-200 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white w-64 border-r border-gray-200 flex flex-col h-full">
      {/* 🚀 PERFORMANCE: Navigation Section - Memoized */}
      <div className="p-6 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigasyon</h2>
        <nav className="space-y-2">
          {navigationElements}
        </nav>
      </div>
      
      {/* 🚀 PERFORMANCE: Clubs Section - Virtualized */}
      <div className="px-6 py-4 border-t border-gray-200 flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center">
            Kulüplerim
            {isLoading && (
              <div className="ml-2 w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            )}
            {cacheStatus === 'stale' && !isLoading && (
              <div className="ml-2 w-2 h-2 bg-yellow-400 rounded-full" title="Veriler güncellenebilir"></div>
            )}
          </h3>
          {(isAdmin || isLeader) && (
            <Link href="/clubs?action=create">
              <Button variant="ghost" size="sm" className="p-1 hover:bg-blue-50">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        <ClubsList
          userClubs={userClubs}
          pathname={pathname}
          userId={user?.id || ''}
          isLoading={isLoading}
          userRole={user?.role || 'member'}
          onRetry={handleRetry}
        />

        {/* 🚀 PERFORMANCE: Error state with retry and better messaging */}
        {!isLoading && userClubs.length === 0 && clubs.length === 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500 mb-2">
              Kulüp verisi yok
            </p>
            <button 
              onClick={handleRetry}
              className="text-xs text-blue-600 hover:underline"
              disabled={isLoading}
            >
              Yenile
            </button>
          </div>
        )}

        {/* Show when user has no club memberships but clubs exist */}
        {!isLoading && userClubs.length === 0 && clubs.length > 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500 mb-2">Henüz kulüp üyeliğiniz yok</p>
            <Link href="/clubs" className="text-xs text-blue-600 hover:underline">
              Kulüplere gözat →
            </Link>
          </div>
        )}

        {/* Show stale data indicator */}
        {cacheStatus === 'stale' && userClubs.length > 0 && !isLoading && (
          <div className="text-center py-2">
            <p className="text-xs text-yellow-600">
              Veriler güncellenebilir olabilir
            </p>
          </div>
        )}
      </div>
      
      {/* 🚀 PERFORMANCE: Footer - Static */}
      <div className="mt-auto p-6 border-t border-gray-200 flex-shrink-0">
        <div className="text-xs text-gray-500">
          <p>Community Platform v1.0</p>
          <p className="mt-1">© 2024 Tüm hakları saklıdır</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-1 text-green-600 space-y-1">
              <p>Cache: {cacheStatus}</p>
              <p>Clubs: {clubs.length} | User: {userClubs.length}</p>
              <p>Retries: {retryCountRef.current}/{MAX_RETRIES}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

Sidebar.displayName = 'Sidebar'

export default Sidebar