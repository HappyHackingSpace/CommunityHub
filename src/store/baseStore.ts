// src/store/base.ts - UNIFIED ZUSTAND STORE PATTERN
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { appCache, startMeasure } from '@/lib/cache';

// 🚀 Base interface for all stores
export interface BaseStoreState<T> {
  data: T[];
  currentItem: T | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  cacheStatus: 'fresh' | 'stale' | 'empty';
}

export interface BaseStoreActions<T> {
  setData: (data: T[]) => void;
  setCurrentItem: (item: T | null) => void;
  addItem: (item: T) => void;
  updateItem: (id: string, updates: Partial<T>) => void;
  deleteItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCache: () => void;
}

// 🚀 Create base store with common functionality
export function createBaseStore<T extends { id: string }>(
  name: string,
  cacheTTL = 5 * 60 * 1000,
  cacheMethod?: (data: T[]) => void
) {
  return (set: any, get: any) => ({
    // State
    data: [] as T[],
    currentItem: null as T | null,
    isLoading: false,
    error: null as string | null,
    lastFetched: null as number | null,
    cacheStatus: 'empty' as 'fresh' | 'stale' | 'empty',

    // Base actions
    setData: (data: T[]) => {
      const endMeasure = startMeasure(`${name}.setData`);
      
      if (cacheMethod) {
        cacheMethod(data);
      }  
      set({ 
         data, 
         lastFetched: Date.now(),
         cacheStatus: 'fresh',
         error: null
       });
       
       endMeasure();
     },

    setCurrentItem: (item: T | null) => set({ currentItem: item }),

    addItem: (item: T) => set((state: any) => {
      const newData = [...state.data, item];
      return { data: newData };
    }),

    updateItem: (id: string, updates: Partial<T>) => set((state: any) => ({
      data: state.data.map((item: T) => 
        item.id === id ? { ...item, ...updates } : item
      ),
      currentItem: state.currentItem?.id === id 
        ? { ...state.currentItem, ...updates }
        : state.currentItem
    })),

    deleteItem: (id: string) => set((state: any) => ({
      data: state.data.filter((item: T) => item.id !== id),
      currentItem: state.currentItem?.id === id ? null : state.currentItem
    })),

    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setError: (error: string | null) => set({ error }),

    clearCache: () => set({ 
      data: [], 
      currentItem: null,
      lastFetched: null,
      error: null,
      cacheStatus: 'empty'
    }),
  });
}

// 🚀 Enhanced club store with unified pattern
export interface Club {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  leaderName: string;
  memberIds: string[];
  memberCount: number;
  type: 'education' | 'social' | 'project';
  createdAt: string;
  isActive: boolean;
}

export interface ClubStore extends BaseStoreState<Club>, BaseStoreActions<Club> {
  // Club-specific actions
  fetchClubs: (force?: boolean) => Promise<void>;
  fetchClubById: (id: string) => Promise<void>;
  backgroundSync: () => Promise<void>;
  invalidateCache: () => void;
  joinClub: (clubId: string, userId: string) => Promise<void>;
  leaveClub: (clubId: string, userId: string) => Promise<void>;
  
  // Computed properties
  getUserClubs: (userId: string) => Club[];
  getClubsByType: (type: string) => Club[];
}

