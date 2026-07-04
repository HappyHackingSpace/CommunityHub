import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { AddParticipantCommand } from './add-participant.command';
import { Meeting } from '../../../domain/entities/meeting.entity';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IMeetingRepository } from '../../../domain/repositories/meeting.repository.interface';

@CommandHandler(AddParticipantCommand)
export class AddParticipantHandler implements ICommandHandler<AddParticipantCommand> {
  constructor(
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AddParticipantCommand): Promise<Meeting> {
    const meeting = await this.meetingRepository.findById(command.meetingId);
    
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // Only organizer can add participants
    if (meeting.organizerId !== command.organizerId) {
      throw new ForbiddenException('Only meeting organizer can add participants');
    }

    meeting.addParticipant(command.participantId);

    const updatedMeeting = await this.meetingRepository.update(meeting);

    // Publish domain events
    const events = updatedMeeting.events;
    events.forEach(event => this.eventBus.publish(event));
    updatedMeeting.clearEvents();

    return updatedMeeting;
  }
}