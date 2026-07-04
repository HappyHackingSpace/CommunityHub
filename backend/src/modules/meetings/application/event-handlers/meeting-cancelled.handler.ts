import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { MeetingCancelledEvent } from '../../domain/events/meeting-cancelled.event';
import { MeetingReminderService } from '../services/meeting-reminder.service';

@EventsHandler(MeetingCancelledEvent)
export class MeetingCancelledHandler implements IEventHandler<MeetingCancelledEvent> {
  private readonly logger = new Logger(MeetingCancelledHandler.name);

  constructor(private readonly meetingReminderService: MeetingReminderService) {}

  async handle(event: MeetingCancelledEvent): Promise<void> {
    this.logger.log(`Handling MeetingCancelledEvent for meeting ${event.meetingId}`);

    try {
      // Cancel all meeting reminders
      await this.meetingReminderService.cancelMeetingReminders(event.meetingId);

      this.logger.log(`Successfully cancelled reminders for meeting ${event.meetingId}`);
    } catch (error) {
      this.logger.error(
        `Failed to cancel reminders for meeting ${event.meetingId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
