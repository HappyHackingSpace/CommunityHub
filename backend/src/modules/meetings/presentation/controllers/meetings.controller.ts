import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ValidationPipe,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

// Guards and Decorators (imported from IAM module)
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../iam/infrastructure/decorators/current-user.decorator';

// DTOs
import { CreateMeetingDto } from '../../application/dto/create-meeting.dto';
import { UpdateMeetingDto } from '../../application/dto/update-meeting.dto';
import { AddParticipantDto } from '../../application/dto/add-participant.dto';
import { MeetingResponseDto } from '../../application/dto/meeting-response.dto';
import { SubmitRsvpDto } from '../../application/dto/submit-rsvp.dto';
import { CreateAgendaItemDto } from '../../application/dto/create-agenda-item.dto';
import { CreateMeetingNoteDto } from '../../application/dto/create-meeting-note.dto';
import { AttachResourceDto } from '../../application/dto/attach-resource.dto';
import { ConvertNoteToTaskDto } from '../../application/dto/convert-note-to-task.dto';

// Commands
import { CreateMeetingCommand } from '../../application/commands/create-meeting/create-meeting.command';
import { UpdateMeetingCommand } from '../../application/commands/update-meeting/update-meeting.command';
import { AddParticipantCommand } from '../../application/commands/add-participant/add-participant.command';
import { AcceptInvitationCommand } from '../../application/commands/accept-invitation/accept-invitation.command';
import { DeclineInvitationCommand } from '../../application/commands/decline-invitation/decline-invitation.command';
import { CancelMeetingCommand } from '../../application/commands/cancel-meeting/cancel-meeting.command';
import { SubmitRsvpCommand } from '../../application/commands/submit-rsvp/submit-rsvp.command';
import { AddAgendaItemCommand } from '../../application/commands/add-agenda-item/add-agenda-item.command';
import { UpdateAgendaItemCommand } from '../../application/commands/update-agenda-item/update-agenda-item.command';
import { DeleteAgendaItemCommand } from '../../application/commands/delete-agenda-item/delete-agenda-item.command';
import { AttachResourceCommand } from '../../application/commands/attach-resource/attach-resource.command';
import { UpdateResourceCommand } from '../../application/commands/update-resource/update-resource.command';
import { RemoveResourceCommand } from '../../application/commands/remove-resource/remove-resource.command';
import { CreateMeetingNoteCommand } from '../../application/commands/create-meeting-note/create-meeting-note.command';
import { UpdateMeetingNoteCommand } from '../../application/commands/update-meeting-note/update-meeting-note.command';
import { DeleteMeetingNoteCommand } from '../../application/commands/delete-meeting-note/delete-meeting-note.command';
import { ConvertNoteToTaskCommand } from '../../application/commands/convert-note-to-task/convert-note-to-task.command';
import { MarkAttendedCommand } from '../../application/commands/mark-attended/mark-attended.command';
import { RecordDepartureCommand } from '../../application/commands/record-departure/record-departure.command';

