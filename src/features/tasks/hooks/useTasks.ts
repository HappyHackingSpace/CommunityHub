// Custom hooks for tasks management using React Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { tasksService } from '../services/tasks.service';
import type {
  TaskSearchParams,
  CreateTaskDto,
  UpdateTaskDto,
  AssignTaskDto,
  UpdateTaskStatusDto,
  CreateCommentDto,
  CreateSubtaskDto,
  UpdateSubtaskStatusDto,
} from '../types/task.types';
import { toast } from 'sonner';

// Search Hooks
export function useAssignedToMeTasks(params: TaskSearchParams = {}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['tasks', 'assigned-to-me', params],
    queryFn: () => tasksService.searchAssignedToMe(params, token!),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAssignedByMeTasks(params: TaskSearchParams = {}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['tasks', 'assigned-by-me', params],
    queryFn: () => tasksService.searchAssignedByMe(params, token!),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  });
}

export function usePublicTasks(params: TaskSearchParams = {}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['tasks', 'public', params],
    queryFn: () => tasksService.searchPublicTasks(params, token!),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  });
}

// Single Task Hook
export function useTask(taskId: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => tasksService.getTask(taskId, token!),
    enabled: !!token && !!taskId,
    staleTime: 2 * 60 * 1000,
  });
}

// Task CRUD Mutations
export function useCreateTask() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDto) => tasksService.createTask(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev başarıyla oluşturuldu');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Görev oluşturulamadı');
    },
  });
}

export function useUpdateTask(taskId: string) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTaskDto) => tasksService.updateTask(taskId, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success('Görev güncellendi');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Görev güncellenemedi');
    },
  });
}

export function useDeleteTask() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksService.deleteTask(taskId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev silindi');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Görev silinemedi');
    },
  });
}

// Task Operations Mutations
export function useAssignTask(taskId: string) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignTaskDto) => tasksService.assignTask(taskId, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success('Görev atandı');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Görev atanamadı');
    },
  });
}

export function useUpdateTaskStatus(taskId: string) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTaskStatusDto) =>
      tasksService.updateTaskStatus(taskId, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success('Durum güncellendi');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Durum güncellenemedi');
    },
  });
}

export function useAddComment(taskId: string) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentDto) => tasksService.addComment(taskId, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success('Yorum eklendi');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Yorum eklenemedi');
    },
  });
}

export function useAddSubtask(taskId: string) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubtaskDto) => tasksService.addSubtask(taskId, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success('Alt görev eklendi');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Alt görev eklenemedi');
    },
  });
}

export function useUpdateSubtaskStatus(subtaskId: string, taskId: string) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSubtaskStatusDto) =>
      tasksService.updateSubtaskStatus(subtaskId, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success('Alt görev durumu güncellendi');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Alt görev durumu güncellenemedi');
    },
  });
}

// Tags Hooks
export function useTags() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['tags'],
    queryFn: () => tasksService.getTags(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateTag() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => tasksService.createTag(name, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Etiket oluşturuldu');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Etiket oluşturulamadı');
    },
  });
}
