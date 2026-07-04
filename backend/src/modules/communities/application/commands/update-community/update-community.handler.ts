import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateCommunityCommand } from './update-community.command';
import type { ICommunityRepository } from 'src/modules/communities/domain/repositories/community.repository.interface';

@CommandHandler(UpdateCommunityCommand)
export class UpdateCommunityHandler implements ICommandHandler<UpdateCommunityCommand> {
  constructor(
    @Inject('ICommunityRepository')
    private readonly communityRepository: ICommunityRepository,
  ) {}

  async execute(command: UpdateCommunityCommand): Promise<void> {
    const community = await this.communityRepository.findById(command.communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    community.update({
      name: command.name,
      description: command.description,
      visibility: command.visibility,
      logoUrl: command.logoUrl,
      websiteUrl: command.websiteUrl,
    });

    await this.communityRepository.update(community);
  }
}
