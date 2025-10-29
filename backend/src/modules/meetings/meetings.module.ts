import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure
import { MeetingOrmEntity } from './infrastructure/persistence/typeorm/entities/meeting.orm-entity';
import { ParticipantOrmEntity } from './infrastructure/persistence/typeorm/entities/participant.orm-entity';
import { MeetingRepository } from './infrastructure/persistence/typeorm/repositories/meeting.repository';

// Presentation
import { MeetingsController } from './presentation/controllers/meetings.controller';

// Application - Commands
import { CreateMeetingHandler } from './application/commands/create-meeting/create-meeting.handler';
import { UpdateMeetingHandler } from './application/commands/update-meeting/update-meeting.handler';
import { AddParticipantHandler } from './application/commands/add-participant/add-participant.handler';
import { AcceptInvitationHandler } from './application/commands/accept-invitation/accept-invitation.handler';
import { DeclineInvitationHandler } from './application/commands/decline-invitation/decline-invitation.handler';
import { CancelMeetingHandler } from './application/commands/cancel-meeting/cancel-meeting.handler';

// Application - Queries
import { GetMeetingHandler } from './application/queries/get-meeting/get-meeting.handler';
import { GetUserMeetingsHandler } from './application/queries/get-user-meetings/get-user-meetings.handler';
import { GetUpcomingMeetingsHandler } from './application/queries/get-upcoming-meetings/get-upcoming-meetings.handler';

const CommandHandlers = [
  CreateMeetingHandler,
  UpdateMeetingHandler,
  AddParticipantHandler,
  AcceptInvitationHandler,
  DeclineInvitationHandler,
  CancelMeetingHandler,
];

const QueryHandlers = [
  GetMeetingHandler,
  GetUserMeetingsHandler,
  GetUpcomingMeetingsHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([MeetingOrmEntity, ParticipantOrmEntity]),
    CqrsModule,
  ],
  controllers: [MeetingsController],
  providers: [
    {
      provide: 'IMeetingRepository',
      useClass: MeetingRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: ['IMeetingRepository'],
})
export class MeetingsModule {}
