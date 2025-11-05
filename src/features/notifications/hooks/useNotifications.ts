
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markNotificationAsRead as apiMarkAsRead,
  markAllNotificationsAsRead as apiMarkAllAsRead,
  archiveNotification as apiArchive,
} from '@/lib/notifications-api';
import { useAuthStore } from '@/store/auth-store';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(token || undefined),
    enabled: !!token,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiMarkAsRead(id, token || undefined),
    onSuccess,
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiMarkAllAsRead(token || undefined),
    onSuccess,
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => apiArchive(id, token || undefined),
    onSuccess,
  });

  return {
    notifications,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    archive: archiveMutation.mutate,
  };
};
