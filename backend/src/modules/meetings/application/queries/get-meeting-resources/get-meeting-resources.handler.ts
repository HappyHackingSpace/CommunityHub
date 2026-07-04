import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMeetingResourcesQuery } from './get-meeting-resources.query';
import { MeetingResource } from '../../../domain/entities/meeting-resource.entity';
import type { IMeetingResourceRepository } from '../../../domain/repositories/meeting-resource.repository.interface';

@QueryHandler(GetMeetingResourcesQuery)
export class GetMeetingResourcesHandler implements IQueryHandler<GetMeetingResourcesQuery> {
  constructor(
    @Inject('IMeetingResourceRepository')
    private readonly meetingResourceRepository: IMeetingResourceRepository,
  ) {}

  async execute(query: GetMeetingResourcesQuery): Promise<MeetingResource[]> {
    const { meetingId } = query;
    return this.meetingResourceRepository.findByMeetingId(meetingId);
  }
}
