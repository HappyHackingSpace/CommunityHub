// src/modules/notifications/application/event-handlers/task-comment-added.handler.ts
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { TaskCommentAddedEvent } from '../../../tasks/domain/events';
import { NotificationService } from '../services/notification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '../../domain/enums';

@Injectable()
@EventsHandler(TaskCommentAddedEvent)
export class TaskCommentAddedHandler implements IEventHandler<TaskCommentAddedEvent> {
  private readonly logger = new Logger(TaskCommentAddedHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: TaskCommentAddedEvent) {
    this.logger.log(
      `Handling task comment added event for task ${event.taskId}`,
    );

    try {
      // Don't notify the commenter
      if (event.authorId === event.taskOwnerId) {
        return;
      }

      // Send in-app notification to task owner
      await this.notificationService.createAndSendNotification({
        userId: event.taskOwnerId,
        userEmail: '', // Not needed for in-app notifications
        type: NotificationType.TASK_COMMENT_ADDED,
        channel: NotificationChannel.IN_APP,
        priority: NotificationPriority.LOW,
        metadata: {
          taskId: event.taskId,
          taskTitle: event.taskTitle,
          commentId: event.commentId,
          authorId: event.authorId,
          commentPreview: event.content.substring(0, 100),
        },
        actionButtons: [
          {
            label: 'View Comment',
            action: 'view_comment',
            url: `${process.env.FRONTEND_URL}/tasks/${event.taskId}#comment-${event.commentId}`,
          },
          {
            label: 'Reply',
            action: 'reply_comment',
            url: `${process.env.FRONTEND_URL}/tasks/${event.taskId}#reply`,
          },
        ],
        groupKey: `task-${event.taskId}-comments`, // For batching
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle task comment added event: ${error.message}`,
        error.stack,
      );
    }
  }
}
