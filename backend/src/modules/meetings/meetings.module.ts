import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

// Infrastructure - ORM Entities
import { MeetingOrmEntity } from './infrastructure/persistence/typeorm/entities/meeting.orm-entity';
import { ParticipantOrmEntity } from './infrastructure/persistence/typeorm/entities/participant.orm-entity';
import { AgendaItemOrmEntity } from './infrastructure/persistence/typeorm/entities/agenda-item.orm-entity';
import { MeetingResourceOrmEntity } from './infrastructure/persistence/typeorm/entities/meeting-resource.orm-entity';
import { RsvpResponseOrmEntity } from './infrastructure/persistence/typeorm/entities/rsvp-response.orm-entity';
import { MeetingNoteOrmEntity } from './infrastructure/persistence/typeorm/entities/meeting-note.orm-entity';
import { AttendanceRecordOrmEntity } from './infrastructure/persistence/typeorm/entities/attendance-record.orm-entity';

// Infrastructure - Repositories
import { MeetingRepository } from './infrastructure/persistence/typeorm/repositories/meeting.repository';
import { AgendaItemRepository } from './infrastructure/persistence/typeorm/repositories/agenda-item.repository';
import { MeetingResourceRepository } from './infrastructure/persistence/typeorm/repositories/meeting-resource.repository';
import { RsvpResponseRepository } from './infrastructure/persistence/typeorm/repositories/rsvp-response.repository';
import { MeetingNoteRepository } from './infrastructure/persistence/typeorm/repositories/meeting-note.repository';
import { AttendanceRecordRepository } from './infrastructure/persistence/typeorm/repositories/attendance-record.repository';

// Application - Services
import { ICalendarService } from './application/services/icalendar.service';
import { NoteToTaskService } from './application/services/note-to-task.service';
import { MeetingReminderService } from './application/services/meeting-reminder.service';

// Infrastructure - Scheduler
import { MeetingReminderProcessor } from './infrastructure/scheduler/meeting-reminder.processor';

// Presentation
import { MeetingsController } from './presentation/controllers/meetings.controller';

// Application - Commands (Existing)
import { CreateMeetingHandler } from './application/commands/create-meeting/create-meeting.handler';
import { UpdateMeetingHandler } from './application/commands/update-meeting/update-meeting.handler';
import { AddParticipantHandler } from './application/commands/add-participant/add-participant.handler';
import { AcceptInvitationHandler } from './application/commands/accept-invitation/accept-invitation.handler';
import { DeclineInvitationHandler } from './application/commands/decline-invitation/decline-invitation.handler';
import { CancelMeetingHandler } from './application/commands/cancel-meeting/cancel-meeting.handler';

// Application - Commands (New)
import { SubmitRsvpHandler } from './application/commands/submit-rsvp/submit-rsvp.handler';
import { AddAgendaItemHandler } from './application/commands/add-agenda-item/add-agenda-item.handler';
import { AttachResourceHandler } from './application/commands/attach-resource/attach-resource.handler';
import { CreateMeetingNoteHandler } from './application/commands/create-meeting-note/create-meeting-note.handler';
import { UpdateMeetingNoteHandler } from './application/commands/update-meeting-note/update-meeting-note.handler';
import { DeleteMeetingNoteHandler } from './application/commands/delete-meeting-note/delete-meeting-note.handler';
import { ConvertNoteToTaskHandler } from './application/commands/convert-note-to-task/convert-note-to-task.handler';
import { UpdateAgendaItemHandler } from './application/commands/update-agenda-item/update-agenda-item.handler';
import { DeleteAgendaItemHandler } from './application/commands/delete-agenda-item/delete-agenda-item.handler';
import { UpdateResourceHandler } from './application/commands/update-resource/update-resource.handler';
import { RemoveResourceHandler } from './application/commands/remove-resource/remove-resource.handler';
import { MarkAttendedHandler } from './application/commands/mark-attended/mark-attended.handler';
import { RecordDepartureHandler } from './application/commands/record-departure/record-departure.handler';

