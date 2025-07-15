// src/hooks/useAuth.ts - PERFORMANCE OPTIMIZED VERSION
'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'club_leader' | 'member';
  isActive: boolean;
}

interface AuthCache {
  user: AuthUser | null;
  timestamp: number;
  ttl: number;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  initialized: boolean;
  error: string | null;
}

// 🚀 PERFORMANCE: Memory cache ile expensive profile fetches'i önle
const AUTH_CACHE_KEY = 'auth_cache_v2'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const memoryCache = new Map<string, AuthCache>()

// 🚀 PERFORMANCE: Cache utilities
const getCachedAuth = (userId: string): AuthUser | null => {
  const cached = memoryCache.get(userId)
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.user
  }
  return null
}

const setCachedAuth = (userId: string, user: AuthUser | null) => {
  memoryCache.set(userId, {
    user,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  })
}

// 🚀 PERFORMANCE: Debounced auth state changes
const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): T => {
  let timeoutId: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }) as T
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    initialized: false,
    error: null
  })
  
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const mountedRef = useRef(true)
  const lastProfileFetchRef = useRef<string | null>(null)

  // 🚀 PERFORMANCE: Memoized setters
  const setUser = useCallback((user: AuthUser | null) => {
    if (!mountedRef.current) return
    setState(prev => ({ ...prev, user, error: null }))
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    if (!mountedRef.current) return
    setState(prev => ({ ...prev, isLoading: loading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    if (!mountedRef.current) return
    setState(prev => ({ ...prev, error }))
  }, [])

  const setInitialized = useCallback((initialized: boolean) => {
    if (!mountedRef.current) return
    setState(prev => ({ ...prev, initialized }))
  }, [])

  // 🚀 PERFORMANCE: Optimized profile fetcher with caching
  const fetchUserProfile = useCallback(async (authUser: User): Promise<AuthUser | null> => {
    // Cache check first
    const cached = getCachedAuth(authUser.id)
    if (cached) {
      console.log('✅ Auth: Using cached profile for', authUser.id)
      return cached
    }

    // Prevent duplicate fetches
    if (lastProfileFetchRef.current === authUser.id) {
      console.log('⏳ Auth: Profile fetch already in progress for', authUser.id)
      return null
    }

    lastProfileFetchRef.current = authUser.id
    console.log('🔍 Auth: Fetching fresh profile for', authUser.id)
    
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .eq('is_active', true)
        .single()

      if (userData) {
        const userProfile: AuthUser = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          isActive: userData.is_active,
        }
        
        // Cache the result
        setCachedAuth(authUser.id, userProfile)
        return userProfile
        
      } else if (error?.code === 'PGRST116') {
        console.log('🔄 Auth: Creating new user profile')
        return await createUserProfile(authUser)
      } else {
        console.error('❌ Auth: Profile fetch error:', error)
        return null
      }
    } catch (error) {
      console.error('💥 Auth: Profile fetch exception:', error)
      return null
    } finally {
      lastProfileFetchRef.current = null
    }
  }, [supabase])

  // 🚀 PERFORMANCE: Optimized profile creator
  const createUserProfile = useCallback(async (authUser: User): Promise<AuthUser | null> => {
    try {
      let role: 'admin' | 'club_leader' | 'member' = 'member'
      
      // Smart role detection
      if (authUser.email === 'admin@happyhackingspace.com') {
        role = 'admin'
      } else if (authUser.email?.includes('leader') || authUser.email?.includes('club')) {
        role = 'club_leader'
      }

      const newUserData = {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        role,
        is_active: true,
        permissions: role === 'admin' ? [
          { name: 'MANAGE_USERS', granted_at: new Date().toISOString(), granted_by: 'system' },
          { name: 'ADMIN_PANEL_ACCESS', granted_at: new Date().toISOString(), granted_by: 'system' },
        ] : []
      }

      const { data: createdUser, error } = await supabase
        .from('users')
        .insert(newUserData)
        .select()
        .single()

      if (error) {
        console.error('❌ Auth: Failed to create profile:', error)
        return null
      }

      const userProfile: AuthUser = {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role,
        isActive: createdUser.is_active,
      }

      // Cache immediately
      setCachedAuth(authUser.id, userProfile)
      return userProfile
      
    } catch (error) {
      console.error('💥 Auth: Profile creation exception:', error)
      return null
    }
  }, [supabase])

  // 🚀 PERFORMANCE: Debounced auth state handler
  const debouncedAuthHandler = useMemo(
    () => debounce(async (event: string, session: any) => {
      if (!mountedRef.current) return

      console.log('🔄 Auth: State change debounced:', event)

      if (event === 'SIGNED_IN' && session?.user) {
        const userProfile = await fetchUserProfile(session.user)
        if (userProfile && mountedRef.current) {
          setUser(userProfile)
        }
      } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        setUser(null)
        // Clear caches
        memoryCache.clear()
        localStorage.removeItem(AUTH_CACHE_KEY)
        
        // ✅ FIX: Only redirect if we're not already on login page
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          console.log('🔄 Auth: Redirecting to login from:', window.location.pathname)
          router.push('/login')
        }
      }
      
      setLoading(false)
    }, 100),
    [fetchUserProfile, setUser, setLoading, router]
  )

  // 🚀 PERFORMANCE: Optimized initial session
  const getInitialSession = useCallback(async () => {
    if (!mountedRef.current) return

    console.log('🔍 Auth: Getting initial session...')
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user && mountedRef.current) {
        console.log('👤 Auth: Session found:', session.user.id)
        const userProfile = await fetchUserProfile(session.user)
        if (userProfile && mountedRef.current) {
          setUser(userProfile)
        }
      } else {
        console.log('❌ Auth: No session found')
        if (mountedRef.current) {
          setUser(null)
          // ✅ FIX: Don't redirect in getInitialSession, let middleware handle it
          // Just emit the auth state change
          debouncedAuthHandler('INITIAL_SESSION', null)
        }
      }
    } catch (error) {
      console.error('💥 Auth: Session error:', error)
      if (mountedRef.current) {
        setError('Session yükleme hatası')
        setUser(null)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
        setInitialized(true)
      }
    }
  }, [supabase, fetchUserProfile, setUser, setLoading, setError, setInitialized, debouncedAuthHandler])

  // 🚀 PERFORMANCE: Effect with cleanup
  useEffect(() => {
    mountedRef.current = true

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(debouncedAuthHandler)

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [getInitialSession, debouncedAuthHandler, supabase])

  // 🚀 PERFORMANCE: Optimized logout with cache clearing
  const logout = useCallback(async () => {
    console.log('👋 Auth: Logging out...')
    
    try {
      // Clear caches first
      memoryCache.clear()
      localStorage.removeItem(AUTH_CACHE_KEY)
      
      await supabase.auth.signOut()
      setUser(null)
      
      // Force navigation
      window.location.href = '/login'
    } catch (error) {
      console.error('💥 Auth: Logout error:', error)
      // Even on error, clear state and redirect
      setUser(null)
      window.location.href = '/login'
    }
  }, [supabase, setUser])

  // 🚀 PERFORMANCE: Background sync for fresh data
  useEffect(() => {
    if (!state.user || !state.initialized) return

    const interval = setInterval(async () => {
      // Silent background refresh
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const freshProfile = await fetchUserProfile(session.user)
        if (freshProfile && mountedRef.current) {
          // Only update if different
          if (JSON.stringify(freshProfile) !== JSON.stringify(state.user)) {
            console.log('🔄 Auth: Background sync updated profile')
            setUser(freshProfile)
          }
        }
      }
    }, CACHE_TTL) // Sync every cache TTL

    return () => clearInterval(interval)
  }, [state.user, state.initialized, supabase, fetchUserProfile, setUser])

  // 🚀 PERFORMANCE: Memoized return values
  return useMemo(() => ({
    user: state.user,
    isLoading: state.isLoading,
    initialized: state.initialized,
    error: state.error,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin',
    isLeader: state.user?.role === 'club_leader',
    isMember: state.user?.role === 'member',
    logout,
  }), [state, logout])
}