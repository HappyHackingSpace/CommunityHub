import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Meeting } from '@/types';

interface MeetingCache {
  data: Meeting[];
  timestamp: number;
  ttl: number;
}

interface MeetingStore {
  meetings: Meeting[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  cacheStatus: 'fresh' | 'stale' | 'empty';
  
  // Actions
  setMeetings: (meetings: Meeting[]) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCache: () => void;
  
  // API calls
  fetchMeetings: (clubId?: string, userId?: string, force?: boolean) => Promise<void>;
  fetchMeetingById: (id: string) => Promise<void>;
  updateMeetingResponse: (meetingId: string, response: 'accepted' | 'declined') => Promise<void>;
  backgroundSync: (clubId?: string, userId?: string) => Promise<void>;
  refreshIfStale: (clubId?: string, userId?: string) => Promise<void>;
  invalidateCache: () => void;
}

// Cache configuration
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const memoryCache = new Map<string, MeetingCache>();

// Cache utilities
const getCacheKey = (clubId?: string, userId?: string) => 
  `meetings_${clubId || 'all'}_${userId || 'all'}`;

const getCachedMeetings = (cacheKey: string): { meetings: Meeting[] | null; isStale: boolean; isVeryStale: boolean } => {
  const cached = memoryCache.get(cacheKey);
  if (!cached) return { meetings: null, isStale: false, isVeryStale: false };
  
  const age = Date.now() - cached.timestamp;
  const isStale = age > STALE_THRESHOLD;
  const isVeryStale = age > CACHE_TTL;
  
  return { meetings: cached.data, isStale, isVeryStale };
};

const setCachedMeetings = (cacheKey: string, meetings: Meeting[]) => {
  memoryCache.set(cacheKey, {
    data: meetings,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  });
};

export const useMeetingStore = create<MeetingStore>()(
  persist(
    (set, get) => ({
      meetings: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      cacheStatus: 'empty',

      setMeetings: (meetings) => {
        const cacheKey = getCacheKey();
        setCachedMeetings(cacheKey, meetings);
        set({ 
          meetings, 
          lastFetched: Date.now(),
          cacheStatus: 'fresh',
          error: null 
        });
      },
      
      addMeeting: (meeting) => set((state) => {
        const newMeetings = [...state.meetings, meeting];
        const cacheKey = getCacheKey();
        setCachedMeetings(cacheKey, newMeetings);
        return { meetings: newMeetings };
      }),
      
      updateMeeting: (id, updates) => set((state) => {
        const newMeetings = state.meetings.map(meeting => 
          meeting.id === id ? { ...meeting, ...updates } : meeting
        );
        const cacheKey = getCacheKey();
        setCachedMeetings(cacheKey, newMeetings);
        return { meetings: newMeetings };
      }),
      
      deleteMeeting: (id) => set((state) => {
        const newMeetings = state.meetings.filter(meeting => meeting.id !== id);
        const cacheKey = getCacheKey();
        setCachedMeetings(cacheKey, newMeetings);
        return { meetings: newMeetings };
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      fetchMeetings: async (clubId?: string, userId?: string, force = false) => {
        const state = get();
        const cacheKey = getCacheKey(clubId, userId);

        console.log('📅 MeetingStore.fetchMeetings called', { force, clubId, userId, currentCount: state.meetings.length });

        // Check cache first (only if not forced)
        if (!force) {
          const { meetings: cachedMeetings, isStale, isVeryStale } = getCachedMeetings(cacheKey);
          
          // Return fresh cache immediately
          if (cachedMeetings && !isStale) {
            console.log('✅ MeetingStore: Using fresh cache');
            set({ 
              meetings: cachedMeetings, 
              cacheStatus: 'fresh',
              error: null 
            });
            return;
          }
          
          // For stale cache: return stale data but ALWAYS fetch fresh data
          if (cachedMeetings && isStale && !isVeryStale) {
            console.log('⚠️ MeetingStore: Using stale cache, fetching fresh data...');
            set({ 
              meetings: cachedMeetings, 
              cacheStatus: 'stale',
              error: null,
              isLoading: true // Show loading indicator for fresh data
            });
            // Continue to fetch fresh data below
          } else if (!cachedMeetings || isVeryStale) {
            // No cache or very stale - show loading
            set({ isLoading: true, error: null, cacheStatus: 'empty' });
          }
        } else {
          // Force refresh - always show loading
          set({ isLoading: true, error: null });
        }

        // Prevent duplicate requests (unless forced)
        if (state.isLoading && !force && state.cacheStatus !== 'stale') return;

        try {
          const params = new URLSearchParams();
          if (clubId) params.append('clubId', clubId);
          if (userId) params.append('userId', userId);
          
          const url = `/api/meetings?${params}`;
          console.log('🌐 MeetingStore: Fetching from API:', url);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(10000) // 10 second timeout
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const result = await response.json();
          
          if (result.success) {
            console.log('✅ MeetingStore: Fresh data fetched successfully', { count: result.data.length });
            setCachedMeetings(cacheKey, result.data);
            set({ 
              meetings: result.data, 
              isLoading: false,
              lastFetched: Date.now(),
              cacheStatus: 'fresh',
              error: null
            });
          } else {
            throw new Error(result.error || 'API returned unsuccessful response');
          }
        } catch (error) {
          console.error('💥 MeetingStore: Network error:', error);
          
          const currentState = get();
          const existingMeetings = currentState.meetings;
          
          // If we have existing data (even stale), keep showing it with error message
          if (existingMeetings.length > 0) {
            set({ 
              isLoading: false,
              cacheStatus: 'stale',
              error: error instanceof Error && error.name === 'AbortError' 
                ? 'Bağlantı zaman aşımı - eski veriler gösteriliyor'
                : 'Bağlantı sorunu - eski veriler gösteriliyor'
            });
          } else {
            // No existing data - show error state
            set({ 
              error: error instanceof Error && error.name === 'AbortError'
                ? 'Bağlantı zaman aşımı - sayfayı yeniden deneyin'
                : 'Toplantılar yüklenemedi - internet bağlantınızı kontrol edin', 
              isLoading: false,
              cacheStatus: 'empty'
            });
          }
          
          // Retry mechanism for stale data scenarios
          if (existingMeetings.length > 0) {
            // Retry after 5 seconds for stale data
            setTimeout(() => {
              const retryState = get();
              if (retryState.cacheStatus === 'stale' && !retryState.isLoading) {
                console.log('🔄 MeetingStore: Auto-retry after error');
                retryState.fetchMeetings(clubId, userId, true);
              }
            }, 5000);
          }
        }
      },

      fetchMeetingById: async (id: string) => {
        const state = get();
        if (state.isLoading) return;

        // Check if meeting already exists in memory
        const existingMeeting = state.meetings.find(meeting => meeting.id === id);
        if (existingMeeting) {
          console.log('✅ MeetingStore: Meeting already in memory');
          return;
        }

        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`/api/meetings/${id}`, {
            signal: AbortSignal.timeout(10000)
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const result = await response.json();
          
          if (result.success) {
            // Add to meetings list
            set((state) => ({
              meetings: [...state.meetings, result.data],
              isLoading: false,
              error: null
            }));
            
            // Update cache
            const cacheKey = getCacheKey();
            const updatedMeetings = [...state.meetings, result.data];
            setCachedMeetings(cacheKey, updatedMeetings);
          } else {
            throw new Error(result.error || 'Meeting not found');
          }
        } catch (error) {
          console.error('💥 MeetingStore: Error fetching meeting by ID:', error);
          set({ 
            error: error instanceof Error && error.name === 'AbortError'
              ? 'Bağlantı zaman aşımı'
              : 'Toplantı bilgileri yüklenemedi', 
            isLoading: false 
          });
        }
      },

      updateMeetingResponse: async (meetingId: string, response: 'accepted' | 'declined') => {
        const state = get();
        if (state.isLoading) return;

        set({ isLoading: true, error: null });
        
        try {
          const apiResponse = await fetch(`/api/meetings/${meetingId}/response`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ response }),
            signal: AbortSignal.timeout(10000)
          });
          
          if (!apiResponse.ok) {
            throw new Error(`HTTP ${apiResponse.status}: ${apiResponse.statusText}`);
          }
          
          const result = await apiResponse.json();
          
          if (result.success) {
            // Update meeting in local state
            set((state) => ({
              meetings: state.meetings.map(meeting => 
                meeting.id === meetingId 
                  ? { ...meeting, userResponse: response }
                  : meeting
              ),
              isLoading: false,
              error: null
            }));
            
            // Update cache
            const cacheKey = getCacheKey();
            const updatedMeetings = state.meetings.map(meeting => 
              meeting.id === meetingId 
                ? { ...meeting, userResponse: response }
                : meeting
            );
            setCachedMeetings(cacheKey, updatedMeetings);
          } else {
            throw new Error(result.error || 'Failed to update response');
          }
        } catch (error) {
          console.error('💥 MeetingStore: Error updating meeting response:', error);
          set({ 
            error: error instanceof Error && error.name === 'AbortError'
              ? 'Bağlantı zaman aşımı'
              : 'Yanıt güncellenemedi', 
            isLoading: false 
          });
        }
      },

      // 🚀 PERFORMANCE: Background sync without affecting UI
      backgroundSync: async (clubId?: string, userId?: string) => {
        const state = get();
        // Don't interfere if already loading
        if (state.isLoading) return;

        try {
          console.log('🔄 MeetingStore: Background sync started');
          const params = new URLSearchParams();
          if (clubId) params.append('clubId', clubId);
          if (userId) params.append('userId', userId);
          
          const url = `/api/meetings?${params}`;
          const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(8000) // Shorter timeout for background
          });
          
          if (!response.ok) return; // Silently fail for background sync
          
          const result = await response.json();
          if (result.success) {
            const cacheKey = getCacheKey(clubId, userId);
            setCachedMeetings(cacheKey, result.data);
            
            // Only update state if data actually changed
            const currentMeetings = state.meetings;
            const hasChanges = JSON.stringify(currentMeetings) !== JSON.stringify(result.data);
            
            if (hasChanges) {
              console.log('✅ MeetingStore: Background sync updated data');
              set({ 
                meetings: result.data,
                lastFetched: Date.now(),
                cacheStatus: 'fresh',
                error: null
              });
            }
          }
        } catch (error) {
          console.warn('⚠️ MeetingStore: Background sync failed silently:', error);
          // Don't update error state for background sync failures
        }
      },

      // 🚀 PERFORMANCE: Refresh data if cache is stale
      refreshIfStale: async (clubId?: string, userId?: string) => {
        const state = get();
        const cacheKey = getCacheKey(clubId, userId);
        const { isStale } = getCachedMeetings(cacheKey);
        
        if (isStale || state.cacheStatus === 'stale') {
          console.log('🔄 MeetingStore: Refreshing stale cache');
          await state.fetchMeetings(clubId, userId, true);
        }
      },

      // 🚀 PERFORMANCE: Force cache invalidation
      invalidateCache: () => {
        memoryCache.clear();
        set({ 
          cacheStatus: 'empty',
          lastFetched: null 
        });
        console.log('🗑️ MeetingStore: Cache invalidated');
      },

      clearCache: () => {
        memoryCache.clear();
        set({ 
          meetings: [], 
          lastFetched: null,
          error: null,
          cacheStatus: 'empty'
        });
      },
    }),
    {
      name: 'meeting-storage-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        meetings: state.meetings,
        lastFetched: state.lastFetched,
        cacheStatus: state.cacheStatus
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const age = state.lastFetched ? Date.now() - state.lastFetched : Infinity;
          const isStale = age > STALE_THRESHOLD;
          const isVeryStale = age > CACHE_TTL;
          
          if (isVeryStale) {
            state.cacheStatus = 'empty';
            state.meetings = [];
          } else if (isStale) {
            state.cacheStatus = 'stale';
          } else {
            state.cacheStatus = 'fresh';
          }
          
          console.log('📅 MeetingStore: Rehydrated from localStorage', {
            meetingsCount: state.meetings.length,
            cacheStatus: state.cacheStatus,
            age: Math.round(age / 1000) + 's'
          });
        }
      }
    }
  )
);