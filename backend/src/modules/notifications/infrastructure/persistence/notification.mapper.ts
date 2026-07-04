// src/modules/notifications/infrastructure/persistence/notification.mapper.ts
import { Notification } from '../../domain/entities';
import { NotificationSchema } from './notification.schema';

export class NotificationMapper {
  static toDomain(schema: NotificationSchema): Notification {
    const notification = new Notification(
      schema.id,
      schema.userId,
      schema.type,
      schema.channel,
      schema.title,
      schema.message,
      schema.priority,
      schema.metadata,
      schema.actionButtons,
      schema.groupKey,
      schema.createdAt,
      schema.updatedAt,
    );

    // Set private fields using reflection or direct assignment
    // Since we can't access private fields directly, we'll use Object.defineProperty
    Object.defineProperty(notification, '_status', { value: schema.status, writable: true });
    Object.defineProperty(notification, '_readAt', { value: schema.readAt, writable: true });
    Object.defineProperty(notification, '_sentAt', { value: schema.sentAt, writable: true });
    Object.defineProperty(notification, '_failureReason', { value: schema.failureReason, writable: true });
    Object.defineProperty(notification, '_retryCount', { value: schema.retryCount, writable: true });

    return notification;
  }

  static toSchema(notification: Notification): NotificationSchema {
    const schema = new NotificationSchema();
    schema.id = notification.id;
    schema.userId = notification.userId;
    schema.type = notification.type;
    schema.channel = notification.channel;
    schema.status = notification.status;
    schema.priority = notification.priority;
    schema.title = notification.title;
    schema.message = notification.message;
    schema.metadata = notification.metadata;
    schema.actionButtons = notification.actionButtons;
    schema.groupKey = notification.groupKey;
    schema.readAt = notification.readAt;
    schema.sentAt = notification.sentAt;
    schema.failureReason = notification.failureReason;
    schema.retryCount = notification.retryCount;
    schema.createdAt = notification.createdAt;
    schema.updatedAt = notification.updatedAt;

    return schema;
  }
}
