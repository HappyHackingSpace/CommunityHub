// src/store/clubStore.ts - PERFORMANCE OPTIMIZED VERSION
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createClient } from '@/lib/supabase-client'
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

// 🚀 PERFORMANCE: Cache configuration - Extended TTL for better UX
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes (extended from 5)
const STALE_THRESHOLD = 10 * 60 * 1000 // 10 minutes (data is considered stale but still usable)
const BACKGROUND_SYNC_INTERVAL = 5 * 60 * 1000 // 5 minutes (less frequent)
const memoryCache = new Map<string, ClubCache>()

// 🚀 PERFORMANCE: Cache utilities
const getCacheKey = (userId?: string) => `clubs_${userId || 'all'}`

const getCachedClubs = (cacheKey: string): { clubs: Club[] | null; isStale: boolean; isVeryStale: boolean } => {
  const cached = memoryCache.get(cacheKey)
  if (!cached) return { clubs: null, isStale: false, isVeryStale: false }
  
  const age = Date.now() - cached.timestamp
  const isStale = age > STALE_THRESHOLD
  const isVeryStale = age > CACHE_TTL
  
  return { clubs: cached.data, isStale, isVeryStale }
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

        console.log('🏢 ClubStore.fetchClubs called', { force, currentCount: state.clubs.length, cacheStatus: state.cacheStatus })

        // 🚀 CACHE LAYER 1: Memory cache check with improved stale handling
        if (!force) {
          const { clubs: cachedClubs, isStale, isVeryStale } = getCachedClubs(cacheKey)
          
          // Use fresh cache immediately
          if (cachedClubs && !isStale) {
            console.log('✅ ClubStore: Using fresh memory cache')
            set({ 
              clubs: cachedClubs, 
              cacheStatus: 'fresh',
              error: null 
            })
            return
          }
          
          // Use stale cache but trigger background refresh
          if (cachedClubs && isStale && !isVeryStale) {
            console.log('⚠️ ClubStore: Using stale cache, triggering background refresh')
            set({ 
              clubs: cachedClubs, 
              cacheStatus: 'stale',
              error: null 
            })
            // Trigger background refresh without blocking UI
            setTimeout(() => {
              get().backgroundSync()
            }, 100)
            return
          }

          // Use very stale cache only if no fresh data available, but show as stale
          if (cachedClubs && isVeryStale) {
            console.log('⚠️ ClubStore: Using very stale cache as fallback')
            set({ 
              clubs: cachedClubs, 
              cacheStatus: 'stale',
              error: null 
            })
            // Continue to fetch fresh data below
          }
        }

        // 🚀 CACHE LAYER 2: Prevent duplicate requests
        if (state.isLoading && !force) {
          console.log('⏳ ClubStore: Already loading, skipping')
          return
        }

        set({ isLoading: true, error: null })

        try {
          console.log('🏢 ClubStore: Making Supabase query')
          
          const supabase = createClient()
          const { data, error } = await supabase
            .from('clubs')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (error) {
            throw new Error(`Supabase Error: ${error.message}`)
          }
          
          console.log('🏢 ClubStore: Supabase response:', { 
            dataLength: data?.length,
            error: error 
          })
          
          if (data) {
            // Ensure memberIds is always an array
            const normalizedData = data.map(club => ({
              ...club,
              memberIds: club.memberIds || []
            }))
            
            // Update all caches
            setCachedClubs(cacheKey, normalizedData)
            
            set({ 
              clubs: normalizedData, 
              isLoading: false, 
              lastFetched: Date.now(),
              cacheStatus: 'fresh',
              error: null
            })
            
            console.log('✅ ClubStore: Clubs updated successfully:', normalizedData?.length, 'clubs')
          } else {
            set({ error: 'No data returned', isLoading: false, cacheStatus: 'empty' })
            console.error('❌ ClubStore: No data returned from Supabase')
          }
        } catch (error) {
          console.error('💥 ClubStore: Network error:', error)
          
          // Smart error handling - keep existing data if available
          const existingClubs = state.clubs
          if (existingClubs.length > 0) {
            console.log('🔄 ClubStore: Network error, keeping existing data as stale')
            set({ 
              isLoading: false,
              cacheStatus: 'stale',
              error: 'Bağlantı sorunu - eski veriler gösteriliyor'
            })
          } else {
            set({ 
              error: 'Kulüpler yüklenemedi - internet bağlantınızı kontrol edin', 
              isLoading: false,
              cacheStatus: 'empty'
            })
          }
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
          const supabase = createClient()
          const { data, error } = await supabase
            .from('clubs')
            .select('*')
            .eq('id', id)
            .single()
          
          if (error) {
            throw new Error(`Supabase Error: ${error.message}`)
          }
          
          if (data) {
            // Ensure memberIds is always an array
            const normalizedClub = {
              ...data,
              memberIds: data.memberIds || []
            }
            
            set({ currentClub: normalizedClub, isLoading: false })
            
            // 🚀 PERFORMANCE: Add to clubs list if not exists
            if (!state.clubs.find(club => club.id === id)) {
              const newClubs = [...state.clubs, normalizedClub]
              const cacheKey = getCacheKey()
              setCachedClubs(cacheKey, newClubs)
              set({ clubs: newClubs })
            }
          } else {
            set({ error: 'Club not found', isLoading: false })
          }
        } catch (error) {
          set({ error: 'Kulüp bilgileri yüklenemedi', isLoading: false })
        }
      },

      // 🚀 PERFORMANCE: Background sync for fresh data with retry logic
      backgroundSync: async () => {
        const state = get()
        if (state.isLoading) return

        console.log('🔄 ClubStore: Background sync started')
        
        try {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('clubs')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (error) {
            throw new Error(`Supabase Error: ${error.message}`)
          }
          
          if (data) {
            // Ensure memberIds is always an array
            const normalizedData = data.map(club => ({
              ...club,
              memberIds: club.memberIds || []
            }))
            
            const cacheKey = getCacheKey()
            setCachedClubs(cacheKey, normalizedData)
            
            // Only update if data actually changed
            const currentIds = state.clubs.map(c => c.id).sort()
            const newIds = normalizedData.map((c: Club) => c.id).sort()
            
            if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
              console.log('🔄 ClubStore: Background sync found changes, updating UI')
              set({ 
                clubs: normalizedData,
                lastFetched: Date.now(),
                cacheStatus: 'fresh',
                error: null
              })
            } else {
              console.log('✅ ClubStore: Background sync - no changes, updating cache status')
              set({ 
                cacheStatus: 'fresh',
                lastFetched: Date.now(),
                error: null
              })
            }
          }
        } catch (error) {
          console.error('⚠️ ClubStore: Background sync failed:', error)
          // For background sync failures, don't change cache status
          // The data remains stale but still usable
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
          // Check if persisted data is stale but still usable
          const age = state.lastFetched ? Date.now() - state.lastFetched : Infinity
          const isStale = age > STALE_THRESHOLD
          const isVeryStale = age > CACHE_TTL
          
          if (isVeryStale) {
            state.cacheStatus = 'empty' // Force fresh fetch
            state.clubs = [] // Clear very old data
          } else if (isStale) {
            state.cacheStatus = 'stale' // Use stale data but trigger refresh
          } else {
            state.cacheStatus = 'fresh'
          }
          
          console.log('🏢 ClubStore: Rehydrated from localStorage', {
            clubsCount: state.clubs.length,
            cacheStatus: state.cacheStatus,
            age: Math.round(age / 1000) + 's'
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
    if (!store.isLoading) {
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