import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCommunityCommand } from './create-community.command';
import { Community } from 'src/modules/communities/domain/entities/community.entity';
import { RoleType } from 'src/modules/iam/domain/enums/role-type.enum';
import type { ICommunityRepository } from 'src/modules/communities/domain/repositories/community.repository.interface';
import type { IUserRepository } from 'src/modules/iam/domain/repositories/user.repository.interface';

@CommandHandler(CreateCommunityCommand)
export class CreateCommunityHandler implements ICommandHandler<CreateCommunityCommand> {
  constructor(
    @Inject('ICommunityRepository')
    private readonly communityRepository: ICommunityRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
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

    // Set tenant and FOUNDER role for community creator
    const founder = await this.userRepository.findById(command.founderId);
    if (founder && community.tenantId) {
      // Set primary tenant if not already set
      if (!founder.primaryTenantId) {
        founder.setPrimaryTenantId(community.tenantId);
      }
      // Add FOUNDER role
      if (!founder.hasRole(RoleType.FOUNDER)) {
        founder.assignRole(RoleType.FOUNDER, command.founderId);
      }
      await this.userRepository.update(founder);
    }

    return community.id;
  }
}
