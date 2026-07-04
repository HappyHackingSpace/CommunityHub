// src/modules/notifications/application/services/notification.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type {
  INotificationRepository,
  INotificationPreferenceRepository,
  INotificationTemplateRepository,
} from '../../domain/repositories';
import { Notification, ActionButton } from '../../domain/entities';
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationPriority,
} from '../../domain/enums';
import { NotificationQueueService } from '../../infrastructure/queue/notification-queue.service';

export interface CreateNotificationDto {
  userId: string;
  userEmail: string;
  type: NotificationType;
  channel: NotificationChannel;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
  actionButtons?: ActionButton[];
  groupKey?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
    @Inject('INotificationPreferenceRepository')
    private readonly preferenceRepository: INotificationPreferenceRepository,
    @Inject('INotificationTemplateRepository')
    private readonly templateRepository: INotificationTemplateRepository,
    private readonly queueService: NotificationQueueService,
  ) {}

  async createAndSendNotification(dto: CreateNotificationDto): Promise<Notification | null> {
    try {
      // Check user preferences
      const preference = await this.preferenceRepository.findByUserIdAndType(
        dto.userId,
        dto.type,
      );

      if (preference && !preference.isChannelEnabled(dto.channel)) {
        this.logger.debug(
          `Channel ${dto.channel} is disabled for user ${dto.userId} and type ${dto.type}`,
        );
        return null;
      }

      // Check Do Not Disturb mode
      const isCritical = dto.priority === NotificationPriority.CRITICAL;
      if (preference && !preference.shouldSendNotification(isCritical)) {
        this.logger.debug(
          `User ${dto.userId} is in Do Not Disturb mode, deferring notification`,
        );
        // TODO: Queue for later delivery
        return null;
      }

      // Get template
      const template = await this.templateRepository.findByTypeAndChannel(
        dto.type,
        dto.channel,
      );

      if (!template) {
        this.logger.warn(
          `No template found for type ${dto.type} and channel ${dto.channel}`,
        );
        return null;
      }

      // Render template with metadata
      const rendered = template.render({
        ...dto.metadata,
        userEmail: dto.userEmail,
      });

      // Create notification
      const notification = new Notification(
        uuidv4(),
        dto.userId,
        dto.type,
        dto.channel,
        rendered.subject || 'Notification',
        rendered.body,
        dto.priority || NotificationPriority.MEDIUM,
        { ...dto.metadata, userEmail: dto.userEmail },
        dto.actionButtons,
        dto.groupKey,
      );

      // Save notification
      const saved = await this.notificationRepository.save(notification);

      // Add to queue for async processing
      await this.queueService.addNotificationJob(saved);

      this.logger.log(
        `Created and queued notification ${saved.id} for user ${dto.userId}`,
      );

      return saved;
    } catch (error) {
      this.logger.error(
        `Failed to create notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getUserNotifications(
    userId: string,
    limit?: number,
  ): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId, limit);
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findUnreadByUserId(userId);
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(
      notificationId,
    );

    if (notification) {
      notification.markAsRead();
      await this.notificationRepository.save(notification);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  async archiveNotification(notificationId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(
      notificationId,
    );

    if (notification) {
      notification.archive();
      await this.notificationRepository.save(notification);
    }
  }
}
