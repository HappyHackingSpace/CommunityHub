import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SubmitRsvpCommand } from './submit-rsvp.command';
import type { IRsvpResponseRepository } from '../../../domain/repositories/rsvp-response.repository.interface';
import { RsvpResponse } from '../../../domain/entities/rsvp-response.entity';

@CommandHandler(SubmitRsvpCommand)
export class SubmitRsvpHandler implements ICommandHandler<SubmitRsvpCommand> {
  constructor(
    @Inject('IRsvpResponseRepository')
    private readonly rsvpRepository: IRsvpResponseRepository,
  ) {}

  async execute(command: SubmitRsvpCommand): Promise<string> {
    const { meetingId, userId, status, notes } = command;

    // Check if RSVP already exists
    const existingRsvp = await this.rsvpRepository.findByMeetingAndUser(
      meetingId,
      userId,
    );

    if (existingRsvp) {
      // Update existing RSVP
      existingRsvp.updateStatus(status, notes);
      const updated = await this.rsvpRepository.save(existingRsvp);
      return updated.id;
    } else {
      // Create new RSVP
      const rsvp = RsvpResponse.create({
        meetingId,
        userId,
        status,
        notes,
      });

      const saved = await this.rsvpRepository.save(rsvp);
      return saved.id;
    }
  }
}
