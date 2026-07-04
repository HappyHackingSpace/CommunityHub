import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateMeetingCommand } from './create-meeting.command';
import { Meeting } from '../../../domain/entities/meeting.entity';
import { Inject } from '@nestjs/common';
import type { IMeetingRepository } from '../../../domain/repositories/meeting.repository.interface';

@CommandHandler(CreateMeetingCommand)
export class CreateMeetingHandler implements ICommandHandler<CreateMeetingCommand> {
  constructor(
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateMeetingCommand): Promise<Meeting> {
    const meeting = Meeting.create({
      title: command.title,
      description: command.description,
      startTime: command.startTime,
      duration: command.duration,
      organizerId: command.organizerId,
      meetingUrl: command.meetingUrl,
    });

    // Add participants if provided
    if (command.participantIds && command.participantIds.length > 0) {
      command.participantIds.forEach(participantId => {
        meeting.addParticipant(participantId);
      });
    }

    const savedMeeting = await this.meetingRepository.save(meeting);

    // Publish domain events
    const events = savedMeeting.events;
    events.forEach(event => this.eventBus.publish(event));
    savedMeeting.clearEvents();

    return savedMeeting;
  }
}