// src/hooks/useSimpleApi.ts - Ultra Simple API Hooks (No Caching!)
import { useCallback } from 'react';
import { useClubs, useFiles, useFolders, useMeetings, useTasks, useNotifications } from '@/store/simple-store';

interface ApiOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

// 🔄 Base API call function
async function apiCall(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'API call failed');
  }

  return result;
}

// 🏢 Clubs API Hook (Super Simple!)
export function useClubsApi() {
  const clubsHook = useClubs();

  const fetchClubs = useCallback(async (options: ApiOptions = {}) => {
    try {
      clubsHook.setLoading(true);
      clubsHook.setError(null);

      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      const result = await apiCall(`/api/clubs?${params}`);
      clubsHook.setClubs(result.data, result.pagination);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch clubs';
      clubsHook.setError(message);
      throw error;
    } finally {
      clubsHook.setLoading(false);
    }
  }, [clubsHook]);

  const createClub = useCallback(async (clubData: { name: string; description: string; type?: string }) => {
    try {
      const result = await apiCall('/api/clubs', {
        method: 'POST',
        body: JSON.stringify(clubData),
      });
      
      clubsHook.addClub(result.data);
      return result;
    } catch (error) {
      console.error('Failed to create club:', error);
      throw error;
    }
  }, [clubsHook]);

  const updateClub = useCallback(async (id: string, updates: any) => {
    try {
      const result = await apiCall(`/api/clubs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      clubsHook.updateClub(id, result.data);
      return result;
    } catch (error) {
      console.error('Failed to update club:', error);
      throw error;
    }
  }, [clubsHook]);

  const deleteClub = useCallback(async (id: string) => {
    try {
      await apiCall(`/api/clubs/${id}`, { method: 'DELETE' });
      clubsHook.deleteClub(id);
    } catch (error) {
      console.error('Failed to delete club:', error);
      throw error;
    }
  }, [clubsHook]);

  return {
    ...clubsHook,
    fetchClubs,
    createClub,
    updateClub,
    deleteClub,
  };
}

// 📁 Files & Folders API Hook (Super Simple!)
export function useFilesApi() {
  const filesHook = useFiles();
  const foldersHook = useFolders();

  const fetchFiles = useCallback(async (clubId: string, options: ApiOptions = {}) => {
    try {
      filesHook.setLoading(true);
      filesHook.setError(null);

      const params = new URLSearchParams({ clubId });
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      const result = await apiCall(`/api/files?${params}`);
      filesHook.setFiles(result.data, result.pagination);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch files';
      filesHook.setError(message);
      throw error;
    } finally {
      filesHook.setLoading(false);
    }
  }, [filesHook]);

  const fetchFolders = useCallback(async (clubId: string, options: ApiOptions = {}) => {
    try {
      foldersHook.setLoading(true);
      foldersHook.setError(null);

      const params = new URLSearchParams({ clubId });
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      const result = await apiCall(`/api/folders?${params}`);
      foldersHook.setFolders(result.data, result.pagination);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch folders';
      foldersHook.setError(message);
      throw error;
    } finally {
      foldersHook.setLoading(false);
    }
  }, [foldersHook]);

  const uploadFile = useCallback(async (fileData: FormData) => {
    try {
      filesHook.setLoading(true);
      filesHook.setError(null);
      
      const result = await fetch('/api/files', {
        method: 'POST',
        body: fileData, // Don't set Content-Type for FormData
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.error || 'File upload failed');
      }

      filesHook.addFile(data.data);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      filesHook.setError(message);
      throw error;
    } finally {
      filesHook.setLoading(false);
    }
  }, [filesHook]);

  const deleteFile = useCallback(async (id: string) => {
    try {
      await apiCall(`/api/files/${id}`, { method: 'DELETE' });
      filesHook.deleteFile(id);
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }, [filesHook]);

  const createFolder = useCallback(async (name: string, clubId: string, parentId?: string) => {
    try {
      foldersHook.setLoading(true);
      foldersHook.setError(null);
      
      const result = await apiCall('/api/folders', {
        method: 'POST',
        body: JSON.stringify({ name, clubId, parentId }),
      });

      // Refresh folders to show the new folder
      await fetchFolders(clubId, { parentId });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create folder';
      foldersHook.setError(message);
      throw error;
    } finally {
      foldersHook.setLoading(false);
    }
  }, [foldersHook, fetchFolders]);

  return {
    // Files
    files: filesHook.files,
    filesLoading: filesHook.isLoading,
    filesError: filesHook.error,
    // Folders
    folders: foldersHook.folders,
    foldersLoading: foldersHook.isLoading,
    foldersError: foldersHook.error,
    // Methods
    fetchFiles,
    fetchFolders,
    uploadFile,
    deleteFile,
    createFolder,
    // File operations
    addFile: filesHook.addFile,
    updateFile: filesHook.updateFile,
    selectFile: filesHook.selectFile,
  };
}

// 📅 Meetings API Hook (Super Simple!)
export function useMeetingsApi() {
  const meetingsHook = useMeetings();

  const fetchMeetings = useCallback(async (options: ApiOptions = {}) => {
    try {
      meetingsHook.setLoading(true);
      meetingsHook.setError(null);

      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      const result = await apiCall(`/api/meetings?${params}`);
      meetingsHook.setMeetings(result.data, result.pagination);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch meetings';
      meetingsHook.setError(message);
      throw error;
    } finally {
      meetingsHook.setLoading(false);
    }
  }, [meetingsHook]);

  const createMeeting = useCallback(async (meetingData: any) => {
    try {
      const result = await apiCall('/api/meetings', {
        method: 'POST',
        body: JSON.stringify(meetingData),
      });
      
      meetingsHook.addMeeting(result.data);
      return result;
    } catch (error) {
      console.error('Failed to create meeting:', error);
      throw error;
    }
  }, [meetingsHook]);

  const updateMeeting = useCallback(async (id: string, updates: any) => {
    try {
      const result = await apiCall(`/api/meetings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      meetingsHook.updateMeeting(id, result.data);
      return result;
    } catch (error) {
      console.error('Failed to update meeting:', error);
      throw error;
    }
  }, [meetingsHook]);

  const deleteMeeting = useCallback(async (id: string) => {
    try {
      await apiCall(`/api/meetings/${id}`, { method: 'DELETE' });
      meetingsHook.deleteMeeting(id);
    } catch (error) {
      console.error('Failed to delete meeting:', error);
      throw error;
    }
  }, [meetingsHook]);

  return {
    ...meetingsHook,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  };
}

// ✅ Tasks API Hook (Super Simple!)
export function useTasksApi() {
  const tasksHook = useTasks();

  const fetchTasks = useCallback(async (options: ApiOptions = {}) => {
    try {
      tasksHook.setLoading(true);
      tasksHook.setError(null);

      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      const result = await apiCall(`/api/tasks?${params}`);
      tasksHook.setTasks(result.data, result.pagination);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tasks';
      tasksHook.setError(message);
      throw error;
    } finally {
      tasksHook.setLoading(false);
    }
  }, [tasksHook]);

  const createTask = useCallback(async (taskData: any) => {
    try {
      const result = await apiCall('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      
      tasksHook.addTask(result.data);
      return result;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }, [tasksHook]);

  const updateTask = useCallback(async (id: string, updates: any) => {
    try {
      const result = await apiCall(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      tasksHook.updateTask(id, result.data);
      return result;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }, [tasksHook]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await apiCall(`/api/tasks/${id}`, { method: 'DELETE' });
      tasksHook.deleteTask(id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  }, [tasksHook]);

  return {
    ...tasksHook,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}

// 🔔 Notifications API Hook (Super Simple!)
export function useNotificationsApi() {
  const notificationsHook = useNotifications();

  const fetchNotifications = useCallback(async (options: ApiOptions = {}) => {
    try {
      notificationsHook.setLoading(true);
      notificationsHook.setError(null);

      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      const result = await apiCall(`/api/notifications?${params}`);
      notificationsHook.setNotifications(result.data, result.pagination);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch notifications';
      notificationsHook.setError(message);
      throw error;
    } finally {
      notificationsHook.setLoading(false);
    }
  }, [notificationsHook]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const result = await apiCall(`/api/notifications/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_read: true }),
      });
      
      notificationsHook.updateNotification(id, { is_read: true });
      return result;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }, [notificationsHook]);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiCall('/api/notifications/mark-all-read', { method: 'POST' });
      
      // Update all notifications to read
      notificationsHook.notifications.forEach(notification => {
        if (!notification.is_read) {
          notificationsHook.updateNotification(notification.id, { is_read: true });
        }
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }, [notificationsHook]);

  return {
    ...notificationsHook,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
