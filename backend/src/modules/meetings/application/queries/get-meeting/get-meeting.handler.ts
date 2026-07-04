import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMeetingQuery } from './get-meeting.query';
import { Meeting } from '../../../domain/entities/meeting.entity';
import { Inject, NotFoundException } from '@nestjs/common';
import type { IMeetingRepository } from '../../../domain/repositories/meeting.repository.interface';

@QueryHandler(GetMeetingQuery)
export class GetMeetingHandler implements IQueryHandler<GetMeetingQuery> {
  constructor(
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async execute(query: GetMeetingQuery): Promise<Meeting> {
    const meeting = await this.meetingRepository.findById(query.meetingId);
    
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    return meeting;
  }
}