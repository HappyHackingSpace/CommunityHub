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

        // Check cache first
        if (!force) {
          const { tasks: cachedTasks, isStale, isVeryStale } = getCachedTasks(cacheKey);
          
          if (cachedTasks && !isStale) {
            console.log('✅ TaskStore: Using fresh cache');
            set({ 
              tasks: cachedTasks, 
              cacheStatus: 'fresh',
              error: null 
            });
            return;
          }
          
          if (cachedTasks && isStale && !isVeryStale) {
            console.log('⚠️ TaskStore: Using stale cache');
            set({ 
              tasks: cachedTasks, 
              cacheStatus: 'stale',
              error: null 
            });
            // Continue to fetch fresh data
          }
        }

        if (state.isLoading && !force) return;

        set({ isLoading: true, error: null });
        
        try {
          const url = clubId ? `/api/tasks?clubId=${clubId}` : '/api/tasks';
          const response = await fetch(url);
          const result = await response.json();
          
          if (result.success) {
            setCachedTasks(cacheKey, result.data);
            set({ 
              tasks: result.data, 
              isLoading: false,
              lastFetched: Date.now(),
              cacheStatus: 'fresh',
              error: null
            });
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          console.error('💥 TaskStore: Network error:', error);
          
          const existingTasks = state.tasks;
          if (existingTasks.length > 0) {
            set({ 
              isLoading: false,
              cacheStatus: 'stale',
              error: 'Bağlantı sorunu - eski veriler gösteriliyor'
            });
          } else {
            set({ 
              error: 'Görevler yüklenemedi - internet bağlantınızı kontrol edin', 
              isLoading: false,
              cacheStatus: 'empty'
            });
          }
        }
      },

      fetchTasksByUser: async (userId: string, force = false) => {
        const state = get();
        const cacheKey = getCacheKey(undefined, userId);

        // Check cache first
        if (!force) {
          const { tasks: cachedTasks, isStale, isVeryStale } = getCachedTasks(cacheKey);
          
          if (cachedTasks && !isStale) {
            set({ 
              tasks: cachedTasks, 
              cacheStatus: 'fresh',
              error: null 
            });
            return;
          }
          
          if (cachedTasks && isStale && !isVeryStale) {
            set({ 
              tasks: cachedTasks, 
              cacheStatus: 'stale',
              error: null 
            });
          }
        }

        if (state.isLoading && !force) return;

        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`/api/tasks?userId=${userId}`);
          const result = await response.json();
          
          if (result.success) {
            setCachedTasks(cacheKey, result.data);
            set({ 
              tasks: result.data, 
              isLoading: false,
              lastFetched: Date.now(),
              cacheStatus: 'fresh',
              error: null
            });
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          console.error('💥 TaskStore: Network error:', error);
          
          const existingTasks = state.tasks;
          if (existingTasks.length > 0) {
            set({ 
              isLoading: false,
              cacheStatus: 'stale',
              error: 'Bağlantı sorunu - eski veriler gösteriliyor'
            });
          } else {
            set({ 
              error: 'Görevler yüklenemedi - internet bağlantınızı kontrol edin', 
              isLoading: false,
              cacheStatus: 'empty'
            });
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