
import { apiClient } from './api-client';
import { Notification, NotificationPreferences } from '../features/notifications/types/notification.types';

// --- Notifications ---

export const getNotifications = (token?: string): Promise<Notification[]> => {
  return apiClient.get('/notifications', token);
};

export const getUnreadNotifications = (token?: string): Promise<Notification[]> => {
  return apiClient.get('/notifications/unread', token);
};

export const markNotificationAsRead = (id: string, token?: string): Promise<void> => {
  return apiClient.patch(`/notifications/${id}/read`, {}, token);
};

export const markAllNotificationsAsRead = (token?: string): Promise<void> => {
  return apiClient.patch('/notifications/read-all', {}, token);
};

export const archiveNotification = (id: string, token?: string): Promise<void> => {
  return apiClient.delete(`/notifications/${id}`, token);
};

// --- Notification Preferences ---

export const getNotificationPreferences = (token?: string): Promise<NotificationPreferences> => {
  return apiClient.get('/notification-preferences', token);
};

export const updateChannelPreference = (channel: string, enabled: boolean, token?: string): Promise<void> => {
  return apiClient.patch('/notification-preferences/channel', { channel, enabled }, token);
};

export const updateDoNotDisturb = (schedule: { enabled: boolean; startTime?: string; endTime?: string }, token?: string): Promise<void> => {
  return apiClient.patch('/notification-preferences/do-not-disturb', schedule, token);
};

export const setBypassCritical = (bypass: boolean, token?: string): Promise<void> => {
  return apiClient.patch('/notification-preferences/bypass-critical', { bypass }, token);
};
