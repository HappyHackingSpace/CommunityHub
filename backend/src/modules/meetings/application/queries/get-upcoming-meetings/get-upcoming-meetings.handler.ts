import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUpcomingMeetingsQuery } from './get-upcoming-meetings.query';
import { Meeting } from '../../../domain/entities/meeting.entity';
import { Inject } from '@nestjs/common';
import type { IMeetingRepository } from '../../../domain/repositories/meeting.repository.interface';

@QueryHandler(GetUpcomingMeetingsQuery)
export class GetUpcomingMeetingsHandler implements IQueryHandler<GetUpcomingMeetingsQuery> {
  constructor(
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async execute(query: GetUpcomingMeetingsQuery): Promise<Meeting[]> {
    return await this.meetingRepository.findUpcoming(query.userId);
  }
}