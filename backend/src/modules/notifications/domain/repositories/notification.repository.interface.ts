// src/modules/notifications/domain/repositories/notification.repository.interface.ts
import { Notification } from '../entities';
import { NotificationStatus, NotificationType } from '../enums';

export interface INotificationRepository {
  save(notification: Notification): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string, limit?: number): Promise<Notification[]>;
  findUnreadByUserId(userId: string): Promise<Notification[]>;
  findPendingNotifications(limit?: number): Promise<Notification[]>;
  findByGroupKey(groupKey: string): Promise<Notification[]>;
  findByUserIdAndType(
    userId: string,
    type: NotificationType,
  ): Promise<Notification[]>;
  updateStatus(id: string, status: NotificationStatus): Promise<void>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  delete(id: string): Promise<void>;
  deleteOldNotifications(olderThanDays: number): Promise<number>;
}
