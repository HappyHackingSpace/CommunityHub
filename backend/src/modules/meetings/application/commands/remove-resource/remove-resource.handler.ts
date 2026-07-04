import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RemoveResourceCommand } from './remove-resource.command';
import type { IMeetingResourceRepository } from '../../../domain/repositories/meeting-resource.repository.interface';
import type { IMeetingRepository } from '../../../domain/repositories/meeting.repository.interface';

@CommandHandler(RemoveResourceCommand)
export class RemoveResourceHandler implements ICommandHandler<RemoveResourceCommand> {
  constructor(
    @Inject('IMeetingResourceRepository')
    private readonly meetingResourceRepository: IMeetingResourceRepository,
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async execute(command: RemoveResourceCommand): Promise<void> {
    const { resourceId, userId } = command;

    // Find resource
    const resource = await this.meetingResourceRepository.findById(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    // Verify user has permission (meeting organizer or uploader)
    const meeting = await this.meetingRepository.findById(resource.meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    if (meeting.organizerId !== userId && resource.uploadedBy !== userId) {
      throw new Error('Only the meeting organizer or uploader can remove this resource');
    }

    // Delete resource
    await this.meetingResourceRepository.delete(resourceId);
  }
}
