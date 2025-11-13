import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetActionItemsQuery } from './get-action-items.query';
import { MeetingNote } from '../../../domain/entities/meeting-note.entity';
import type { IMeetingNoteRepository } from '../../../domain/repositories/meeting-note.repository.interface';

@QueryHandler(GetActionItemsQuery)
export class GetActionItemsHandler implements IQueryHandler<GetActionItemsQuery> {
  constructor(
    @Inject('IMeetingNoteRepository')
    private readonly meetingNoteRepository: IMeetingNoteRepository,
  ) {}

  async execute(query: GetActionItemsQuery): Promise<MeetingNote[]> {
    const { meetingId } = query;
    return this.meetingNoteRepository.findActionItemsByMeetingId(meetingId);
  }
}
