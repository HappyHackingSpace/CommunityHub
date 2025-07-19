// src/store/unified-store.ts - Ultra Simple State Management (Fixed)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 📊 Pagination interface
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 🗃️ Generic list state
interface ListState<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  pagination: Pagination | null;
  lastFetched: number | null;
}

// 🏪 Unified Store Interface
interface UnifiedStore {
  // Generic list states
  clubs: ListState<any>;
  files: ListState<any>;
  meetings: ListState<any>;
  tasks: ListState<any>;
  notifications: ListState<any>;
  users: ListState<any>;

  // Selected items
  selectedClub: any;
  selectedFile: any;
  selectedMeeting: any;
  selectedTask: any;

  // Generic actions
  setListData: <T>(
    listName: keyof Pick<UnifiedStore, 'clubs' | 'files' | 'meetings' | 'tasks' | 'notifications' | 'users'>,
    data: T[],
    pagination?: Pagination
  ) => void;
  
  setListLoading: (
    listName: keyof Pick<UnifiedStore, 'clubs' | 'files' | 'meetings' | 'tasks' | 'notifications' | 'users'>,
    loading: boolean
  ) => void;
  
  setListError: (
    listName: keyof Pick<UnifiedStore, 'clubs' | 'files' | 'meetings' | 'tasks' | 'notifications' | 'users'>,
    error: string | null
  ) => void;

  addItem: <T>(
    listName: keyof Pick<UnifiedStore, 'clubs' | 'files' | 'meetings' | 'tasks' | 'notifications' | 'users'>,
    item: T
  ) => void;

  updateItem: <T>(
    listName: keyof Pick<UnifiedStore, 'clubs' | 'files' | 'meetings' | 'tasks' | 'notifications' | 'users'>,
    id: string,
    updates: Partial<T>
  ) => void;

  deleteItem: (
    listName: keyof Pick<UnifiedStore, 'clubs' | 'files' | 'meetings' | 'tasks' | 'notifications' | 'users'>,
    id: string
  ) => void;

  // Selection actions
  setSelected: (type: 'club' | 'file' | 'meeting' | 'task', item: any) => void;
  clearSelected: (type: 'club' | 'file' | 'meeting' | 'task') => void;

  // Clear all
  clearAll: () => void;
}

// 🚀 Default list state
const createDefaultListState = <T>(): ListState<T> => ({
  items: [],
  isLoading: false,
  error: null,
  pagination: null,
  lastFetched: null,
});