// Queries
import { GetMeetingQuery } from '../../application/queries/get-meeting/get-meeting.query';
import { GetUserMeetingsQuery } from '../../application/queries/get-user-meetings/get-user-meetings.query';
import { GetUpcomingMeetingsQuery } from '../../application/queries/get-upcoming-meetings/get-upcoming-meetings.query';
import { GetRsvpResponsesQuery } from '../../application/queries/get-rsvp-responses/get-rsvp-responses.query';
import { GetAgendaItemsQuery } from '../../application/queries/get-agenda-items/get-agenda-items.query';
import { GetMeetingResourcesQuery } from '../../application/queries/get-meeting-resources/get-meeting-resources.query';
import { GetMeetingNotesQuery } from '../../application/queries/get-meeting-notes/get-meeting-notes.query';
import { GetActionItemsQuery } from '../../application/queries/get-action-items/get-action-items.query';
import { GetAttendanceRecordsQuery } from '../../application/queries/get-attendance-records/get-attendance-records.query';
import { GetUserAttendanceHistoryQuery } from '../../application/queries/get-user-attendance-history/get-user-attendance-history.query';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class MeetingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMeeting(
    @Body() dto: CreateMeetingDto,
    @CurrentUser() currentUser: any,
  ) {
    const command = new CreateMeetingCommand(
      dto.title,
      dto.description,
      new Date(dto.startTime),
      dto.duration,
      currentUser.userId,
      dto.meetingUrl,
      dto.participantIds || [],
    );

    const meeting = await this.commandBus.execute(command);
    return MeetingResponseDto.fromDomain(meeting);
  }

  @Get(':id')
  async getMeeting(@Param('id') id: string) {
    const meeting = await this.queryBus.execute(new GetMeetingQuery(id));
    return MeetingResponseDto.fromDomain(meeting);
  }

  @Put(':id')
  async updateMeeting(
    @Param('id') id: string,
    @Body() dto: UpdateMeetingDto,
    @CurrentUser() currentUser: any,
  ) {
    const command = new UpdateMeetingCommand(
      id,
      currentUser.userId,
      dto.title,
      dto.description,
      dto.startTime ? new Date(dto.startTime) : undefined,
      dto.duration,
      dto.meetingUrl,
    );

    const meeting = await this.commandBus.execute(command);
    return MeetingResponseDto.fromDomain(meeting);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async cancelMeeting(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ) {
    const command = new CancelMeetingCommand(id, currentUser.userId);
    const meeting = await this.commandBus.execute(command);
    return MeetingResponseDto.fromDomain(meeting);
  }

  @Get()
  async getMyMeetings(@CurrentUser() currentUser: any) {
    const meetings = await this.queryBus.execute(
      new GetUserMeetingsQuery(currentUser.userId),
    );
    return meetings.map(meeting => MeetingResponseDto.fromDomain(meeting));
  }

  @Get('upcoming')
  async getUpcomingMeetings(@CurrentUser() currentUser: any) {
    const meetings = await this.queryBus.execute(
      new GetUpcomingMeetingsQuery(currentUser.userId),
    );
    return meetings.map(meeting => MeetingResponseDto.fromDomain(meeting));
  }

  @Post(':id/participants')
  async addParticipant(
    @Param('id') meetingId: string,
    @Body() dto: AddParticipantDto,
    @CurrentUser() currentUser: any,
  ) {
    const command = new AddParticipantCommand(
      meetingId,
      dto.participantId,
      currentUser.userId,
    );

    const meeting = await this.commandBus.execute(command);
    return MeetingResponseDto.fromDomain(meeting);
  }

  @Put(':id/participants/accept')
  async acceptInvitation(
    @Param('id') meetingId: string,
    @CurrentUser() currentUser: any,
  ) {
    const command = new AcceptInvitationCommand(
      meetingId,
      currentUser.userId,
    );

    const meeting = await this.commandBus.execute(command);
    return MeetingResponseDto.fromDomain(meeting);
  }

  @Put(':id/participants/decline')
  async declineInvitation(
    @Param('id') meetingId: string,
    @CurrentUser() currentUser: any,
  ) {
    const command = new DeclineInvitationCommand(
      meetingId,
      currentUser.userId,
    );

    const meeting = await this.commandBus.execute(command);
    return MeetingResponseDto.fromDomain(meeting);
  }

  @Post(':id/rsvp')
  async submitRsvp(
    @Param('id') meetingId: string,
    @Body() dto: SubmitRsvpDto,
    @CurrentUser() currentUser: any,
  ) {
    const command = new SubmitRsvpCommand(
      meetingId,
      currentUser.userId,
      dto.status,
      dto.notes,
    );

    return await this.commandBus.execute(command);
  }

  @Get(':id/rsvp')
  async getRsvpResponses(@Param('id') meetingId: string) {
    return await this.queryBus.execute(new GetRsvpResponsesQuery(meetingId));
  }

  // Agenda Management Endpoints
  @Post(':id/agenda')
  async addAgendaItem(
    @Param('id') meetingId: string,
    @Body() dto: CreateAgendaItemDto,
  ) {
    const command = new AddAgendaItemCommand(
      meetingId,
      dto.title,
      dto.description,
      dto.duration ? (typeof dto.duration === 'string' ? parseInt(dto.duration, 10) : dto.duration) : undefined,
      dto.order,
      dto.presenterId,
    );

    return await this.commandBus.execute(command);
  }

  @Get(':id/agenda')
  async getAgendaItems(@Param('id') meetingId: string) {
    return await this.queryBus.execute(new GetAgendaItemsQuery(meetingId));
  }

  @Put('agenda/:agendaId')
  async updateAgendaItem(
    @Param('agendaId') agendaId: string,
    @Body() dto: Partial<CreateAgendaItemDto>,
    @CurrentUser() currentUser: any,
  ) {
    const command = new UpdateAgendaItemCommand(
      agendaId,
      currentUser.userId,
      dto.title,
      dto.description,
      dto.duration,
      dto.presenterId,
    );

    return await this.commandBus.execute(command);
  }

  @Delete('agenda/:agendaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAgendaItem(
    @Param('agendaId') agendaId: string,
    @CurrentUser() currentUser: any,
  ) {
    const command = new DeleteAgendaItemCommand(agendaId, currentUser.userId);
    await this.commandBus.execute(command);
  }

  // Resource Management Endpoints
  @Post(':id/resources')
  async attachResource(
    @Param('id') meetingId: string,
    @Body() dto: AttachResourceDto,
    @CurrentUser() currentUser: any,
  ) {
    const command = new AttachResourceCommand(
      meetingId,
      dto.title,
      dto.url,
      dto.type,
      dto.description,
      currentUser.userId,
    );

    return await this.commandBus.execute(command);
  }

  @Get(':id/resources')
  async getMeetingResources(@Param('id') meetingId: string) {
    return await this.queryBus.execute(new GetMeetingResourcesQuery(meetingId));
  }

  @Put('resources/:resourceId')
  async updateResource(
    @Param('resourceId') resourceId: string,
    @Body() dto: Partial<AttachResourceDto>,
    @CurrentUser() currentUser: any,
  ) {
    const command = new UpdateResourceCommand(
      resourceId,
      currentUser.userId,
      dto.title,
      dto.url,
    );

    return await this.commandBus.execute(command);
  }

  @Delete('resources/:resourceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeResource(
    @Param('resourceId') resourceId: string,
    @CurrentUser() currentUser: any,
  ) {
    const command = new RemoveResourceCommand(resourceId, currentUser.userId);
    await this.commandBus.execute(command);
  }

  // Meeting Notes Endpoints
  @Post(':id/notes')
  async createMeetingNote(
    @Param('id') meetingId: string,
    @Body() dto: CreateMeetingNoteDto,
    @CurrentUser() currentUser: any,
  ) {
    const command = new CreateMeetingNoteCommand(
      meetingId,
      currentUser.userId,
      dto.content,
      dto.noteType === 'action_item',
    );

    return await this.commandBus.execute(command);
  }

  @Get(':id/notes')
  async getMeetingNotes(@Param('id') meetingId: string) {
    return await this.queryBus.execute(new GetMeetingNotesQuery(meetingId));
  }

  @Get(':id/action-items')
  async getActionItems(@Param('id') meetingId: string) {
    return await this.queryBus.execute(new GetActionItemsQuery(meetingId));
  }

  @Put('notes/:noteId')
  async updateMeetingNote(
    @Param('noteId') noteId: string,
    @Body() dto: Partial<CreateMeetingNoteDto>,
    @CurrentUser() currentUser: any,
  ) {
    const command = new UpdateMeetingNoteCommand(
      noteId,
      currentUser.userId,
      dto.content,
      dto.noteType ? dto.noteType === 'action_item' : undefined,
    );

    return await this.commandBus.execute(command);
  }

  @Delete('notes/:noteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMeetingNote(
    @Param('noteId') noteId: string,
    @CurrentUser() currentUser: any,
  ) {
    const command = new DeleteMeetingNoteCommand(noteId, currentUser.userId);
    await this.commandBus.execute(command);
  }

  @Post('notes/:noteId/convert-to-task')
  async convertNoteToTask(
    @Param('noteId') noteId: string,
    @CurrentUser() currentUser: any,
  ) {
    const command = new ConvertNoteToTaskCommand(noteId, currentUser.userId);
    return await this.commandBus.execute(command);
  }

  // Attendance Tracking Endpoints
  @Post(':id/attendance/checkin')
  async markAttended(
    @Param('id') meetingId: string,
    @CurrentUser() currentUser: any,
  ) {
    const command = new MarkAttendedCommand(meetingId, currentUser.userId);
    return await this.commandBus.execute(command);
  }

  @Post(':id/attendance/checkout')
  async recordDeparture(
    @Param('id') meetingId: string,
    @CurrentUser() currentUser: any,
  ) {
    const command = new RecordDepartureCommand(meetingId, currentUser.userId);
    return await this.commandBus.execute(command);
  }

  @Get(':id/attendance')
  async getAttendanceRecords(@Param('id') meetingId: string) {
    return await this.queryBus.execute(new GetAttendanceRecordsQuery(meetingId));
  }

  @Get('attendance/history')
  async getMyAttendanceHistory(@CurrentUser() currentUser: any) {
    return await this.queryBus.execute(
      new GetUserAttendanceHistoryQuery(currentUser.userId),
    );
  }
}
