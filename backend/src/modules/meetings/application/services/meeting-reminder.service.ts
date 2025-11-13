import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Meeting } from '../../domain/entities/meeting.entity';
import { MeetingReminderJobData } from '../../infrastructure/scheduler/meeting-reminder.processor';

@Injectable()
export class MeetingReminderService {
  private readonly logger = new Logger(MeetingReminderService.name);

  constructor(
    @InjectQueue('meeting-reminders')
    private readonly reminderQueue: Queue<MeetingReminderJobData>,
  ) {}

  async scheduleMeetingReminders(meeting: Meeting): Promise<void> {
    const now = new Date();
    const startTime = meeting.startTime;

    // Calculate reminder times
    const twentyFourHoursBefore = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
    const oneHourBefore = new Date(startTime.getTime() - 60 * 60 * 1000);
    const fifteenMinutesBefore = new Date(startTime.getTime() - 15 * 60 * 1000);

    const jobData: Omit<MeetingReminderJobData, 'reminderType'> = {
      meetingId: meeting.id,
      title: meeting.title.value,
      startTime: meeting.startTime,
      participantIds: meeting.participants.map(p => p.userId),
    };

    // Schedule 24-hour reminder
    if (twentyFourHoursBefore > now) {
      await this.reminderQueue.add(
        'send-reminder',
        { ...jobData, reminderType: '24h' },
        {
          delay: twentyFourHoursBefore.getTime() - now.getTime(),
          jobId: `${meeting.id}-24h`,
          removeOnComplete: true,
        },
      );
      this.logger.log(`Scheduled 24-hour reminder for meeting ${meeting.id}`);
    }

    // Schedule 1-hour reminder
    if (oneHourBefore > now) {
      await this.reminderQueue.add(
        'send-reminder',
        { ...jobData, reminderType: '1h' },
        {
          delay: oneHourBefore.getTime() - now.getTime(),
          jobId: `${meeting.id}-1h`,
          removeOnComplete: true,
        },
      );
      this.logger.log(`Scheduled 1-hour reminder for meeting ${meeting.id}`);
    }

    // Schedule 15-minute reminder
    if (fifteenMinutesBefore > now) {
      await this.reminderQueue.add(
        'send-reminder',
        { ...jobData, reminderType: '15m' },
        {
          delay: fifteenMinutesBefore.getTime() - now.getTime(),
          jobId: `${meeting.id}-15m`,
          removeOnComplete: true,
        },
      );
      this.logger.log(`Scheduled 15-minute reminder for meeting ${meeting.id}`);
    }
  }

  async cancelMeetingReminders(meetingId: string): Promise<void> {
    try {
      // Remove all scheduled reminders for this meeting
      const jobs = await this.reminderQueue.getJobs(['delayed', 'waiting']);

      for (const job of jobs) {
        if (
          job.id === `${meetingId}-24h` ||
          job.id === `${meetingId}-1h` ||
          job.id === `${meetingId}-15m`
        ) {
          await job.remove();
          this.logger.log(`Cancelled reminder job ${job.id}`);
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to cancel reminders for meeting ${meetingId}: ${error.message}`,
        error.stack,
      );
    }
  }

  async rescheduleMeetingReminders(meeting: Meeting): Promise<void> {
    // First, cancel existing reminders
    await this.cancelMeetingReminders(meeting.id);

    // Then, schedule new reminders
    await this.scheduleMeetingReminders(meeting);
  }
}
