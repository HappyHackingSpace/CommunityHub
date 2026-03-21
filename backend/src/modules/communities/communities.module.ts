import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { IamModule } from 'src/modules/iam/iam.module';
import { TasksModule } from 'src/modules/tasks/tasks.module';
import { MeetingsModule } from 'src/modules/meetings/meetings.module';
import { CommunitiesController } from './presentation/controllers/communities.controller';
import { CommunityOrmEntity, CommunityMemberOrmEntity } from './infrastructure/persistence/typeorm/entities';
import { CommunityRepository, CommunityMemberRepository } from './infrastructure/persistence/typeorm/repositories';
import {
  CreateCommunityHandler,
  UpdateCommunityHandler,
  ApplyForMembershipHandler,
  ApproveMembershipHandler,
  RejectMembershipHandler,
} from './application/commands';
import {
  GetCommunityMembersHandler,
  GetPendingMembershipsHandler,
  GetCommunityStatsHandler,
  GetCommunityHandler,
  GetAllCommunitiesHandler,
} from './application/queries';

const commandHandlers = [
  CreateCommunityHandler,
  UpdateCommunityHandler,
  ApplyForMembershipHandler,
  ApproveMembershipHandler,
  RejectMembershipHandler,
];

const queryHandlers = [
  GetCommunityMembersHandler,
  GetPendingMembershipsHandler,
  GetCommunityStatsHandler,
  GetCommunityHandler,
  GetAllCommunitiesHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityOrmEntity, CommunityMemberOrmEntity]),
    CqrsModule,
    forwardRef(() => IamModule),
    forwardRef(() => TasksModule),
    forwardRef(() => MeetingsModule),
  ],
  controllers: [CommunitiesController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    {
      provide: 'ICommunityRepository',
      useClass: CommunityRepository,
    },
    {
      provide: 'ICommunityMemberRepository',
      useClass: CommunityMemberRepository,
    },
  ],
  exports: ['ICommunityRepository', 'ICommunityMemberRepository'],
})
export class CommunitiesModule {}
