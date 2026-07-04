import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { RemoveMemberCommand } from './remove-member.command';
import type { IClubMemberRepository } from 'src/modules/clubs/domain/repositories/club-member.repository.interface';

@CommandHandler(RemoveMemberCommand)
export class RemoveMemberHandler implements ICommandHandler<RemoveMemberCommand> {
  constructor(
    @Inject('IClubMemberRepository')
    private readonly memberRepository: IClubMemberRepository,
  ) {}

  async execute(command: RemoveMemberCommand): Promise<void> {
    const member = await this.memberRepository.findById(command.memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    member.remove();
    await this.memberRepository.update(member);
  }
}
