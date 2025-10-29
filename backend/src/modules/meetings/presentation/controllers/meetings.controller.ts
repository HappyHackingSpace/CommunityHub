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

// Commands
import { CreateMeetingCommand } from '../../application/commands/create-meeting/create-meeting.command';
import { UpdateMeetingCommand } from '../../application/commands/update-meeting/update-meeting.command';
import { AddParticipantCommand } from '../../application/commands/add-participant/add-participant.command';
import { AcceptInvitationCommand } from '../../application/commands/accept-invitation/accept-invitation.command';
import { DeclineInvitationCommand } from '../../application/commands/decline-invitation/decline-invitation.command';
import { CancelMeetingCommand } from '../../application/commands/cancel-meeting/cancel-meeting.command';

// Queries
import { GetMeetingQuery } from '../../application/queries/get-meeting/get-meeting.query';
import { GetUserMeetingsQuery } from '../../application/queries/get-user-meetings/get-user-meetings.query';
import { GetUpcomingMeetingsQuery } from '../../application/queries/get-upcoming-meetings/get-upcoming-meetings.query';

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

  // Participant Management Endpoints
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
}
