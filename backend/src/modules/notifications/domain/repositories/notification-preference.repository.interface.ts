// src/modules/notifications/domain/repositories/notification-preference.repository.interface.ts
import { NotificationPreference } from '../entities';
import { NotificationType } from '../enums';

export interface INotificationPreferenceRepository {
  save(preference: NotificationPreference): Promise<NotificationPreference>;
  findById(id: string): Promise<NotificationPreference | null>;
  findByUserId(userId: string): Promise<NotificationPreference[]>;
  findByUserIdAndType(
    userId: string,
    type: NotificationType,
  ): Promise<NotificationPreference | null>;
  createDefaultPreferences(userId: string): Promise<NotificationPreference[]>;
  delete(id: string): Promise<void>;
}
