import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { UpdateMeetingCommand } from './update-meeting.command';
import { Meeting } from '../../../domain/entities/meeting.entity';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IMeetingRepository } from '../../../domain/repositories/meeting.repository.interface';

@CommandHandler(UpdateMeetingCommand)
export class UpdateMeetingHandler implements ICommandHandler<UpdateMeetingCommand> {
  constructor(
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateMeetingCommand): Promise<Meeting> {
    const meeting = await this.meetingRepository.findById(command.meetingId);
    
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    if (meeting.organizerId !== command.organizerId) {
      throw new ForbiddenException('Only meeting organizer can update the meeting');
    }

    meeting.updateMeeting({
      title: command.title,
      description: command.description,
      startTime: command.startTime,
      duration: command.duration,
    });

    const updatedMeeting = await this.meetingRepository.update(meeting);

    // Publish domain events
    const events = updatedMeeting.events;
    events.forEach(event => this.eventBus.publish(event));
    updatedMeeting.clearEvents();

    return updatedMeeting;
  }
}