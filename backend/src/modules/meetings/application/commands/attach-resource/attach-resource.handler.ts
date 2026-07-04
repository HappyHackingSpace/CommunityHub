import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AttachResourceCommand } from './attach-resource.command';
import type { IMeetingResourceRepository } from '../../../domain/repositories/meeting-resource.repository.interface';
import { MeetingResource } from '../../../domain/entities/meeting-resource.entity';

@CommandHandler(AttachResourceCommand)
export class AttachResourceHandler implements ICommandHandler<AttachResourceCommand> {
  constructor(
    @Inject('IMeetingResourceRepository')
    private readonly resourceRepository: IMeetingResourceRepository,
  ) {}

  async execute(command: AttachResourceCommand): Promise<string> {
    const { meetingId, title, url, type, description, uploadedBy } = command;

    const resource = MeetingResource.create({
      meetingId,
      title,
      url,
      type,
      description,
      uploadedBy,
    });

    const saved = await this.resourceRepository.save(resource);
    return saved.id;
  }
}