// Application - Queries
import { GetMeetingHandler } from './application/queries/get-meeting/get-meeting.handler';
import { GetUserMeetingsHandler } from './application/queries/get-user-meetings/get-user-meetings.handler';
import { GetUpcomingMeetingsHandler } from './application/queries/get-upcoming-meetings/get-upcoming-meetings.handler';
import { GetRsvpResponsesHandler } from './application/queries/get-rsvp-responses/get-rsvp-responses.handler';
import { GetAgendaItemsHandler } from './application/queries/get-agenda-items/get-agenda-items.handler';
import { GetMeetingResourcesHandler } from './application/queries/get-meeting-resources/get-meeting-resources.handler';
import { GetMeetingNotesHandler } from './application/queries/get-meeting-notes/get-meeting-notes.handler';
import { GetActionItemsHandler } from './application/queries/get-action-items/get-action-items.handler';
import { GetAttendanceRecordsHandler } from './application/queries/get-attendance-records/get-attendance-records.handler';
import { GetUserAttendanceHistoryHandler } from './application/queries/get-user-attendance-history/get-user-attendance-history.handler';

// Application - Event Handlers
import { MeetingCreatedHandler } from './application/event-handlers/meeting-created.handler';
import { MeetingUpdatedHandler } from './application/event-handlers/meeting-updated.handler';
import { MeetingCancelledHandler } from './application/event-handlers/meeting-cancelled.handler';

const CommandHandlers = [
  // Existing
  CreateMeetingHandler,
  UpdateMeetingHandler,
  AddParticipantHandler,
  AcceptInvitationHandler,
  DeclineInvitationHandler,
  CancelMeetingHandler,
  // New
  SubmitRsvpHandler,
  AddAgendaItemHandler,
  AttachResourceHandler,
  CreateMeetingNoteHandler,
  UpdateMeetingNoteHandler,
  DeleteMeetingNoteHandler,
  ConvertNoteToTaskHandler,
  UpdateAgendaItemHandler,
  DeleteAgendaItemHandler,
  UpdateResourceHandler,
  RemoveResourceHandler,
  MarkAttendedHandler,
  RecordDepartureHandler,
];

const QueryHandlers = [
  GetMeetingHandler,
  GetUserMeetingsHandler,
  GetUpcomingMeetingsHandler,
  GetRsvpResponsesHandler,
  GetAgendaItemsHandler,
  GetMeetingResourcesHandler,
  GetMeetingNotesHandler,
  GetActionItemsHandler,
  GetAttendanceRecordsHandler,
  GetUserAttendanceHistoryHandler,
];

const EventHandlers = [
  MeetingCreatedHandler,
  MeetingUpdatedHandler,
  MeetingCancelledHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MeetingOrmEntity,
      ParticipantOrmEntity,
      AgendaItemOrmEntity,
      MeetingResourceOrmEntity,
      RsvpResponseOrmEntity,
      MeetingNoteOrmEntity,
      AttendanceRecordOrmEntity,
    ]),
    CqrsModule,
    BullModule.registerQueue({
      name: 'meeting-reminders',
    }),
  ],
  controllers: [MeetingsController],
  providers: [
    // Repositories
    {
      provide: 'IMeetingRepository',
      useClass: MeetingRepository,
    },
    {
      provide: 'IAgendaItemRepository',
      useClass: AgendaItemRepository,
    },
    {
      provide: 'IMeetingResourceRepository',
      useClass: MeetingResourceRepository,
    },
    {
      provide: 'IRsvpResponseRepository',
      useClass: RsvpResponseRepository,
    },
    {
      provide: 'IMeetingNoteRepository',
      useClass: MeetingNoteRepository,
    },
    {
      provide: 'IAttendanceRecordRepository',
      useClass: AttendanceRecordRepository,
    },
    // Services
    ICalendarService,
    NoteToTaskService,
    MeetingReminderService,
    // Scheduler
    MeetingReminderProcessor,
    // Handlers
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [
    'IMeetingRepository',
    'IAgendaItemRepository',
    'IMeetingResourceRepository',
    'IRsvpResponseRepository',
    'IMeetingNoteRepository',
    'IAttendanceRecordRepository',
    ICalendarService,
    NoteToTaskService,
  ],
})
export class MeetingsModule {}
