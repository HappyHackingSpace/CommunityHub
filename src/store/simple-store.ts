// src/store/simple-store.ts - Ultra Simple State Management (No Caching!)
import { create } from 'zustand';
import { Club, FileItem, Folder, Meeting, Task, Notification } from '@/types/index';

// 📊 Pagination interface
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 🗃️ Simple list state
interface ListState<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

// 🏪 Simple Store Interface - NO CACHING!
export interface SimpleStore {
  // Data states
  clubs: ListState<Club>;
  files: ListState<FileItem>;
  folders: ListState<Folder>;
  meetings: ListState<Meeting>;
  tasks: ListState<Task>;
  notifications: ListState<Notification>;

  // Selected items
  selectedClub: Club | null;
  selectedFile: FileItem | null;
  selectedMeeting: Meeting | null;
  selectedTask: Task | null;

  // Actions
  setClubs: (data: any[], pagination?: Pagination) => void;
  setFiles: (data: any[], pagination?: Pagination) => void;
  setFolders: (data: any[], pagination?: Pagination) => void;
  setMeetings: (data: any[], pagination?: Pagination) => void;
  setTasks: (data: any[], pagination?: Pagination) => void;
  setNotifications: (data: any[], pagination?: Pagination) => void;

  setClubsLoading: (loading: boolean) => void;
  setFilesLoading: (loading: boolean) => void;
  setFoldersLoading: (loading: boolean) => void;
  setMeetingsLoading: (loading: boolean) => void;
  setTasksLoading: (loading: boolean) => void;
  setNotificationsLoading: (loading: boolean) => void;

  setClubsError: (error: string | null) => void;
  setFilesError: (error: string | null) => void;
  setFoldersError: (error: string | null) => void;
  setMeetingsError: (error: string | null) => void;
  setTasksError: (error: string | null) => void;
  setNotificationsError: (error: string | null) => void;

  addClub: (item: any) => void;
  addFile: (item: any) => void;
  addFolder: (item: any) => void;
  addMeeting: (item: any) => void;
  addTask: (item: any) => void;
  addNotification: (item: any) => void;

  updateClub: (id: string, updates: any) => void;
  updateFile: (id: string, updates: any) => void;
  updateFolder: (id: string, updates: any) => void;
  updateMeeting: (id: string, updates: any) => void;
  updateTask: (id: string, updates: any) => void;
  updateNotification: (id: string, updates: any) => void;

  deleteClub: (id: string) => void;
  deleteFile: (id: string) => void;
  deleteFolder: (id: string) => void;
  deleteMeeting: (id: string) => void;
  deleteTask: (id: string) => void;
  deleteNotification: (id: string) => void;

  setSelectedClub: (item: any) => void;
  setSelectedFile: (item: any) => void;
  setSelectedMeeting: (item: any) => void;
  setSelectedTask: (item: any) => void;

  clearAll: () => void;
}

// 🚀 Default list state
const createDefaultListState = <T>(): ListState<T> => ({
  items: [],
  isLoading: false,
  error: null,
  pagination: null,
});

// � Generic factory for entity state management
const createEntityActions = <T>(entityName: string, set: any) => {
  const capitalizedEntity = entityName.charAt(0).toUpperCase() + entityName.slice(1);
  const singularEntity = entityName.endsWith('s') ? entityName.slice(0, -1) : entityName;
  const capitalizedSingular = singularEntity.charAt(0).toUpperCase() + singularEntity.slice(1);

  return {
    [`set${capitalizedEntity}`]: (data: T[], pagination?: Pagination) =>
      set((state: any) => ({
        [entityName]: { ...state[entityName], items: data, pagination: pagination || null, isLoading: false, error: null },
      })),
    [`set${capitalizedEntity}Loading`]: (loading: boolean) =>
      set((state: any) => ({ [entityName]: { ...state[entityName], isLoading: loading } })),
    [`set${capitalizedEntity}Error`]: (error: string | null) =>
      set((state: any) => ({ [entityName]: { ...state[entityName], error, isLoading: false } })),
    [`add${capitalizedSingular}`]: (item: T) =>
      set((state: any) => ({ [entityName]: { ...state[entityName], items: [item, ...state[entityName].items] } })),
    [`update${capitalizedSingular}`]: (id: string, updates: Partial<T>) =>
      set((state: any) => ({
        [entityName]: {
          ...state[entityName],
          items: state[entityName].items.map((item: any) => item.id === id ? { ...item, ...updates } : item),
        },
      })),
    [`delete${capitalizedSingular}`]: (id: string) =>
      set((state: any) => ({
        [entityName]: { ...state[entityName], items: state[entityName].items.filter((item: any) => item.id !== id) },
      })),
  };
};

