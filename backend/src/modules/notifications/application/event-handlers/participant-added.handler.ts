// src/modules/notifications/application/event-handlers/participant-added.handler.ts
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { ParticipantAddedEvent } from '../../../meetings/domain/events/participant-added.event';
import { NotificationService } from '../services/notification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '../../domain/enums';

@Injectable()
@EventsHandler(ParticipantAddedEvent)
export class ParticipantAddedHandler implements IEventHandler<ParticipantAddedEvent> {
  private readonly logger = new Logger(ParticipantAddedHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: ParticipantAddedEvent) {
    this.logger.log(
      `Handling participant added event for meeting ${event.meetingId}`,
    );

    try {
      // Send in-app meeting invitation notification
      await this.notificationService.createAndSendNotification({
        userId: event.participantId,
        userEmail: '', // Not needed for in-app notifications
        type: NotificationType.MEETING_INVITATION,
        channel: NotificationChannel.IN_APP,
        priority: NotificationPriority.HIGH,
        metadata: {
          meetingId: event.meetingId,
        },
        actionButtons: [
          {
            label: 'Accept',
            action: 'accept_invitation',
            url: `${process.env.FRONTEND_URL}/meetings/${event.meetingId}/accept`,
          },
          {
            label: 'Decline',
            action: 'decline_invitation',
            url: `${process.env.FRONTEND_URL}/meetings/${event.meetingId}/decline`,
          },
          {
            label: 'View Details',
            action: 'view_meeting',
            url: `${process.env.FRONTEND_URL}/meetings/${event.meetingId}`,
          },
        ],
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle participant added event: ${error.message}`,
        error.stack,
      );
    }
  }
}
