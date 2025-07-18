import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Task } from '@/types';

interface TaskCache {
  data: Task[];
  timestamp: number;
  ttl: number;
}

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  cacheStatus: 'fresh' | 'stale' | 'empty';
  retryCount: number;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchTasks: (clubId?: string, force?: boolean) => Promise<void>;
  fetchTasksByUser: (userId: string, force?: boolean) => Promise<void>;
  clearCache: () => void;
  backgroundSync: (clubId?: string, userId?: string) => Promise<void>;
  refreshIfStale: (clubId?: string, userId?: string) => Promise<void>;
  invalidateCache: () => void;
}

// Cache configuration
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const memoryCache = new Map<string, TaskCache>();

// Cache utilities
const getCacheKey = (clubId?: string, userId?: string) => 
  `tasks_${clubId || 'all'}_${userId || 'all'}`;

const getCachedTasks = (cacheKey: string): { tasks: Task[] | null; isStale: boolean; isVeryStale: boolean } => {
  const cached = memoryCache.get(cacheKey);
  if (!cached) return { tasks: null, isStale: false, isVeryStale: false };
  
  const age = Date.now() - cached.timestamp;
  const isStale = age > STALE_THRESHOLD;
  const isVeryStale = age > CACHE_TTL;
  
  return { tasks: cached.data, isStale, isVeryStale };
};

