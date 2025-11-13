import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ApproveMemberApplicationCommand } from './approve-member-application.command';
import type { IClubMemberRepository } from 'src/modules/clubs/domain/repositories/club-member.repository.interface';
import type { IClubRepository } from 'src/modules/clubs/domain/repositories/club.repository.interface';

@CommandHandler(ApproveMemberApplicationCommand)
export class ApproveMemberApplicationHandler
  implements ICommandHandler<ApproveMemberApplicationCommand>
{
  constructor(
    @Inject('IClubMemberRepository')
    private readonly memberRepository: IClubMemberRepository,
    @Inject('IClubRepository')
    private readonly clubRepository: IClubRepository,
  ) {}

  async execute(command: ApproveMemberApplicationCommand): Promise<void> {
    const club = await this.clubRepository.findById(command.clubId);
    if (!club) {
      throw new NotFoundException('Club not found');
    }

    if (!club.isLeader(command.approverId)) {
      throw new ForbiddenException('Only club leaders can approve applications');
    }

    const member = await this.memberRepository.findById(command.memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    member.approve(command.approverId);
    await this.memberRepository.update(member);
  }
}
