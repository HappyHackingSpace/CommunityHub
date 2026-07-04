import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApplyForMembershipCommand } from './apply-for-membership.command';
import { CommunityMember } from 'src/modules/communities/domain/entities/community-member.entity';
import type { ICommunityRepository } from 'src/modules/communities/domain/repositories/community.repository.interface';
import type { ICommunityMemberRepository } from 'src/modules/communities/domain/repositories/community-member.repository.interface';

@CommandHandler(ApplyForMembershipCommand)
export class ApplyForMembershipHandler implements ICommandHandler<ApplyForMembershipCommand> {
  constructor(
    @Inject('ICommunityRepository')
    private readonly communityRepository: ICommunityRepository,
    @Inject('ICommunityMemberRepository')
    private readonly memberRepository: ICommunityMemberRepository,
  ) {}

  async execute(command: ApplyForMembershipCommand): Promise<string> {
    const community = await this.communityRepository.findById(command.communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const existingMember = await this.memberRepository.findByCommunityAndUser(
      command.communityId,
      command.userId,
    );
    if (existingMember) {
      throw new BadRequestException('User has already applied or is a member of this community');
    }

    const member = CommunityMember.create({
      communityId: command.communityId,
      userId: command.userId,
    });

    await this.memberRepository.create(member);

    return member.id;
  }
}
