import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeclineInvitationCommand } from './decline-invitation.command';
import { Meeting } from '../../../domain/entities/meeting.entity';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IMeetingRepository } from '../../../domain/repositories/meeting.repository.interface';

@CommandHandler(DeclineInvitationCommand)
export class DeclineInvitationHandler implements ICommandHandler<DeclineInvitationCommand> {
  constructor(
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async execute(command: DeclineInvitationCommand): Promise<Meeting> {
    const meeting = await this.meetingRepository.findById(command.meetingId);
    
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // Check if user is a participant
    const isParticipant = meeting.participants.some(p => p.userId === command.participantId);
    if (!isParticipant) {
      throw new ForbiddenException('User is not invited to this meeting');
    }

    meeting.declineInvitation(command.participantId);

    return await this.meetingRepository.update(meeting);
  }
}