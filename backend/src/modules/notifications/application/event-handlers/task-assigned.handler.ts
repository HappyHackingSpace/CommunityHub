// src/modules/notifications/application/event-handlers/task-assigned.handler.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TaskAssignedEvent } from '../../../tasks/domain/events';
import { NotificationService } from '../services/notification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '../../domain/enums';

@Injectable()
export class TaskAssignedHandler {
  private readonly logger = new Logger(TaskAssignedHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('task.assigned')
  async handleTaskAssigned(event: TaskAssignedEvent) {
    this.logger.log(
      `Handling task assigned event for task ${event.taskId} to user ${event.assigneeId}`,
    );

    try {
      // Send in-app notification to assignee
      await this.notificationService.createAndSendNotification({
        userId: event.assigneeId,
        userEmail: '', // Not needed for in-app notifications
        type: NotificationType.TASK_ASSIGNED,
        channel: NotificationChannel.IN_APP,
        priority: NotificationPriority.MEDIUM,
        metadata: {
          taskId: event.taskId,
          taskTitle: event.taskTitle,
          assignerId: event.assignerId,
          dueDate: event.dueDate,
        },
        actionButtons: [
          {
            label: 'View Task',
            action: 'view_task',
            url: `${process.env.FRONTEND_URL}/tasks/${event.taskId}`,
          },
          {
            label: 'Accept',
            action: 'accept_task',
            url: `${process.env.FRONTEND_URL}/tasks/${event.taskId}/accept`,
          },
        ],
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle task assigned event: ${error.message}`,
        error.stack,
      );
    }
  }
}
