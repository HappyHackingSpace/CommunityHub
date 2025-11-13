import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetRsvpResponsesQuery } from './get-rsvp-responses.query';
import { RsvpResponse } from '../../../domain/entities/rsvp-response.entity';
import type { IRsvpResponseRepository } from '../../../domain/repositories/rsvp-response.repository.interface';

@QueryHandler(GetRsvpResponsesQuery)
export class GetRsvpResponsesHandler implements IQueryHandler<GetRsvpResponsesQuery> {
  constructor(
    @Inject('IRsvpResponseRepository')
    private readonly rsvpResponseRepository: IRsvpResponseRepository,
  ) {}

  async execute(query: GetRsvpResponsesQuery): Promise<RsvpResponse[]> {
    const { meetingId } = query;
    return this.rsvpResponseRepository.findByMeetingId(meetingId);
  }
}
