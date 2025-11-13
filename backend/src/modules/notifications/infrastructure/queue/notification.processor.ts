// src/modules/notifications/infrastructure/queue/notification.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Logger, Inject } from '@nestjs/common';
import type { Job } from 'bull';
import type { NotificationJob, DigestJob } from './notification-queue.service';
import { NOTIFICATION_QUEUE } from './notification-queue.service';
import type { INotificationRepository } from '../../domain/repositories';
import { NotificationChannel } from '../../domain/enums';
import { NotificationWebSocketService } from '../websocket/notification-websocket.service';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
    private readonly wsService: NotificationWebSocketService,
  ) {}

  @Process('send-notification')
  async handleNotification(job: Job<NotificationJob>) {
    const { notificationId } = job.data;

    try {
      const notification = await this.notificationRepository.findById(
        notificationId,
      );

      if (!notification) {
        this.logger.warn(`Notification ${notificationId} not found`);
        return;
      }

      // Send notification based on channel
      let success = false;

      switch (notification.channel) {
        case NotificationChannel.IN_APP:
          // In-app notifications are stored in DB
          // Send via WebSocket if user is online
          if (this.wsService.isUserOnline(notification.userId)) {
            this.wsService.sendNotificationToUser(notification.userId, notification);
            this.logger.log(
              `Sent real-time notification ${notificationId} to user ${notification.userId} via WebSocket`,
            );
          } else {
            this.logger.debug(
              `User ${notification.userId} is offline, notification ${notificationId} stored for later retrieval`,
            );
          }
          notification.markAsSent();
          success = true;
          break;

        case NotificationChannel.EMAIL:
        case NotificationChannel.PUSH:
          this.logger.warn(`Channel ${notification.channel} is not supported (only IN_APP is enabled)`);
          success = false;
          break;

        default:
          this.logger.warn(`Unknown notification channel: ${notification.channel}`);
          success = false;
      }

      if (success) {
        notification.markAsSent();
        this.logger.log(
          `Successfully processed notification ${notificationId} via ${notification.channel}`,
        );
      } else {
        notification.markAsFailed('Failed to send notification');
        this.logger.error(`Failed to send notification ${notificationId}`);
      }

      await this.notificationRepository.save(notification);
    } catch (error) {
      this.logger.error(
        `Error processing notification ${notificationId}: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw to trigger retry
    }
  }

  @Process('send-daily-digest')
  async handleDailyDigest(job: Job<DigestJob>) {
    this.logger.log(`Processing daily digest for user ${job.data.userId}`);
    // TODO: Implement digest logic (currently disabled - in-app only)
  }

  @Process('send-weekly-digest')
  async handleWeeklyDigest(job: Job<DigestJob>) {
    this.logger.log(`Processing weekly digest for user ${job.data.userId}`);
    // TODO: Implement digest logic (currently disabled - in-app only)
  }
}
