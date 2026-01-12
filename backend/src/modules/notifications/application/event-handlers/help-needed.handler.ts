import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { HelpNeededEvent } from '../../../tasks/domain/events';
import { NotificationService } from '../services/notification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '../../domain/enums';

@Injectable()
@EventsHandler(HelpNeededEvent)
export class HelpNeededHandler implements IEventHandler<HelpNeededEvent> {
  private readonly logger = new Logger(HelpNeededHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: HelpNeededEvent) {
    this.logger.log(
      `Handling help needed event for task ${event.taskId} from user ${event.requestedBy}`,
    );

    try {
      // Notify task owner that help is needed
      // Note: This would typically notify task watchers or community
      // For now, we'll skip notification if no specific recipients are available
      // In a real scenario, you'd notify volunteer coordinators or community members
      this.logger.log(
        `Help requested for task ${event.taskId}: ${event.message}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle help needed event: ${error.message}`,
        error.stack,
      );
    }
  }
}
