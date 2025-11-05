
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotificationPreferences,
  updateChannelPreference,
  updateDoNotDisturb,
  setBypassCritical,
} from '@/lib/notifications-api';
import { useAuthStore } from '@/store/auth-store';

export const useNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => getNotificationPreferences(token || undefined),
    enabled: !!token,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
  };

  const updateChannelMutation = useMutation({
    mutationFn: ({ channel, enabled }: { channel: string; enabled: boolean }) =>
      updateChannelPreference(channel, enabled, token || undefined),
    onSuccess,
  });

  const updateDndMutation = useMutation({
    mutationFn: (schedule: { enabled: boolean; startTime?: string; endTime?: string }) =>
      updateDoNotDisturb(schedule, token || undefined),
    onSuccess,
  });

  const setBypassMutation = useMutation({
    mutationFn: (bypass: boolean) => setBypassCritical(bypass, token || undefined),
    onSuccess,
  });

  return {
    preferences,
    isLoading,
    updateChannel: updateChannelMutation.mutate,
    updateDnd: updateDndMutation.mutate,
    setBypass: setBypassMutation.mutate,
  };
};
