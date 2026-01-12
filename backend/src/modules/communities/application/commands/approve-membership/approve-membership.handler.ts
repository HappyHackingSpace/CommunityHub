import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ApproveMembershipCommand } from './approve-membership.command';
import type { ICommunityRepository } from 'src/modules/communities/domain/repositories/community.repository.interface';
import type { ICommunityMemberRepository } from 'src/modules/communities/domain/repositories/community-member.repository.interface';
import type { IUserRepository } from 'src/modules/iam/domain/repositories/user.repository.interface';

@CommandHandler(ApproveMembershipCommand)
export class ApproveMembershipHandler implements ICommandHandler<ApproveMembershipCommand> {
  constructor(
    @Inject('ICommunityRepository')
    private readonly communityRepository: ICommunityRepository,
    @Inject('ICommunityMemberRepository')
    private readonly memberRepository: ICommunityMemberRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: ApproveMembershipCommand): Promise<void> {
    const community = await this.communityRepository.findById(command.communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    if (community.founderId !== command.adminId) {
      throw new ForbiddenException('Only community founder can approve memberships');
    }

    const member = await this.memberRepository.findById(command.memberId);
    if (!member || member.communityId !== command.communityId) {
      throw new NotFoundException('Member not found');
    }

    member.approve(command.adminId);
    await this.memberRepository.update(member);

    if (community.tenantId) {
      const user = await this.userRepository.findById(member.userId);
      if (user && !user.primaryTenantId) {
        user.setPrimaryTenantId(community.tenantId);
        await this.userRepository.update(user);
      }
    }
  }
}
