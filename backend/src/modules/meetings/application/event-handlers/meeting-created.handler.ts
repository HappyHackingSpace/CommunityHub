import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { MeetingCreatedEvent } from '../../domain/events/meeting-created.event';
import { MeetingReminderService } from '../services/meeting-reminder.service';
import type { IMeetingRepository } from '../../domain/repositories/meeting.repository.interface';

@EventsHandler(MeetingCreatedEvent)
export class MeetingCreatedHandler implements IEventHandler<MeetingCreatedEvent> {
  private readonly logger = new Logger(MeetingCreatedHandler.name);

  constructor(
    private readonly meetingReminderService: MeetingReminderService,
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async handle(event: MeetingCreatedEvent): Promise<void> {
    this.logger.log(`Handling MeetingCreatedEvent for meeting ${event.meetingId}`);

    try {
      // Fetch the created meeting
      const meeting = await this.meetingRepository.findById(event.meetingId);
      if (!meeting) {
        this.logger.warn(`Meeting ${event.meetingId} not found`);
        return;
      }

      // Schedule meeting reminders
      await this.meetingReminderService.scheduleMeetingReminders(meeting);

      this.logger.log(`Successfully scheduled reminders for meeting ${event.meetingId}`);
    } catch (error) {
      this.logger.error(
        `Failed to schedule reminders for meeting ${event.meetingId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