// �🏪 Create the simple store
export const useSimpleStore = create<SimpleStore>((set) => ({
  // Initialize states
  clubs: createDefaultListState(),
  files: createDefaultListState(),
  folders: createDefaultListState(),
  meetings: createDefaultListState(),
  tasks: createDefaultListState(),
  notifications: createDefaultListState(),

  selectedClub: null,
  selectedFile: null,
  selectedMeeting: null,
  selectedTask: null,

  // Generic entity actions
  ...createEntityActions<Club>('clubs', set),
  ...createEntityActions<FileItem>('files', set),
  ...createEntityActions<Folder>('folders', set),
  ...createEntityActions<Meeting>('meetings', set),
  ...createEntityActions<Task>('tasks', set),
  ...createEntityActions<Notification>('notifications', set),

  // Selected items
  setSelectedClub: (item) => set(() => ({ selectedClub: item })),
  setSelectedFile: (item) => set(() => ({ selectedFile: item })),
  setSelectedMeeting: (item) => set(() => ({ selectedMeeting: item })),
  setSelectedTask: (item) => set(() => ({ selectedTask: item })),

  // Clear all
  clearAll: () =>
    set(() => ({
      clubs: createDefaultListState(),
      files: createDefaultListState(),
      meetings: createDefaultListState(),
      tasks: createDefaultListState(),
      notifications: createDefaultListState(),
      selectedClub: null,
      selectedFile: null,
      selectedMeeting: null,
      selectedTask: null,
    })),
} as SimpleStore));

// 🔗 Simple hooks for specific data types (no caching logic!)
export const useClubs = () => {
  const store = useSimpleStore();
  return {
    clubs: store.clubs.items,
    isLoading: store.clubs.isLoading,
    error: store.clubs.error,
    pagination: store.clubs.pagination,
    selectedClub: store.selectedClub,
    setClubs: store.setClubs,
    setLoading: store.setClubsLoading,
    setError: store.setClubsError,
    addClub: store.addClub,
    updateClub: store.updateClub,
    deleteClub: store.deleteClub,
    selectClub: store.setSelectedClub,
  };
};

export const useFiles = () => {
  const store = useSimpleStore();
  return {
    files: store.files.items,
    isLoading: store.files.isLoading,
    error: store.files.error,
    pagination: store.files.pagination,
    selectedFile: store.selectedFile,
    setFiles: store.setFiles,
    setLoading: store.setFilesLoading,
    setError: store.setFilesError,
    addFile: store.addFile,
    updateFile: store.updateFile,
    deleteFile: store.deleteFile,
    selectFile: store.setSelectedFile,
  };
};

export const useMeetings = () => {
  const store = useSimpleStore();
  return {
    meetings: store.meetings.items,
    isLoading: store.meetings.isLoading,
    error: store.meetings.error,
    pagination: store.meetings.pagination,
    selectedMeeting: store.selectedMeeting,
    setMeetings: store.setMeetings,
    setLoading: store.setMeetingsLoading,
    setError: store.setMeetingsError,
    addMeeting: store.addMeeting,
    updateMeeting: store.updateMeeting,
    deleteMeeting: store.deleteMeeting,
    selectMeeting: store.setSelectedMeeting,
  };
};

export const useTasks = () => {
  const store = useSimpleStore();
  return {
    tasks: store.tasks.items,
    isLoading: store.tasks.isLoading,
    error: store.tasks.error,
    pagination: store.tasks.pagination,
    selectedTask: store.selectedTask,
    setTasks: store.setTasks,
    setLoading: store.setTasksLoading,
    setError: store.setTasksError,
    addTask: store.addTask,
    updateTask: store.updateTask,
    deleteTask: store.deleteTask,
    selectTask: store.setSelectedTask,
  };
};

export const useNotifications = () => {
  const store = useSimpleStore();
  return {
    notifications: store.notifications.items,
    isLoading: store.notifications.isLoading,
    error: store.notifications.error,
    pagination: store.notifications.pagination,
    setNotifications: store.setNotifications,
    setLoading: store.setNotificationsLoading,
    setError: store.setNotificationsError,
    addNotification: store.addNotification,
    updateNotification: store.updateNotification,
    deleteNotification: store.deleteNotification,
  };
};

export const useFolders = () => {
  const store = useSimpleStore();
  return {
    folders: store.folders.items,
    isLoading: store.folders.isLoading,
    error: store.folders.error,
    pagination: store.folders.pagination,
    setFolders: store.setFolders,
    setLoading: store.setFoldersLoading,
    setError: store.setFoldersError,
    addFolder: store.addFolder,
    updateFolder: store.updateFolder,
    deleteFolder: store.deleteFolder,
  };
};
