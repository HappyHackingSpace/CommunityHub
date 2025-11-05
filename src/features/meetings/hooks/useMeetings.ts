// Custom hook for meetings management using React Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { meetingsService } from '../services/meetings.service';
import type { CreateMeetingDto, UpdateMeetingDto } from '@/types';
import { toast } from 'sonner';

export function useMeetings() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: meetings = [], isLoading, error } = useQuery({
    queryKey: ['meetings'],
    queryFn: () => meetingsService.getUserMeetings(token!),
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    meetings,
    isLoading,
    error,
  };
}

export function useMeeting(meetingId: string) {
  const { token } = useAuthStore();

  const { data: meeting, isLoading, error } = useQuery({
    queryKey: ['meetings', meetingId],
    queryFn: () => meetingsService.getMeeting(meetingId, token!),
    enabled: !!token && !!meetingId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    meeting,
    isLoading,
    error,
  };
}

export function useCreateMeeting() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeetingDto) =>
      meetingsService.createMeeting(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast.success('Toplantı başarıyla oluşturuldu');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Toplantı oluşturulamadı');
    },
  });
}

export function useUpdateMeeting(meetingId: string) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMeetingDto) =>
      meetingsService.updateMeeting(meetingId, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meetings', meetingId] });
      toast.success('Toplantı güncellendi');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Toplantı güncellenemedi');
    },
  });
}

export function useDeleteMeeting() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingId: string) =>
      meetingsService.cancelMeeting(meetingId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast.success('Toplantı iptal edildi');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Toplantı iptal edilemedi');
    },
  });
}
