import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { AddMemberCommand } from './add-member.command';
import type { IClubMemberRepository } from 'src/modules/clubs/domain/repositories/club-member.repository.interface';
import type { IClubRoleRepository } from 'src/modules/clubs/domain/repositories/club-role.repository.interface';
import { ClubMember } from 'src/modules/clubs/domain/entities/club-member.entity';
import { MembershipStatus } from 'src/modules/clubs/domain/enums/membership-status.enum';
import { ClubRoleType } from 'src/modules/clubs/domain/enums/club-role-type.enum';

@CommandHandler(AddMemberCommand)
export class AddMemberHandler implements ICommandHandler<AddMemberCommand> {
  constructor(
    @Inject('IClubMemberRepository')
    private readonly memberRepository: IClubMemberRepository,
    @Inject('IClubRoleRepository')
    private readonly roleRepository: IClubRoleRepository,
  ) {}

  async execute(command: AddMemberCommand): Promise<string> {
    const existing = await this.memberRepository.findByClubAndUser(
      command.clubId,
      command.userId,
    );

    if (existing && existing.isActive()) {
      throw new BadRequestException('User is already a member of this club');
    }

    let roleId = command.roleId;

    if (!roleId) {
      const memberRole = await this.roleRepository.findRolesByClubAndType(
        command.clubId,
        ClubRoleType.MEMBER,
      );

      if (memberRole.length === 0) {
        throw new NotFoundException('Member role not found in club');
      }

      roleId = memberRole[0].id;
    }

    const member = ClubMember.create({
      clubId: command.clubId,
      userId: command.userId,
      roleId: roleId,
      status: MembershipStatus.APPROVED,
      joinedAt: new Date(),
    });

    await this.memberRepository.create(member);

    return member.id;
  }
}
