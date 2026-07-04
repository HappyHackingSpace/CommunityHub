import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ClubOrmEntity } from './infrastructure/persistence/typeorm/entities/club.orm-entity';
import { ClubMemberOrmEntity } from './infrastructure/persistence/typeorm/entities/club-member.orm-entity';
import { ClubRoleOrmEntity } from './infrastructure/persistence/typeorm/entities/club-role.orm-entity';
import { ClubAnnouncementOrmEntity } from './infrastructure/persistence/typeorm/entities/club-announcement.orm-entity';
import { ClubRepository } from './infrastructure/persistence/typeorm/repositories/club.repository';
import { ClubMemberRepository } from './infrastructure/persistence/typeorm/repositories/club-member.repository';
import { ClubRoleRepository } from './infrastructure/persistence/typeorm/repositories/club-role.repository';
import { ClubAnnouncementRepository } from './infrastructure/persistence/typeorm/repositories/club-announcement.repository';
import { CreateClubHandler } from './application/commands/create-club/create-club.handler';
import { UpdateClubHandler } from './application/commands/update-club/update-club.handler';
import { DeleteClubHandler } from './application/commands/delete-club/delete-club.handler';
import { AddMemberHandler } from './application/commands/add-member/add-member.handler';
import { ApplyForMembershipHandler } from './application/commands/apply-for-membership/apply-for-membership.handler';
import { ApproveMemberApplicationHandler } from './application/commands/approve-member-application/approve-member-application.handler';
import { RemoveMemberHandler } from './application/commands/remove-member/remove-member.handler';
import { AddLeaderHandler } from './application/commands/add-leader/add-leader.handler';
import { CreateAnnouncementHandler } from './application/commands/create-announcement/create-announcement.handler';
import { GetClubHandler } from './application/queries/get-club/get-club.handler';
import { GetAllClubsHandler } from './application/queries/get-all-clubs/get-all-clubs.handler';
import { GetClubMembersHandler } from './application/queries/get-club-members/get-club-members.handler';
import { GetClubAnnouncementsHandler } from './application/queries/get-club-announcements/get-club-announcements.handler';
import { GetPendingApplicationsHandler } from './application/queries/get-pending-applications/get-pending-applications.handler';
import { ClubsController } from './presentation/controllers/clubs.controller';

const commandHandlers = [
  CreateClubHandler,
  UpdateClubHandler,
  DeleteClubHandler,
  AddMemberHandler,
  ApplyForMembershipHandler,
  ApproveMemberApplicationHandler,
  RemoveMemberHandler,
  AddLeaderHandler,
  CreateAnnouncementHandler,
];

const queryHandlers = [
  GetClubHandler,
  GetAllClubsHandler,
  GetClubMembersHandler,
  GetClubAnnouncementsHandler,
  GetPendingApplicationsHandler,
];

const repositories = [
  {
    provide: 'IClubRepository',
    useClass: ClubRepository,
  },
  {
    provide: 'IClubMemberRepository',
    useClass: ClubMemberRepository,
  },
  {
    provide: 'IClubRoleRepository',
    useClass: ClubRoleRepository,
  },
  {
    provide: 'IClubAnnouncementRepository',
    useClass: ClubAnnouncementRepository,
  },
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClubOrmEntity,
      ClubMemberOrmEntity,
      ClubRoleOrmEntity,
      ClubAnnouncementOrmEntity,
    ]),
    CqrsModule,
  ],
  controllers: [ClubsController],
  providers: [...repositories, ...commandHandlers, ...queryHandlers],
  exports: ['IClubRepository', 'IClubMemberRepository', 'IClubRoleRepository'],
})
export class ClubsModule {}
