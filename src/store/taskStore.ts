import { create } from 'zustand';
import { Task } from '@/types';

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchTasks: (clubId?: string) => Promise<void>;
  fetchTasksByUser: (userId: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    )
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(task => task.id !== id)
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchTasks: async (clubId?: string) => {
    set({ isLoading: true });
    try {
      const url = clubId ? `/api/tasks?clubId=${clubId}` : '/api/tasks';
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        set({ tasks: result.data, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Görevler yüklenemedi', isLoading: false });
    }
  },

  fetchTasksByUser: async (userId: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/tasks?userId=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        set({ tasks: result.data, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Görevler yüklenemedi', isLoading: false });
    }
  },
}));