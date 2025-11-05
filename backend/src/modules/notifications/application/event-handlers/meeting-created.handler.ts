// src/modules/notifications/application/event-handlers/meeting-created.handler.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MeetingCreatedEvent } from '../../../meetings/domain/events/meeting-created.event';
import { NotificationService } from '../services/notification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '../../domain/enums';

@Injectable()
export class MeetingCreatedHandler {
  private readonly logger = new Logger(MeetingCreatedHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('meeting.created')
  async handleMeetingCreated(event: MeetingCreatedEvent) {
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
