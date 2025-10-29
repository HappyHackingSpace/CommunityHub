import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AcceptInvitationCommand } from './accept-invitation.command';
import { Meeting } from '../../../domain/entities/meeting.entity';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IMeetingRepository } from '../../../domain/repositories/meeting.repository.interface';

@CommandHandler(AcceptInvitationCommand)
export class AcceptInvitationHandler implements ICommandHandler<AcceptInvitationCommand> {
  constructor(
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async execute(command: AcceptInvitationCommand): Promise<Meeting> {
    const meeting = await this.meetingRepository.findById(command.meetingId);
    
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // Check if user is a participant
    const isParticipant = meeting.participants.some(p => p.userId === command.participantId);
    if (!isParticipant) {
      throw new ForbiddenException('User is not invited to this meeting');
    }

    meeting.acceptInvitation(command.participantId);

    return await this.meetingRepository.update(meeting);
  }
}