const setCachedTasks = (cacheKey: string, tasks: Task[]) => {
  memoryCache.set(cacheKey, {
    data: tasks,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  });
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      cacheStatus: 'empty',
      retryCount: 0,

      setTasks: (tasks) => {
        const cacheKey = getCacheKey();
        setCachedTasks(cacheKey, tasks);
        set({ 
          tasks, 
          lastFetched: Date.now(),
          cacheStatus: 'fresh',
          error: null 
        });
      },
      
      addTask: (task) => set((state) => {
        const newTasks = [...state.tasks, task];
        const cacheKey = getCacheKey();
        setCachedTasks(cacheKey, newTasks);
        return { tasks: newTasks };
      }),
      
      updateTask: (id, updates) => set((state) => {
        const newTasks = state.tasks.map(task => 
          task.id === id ? { ...task, ...updates } : task
        );
        const cacheKey = getCacheKey();
        setCachedTasks(cacheKey, newTasks);
        return { tasks: newTasks };
      }),
      
      deleteTask: (id) => set((state) => {
        const newTasks = state.tasks.filter(task => task.id !== id);
        const cacheKey = getCacheKey();
        setCachedTasks(cacheKey, newTasks);
        return { tasks: newTasks };
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      fetchTasks: async (clubId?: string, force = false) => {
        const state = get();
        const cacheKey = getCacheKey(clubId);

        console.log('📋 TaskStore.fetchTasks called', { force, clubId, currentCount: state.tasks.length });

        // Check cache first (only if not forced)
        if (!force) {
          const { tasks: cachedTasks, isStale, isVeryStale } = getCachedTasks(cacheKey);
          
          // Return fresh cache immediately
          if (cachedTasks && !isStale) {
            console.log('✅ TaskStore: Using fresh cache');
            set({ 
              tasks: cachedTasks, 
              cacheStatus: 'fresh',
              error: null 
            });
            return;
          }
          
          // For stale cache: return stale data but ALWAYS fetch fresh data
          if (cachedTasks && isStale && !isVeryStale) {
            console.log('⚠️ TaskStore: Using stale cache, fetching fresh data...');
            set({ 
              tasks: cachedTasks, 
              cacheStatus: 'stale',
              error: null,
              isLoading: true // Show loading indicator for fresh data
            });
            // Continue to fetch fresh data below
          } else if (!cachedTasks || isVeryStale) {
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
          const url = clubId ? `/api/tasks?clubId=${clubId}` : '/api/tasks';
          console.log('🌐 TaskStore: Fetching from API:', url);
          
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
            console.log('✅ TaskStore: Fresh data fetched successfully', { count: result.data.length });
            setCachedTasks(cacheKey, result.data);
            set({ 
              tasks: result.data, 
              isLoading: false,
              lastFetched: Date.now(),
              cacheStatus: 'fresh',
              error: null
            });
          } else {
            throw new Error(result.error || 'API returned unsuccessful response');
          }
        } catch (error) {
          console.error('💥 TaskStore: Network error:', error);
          
          const currentState = get();
          const existingTasks = currentState.tasks;
          
          // If we have existing data (even stale), keep showing it with error message
          if (existingTasks.length > 0) {
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
                : 'Görevler yüklenemedi - internet bağlantınızı kontrol edin', 
              isLoading: false,
              cacheStatus: 'empty'
            });
          }
          
          // Retry mechanism for stale data scenarios
          if (existingTasks.length > 0) {
            // Retry after 5 seconds for stale data
            setTimeout(() => {
          
              const retryState = get();
             if (retryState.cacheStatus === 'stale' && !retryState.isLoading && retryState.retryCount < 3) {
               set({ retryCount: retryState.retryCount + 1 });
                console.log('🔄 TaskStore: Auto-retry after error');
                retryState.fetchTasks(clubId, true);
              }
            }, 5000);
          }
        }
      },

      fetchTasksByUser: async (userId: string, force = false) => {
        const state = get();
        const cacheKey = getCacheKey(undefined, userId);

        console.log('📋 TaskStore.fetchTasksByUser called', { force, userId });

        // Check cache first (only if not forced)
        if (!force) {
          const { tasks: cachedTasks, isStale, isVeryStale } = getCachedTasks(cacheKey);
          
          // Return fresh cache immediately
          if (cachedTasks && !isStale) {
            console.log('✅ TaskStore: Using fresh user cache');
            set({ 
              tasks: cachedTasks, 
              cacheStatus: 'fresh',
              error: null 
            });
            return;
          }
          
          // For stale cache: return stale data but ALWAYS fetch fresh data
          if (cachedTasks && isStale && !isVeryStale) {
            console.log('⚠️ TaskStore: Using stale user cache, fetching fresh data...');
            set({ 
              tasks: cachedTasks, 
              cacheStatus: 'stale',
              error: null,
              isLoading: true // Show loading indicator for fresh data
            });
            // Continue to fetch fresh data below
          } else if (!cachedTasks || isVeryStale) {
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
          const url = `/api/tasks?userId=${userId}`;
          console.log('🌐 TaskStore: Fetching user tasks from API:', url);
          
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
            console.log('✅ TaskStore: Fresh user data fetched successfully', { count: result.data.length });
            setCachedTasks(cacheKey, result.data);
            set({ 
              tasks: result.data, 
              isLoading: false,
              lastFetched: Date.now(),
              cacheStatus: 'fresh',
              error: null
            });
          } else {
            throw new Error(result.error || 'API returned unsuccessful response');
          }
        } catch (error) {
          console.error('💥 TaskStore: Network error in fetchTasksByUser:', error);
          
          const currentState = get();
          const existingTasks = currentState.tasks;
          
          // If we have existing data (even stale), keep showing it with error message
          if (existingTasks.length > 0) {
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
                : 'Görevler yüklenemedi - internet bağlantınızı kontrol edin', 
              isLoading: false,
              cacheStatus: 'empty'
            });
          }
          
          // Retry mechanism for stale data scenarios
          if (existingTasks.length > 0) {
            // Retry after 5 seconds for stale data
            setTimeout(() => {
              const retryState = get();
              if (retryState.cacheStatus === 'stale' && !retryState.isLoading) {
                console.log('🔄 TaskStore: Auto-retry user tasks after error');
                retryState.fetchTasksByUser(userId, true);
              }
            }, 5000);
          }
        }
      },

      clearCache: () => {
        memoryCache.clear();
        set({ 
          tasks: [], 
          lastFetched: null,
          error: null,
          cacheStatus: 'empty'
        });
      },

      // 🚀 PERFORMANCE: Background sync without affecting UI
      backgroundSync: async (clubId?: string, userId?: string) => {
        const state = get();
        // Don't interfere if already loading
        if (state.isLoading) return;

        try {
          console.log('🔄 TaskStore: Background sync started');
          const url = clubId 
            ? `/api/tasks?clubId=${clubId}` 
            : userId 
            ? `/api/tasks?userId=${userId}`
            : '/api/tasks';
            
          const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(8000) // Shorter timeout for background
          });
          
          if (!response.ok) return; // Silently fail for background sync
          
          const result = await response.json();
          if (result.success) {
            const cacheKey = getCacheKey(clubId, userId);
            setCachedTasks(cacheKey, result.data);
            
            // Only update state if data actually changed
            const currentTasks = state.tasks;
            const hasChanges = JSON.stringify(currentTasks) !== JSON.stringify(result.data);
            
            if (hasChanges) {
              console.log('✅ TaskStore: Background sync updated data');
              set({ 
                tasks: result.data,
                lastFetched: Date.now(),
                cacheStatus: 'fresh',
                error: null
              });
            }
          }
        } catch (error) {
          console.warn('⚠️ TaskStore: Background sync failed silently:', error);
          // Don't update error state for background sync failures
        }
      },

      // 🚀 PERFORMANCE: Refresh data if cache is stale
      refreshIfStale: async (clubId?: string, userId?: string) => {
        const state = get();
        const cacheKey = getCacheKey(clubId, userId);
        const { isStale } = getCachedTasks(cacheKey);
        
        if (isStale || state.cacheStatus === 'stale') {
          console.log('🔄 TaskStore: Refreshing stale cache');
          if (userId) {
            await state.fetchTasksByUser(userId, true);
          } else {
            await state.fetchTasks(clubId, true);
          }
        }
      },

      // 🚀 PERFORMANCE: Force cache invalidation
      invalidateCache: () => {
        memoryCache.clear();
        set({ 
          cacheStatus: 'empty',
          lastFetched: null 
        });
        console.log('🗑️ TaskStore: Cache invalidated');
      },
    }),
    {
      name: 'task-storage-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        tasks: state.tasks,
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
            state.tasks = [];
          } else if (isStale) {
            state.cacheStatus = 'stale';
          } else {
            state.cacheStatus = 'fresh';
          }
          
          console.log('📋 TaskStore: Rehydrated from localStorage', {
            tasksCount: state.tasks.length,
            cacheStatus: state.cacheStatus,
            age: Math.round(age / 1000) + 's'
          });
        }
      }
    }
  )
);