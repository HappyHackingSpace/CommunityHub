import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCommunityCommand } from './create-community.command';
import { Community } from 'src/modules/communities/domain/entities/community.entity';
import { CommunityMember } from 'src/modules/communities/domain/entities/community-member.entity';
import { CommunityMemberStatus } from 'src/modules/communities/domain/enums/community-member-status.enum';
import { RoleType } from 'src/modules/iam/domain/enums/role-type.enum';
import type { ICommunityRepository } from 'src/modules/communities/domain/repositories/community.repository.interface';
import type { ICommunityMemberRepository } from 'src/modules/communities/domain/repositories/community-member.repository.interface';
import type { IUserRepository } from 'src/modules/iam/domain/repositories/user.repository.interface';

@CommandHandler(CreateCommunityCommand)
export class CreateCommunityHandler implements ICommandHandler<CreateCommunityCommand> {
  constructor(
    @Inject('ICommunityRepository')
    private readonly communityRepository: ICommunityRepository,
    @Inject('ICommunityMemberRepository')
    private readonly memberRepository: ICommunityMemberRepository,
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

    // Create active membership for founder
    const member = CommunityMember.restore(
      this.generateId(), // Using restore to set status directly or we could add a factory method
      {
        communityId: community.id,
        userId: command.founderId,
        status: CommunityMemberStatus.ACTIVE,
        appliedAt: new Date(),
        approvedAt: new Date(),
        approvedBy: command.founderId,
      },
      new Date(),
      new Date(),
    );
    await this.memberRepository.create(member);

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

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
