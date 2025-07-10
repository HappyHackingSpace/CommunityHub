import { create } from 'zustand';
import { FileItem, Folder } from '@/types';

interface FileStore {
  files: FileItem[];
  folders: Folder[];
  currentFolder: Folder | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setFiles: (files: FileItem[]) => void;
  setFolders: (folders: Folder[]) => void;
  setCurrentFolder: (folder: Folder | null) => void;
  addFile: (file: FileItem) => void;
  addFolder: (folder: Folder) => void;
  updateFile: (id: string, updates: Partial<FileItem>) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFile: (id: string) => void;
  deleteFolder: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // API calls
  fetchFiles: (clubId: string, folderId?: string) => Promise<void>;
  fetchFolders: (clubId: string, parentId?: string) => Promise<void>;
  uploadFile: (file: File, clubId: string, folderId?: string, description?: string) => Promise<void>;
  createFolder: (name: string, clubId: string, parentId?: string) => Promise<void>;
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  folders: [],
  currentFolder: null,
  isLoading: false,
  error: null,

  setFiles: (files) => set({ files }),
  setFolders: (folders) => set({ folders }),
  setCurrentFolder: (folder) => set({ currentFolder: folder }),
  
  addFile: (file) => set((state) => ({ 
    files: [...state.files, file] 
  })),
  
  addFolder: (folder) => set((state) => ({ 
    folders: [...state.folders, folder] 
  })),
  
  updateFile: (id, updates) => set((state) => ({
    files: state.files.map(file => 
      file.id === id ? { ...file, ...updates } : file
    )
  })),
  
  updateFolder: (id, updates) => set((state) => ({
    folders: state.folders.map(folder => 
      folder.id === id ? { ...folder, ...updates } : folder
    )
  })),
  
  deleteFile: (id) => set((state) => ({
    files: state.files.filter(file => file.id !== id)
  })),
  
  deleteFolder: (id) => set((state) => ({
    folders: state.folders.filter(folder => folder.id !== id)
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchFiles: async (clubId: string, folderId?: string) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams({ clubId });
      if (folderId) params.append('folderId', folderId);
      
      const response = await fetch(`/api/files?${params}`);
      const result = await response.json();
      
      if (result.success) {
        set({ files: result.data, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Dosyalar yüklenemedi', isLoading: false });
    }
  },

  fetchFolders: async (clubId: string, parentId?: string) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams({ clubId });
      if (parentId) params.append('parentId', parentId);
      
      const response = await fetch(`/api/folders?${params}`);
      const result = await response.json();
      
      if (result.success) {
        set({ folders: result.data, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Klasörler yüklenemedi', isLoading: false });
    }
  },

  uploadFile: async (file: File, clubId: string, folderId?: string, description?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clubId', clubId);
      if (folderId) formData.append('folderId', folderId);
      if (description) formData.append('description', description);

      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        get().addFile(result.data);
        set({ isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Dosya yüklenemedi', isLoading: false });
    }
  },

  createFolder: async (name: string, clubId: string, parentId?: string) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, clubId, parentId }),
      });

      const result = await response.json();

      if (result.success) {
        get().addFolder(result.data);
      } else {
        set({ error: result.error });
      }
    } catch (error) {
      set({ error: 'Klasör oluşturulamadı' });
    }
  },
}));