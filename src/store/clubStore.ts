// src/store/clubStore.ts - PERFORMANCE OPTIMIZED VERSION
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Club } from '@/types'

interface ClubCache {
  data: Club[];
  timestamp: number;
  ttl: number;
}

interface ClubStore {
  clubs: Club[];
  currentClub: Club | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  cacheStatus: 'fresh' | 'stale' | 'empty';
  
  // Actions
  setClubs: (clubs: Club[]) => void;
  setCurrentClub: (club: Club | null) => void;
  addClub: (club: Club) => void;
  updateClub: (id: string, updates: Partial<Club>) => void;
  deleteClub: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchClubs: (force?: boolean) => Promise<void>;
  fetchClubById: (id: string) => Promise<void>;
  clearCache: () => void;
  invalidateCache: () => void;
  backgroundSync: () => Promise<void>;
}

// 🚀 PERFORMANCE: Cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const BACKGROUND_SYNC_INTERVAL = 2 * 60 * 1000 // 2 minutes
const memoryCache = new Map<string, ClubCache>()

// 🚀 PERFORMANCE: Cache utilities
const getCacheKey = (userId?: string) => `clubs_${userId || 'all'}`

const getCachedClubs = (cacheKey: string): { clubs: Club[] | null; isStale: boolean } => {
  const cached = memoryCache.get(cacheKey)
  if (!cached) return { clubs: null, isStale: false }
  
  const isStale = Date.now() - cached.timestamp > cached.ttl
  return { clubs: cached.data, isStale }
}

const setCachedClubs = (cacheKey: string, clubs: Club[]) => {
  memoryCache.set(cacheKey, {
    data: clubs,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  })
}

