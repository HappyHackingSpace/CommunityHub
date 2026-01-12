import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { IamModule } from 'src/modules/iam/iam.module';
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
  GetCommunityHandler,
  GetAllCommunitiesHandler,
  GetCommunityMembersHandler,
} from './application/queries';

const commandHandlers = [
  CreateCommunityHandler,
  UpdateCommunityHandler,
  ApplyForMembershipHandler,
  ApproveMembershipHandler,
  RejectMembershipHandler,
];

const queryHandlers = [
  GetCommunityHandler,
  GetAllCommunitiesHandler,
  GetCommunityMembersHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityOrmEntity, CommunityMemberOrmEntity]),
    CqrsModule,
    forwardRef(() => IamModule),

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
