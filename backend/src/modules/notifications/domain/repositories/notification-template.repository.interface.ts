// src/modules/notifications/domain/repositories/notification-template.repository.interface.ts
import { NotificationTemplate } from '../entities';
import { NotificationType, NotificationChannel } from '../enums';

export interface INotificationTemplateRepository {
  save(template: NotificationTemplate): Promise<NotificationTemplate>;
  findById(id: string): Promise<NotificationTemplate | null>;
  findByTypeAndChannel(
    type: NotificationType,
    channel: NotificationChannel,
  ): Promise<NotificationTemplate | null>;
  findAll(): Promise<NotificationTemplate[]>;
  delete(id: string): Promise<void>;
}