export const useClubStore = create<ClubStore>()(
  persist(
    (set, get) => ({
      ...createBaseStore<Club>('club', 5 * 60 * 1000, (data) => appCache.setClubs(data))(set, get),

      fetchClubs: async (force = false) => {
        const state = get();
        const endMeasure = startMeasure('club.fetchClubs');

        console.log('🏢 ClubStore: fetchClubs called', { force, current: state.data.length });

        if (!force) {
          const cached = appCache.getClubs();
          if (cached.data && !cached.isStale) {
            console.log('✅ ClubStore: Using fresh cache');
            set({ 
              data: cached.data, 
              cacheStatus: 'fresh',
              error: null 
            });
            endMeasure();
            return;
          }
          
          if (cached.data && cached.isStale) {
            console.log('⚠️ ClubStore: Using stale cache, will background sync');
            set({ 
              data: cached.data, 
              cacheStatus: 'stale',
              error: null 
            });
          }
        }

        if (state.isLoading && !force) {
          console.log('⏳ ClubStore: Already loading, skipping');
          endMeasure();
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/clubs');
          const result = await response.json();
          
          if (result.success) {
        
            get().setData(result.data);
            console.log('✅ ClubStore: Fetched', result.data.length, 'clubs');
          } else {
            set({ error: result.error, isLoading: false, cacheStatus: 'empty' });
          }
        } catch (error) {
          console.error('❌ ClubStore: Fetch error:', error);
          set({ 
            error: 'Kulüpler yüklenemedi', 
            isLoading: false,
            cacheStatus: state.data.length > 0 ? 'stale' : 'empty'
          });
        }

        endMeasure();
      },

      fetchClubById: async (id: string) => {
        const state = get();
        if (state.isLoading) return;

        // Check if already in memory
        const existingClub = state.data.find(club => club.id === id);
        if (existingClub) {
          console.log('✅ ClubStore: Using existing club from memory');
          set({ currentItem: existingClub });
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`/api/clubs/${id}`);
          const result = await response.json();
          
          if (result.success) {
            set({ currentItem: result.data, isLoading: false });
            
            // Add to clubs list if not exists
            if (!state.data.find(club => club.id === id)) {
              get().addItem(result.data);
            }
          } else {
            set({ error: result.error, isLoading: false });
          }
        } catch (error) {
          set({ error: 'Kulüp bilgileri yüklenemedi', isLoading: false });
        }
      },

      backgroundSync: async () => {
        const state = get();
        if (state.isLoading) return;

        console.log('🔄 ClubStore: Background sync started');
        
        try {
          const response = await fetch('/api/clubs');
          const result = await response.json();
          
          if (result.success) {
            // Check if data actually changed
            const currentIds = state.data.map(c => c.id).sort();
            const newIds = result.data.map((c: Club) => c.id).sort();
            
            if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
              console.log('🔄 ClubStore: Background sync found changes');
              get().setData(result.data);
            } else {
              console.log('✅ ClubStore: Background sync - no changes');
              set({ cacheStatus: 'fresh' });
            }
          }
        } catch (error) {
          console.error('⚠️ ClubStore: Background sync failed:', error);
          // Don't update error state for background sync failures
        }
      },

      invalidateCache: () => {
        appCache.clearAll();
        set({ cacheStatus: 'empty' });
      },

      joinClub: async (clubId: string, userId: string) => {
        try {
          const response = await fetch('/api/clubs/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clubId, userId }),
          });

          if (response.ok) {
            // Update local state optimistically
            get().updateItem(clubId, {
              memberIds: [...(get().data.find(c => c.id === clubId)?.memberIds || []), userId],
              memberCount: (get().data.find(c => c.id === clubId)?.memberCount || 0) + 1
            });
          }
        } catch (error) {
          console.error('Join club error:', error);
        }
      },

      leaveClub: async (clubId: string, userId: string) => {
        try {
          const response = await fetch('/api/clubs/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clubId, userId }),
          });

          if (response.ok) {
            // Update local state optimistically
            const club = get().data.find(c => c.id === clubId);
            if (club) {
              get().updateItem(clubId, {
                memberIds: club.memberIds.filter(id => id !== userId),
                memberCount: Math.max(0, club.memberCount - 1)
              });
            }
          }
        } catch (error) {
          console.error('Leave club error:', error);
        }
      },

      // Computed properties
      getUserClubs: (userId: string) => {
        return get().data.filter(club => 
          club.memberIds.includes(userId) || club.leaderId === userId
        );
      },

      getClubsByType: (type: string) => {
        return get().data.filter(club => club.type === type);
      },
    }),
    {
      name: 'club-storage-v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        data: state.data,
        lastFetched: state.lastFetched,
        cacheStatus: state.cacheStatus
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check if persisted data is stale
          const isStale = state.lastFetched && 
            (Date.now() - state.lastFetched > 5 * 60 * 1000);
          
          if (isStale) {
            state.cacheStatus = 'stale';
          }
          
          console.log('🏢 ClubStore: Rehydrated', {
            clubsCount: state.data.length,
            cacheStatus: state.cacheStatus
          });
        }
      }
    }
  )
);

