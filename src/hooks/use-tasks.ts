"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useTenantContext } from "@/components/providers/tenant-provider";

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskVisibility = 'PUBLIC' | 'PRIVATE' | 'TEAM';

export interface Task {
  id: string;
  title: string;
  description?: string;
  creatorId?: string;
  assignerId?: string;
  assigneeId?: string;
  mentorId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  visibility: TaskVisibility;
  dueDate?: string;
  points?: number;
  estimatedTime?: number;
  requiredSkills?: string[];
  tags?: { id: string; name: string; color?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetail extends Task {
  comments?: Comment[];
  subTasks?: SubTask[];
  activityLogs?: ActivityLog[];
  attachments?: Attachment[];
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface SubTask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface Attachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string;
  visibility?: TaskVisibility;
  priority?: TaskPriority;
  estimatedTime?: number;
  points?: number;
}

export interface SearchParams {
  search?: string;
  status?: TaskStatus;
  page?: number;
  limit?: number;
}

export function useTasks() {
  const { tenantId } = useTenantContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myCreatedTasks, setMyCreatedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);

  // ─── Basic fetches ───────────────────────────────────────────────────────────

  const fetchPublicTasks = useCallback(async (params?: SearchParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const endpoint = params?.search || params?.status
        ? "/tasks/search/public"
        : "/tasks/public";
      const response = await apiClient.get(endpoint, { params });
      // search returns paginated { data, total, page }, plain returns array
      const data = response.data?.data ?? response.data;
      setTasks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load available tasks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyTasks = useCallback(async (params?: SearchParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const endpoint = params?.search || params?.status
        ? "/tasks/search/assigned-to-me"
        : "/tasks/assigned-to-me";
      const response = await apiClient.get(endpoint, { params });
      const data = response.data?.data ?? response.data;
      setMyTasks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching my tasks:", err);
      setError("Failed to load your tasks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyCreatedTasks = useCallback(async (params?: SearchParams) => {
    try {
      const endpoint = params?.search || params?.status
        ? "/tasks/search/assigned-by-me"
        : "/tasks/assigned-by-me";
      const response = await apiClient.get(endpoint, { params });
      const data = response.data?.data ?? response.data;
      setMyCreatedTasks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching created tasks:", err);
    }
  }, []);

  const fetchGamification = useCallback(async (limit: number = 5) => {
    try {
      const [leaderboardRes, badgesRes] = await Promise.all([
        apiClient.get(`/gamification/leaderboard?limit=${limit}`),
        apiClient.get("/gamification/my-badges")
      ]);
      setLeaderboard(leaderboardRes.data);
      setBadges(badgesRes.data);
    } catch (err) {
      console.error("Error fetching gamification:", err);
    }
  }, []);

  // ─── Task Detail ─────────────────────────────────────────────────────────────

  const fetchTaskDetail = useCallback(async (id: string): Promise<TaskDetail | null> => {
    try {
      const [taskRes, activityRes] = await Promise.all([
        apiClient.get(`/tasks/${id}`),
        apiClient.get(`/tasks/${id}/activity`).catch(() => ({ data: [] })),
      ]);
      return { ...taskRes.data, activityLogs: activityRes.data };
    } catch (err: any) {
      console.error("Error fetching task detail:", err);
      return null;
    }
  }, []);

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  const createTask = async (dto: CreateTaskDto) => {
    try {
      const response = await apiClient.post("/tasks", dto);
      await Promise.all([fetchPublicTasks(), fetchMyTasks(), fetchMyCreatedTasks()]);
      return response.data;
    } catch (err: any) {
      console.error("Error creating task:", err);
      throw err;
    }
  };

  const updateTask = async (id: string, dto: Partial<CreateTaskDto>) => {
    try {
      const response = await apiClient.patch(`/tasks/${id}`, dto);
      await Promise.all([fetchPublicTasks(), fetchMyTasks(), fetchMyCreatedTasks()]);
      return response.data;
    } catch (err: any) {
      console.error("Error updating task:", err);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await apiClient.delete(`/tasks/${id}`);
      await Promise.all([fetchPublicTasks(), fetchMyTasks(), fetchMyCreatedTasks()]);
    } catch (err: any) {
      console.error("Error deleting task:", err);
      throw err;
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    try {
      await apiClient.patch(`/tasks/${id}/status`, { status });
      await Promise.all([fetchMyTasks(), fetchPublicTasks(), fetchGamification()]);
    } catch (err: any) {
      console.error("Error updating task status:", err);
      throw err;
    }
  };

  const volunteerForTask = async (id: string) => {
    try {
      await apiClient.post(`/tasks/${id}/volunteer`);
      await Promise.all([fetchMyTasks(), fetchPublicTasks()]);
    } catch (err: any) {
      console.error("Error volunteering for task:", err);
      throw err;
    }
  };

  // ─── Comments ────────────────────────────────────────────────────────────────

  const addComment = async (taskId: string, content: string): Promise<Comment> => {
    const response = await apiClient.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  };

  // ─── Sub Tasks ───────────────────────────────────────────────────────────────

  const addSubTask = async (taskId: string, title: string): Promise<SubTask> => {
    const response = await apiClient.post(`/tasks/${taskId}/subtasks`, { title });
    return response.data;
  };

  // ─── Tags ────────────────────────────────────────────────────────────────────

  const attachTags = async (taskId: string, tagIds: string[]) => {
    await apiClient.post(`/tasks/${taskId}/tags`, { tagIds });
  };

  // ─── Mentor / Help / Handover ─────────────────────────────────────────────

  const assignMentor = async (taskId: string, mentorId: string) => {
    await apiClient.post(`/tasks/${taskId}/mentor`, { mentorId });
  };

  const requestHelp = async (taskId: string, message: string) => {
    await apiClient.post(`/tasks/${taskId}/help`, { message });
  };

  const requestHandover = async (taskId: string, reason: string) => {
    await apiClient.post(`/tasks/${taskId}/handover`, { reason });
  };

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (tenantId) {
      fetchMyTasks();
      fetchPublicTasks();
      fetchMyCreatedTasks();
      fetchGamification();
    }
  }, [tenantId, fetchMyTasks, fetchPublicTasks, fetchMyCreatedTasks, fetchGamification]);

  return {
    tasks,
    myTasks,
    myCreatedTasks,
    leaderboard,
    badges,
    isLoading,
    error,
    fetchPublicTasks,
    fetchMyTasks,
    fetchMyCreatedTasks,
    fetchTaskDetail,
    refreshTasks: () => {
      fetchMyTasks();
      fetchPublicTasks();
      fetchMyCreatedTasks();
      fetchGamification();
    },
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    volunteerForTask,
    fetchGamification,
    addComment,
    addSubTask,
    attachTags,
    assignMentor,
    requestHelp,
    requestHandover,
  };
}
