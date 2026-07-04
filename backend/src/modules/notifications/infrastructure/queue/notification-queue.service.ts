// src/modules/notifications/infrastructure/queue/notification-queue.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Notification } from '../../domain/entities';

export const NOTIFICATION_QUEUE = 'notifications';

export interface NotificationJob {
  notificationId: string;
  userId: string;
  priority: number;
}

export interface DigestJob {
  userId: string;
  frequency: 'daily' | 'weekly';
}

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue,
  ) {}

  async addNotificationJob(notification: Notification): Promise<void> {
    try {
      await this.notificationQueue.add(
        'send-notification',
        {
          notificationId: notification.id,
          userId: notification.userId,
          priority: this.getPriorityValue(notification.priority),
        } as NotificationJob,
        {
          priority: this.getPriorityValue(notification.priority),
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      this.logger.debug(`Added notification ${notification.id} to queue`);
    } catch (error) {
      this.logger.error(
        `Failed to add notification to queue: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async addDailyDigestJob(userId: string): Promise<void> {
    await this.notificationQueue.add(
      'send-daily-digest',
      { userId, frequency: 'daily' } as DigestJob,
      {
        priority: 5,
        attempts: 2,
        removeOnComplete: true,
      },
    );
  }

  async addWeeklyDigestJob(userId: string): Promise<void> {
    await this.notificationQueue.add(
      'send-weekly-digest',
      { userId, frequency: 'weekly' } as DigestJob,
      {
        priority: 5,
        attempts: 2,
        removeOnComplete: true,
      },
    );
  }

  private getPriorityValue(priority: string): number {
    const priorityMap: Record<string, number> = {
      CRITICAL: 1,
      HIGH: 3,
      MEDIUM: 5,
      LOW: 10,
    };
    return priorityMap[priority] || 5;
  }
}
