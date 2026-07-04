import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateResourceCommand } from './update-resource.command';
import { MeetingResource } from '../../../domain/entities/meeting-resource.entity';
import type { IMeetingResourceRepository } from '../../../domain/repositories/meeting-resource.repository.interface';
import type { IMeetingRepository } from '../../../domain/repositories/meeting.repository.interface';

@CommandHandler(UpdateResourceCommand)
export class UpdateResourceHandler implements ICommandHandler<UpdateResourceCommand> {
  constructor(
    @Inject('IMeetingResourceRepository')
    private readonly meetingResourceRepository: IMeetingResourceRepository,
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async execute(command: UpdateResourceCommand): Promise<MeetingResource> {
    const { resourceId, userId, title, url } = command;

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
      throw new Error('Only the meeting organizer or uploader can update this resource');
    }

    // Update resource
    resource.update({
      title,
      url,
    });

    // Save updated resource
    const savedResource = await this.meetingResourceRepository.save(resource);

    return savedResource;
  }
}
