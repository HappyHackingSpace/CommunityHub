import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RejectMembershipCommand } from './reject-membership.command';
import type { ICommunityRepository } from 'src/modules/communities/domain/repositories/community.repository.interface';
import type { ICommunityMemberRepository } from 'src/modules/communities/domain/repositories/community-member.repository.interface';

@CommandHandler(RejectMembershipCommand)
export class RejectMembershipHandler implements ICommandHandler<RejectMembershipCommand> {
  constructor(
    @Inject('ICommunityRepository')
    private readonly communityRepository: ICommunityRepository,
    @Inject('ICommunityMemberRepository')
    private readonly memberRepository: ICommunityMemberRepository,
  ) {}

  async execute(command: RejectMembershipCommand): Promise<void> {
    const community = await this.communityRepository.findById(command.communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const member = await this.memberRepository.findById(command.memberId);
    if (!member || member.communityId !== command.communityId) {
      throw new NotFoundException('Member not found');
    }

    member.reject();
    await this.memberRepository.update(member);
  }
}
