// src/hooks/useApi.ts - Unified API Hooks with Store Integration
import { useCallback } from 'react';
import { useSimpleStore, useClubs, useFiles, useMeetings, useTasks, useNotifications } from '@/store/simple-store';
import type { SimpleStore } from '@/store/simple-store';
import type { Club } from '@/types';
import type { Pagination } from '@/store/simple-store';
interface ApiOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

interface CreateClubData {
  name: string;
  description: string;
  type?: string;
}
interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: Pagination;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 🔄 Base API hook
function useBaseApi() {
  const store = useSimpleStore();

  

  const apiCall = useCallback(async (
    url: string,
    options: RequestInit = {},
    listName?: keyof Pick<typeof store, 'clubs' | 'files' | 'meetings' | 'tasks' | 'notifications'>
  ) => {
    try {
      if (listName) {
        const loadingMethod = `set${capitalize(listName)}Loading` as keyof SimpleStore;
        const fn = store[loadingMethod] as ((loading: boolean) => void) | undefined;
        if (typeof fn === 'function') {
          fn(true);
        }
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...options.headers,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'API call failed');
      }

      return result;
    } catch (error) {
      if (listName) {
        const errorMethod = `set${capitalize(listName)}Error` as keyof SimpleStore;
        const fn = store[errorMethod] as ((error: string | null) => void) | undefined;
        if (typeof fn === 'function') {
          fn(error instanceof Error ? error.message : 'Unknown error');
        }
      }
      throw error;
    } finally {
      if (listName) {
        const loadingMethod = `set${capitalize(listName)}Loading` as keyof SimpleStore;
        const fn = store[loadingMethod] as ((loading: boolean) => void) | undefined;
        if (typeof fn === 'function') {
          fn(false);
        }
      }

    }
  }, [store]);

  return { apiCall };
}

// 🏢 Clubs API Hook
export function useClubsApi() {
  const { apiCall } = useBaseApi();
  const clubsHook = useClubs();

  const fetchClubs = useCallback(async (options: ApiOptions = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      const result = await apiCall(`/api/clubs?${params}`, {}, 'clubs');
      clubsHook.setClubs(result.data, result.pagination);
      return result;
    } catch (error) {
      console.error('Failed to fetch clubs:', error);
      throw error;
    }
  }, [apiCall, clubsHook]);

   const createClub = useCallback(
    async (clubData: CreateClubData): Promise<ApiResponse<Club>> => {
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
    },
    [apiCall, clubsHook]
  );


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
  }, [apiCall, clubsHook]);

  const deleteClub = useCallback(async (id: string) => {
    try {
      await apiCall(`/api/clubs/${id}`, { method: 'DELETE' });
      clubsHook.deleteClub(id);
    } catch (error) {
      console.error('Failed to delete club:', error);
      throw error;
    }
  }, [apiCall, clubsHook]);

  return {
    ...clubsHook,
    fetchClubs,
    createClub,
    updateClub,
    deleteClub,
  };
}

// 📁 Files API Hook
export function useFilesApi() {
  const { apiCall } = useBaseApi();
  const filesHook = useFiles();

  const fetchFiles = useCallback(async (clubId: string, options: ApiOptions = {}) => {
    try {
      const params = new URLSearchParams({ clubId });
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      const result = await apiCall(`/api/files?${params}`, {}, 'files');
      filesHook.setFiles(result.data, result.pagination);
      return result;
    } catch (error) {
      console.error('Failed to fetch files:', error);
      throw error;
    }
  }, [apiCall, filesHook]);

  const uploadFile = useCallback(async (fileData: FormData) => {
    try {
      filesHook.setLoading(true);
      
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
      filesHook.setError(error instanceof Error ? error.message : 'Upload failed');
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
  }, [apiCall, filesHook]);

  return {
    ...filesHook,
    fetchFiles,
    uploadFile,
    deleteFile,
  };
}

// 📅 Meetings API Hook
export function useMeetingsApi() {
  const { apiCall } = useBaseApi();
  const meetingsHook = useMeetings();

  const fetchMeetings = useCallback(async (options: ApiOptions = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      const result = await apiCall(`/api/meetings?${params}`, {}, 'meetings');
      meetingsHook.setMeetings(result.data, result.pagination);
      return result;
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
      throw error;
    }
  }, [apiCall, meetingsHook]);

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
  }, [apiCall, meetingsHook]);

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
  }, [apiCall, meetingsHook]);

  const deleteMeeting = useCallback(async (id: string) => {
    try {
      await apiCall(`/api/meetings/${id}`, { method: 'DELETE' });
      meetingsHook.deleteMeeting(id);
    } catch (error) {
      console.error('Failed to delete meeting:', error);
      throw error;
    }
  }, [apiCall, meetingsHook]);

  return {
    ...meetingsHook,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  };
}

// ✅ Tasks API Hook
export function useTasksApi() {
  const { apiCall } = useBaseApi();
  const tasksHook = useTasks();

  const fetchTasks = useCallback(async (options: ApiOptions = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      const result = await apiCall(`/api/tasks?${params}`, {}, 'tasks');
      tasksHook.setTasks(result.data, result.pagination);
      return result;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  }, [apiCall, tasksHook]);

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
  }, [apiCall, tasksHook]);

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
  }, [apiCall, tasksHook]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await apiCall(`/api/tasks/${id}`, { method: 'DELETE' });
      tasksHook.deleteTask(id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  }, [apiCall, tasksHook]);

  return {
    ...tasksHook,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}

// 🔔 Notifications API Hook
export function useNotificationsApi() {
  const { apiCall } = useBaseApi();
  const notificationsHook = useNotifications();

  const fetchNotifications = useCallback(async (options: ApiOptions = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      const result = await apiCall(`/api/notifications?${params}`, {}, 'notifications');
      notificationsHook.setNotifications(result.data, result.pagination);
      return result;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }, [apiCall, notificationsHook]);

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
  }, [apiCall, notificationsHook]);

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
  }, [apiCall, notificationsHook]);

  return {
    ...notificationsHook,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
