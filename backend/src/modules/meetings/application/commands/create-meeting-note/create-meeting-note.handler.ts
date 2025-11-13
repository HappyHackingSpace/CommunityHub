import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateMeetingNoteCommand } from './create-meeting-note.command';
import { MeetingNote } from '../../../domain/entities/meeting-note.entity';
import type { IMeetingNoteRepository } from '../../../domain/repositories/meeting-note.repository.interface';
import type { IMeetingRepository } from '../../../domain/repositories/meeting.repository.interface';

@CommandHandler(CreateMeetingNoteCommand)
export class CreateMeetingNoteHandler implements ICommandHandler<CreateMeetingNoteCommand> {
  constructor(
    @Inject('IMeetingNoteRepository')
    private readonly meetingNoteRepository: IMeetingNoteRepository,
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async execute(command: CreateMeetingNoteCommand): Promise<MeetingNote> {
    const { meetingId, creatorId, content, isActionItem } = command;

    // Verify meeting exists
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Create meeting note
    const noteType = isActionItem ? 'action_item' : 'note';
    const meetingNote = MeetingNote.create({
      meetingId,
      title: '',
      content,
      noteType,
      createdBy: creatorId,
    });

    // Save meeting note
    const savedNote = await this.meetingNoteRepository.save(meetingNote);

    return savedNote;
  }
}
