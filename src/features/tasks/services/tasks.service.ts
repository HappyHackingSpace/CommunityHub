// Tasks API Service - Backend tasks endpoints

import { apiClient } from '@/lib/api-client';
import type {
  TaskResponse,
  TaskSearchResponse,
  TaskSearchParams,
  CreateTaskDto,
  UpdateTaskDto,
  AssignTaskDto,
  UpdateTaskStatusDto,
  CreateCommentDto,
  CreateSubtaskDto,
  UpdateSubtaskStatusDto,
  TaskTag,
} from '../types/task.types';

export const tasksService = {
  // Search and List Tasks
  async searchPublicTasks(params: TaskSearchParams, token: string): Promise<TaskSearchResponse> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.tags?.length) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return apiClient.get<TaskSearchResponse>(
      `/tasks/search/public?${queryParams.toString()}`,
      token
    );
  },

  async searchAssignedToMe(params: TaskSearchParams, token: string): Promise<TaskSearchResponse> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.tags?.length) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return apiClient.get<TaskSearchResponse>(
      `/tasks/search/assigned-to-me?${queryParams.toString()}`,
      token
    );
  },

  async searchAssignedByMe(params: TaskSearchParams, token: string): Promise<TaskSearchResponse> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.tags?.length) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return apiClient.get<TaskSearchResponse>(
      `/tasks/search/assigned-by-me?${queryParams.toString()}`,
      token
    );
  },

  // Basic Task Operations
  async createTask(data: CreateTaskDto, token: string): Promise<TaskResponse> {
    return apiClient.post<TaskResponse>('/tasks', data, token);
  },

  async getTask(taskId: string, token: string): Promise<TaskResponse> {
    return apiClient.get<TaskResponse>(`/tasks/${taskId}`, token);
  },

  async updateTask(taskId: string, data: UpdateTaskDto, token: string): Promise<TaskResponse> {
    return apiClient.patch<TaskResponse>(`/tasks/${taskId}`, data, token);
  },

  async deleteTask(taskId: string, token: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${taskId}`, token);
  },

  // Task Sub-operations
  async assignTask(taskId: string, data: AssignTaskDto, token: string): Promise<TaskResponse> {
    return apiClient.post<TaskResponse>(`/tasks/${taskId}/assign`, data, token);
  },

  async updateTaskStatus(
    taskId: string,
    data: UpdateTaskStatusDto,
    token: string
  ): Promise<TaskResponse> {
    return apiClient.patch<TaskResponse>(`/tasks/${taskId}/status`, data, token);
  },

  async addComment(
    taskId: string,
    data: CreateCommentDto,
    token: string
  ): Promise<TaskResponse> {
    return apiClient.post<TaskResponse>(`/tasks/${taskId}/comments`, data, token);
  },

  async addSubtask(
    taskId: string,
    data: CreateSubtaskDto,
    token: string
  ): Promise<TaskResponse> {
    return apiClient.post<TaskResponse>(`/tasks/${taskId}/subtasks`, data, token);
  },

  async updateSubtaskStatus(
    subtaskId: string,
    data: UpdateSubtaskStatusDto,
    token: string
  ): Promise<TaskResponse> {
    return apiClient.patch<TaskResponse>(`/subtasks/${subtaskId}/status`, data, token);
  },

  // Tag Management
  async getTags(token: string): Promise<TaskTag[]> {
    return apiClient.get<TaskTag[]>('/tags', token);
  },

  async createTag(name: string, token: string): Promise<TaskTag> {
    return apiClient.post<TaskTag>('/tags', { name }, token);
  },

  async addTagToTask(taskId: string, tagId: string, token: string): Promise<TaskResponse> {
    return apiClient.post<TaskResponse>(`/tasks/${taskId}/tags`, { tagId }, token);
  },

  // Activity History
  async getTaskActivity(taskId: string, token: string): Promise<any[]> {
    return apiClient.get<any[]>(`/tasks/${taskId}/activity`, token);
  },

  async getTaskAssignmentHistory(taskId: string, token: string): Promise<any[]> {
    return apiClient.get<any[]>(`/tasks/${taskId}/assignment-history`, token);
  },
};