// 🏪 Create the unified store
export const useUnifiedStore = create<UnifiedStore>()(
  persist(
    (set: any, get: any) => ({
      // Initialize list states
      clubs: createDefaultListState(),
      files: createDefaultListState(),
      meetings: createDefaultListState(),
      tasks: createDefaultListState(),
      notifications: createDefaultListState(),
      users: createDefaultListState(),

      // Initialize selected items
      selectedClub: null,
      selectedFile: null,
      selectedMeeting: null,
      selectedTask: null,

      // Generic list data setter
      setListData: (listName: any, data: any, pagination: any) =>
        set((state: any) => ({
          [listName]: {
            ...state[listName],
            items: data,
            pagination,
            lastFetched: Date.now(),
            isLoading: false,
            error: null,
          },
        })),

      // Generic loading setter
      setListLoading: (listName: any, loading: any) =>
        set((state: any) => ({
          [listName]: {
            ...state[listName],
            isLoading: loading,
          },
        })),

      // Generic error setter
      setListError: (listName: any, error: any) =>
        set((state: any) => ({
          [listName]: {
            ...state[listName],
            error,
            isLoading: false,
          },
        })),

      // Add item to list
      addItem: (listName: any, item: any) =>
        set((state: any) => ({
          [listName]: {
            ...state[listName],
            items: [item, ...state[listName].items],
          },
        })),

      // Update item in list
      updateItem: (listName: any, id: any, updates: any) =>
        set((state: any) => ({
          [listName]: {
            ...state[listName],
            items: state[listName].items.map((item: any) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          },
        })),

      // Delete item from list
      deleteItem: (listName: any, id: any) =>
        set((state: any) => ({
          [listName]: {
            ...state[listName],
            items: state[listName].items.filter((item: any) => item.id !== id),
          },
        })),

      // Set selected item
      setSelected: (type: any, item: any) =>
        set(() => ({
          [`selected${type.charAt(0).toUpperCase() + type.slice(1)}`]: item,
        })),

      // Clear selected item
      clearSelected: (type: any) =>
        set(() => ({
          [`selected${type.charAt(0).toUpperCase() + type.slice(1)}`]: null,
        })),

      // Clear all data
      clearAll: () =>
        set((state: any) => ({
          clubs: createDefaultListState(),
          files: createDefaultListState(),
          meetings: createDefaultListState(),
          tasks: createDefaultListState(),
          notifications: createDefaultListState(),
          users: createDefaultListState(),
          selectedClub: null,
          selectedFile: null,
          selectedMeeting: null,
          selectedTask: null,
        })),
    }),
    {
      name: 'unified-store',
      partialize: (state) => ({
        // Only persist selected items, not the full lists
        selectedClub: state.selectedClub,
        selectedFile: state.selectedFile,
        selectedMeeting: state.selectedMeeting,
        selectedTask: state.selectedTask,
      }),
    }
  )
);

// 🔗 Custom hooks for specific data types
export const useClubs = () => {
  const store = useUnifiedStore();
  return {
    clubs: store.clubs.items,
    isLoading: store.clubs.isLoading,
    error: store.clubs.error,
    pagination: store.clubs.pagination,
    selectedClub: store.selectedClub,
    setClubs: (data: any[], pagination?: Pagination) => store.setListData('clubs', data, pagination),
    setLoading: (loading: boolean) => store.setListLoading('clubs', loading),
    setError: (error: string | null) => store.setListError('clubs', error),
    addClub: (club: any) => store.addItem('clubs', club),
    updateClub: (id: string, updates: any) => store.updateItem('clubs', id, updates),
    deleteClub: (id: string) => store.deleteItem('clubs', id),
    selectClub: (club: any) => store.setSelected('club', club),
    clearSelection: () => store.clearSelected('club'),
  };
};

export const useFiles = () => {
  const store = useUnifiedStore();
  return {
    files: store.files.items,
    isLoading: store.files.isLoading,
    error: store.files.error,
    pagination: store.files.pagination,
    selectedFile: store.selectedFile,
    setFiles: (data: any[], pagination?: Pagination) => store.setListData('files', data, pagination),
    setLoading: (loading: boolean) => store.setListLoading('files', loading),
    setError: (error: string | null) => store.setListError('files', error),
    addFile: (file: any) => store.addItem('files', file),
    updateFile: (id: string, updates: any) => store.updateItem('files', id, updates),
    deleteFile: (id: string) => store.deleteItem('files', id),
    selectFile: (file: any) => store.setSelected('file', file),
    clearSelection: () => store.clearSelected('file'),
  };
};

export const useMeetings = () => {
  const store = useUnifiedStore();
  return {
    meetings: store.meetings.items,
    isLoading: store.meetings.isLoading,
    error: store.meetings.error,
    pagination: store.meetings.pagination,
    selectedMeeting: store.selectedMeeting,
    setMeetings: (data: any[], pagination?: Pagination) => store.setListData('meetings', data, pagination),
    setLoading: (loading: boolean) => store.setListLoading('meetings', loading),
    setError: (error: string | null) => store.setListError('meetings', error),
    addMeeting: (meeting: any) => store.addItem('meetings', meeting),
    updateMeeting: (id: string, updates: any) => store.updateItem('meetings', id, updates),
    deleteMeeting: (id: string) => store.deleteItem('meetings', id),
    selectMeeting: (meeting: any) => store.setSelected('meeting', meeting),
    clearSelection: () => store.clearSelected('meeting'),
  };
};

export const useTasks = () => {
  const store = useUnifiedStore();
  return {
    tasks: store.tasks.items,
    isLoading: store.tasks.isLoading,
    error: store.tasks.error,
    pagination: store.tasks.pagination,
    selectedTask: store.selectedTask,
    setTasks: (data: any[], pagination?: Pagination) => store.setListData('tasks', data, pagination),
    setLoading: (loading: boolean) => store.setListLoading('tasks', loading),
    setError: (error: string | null) => store.setListError('tasks', error),
    addTask: (task: any) => store.addItem('tasks', task),
    updateTask: (id: string, updates: any) => store.updateItem('tasks', id, updates),
    deleteTask: (id: string) => store.deleteItem('tasks', id),
    selectTask: (task: any) => store.setSelected('task', task),
    clearSelection: () => store.clearSelected('task'),
  };
};

export const useNotifications = () => {
  const store = useUnifiedStore();
  return {
    notifications: store.notifications.items,
    isLoading: store.notifications.isLoading,
    error: store.notifications.error,
    pagination: store.notifications.pagination,
    setNotifications: (data: any[], pagination?: Pagination) => store.setListData('notifications', data, pagination),
    setLoading: (loading: boolean) => store.setListLoading('notifications', loading),
    setError: (error: string | null) => store.setListError('notifications', error),
    addNotification: (notification: any) => store.addItem('notifications', notification),
    updateNotification: (id: string, updates: any) => store.updateItem('notifications', id, updates),
    deleteNotification: (id: string) => store.deleteItem('notifications', id),
  };
};