// 🚀 Background sync management
let backgroundSyncInterval: NodeJS.Timeout | null = null;

export const startClubBackgroundSync = () => {
  if (backgroundSyncInterval) return;
  
  backgroundSyncInterval = setInterval(() => {
    const store = useClubStore.getState();
    if (!store.isLoading && store.data.length > 0) {
      store.backgroundSync();
    }
  }, 2 * 60 * 1000); // Every 2 minutes
  
  console.log('🔄 ClubStore: Background sync started');
};

export const stopClubBackgroundSync = () => {
  if (backgroundSyncInterval) {
    clearInterval(backgroundSyncInterval);
    backgroundSyncInterval = null;
    console.log('⏹️ ClubStore: Background sync stopped');
  }
};

// 🚀 Task Store with unified pattern
export interface Task {
  id: string;
  title: string;
  description: string;
  clubId: string;
  assignedBy: string;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'rejected';
  files: any[];
  feedback?: string;
  completedAt?: string;
  createdAt: string;
}

export interface TaskStore extends BaseStoreState<Task>, BaseStoreActions<Task> {
  fetchTasks: (clubId?: string) => Promise<void>;
  fetchTasksByUser: (userId: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<void>;
  getUserTasks: (userId: string) => Task[];
  backgroundSync: () => Promise<void>;
  getTasksByClub: (clubId: string) => Task[];
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      ...createBaseStore<Task>('task', 2 * 60 * 1000)(set, get),

      fetchTasks: async (clubId?: string) => {
        const state = get();
        if (state.isLoading) return;

        set({ isLoading: true });
        try {
          const url = clubId ? `/api/tasks?clubId=${clubId}` : '/api/tasks';
          const response = await fetch(url);
          const result = await response.json();
          
          if (result.success) {
            get().setData(result.data);
          } else {
            set({ error: result.error, isLoading: false });
          }
        } catch (error) {
          set({ error: 'Görevler yüklenemedi', isLoading: false });
        }
      },

      fetchTasksByUser: async (userId: string) => {
        const state = get();
        if (state.isLoading) return;

        set({ isLoading: true });
        try {
          const response = await fetch(`/api/tasks?userId=${userId}`);
          const result = await response.json();
          
          if (result.success) {
            get().setData(result.data);
          } else {
            set({ error: result.error, isLoading: false });
          }
        } catch (error) {
          set({ error: 'Görevler yüklenemedi', isLoading: false });
        }
      },

      createTask: async (taskData) => {
        try {
          const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
          });

          const result = await response.json();
          
          if (result.success) {
            get().addItem(result.data);
          } else {
            set({ error: result.error });
          }
        } catch (error) {
          set({ error: 'Görev oluşturulamadı' });
        }
      },

      updateTaskStatus: async (id: string, status: Task['status']) => {
        try {
          const response = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          });

          if (response.ok) {
            get().updateItem(id, { status });
          }
        } catch (error) {
          console.error('Task status update error:', error);
        }
      },

      getUserTasks: (userId: string) => {
        return get().data.filter(task => 
          task.assignedTo === userId || task.assignedBy === userId
        );
      },

      getTasksByClub: (clubId: string) => {
        return get().data.filter(task => task.clubId === clubId);
      },

      backgroundSync: async () => {
        const state = get();
        if (state.isLoading) return;

        try {
          const response = await fetch('/api/tasks');
          const result = await response.json();

          if (result.success) {
            // Check if data actually changed
            const currentIds = state.data.map(t => t.id).sort();
            const newIds = result.data.map((t: Task) => t.id).sort();

            if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
              get().setData(result.data);
            }
          }
        } catch (error) {
          console.error('⚠️ TaskStore: Background sync failed:', error);
        }
      },
    }),
    {
      name: 'task-storage-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        data: state.data,
        lastFetched: state.lastFetched 
      }),
    }
  )
);