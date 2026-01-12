import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCommunityCommand } from './create-community.command';
import { Community } from 'src/modules/communities/domain/entities/community.entity';
import type { ICommunityRepository } from 'src/modules/communities/domain/repositories/community.repository.interface';

@CommandHandler(CreateCommunityCommand)
export class CreateCommunityHandler implements ICommandHandler<CreateCommunityCommand> {
  constructor(
    @Inject('ICommunityRepository')
    private readonly communityRepository: ICommunityRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateCommunityCommand): Promise<string> {
    const community = Community.create({
      name: command.name,
      description: command.description,
      visibility: command.visibility,
      founderId: command.founderId,
      logoUrl: command.logoUrl,
      websiteUrl: command.websiteUrl,
      tenantId: command.tenantId,
    });

    await this.communityRepository.create(community);

    return community.id;
  }
}
