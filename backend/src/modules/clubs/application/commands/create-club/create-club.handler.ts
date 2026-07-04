import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IClubRepository } from 'src/modules/clubs/domain/repositories/club.repository.interface';
import type { IClubRoleRepository } from 'src/modules/clubs/domain/repositories/club-role.repository.interface';
import { CreateClubCommand } from './create-club.command';
import { Club } from 'src/modules/clubs/domain/entities/club.entity';
import { ClubRole } from 'src/modules/clubs/domain/entities/club-role.entity';
import { ClubRoleType } from 'src/modules/clubs/domain/enums/club-role-type.enum';

@CommandHandler(CreateClubCommand)
export class CreateClubHandler implements ICommandHandler<CreateClubCommand> {
  constructor(
    @Inject('IClubRepository')
    private readonly clubRepository: IClubRepository,
    @Inject('IClubRoleRepository')
    private readonly roleRepository: IClubRoleRepository,
  ) {}

  async execute(command: CreateClubCommand): Promise<string> {
    const club = Club.create({
      name: command.name,
      description: command.description,
      logoUrl: command.logoUrl,
      visibility: command.visibility,
      leaderId: command.leaderId,
      manifesto: command.manifesto,
      slackUrl: command.slackUrl,
      discordUrl: command.discordUrl,
    });

    await this.clubRepository.create(club);

    const leaderRole = ClubRole.create({
      clubId: club.id,
      name: 'Leader',
      roleType: ClubRoleType.LEADER,
      permissions: ['manage_club', 'manage_members', 'manage_roles', 'create_announcement'],
    });

    const memberRole = ClubRole.create({
      clubId: club.id,
      name: 'Member',
      roleType: ClubRoleType.MEMBER,
      permissions: ['view_club'],
    });

    await this.roleRepository.create(leaderRole);
    await this.roleRepository.create(memberRole);

    return club.id;
  }
}