export const useClubStore = create<ClubStore>()(
  persist(
    (set, get) => ({
      clubs: [],
      currentClub: null,
      isLoading: false,
      error: null,
      lastFetched: null,
      cacheStatus: 'empty',

      setClubs: (clubs) => {
        const cacheKey = getCacheKey()
        setCachedClubs(cacheKey, clubs)
        set({ 
          clubs, 
          lastFetched: Date.now(),
          cacheStatus: 'fresh',
          error: null
        })
      },

      setCurrentClub: (club) => set({ currentClub: club }),
  
      addClub: (club) => set((state) => {
        const newClubs = [...state.clubs, club]
        const cacheKey = getCacheKey()
        setCachedClubs(cacheKey, newClubs)
        return { clubs: newClubs }
      }),
  
      updateClub: (id, updates) => set((state) => {
        const newClubs = state.clubs.map(club => 
          club.id === id ? { ...club, ...updates } : club
        )
        const cacheKey = getCacheKey()
        setCachedClubs(cacheKey, newClubs)
        
        return {
          clubs: newClubs,
          currentClub: state.currentClub?.id === id 
            ? { ...state.currentClub, ...updates }
            : state.currentClub
        }
      }),
  
      deleteClub: (id) => set((state) => {
        const newClubs = state.clubs.filter(club => club.id !== id)
        const cacheKey = getCacheKey()
        setCachedClubs(cacheKey, newClubs)
        
        return {
          clubs: newClubs,
          currentClub: state.currentClub?.id === id ? null : state.currentClub
        }
      }),
  
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // 🚀 PERFORMANCE: Smart fetch with multi-layer caching
      fetchClubs: async (force = false) => {
        const state = get()
        const cacheKey = getCacheKey()

        console.log('🏢 ClubStore.fetchClubs called', { force, currentCount: state.clubs.length })

        // 🚀 CACHE LAYER 1: Memory cache check
        if (!force) {
          const { clubs: cachedClubs, isStale } = getCachedClubs(cacheKey)
          
          if (cachedClubs && !isStale) {
            console.log('✅ ClubStore: Using fresh memory cache')
            set({ 
              clubs: cachedClubs, 
              cacheStatus: 'fresh',
              error: null 
            })
            return
          }
          
          if (cachedClubs && isStale) {
            console.log('⚠️ ClubStore: Using stale cache, will background sync')
            set({ 
              clubs: cachedClubs, 
              cacheStatus: 'stale',
              error: null 
            })
            // Continue to fetch fresh data
          }
        }

        // 🚀 CACHE LAYER 2: Prevent duplicate requests
        if (state.isLoading && !force) {
          console.log('⏳ ClubStore: Already loading, skipping')
          return
        }

        set({ isLoading: true, error: null })

        try {
          console.log('🏢 ClubStore: Making API call')
          
          const token = localStorage.getItem('token')
          const headers: HeadersInit = { 'Content-Type': 'application/json' }
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
          
          const response = await fetch('/api/clubs', { headers })
          
          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
          }
          
          const result = await response.json()
          
          console.log('🏢 ClubStore: API response:', { 
            success: result.success, 
            dataLength: result.data?.length,
            error: result.error 
          })
          
          if (result.success) {
            // Update all caches
            setCachedClubs(cacheKey, result.data)
            
            set({ 
              clubs: result.data, 
              isLoading: false, 
              lastFetched: Date.now(),
              cacheStatus: 'fresh',
              error: null
            })
            
            console.log('✅ ClubStore: Clubs updated successfully:', result.data?.length, 'clubs')
          } else {
            set({ error: result.error, isLoading: false, cacheStatus: 'empty' })
            console.error('❌ ClubStore: API error:', result.error)
          }
        } catch (error) {
          console.error('💥 ClubStore: Network error:', error)
          set({ 
            error: 'Kulüpler yüklenemedi', 
            isLoading: false,
            cacheStatus: state.clubs.length > 0 ? 'stale' : 'empty'
          })
        }
      },

      fetchClubById: async (id: string) => {
        const state = get()
        if (state.isLoading) return

        // 🚀 PERFORMANCE: Check if club already exists in memory
        const existingClub = state.clubs.find(club => club.id === id)
        if (existingClub) {
          console.log('✅ ClubStore: Using existing club from memory')
          set({ currentClub: existingClub })
          return
        }
        
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`/api/clubs/${id}`)
          const result = await response.json()
          
          if (result.success) {
            set({ currentClub: result.data, isLoading: false })
            
            // 🚀 PERFORMANCE: Add to clubs list if not exists
            if (!state.clubs.find(club => club.id === id)) {
              const newClubs = [...state.clubs, result.data]
              const cacheKey = getCacheKey()
              setCachedClubs(cacheKey, newClubs)
              set({ clubs: newClubs })
            }
          } else {
            set({ error: result.error, isLoading: false })
          }
        } catch (error) {
          set({ error: 'Kulüp bilgileri yüklenemedi', isLoading: false })
        }
      },

      // 🚀 PERFORMANCE: Background sync for fresh data
      backgroundSync: async () => {
        const state = get()
        if (state.isLoading) return

        console.log('🔄 ClubStore: Background sync started')
        
       try {
          const response = await fetch('/api/clubs')
          const result = await response.json()
          
          if (result.success) {
            const cacheKey = getCacheKey()
            setCachedClubs(cacheKey, result.data)
            
            // Only update if data actually changed
            const currentIds = state.clubs.map(c => c.id).sort()
            const newIds = result.data.map((c: Club) => c.id).sort()
            
            if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
              console.log('🔄 ClubStore: Background sync found changes')
              set({ 
                clubs: result.data,
                lastFetched: Date.now(),
                cacheStatus: 'fresh'
              })
            } else {
              console.log('✅ ClubStore: Background sync - no changes')
              set({ cacheStatus: 'fresh' })
            }
          }
        } catch (error) {
          console.error('⚠️ ClubStore: Background sync failed:', error)
          // Don't update error state for background sync failures
        }
      },

      clearCache: () => {
        memoryCache.clear()
        set({ 
          clubs: [], 
          currentClub: null,
          lastFetched: null,
          error: null,
          cacheStatus: 'empty'
        })
      },

      invalidateCache: () => {
        memoryCache.clear()
        set({ cacheStatus: 'empty' })
      },
    }),
    {
      name: 'club-storage-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        clubs: state.clubs,
        lastFetched: state.lastFetched,
        cacheStatus: state.cacheStatus
      }),
      // 🚀 PERFORMANCE: Persist configuration
      skipHydration: false,
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check if persisted data is stale
          const isStale = state.lastFetched && 
            (Date.now() - state.lastFetched > CACHE_TTL)
          
          if (isStale) {
            state.cacheStatus = 'stale'
          }
          
          console.log('🏢 ClubStore: Rehydrated from localStorage', {
            clubsCount: state.clubs.length,
            cacheStatus: state.cacheStatus
          })
        }
      }
    }
  )
)

// 🚀 PERFORMANCE: Background sync setup
let backgroundSyncInterval: NodeJS.Timeout | null = null

export const startClubBackgroundSync = () => {
  if (backgroundSyncInterval) return
  
  backgroundSyncInterval = setInterval(() => {
    const store = useClubStore.getState()
    if (!store.isLoading && store.clubs.length > 0) {
      store.backgroundSync()
    }
  }, BACKGROUND_SYNC_INTERVAL)
  
  console.log('🔄 ClubStore: Background sync started')
}

export const stopClubBackgroundSync = () => {
  if (backgroundSyncInterval) {
    clearInterval(backgroundSyncInterval)
    backgroundSyncInterval = null
    console.log('⏹️ ClubStore: Background sync stopped')
  }
}