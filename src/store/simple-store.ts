// src/store/simple-store.ts - Ultra Simple State Management (No Caching!)
import { create } from 'zustand';

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
  clubs: ListState<any>;
  files: ListState<any>;
  folders: ListState<any>;
  meetings: ListState<any>;
  tasks: ListState<any>;
  notifications: ListState<any>;

  // Selected items
  selectedClub: any;
  selectedFile: any;
  selectedMeeting: any;
  selectedTask: any;

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

// 🏪 Create the simple store
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

  // Clubs
  setClubs: (data, pagination) =>
    set((state) => ({
      clubs: { ...state.clubs, items: data, pagination: pagination || null, isLoading: false, error: null },
    })),
  setClubsLoading: (loading) =>
    set((state) => ({ clubs: { ...state.clubs, isLoading: loading } })),
  setClubsError: (error) =>
    set((state) => ({ clubs: { ...state.clubs, error, isLoading: false } })),
  addClub: (item) =>
    set((state) => ({ clubs: { ...state.clubs, items: [item, ...state.clubs.items] } })),
  updateClub: (id, updates) =>
    set((state) => ({
      clubs: {
        ...state.clubs,
        items: state.clubs.items.map((item: any) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      },
    })),
  deleteClub: (id) =>
    set((state) => ({
      clubs: { ...state.clubs, items: state.clubs.items.filter((item: any) => item.id !== id) },
    })),

  // Files
  setFiles: (data, pagination) =>
    set((state) => ({
      files: { ...state.files, items: data, pagination: pagination || null, isLoading: false, error: null },
    })),
  setFilesLoading: (loading) =>
    set((state) => ({ files: { ...state.files, isLoading: loading } })),
  setFilesError: (error) =>
    set((state) => ({ files: { ...state.files, error, isLoading: false } })),
  addFile: (item) =>
    set((state) => ({ files: { ...state.files, items: [item, ...state.files.items] } })),
  updateFile: (id, updates) =>
    set((state) => ({
      files: {
        ...state.files,
        items: state.files.items.map((item: any) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      },
    })),
  deleteFile: (id) =>
    set((state) => ({
      files: { ...state.files, items: state.files.items.filter((item: any) => item.id !== id) },
    })),

  // Folders
  setFolders: (data, pagination) =>
    set((state) => ({
      folders: { ...state.folders, items: data, pagination: pagination || null, isLoading: false, error: null },
    })),
  setFoldersLoading: (loading) =>
    set((state) => ({ folders: { ...state.folders, isLoading: loading } })),
  setFoldersError: (error) =>
    set((state) => ({ folders: { ...state.folders, error, isLoading: false } })),
  addFolder: (item) =>
    set((state) => ({ folders: { ...state.folders, items: [item, ...state.folders.items] } })),
  updateFolder: (id, updates) =>
    set((state) => ({
      folders: {
        ...state.folders,
        items: state.folders.items.map((item: any) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      },
    })),
  deleteFolder: (id) =>
    set((state) => ({
      folders: { ...state.folders, items: state.folders.items.filter((item: any) => item.id !== id) },
    })),

  // Meetings
  setMeetings: (data, pagination) =>
    set((state) => ({
      meetings: { ...state.meetings, items: data, pagination: pagination || null, isLoading: false, error: null },
    })),
  setMeetingsLoading: (loading) =>
    set((state) => ({ meetings: { ...state.meetings, isLoading: loading } })),
  setMeetingsError: (error) =>
    set((state) => ({ meetings: { ...state.meetings, error, isLoading: false } })),
  addMeeting: (item) =>
    set((state) => ({ meetings: { ...state.meetings, items: [item, ...state.meetings.items] } })),
  updateMeeting: (id, updates) =>
    set((state) => ({
      meetings: {
        ...state.meetings,
        items: state.meetings.items.map((item: any) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      },
    })),
  deleteMeeting: (id) =>
    set((state) => ({
      meetings: { ...state.meetings, items: state.meetings.items.filter((item: any) => item.id !== id) },
    })),

  // Tasks
  setTasks: (data, pagination) =>
    set((state) => ({
      tasks: { ...state.tasks, items: data, pagination: pagination || null, isLoading: false, error: null },
    })),
  setTasksLoading: (loading) =>
    set((state) => ({ tasks: { ...state.tasks, isLoading: loading } })),
  setTasksError: (error) =>
    set((state) => ({ tasks: { ...state.tasks, error, isLoading: false } })),
  addTask: (item) =>
    set((state) => ({ tasks: { ...state.tasks, items: [item, ...state.tasks.items] } })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        items: state.tasks.items.map((item: any) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      },
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: { ...state.tasks, items: state.tasks.items.filter((item: any) => item.id !== id) },
    })),

  // Notifications
  setNotifications: (data, pagination) =>
    set((state) => ({
      notifications: { ...state.notifications, items: data, pagination: pagination || null, isLoading: false, error: null },
    })),
  setNotificationsLoading: (loading) =>
    set((state) => ({ notifications: { ...state.notifications, isLoading: loading } })),
  setNotificationsError: (error) =>
    set((state) => ({ notifications: { ...state.notifications, error, isLoading: false } })),
  addNotification: (item) =>
    set((state) => ({ notifications: { ...state.notifications, items: [item, ...state.notifications.items] } })),
  updateNotification: (id, updates) =>
    set((state) => ({
      notifications: {
        ...state.notifications,
        items: state.notifications.items.map((item: any) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      },
    })),
  deleteNotification: (id) =>
    set((state) => ({
      notifications: { ...state.notifications, items: state.notifications.items.filter((item: any) => item.id !== id) },
    })),

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
}));

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
