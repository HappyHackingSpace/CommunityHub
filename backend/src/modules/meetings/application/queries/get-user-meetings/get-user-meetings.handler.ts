import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserMeetingsQuery } from './get-user-meetings.query';
import { Meeting } from '../../../domain/entities/meeting.entity';
import { Inject } from '@nestjs/common';
import type { IMeetingRepository } from '../../../domain/repositories/meeting.repository.interface';

@QueryHandler(GetUserMeetingsQuery)
export class GetUserMeetingsHandler implements IQueryHandler<GetUserMeetingsQuery> {
  constructor(
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async execute(query: GetUserMeetingsQuery): Promise<Meeting[]> {
    const meetings: Meeting[] = [];

    if (query.includeAsOrganizer) {
      const organizerMeetings = await this.meetingRepository.findByOrganizerId(query.userId);
      meetings.push(...organizerMeetings);
    }

    if (query.includeAsParticipant) {
      const participantMeetings = await this.meetingRepository.findByParticipantId(query.userId);
      // Filter out duplicates (if user is both organizer and participant)
      const newMeetings = participantMeetings.filter(
        pm => !meetings.some(m => m.id === pm.id)
      );
      meetings.push(...newMeetings);
    }

    // Sort by start time (ascending)
    return meetings.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
}