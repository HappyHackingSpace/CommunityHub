// src/components/layout/Sidebar.tsx - SIMPLIFIED
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClubsApi } from '@/hooks/useSimpleApi'

import { cn } from '@/lib/utils'
import { 
  Home, 
  Users, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Settings,
  Plus,
  Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Navigation configuration
const NAVIGATION_CONFIG = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'club_leader', 'member'] },
  { name: 'Kulüpler', href: '/clubs', icon: Users, roles: ['admin', 'club_leader', 'member'] },
  { name: 'Görevler', href: '/tasks', icon: CheckSquare, roles: ['admin', 'club_leader', 'member'] },
  { name: 'Toplantılar', href: '/meetings', icon: Calendar, roles: ['admin', 'club_leader', 'member'] },
  { name: 'Dosyalar', href: '/files', icon: FileText, roles: ['admin', 'club_leader', 'member'] },
  { name: 'Ayarlar', href: '/settings', icon: Settings, roles: ['admin', 'club_leader'] },
  { name: 'Admin Panel', href: '/permissions', icon: Settings, roles: ['admin'] },
]

interface Club {
  id: string
  name: string
  leaderId?: string
  memberIds?: string[]
  memberCount?: number
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user, isAdmin, isLeader, isAuthenticated, initialized } = useAuth()
  const { clubs, fetchClubs, isLoading } = useClubsApi()

  // Fetch clubs when component mounts
  useEffect(() => {
    if (isAuthenticated && initialized && user && clubs.length === 0 && !isLoading) {
      fetchClubs()
    }
  }, [isAuthenticated, initialized, user, clubs.length, isLoading]) // Removed fetchClubs from dependency array

  // Filter user clubs
  const userClubs = useMemo(() => {
    if (!user || !clubs || clubs.length === 0) {
      return []
    }

    const filteredClubs = clubs.filter((club: Club) => {
      const isMember = club.memberIds?.includes(user.id)
      const isLeader = club.leaderId === user.id
      return isMember || isLeader
    }).map((club: Club) => ({
      id: club.id,
      name: club.name,
      leaderId: club.leaderId,
      memberIds: club.memberIds,
      memberCount: club.memberCount
    }))

    // Sort by leadership status and name
    return filteredClubs.sort((a: Club, b: Club) => {
      const aIsLeader = a.leaderId === user.id
      const bIsLeader = b.leaderId === user.id
      
      if (aIsLeader && !bIsLeader) return -1
      if (!aIsLeader && bIsLeader) return 1
      
      return a.name.localeCompare(b.name, 'tr')
    })
  }, [clubs, user])

  // Check if user has access to a navigation item
  const hasAccess = (requiredRoles: string[]) => {
    if (!user?.role) return false
    return requiredRoles.includes(user.role)
  }

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
      {/* Navigation Section */}
      <div className="p-6 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigasyon</h2>
        <nav className="space-y-2">
          {NAVIGATION_CONFIG.map((item) => {
            if (!hasAccess(item.roles)) return null
            
            const Icon = item.icon
            const isActive = pathname === item.href
            
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
            )
          })}
        </nav>
      </div>
      
    
      
      {/* Footer */}
      <div className="mt-auto p-6 border-t border-gray-200 flex-shrink-0">
        <div className="text-xs text-gray-500">
          <p>Community Platform v1.0</p>
          <p className="mt-1">© 2024 Tüm hakları saklıdır</p>
        </div>
      </div>
    </div>
  )
}
