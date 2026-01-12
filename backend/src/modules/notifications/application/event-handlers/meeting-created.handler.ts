// src/modules/notifications/application/event-handlers/meeting-created.handler.ts
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { MeetingCreatedEvent } from '../../../meetings/domain/events/meeting-created.event';
import { NotificationService } from '../services/notification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '../../domain/enums';

@Injectable()
@EventsHandler(MeetingCreatedEvent)
export class MeetingCreatedHandler implements IEventHandler<MeetingCreatedEvent> {
  private readonly logger = new Logger(MeetingCreatedHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: MeetingCreatedEvent) {
    this.logger.log(`Handling meeting created event for meeting ${event.meetingId}`);

    try {
      // This will be called when a meeting is created
      // Actual invitations are sent when participants are added
      this.logger.debug(
        `Meeting ${event.meetingId} created by ${event.organizerId} at ${event.startTime}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle meeting created event: ${error.message}`,
        error.stack,
      );
    }
  }
}
