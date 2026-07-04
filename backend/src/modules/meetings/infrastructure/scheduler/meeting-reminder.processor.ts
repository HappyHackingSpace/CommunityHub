import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import type { Job } from 'bull';
import { MeetingReminderEvent } from '../../domain/events/meeting-reminder.event';

export interface MeetingReminderJobData {
  meetingId: string;
  title: string;
  startTime: Date;
  participantIds: string[];
  reminderType: '24h' | '1h' | '15m';
}

@Processor('meeting-reminders')
export class MeetingReminderProcessor {
  private readonly logger = new Logger(MeetingReminderProcessor.name);

  constructor(private readonly eventBus: EventBus) {}

  @Process('send-reminder')
  async handleMeetingReminder(job: Job<MeetingReminderJobData>) {
    this.logger.log(
      `Processing meeting reminder for meeting ${job.data.meetingId} - ${job.data.reminderType}`,
    );

    try {
      const { meetingId, title, startTime, participantIds, reminderType } = job.data;

      // Map reminderType from job format to event format
      const reminderTypeMap: Record<'24h' | '1h' | '15m', 'one_day' | 'one_hour'> = {
        '24h': 'one_day',
        '1h': 'one_hour',
        '15m': 'one_hour',
      };

      // Publish meeting reminder event
      const reminderEvent = new MeetingReminderEvent(
        meetingId,
        reminderTypeMap[reminderType],
        title,
        startTime,
        participantIds,
      );

      this.eventBus.publish(reminderEvent);

      this.logger.log(
        `Successfully sent ${reminderType} reminder for meeting ${meetingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process meeting reminder: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
