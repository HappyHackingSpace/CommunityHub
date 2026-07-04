import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { MeetingUpdatedEvent } from '../../domain/events/meeting-updated.event';
import { MeetingReminderService } from '../services/meeting-reminder.service';
import type { IMeetingRepository } from '../../domain/repositories/meeting.repository.interface';

@EventsHandler(MeetingUpdatedEvent)
export class MeetingUpdatedHandler implements IEventHandler<MeetingUpdatedEvent> {
  private readonly logger = new Logger(MeetingUpdatedHandler.name);

  constructor(
    private readonly meetingReminderService: MeetingReminderService,
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async handle(event: MeetingUpdatedEvent): Promise<void> {
    this.logger.log(`Handling MeetingUpdatedEvent for meeting ${event.meetingId}`);

    try {
      // Fetch the updated meeting
      const meeting = await this.meetingRepository.findById(event.meetingId);
      if (!meeting) {
        this.logger.warn(`Meeting ${event.meetingId} not found`);
        return;
      }

      // Reschedule meeting reminders (cancel old ones and create new)
      await this.meetingReminderService.rescheduleMeetingReminders(meeting);

      this.logger.log(`Successfully rescheduled reminders for meeting ${event.meetingId}`);
    } catch (error) {
      this.logger.error(
        `Failed to reschedule reminders for meeting ${event.meetingId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
