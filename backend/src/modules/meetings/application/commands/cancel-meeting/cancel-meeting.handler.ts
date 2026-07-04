import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CancelMeetingCommand } from './cancel-meeting.command';
import { Meeting } from '../../../domain/entities/meeting.entity';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IMeetingRepository } from '../../../domain/repositories/meeting.repository.interface';

@CommandHandler(CancelMeetingCommand)
export class CancelMeetingHandler implements ICommandHandler<CancelMeetingCommand> {
  constructor(
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CancelMeetingCommand): Promise<Meeting> {
    const meeting = await this.meetingRepository.findById(command.meetingId);
    
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // Only organizer can cancel meeting
    if (meeting.organizerId !== command.organizerId) {
      throw new ForbiddenException('Only meeting organizer can cancel the meeting');
    }

    meeting.cancelMeeting();

    const updatedMeeting = await this.meetingRepository.update(meeting);

    // Publish domain events if any
    const events = updatedMeeting.events;
    events.forEach(event => this.eventBus.publish(event));
    updatedMeeting.clearEvents();

    return updatedMeeting;
  }
}