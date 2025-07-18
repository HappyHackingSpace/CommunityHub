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

        // Check cache first
        if (!force) {
          const { meetings: cachedMeetings, isStale, isVeryStale } = getCachedMeetings(cacheKey);
          
          if (cachedMeetings && !isStale) {
            console.log('✅ MeetingStore: Using fresh cache');
            set({ 
              meetings: cachedMeetings, 
              cacheStatus: 'fresh',
              error: null 
            });
            return;
          }
          
          if (cachedMeetings && isStale && !isVeryStale) {
            console.log('⚠️ MeetingStore: Using stale cache');
            set({ 
              meetings: cachedMeetings, 
              cacheStatus: 'stale',
              error: null 
            });
            // Continue to fetch fresh data
          }
        }

        if (state.isLoading && !force) return;

        set({ isLoading: true, error: null });
        
        try {
          const params = new URLSearchParams();
          if (clubId) params.append('clubId', clubId);
          if (userId) params.append('userId', userId);
          
          const response = await fetch(`/api/meetings?${params}`);
          const result = await response.json();
          
          if (result.success) {
            setCachedMeetings(cacheKey, result.data);
            set({ 
              meetings: result.data, 
              isLoading: false,
              lastFetched: Date.now(),
              cacheStatus: 'fresh',
              error: null
            });
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          console.error('💥 MeetingStore: Network error:', error);
          
          const existingMeetings = state.meetings;
          if (existingMeetings.length > 0) {
            set({ 
              isLoading: false,
              cacheStatus: 'stale',
              error: 'Bağlantı sorunu - eski veriler gösteriliyor'
            });
          } else {
            set({ 
              error: 'Toplantılar yüklenemedi - internet bağlantınızı kontrol edin', 
              isLoading: false,
              cacheStatus: 'empty'
            });
          }
        }
      },

      fetchMeetingById: async (id: string) => {
        const state = get();
        if (state.isLoading) return;

        // Check if meeting already exists in memory
        const existingMeeting = state.meetings.find(meeting => meeting.id === id);
        if (existingMeeting) {
          console.log('✅ MeetingStore: Using existing meeting from memory');
          return;
        }

        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`/api/meetings/${id}`);
          const result = await response.json();
          
          if (result.success) {
            set((state) => ({
              meetings: state.meetings.map(m => 
                m.id === id ? result.data : m
              ),
              isLoading: false
            }));
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          set({ error: 'Toplantı bilgileri yüklenemedi', isLoading: false });
        }
      },

      updateMeetingResponse: async (meetingId: string, response: 'accepted' | 'declined') => {
        try {
          const res = await fetch(`/api/meetings/${meetingId}/response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response })
          });
          
          const result = await res.json();
          
          if (result.success) {
            set((state) => ({
              meetings: state.meetings.map(meeting => {
                if (meeting.id === meetingId) {
                  return {
                    ...meeting,
                    participants: meeting.participants?.map(p =>
                      p.userId === result.userId ? { ...p, response } : p
                    ) || []
                  };
                }
                return meeting;
              })
            }));
          } else {
            set({ error: result.error });
          }
        } catch (error) {
          set({ error: 'Yanıt güncellenemedi' });
        }
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