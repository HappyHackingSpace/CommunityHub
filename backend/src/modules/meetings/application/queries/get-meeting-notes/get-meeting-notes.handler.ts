import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMeetingNotesQuery } from './get-meeting-notes.query';
import { MeetingNote } from '../../../domain/entities/meeting-note.entity';
import type { IMeetingNoteRepository } from '../../../domain/repositories/meeting-note.repository.interface';

@QueryHandler(GetMeetingNotesQuery)
export class GetMeetingNotesHandler implements IQueryHandler<GetMeetingNotesQuery> {
  constructor(
    @Inject('IMeetingNoteRepository')
    private readonly meetingNoteRepository: IMeetingNoteRepository,
  ) {}

  async execute(query: GetMeetingNotesQuery): Promise<MeetingNote[]> {
    const { meetingId } = query;
    return this.meetingNoteRepository.findByMeetingId(meetingId);
  }
}
