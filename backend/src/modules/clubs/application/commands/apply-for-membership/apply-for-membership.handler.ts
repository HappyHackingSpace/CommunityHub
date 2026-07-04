import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApplyForMembershipCommand } from './apply-for-membership.command';
import type { IClubMemberRepository } from 'src/modules/clubs/domain/repositories/club-member.repository.interface';
import type { IClubRoleRepository } from 'src/modules/clubs/domain/repositories/club-role.repository.interface';
import { ClubMember } from 'src/modules/clubs/domain/entities/club-member.entity';
import { MembershipStatus } from 'src/modules/clubs/domain/enums/membership-status.enum';
import { ClubRoleType } from 'src/modules/clubs/domain/enums/club-role-type.enum';

@CommandHandler(ApplyForMembershipCommand)
export class ApplyForMembershipHandler
  implements ICommandHandler<ApplyForMembershipCommand>
{
  constructor(
    @Inject('IClubMemberRepository')
    private readonly memberRepository: IClubMemberRepository,
    @Inject('IClubRoleRepository')
    private readonly roleRepository: IClubRoleRepository,
  ) {}

  async execute(command: ApplyForMembershipCommand): Promise<string> {
    const existing = await this.memberRepository.findByClubAndUser(
      command.clubId,
      command.userId,
    );

    if (existing && existing.isActive()) {
      throw new BadRequestException('User is already a member of this club');
    }

    if (existing && existing.isPending()) {
      throw new BadRequestException('User already has a pending application');
    }

    const memberRole = await this.roleRepository.findRolesByClubAndType(
      command.clubId,
      ClubRoleType.MEMBER,
    );

    if (memberRole.length === 0) {
      throw new NotFoundException('Member role not found in club');
    }

    const member = ClubMember.create({
      clubId: command.clubId,
      userId: command.userId,
      roleId: memberRole[0].id,
      status: MembershipStatus.PENDING,
      appliedAt: new Date(),
    });

    await this.memberRepository.create(member);

    return member.id;
  }
}
