import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateMeetingNoteCommand } from './update-meeting-note.command';
import { MeetingNote } from '../../../domain/entities/meeting-note.entity';
import type { IMeetingNoteRepository } from '../../../domain/repositories/meeting-note.repository.interface';

@CommandHandler(UpdateMeetingNoteCommand)
export class UpdateMeetingNoteHandler implements ICommandHandler<UpdateMeetingNoteCommand> {
  constructor(
    @Inject('IMeetingNoteRepository')
    private readonly meetingNoteRepository: IMeetingNoteRepository,
  ) {}

  async execute(command: UpdateMeetingNoteCommand): Promise<MeetingNote> {
    const { noteId, userId, content } = command;

    // Find meeting note
    const meetingNote = await this.meetingNoteRepository.findById(noteId);
    if (!meetingNote) {
      throw new Error('Meeting note not found');
    }

    // Only creator can update the note
    if (meetingNote.createdBy !== userId) {
      throw new Error('Only the note creator can update this note');
    }

    // Update note
    if (content !== undefined) {
      meetingNote.update({
        content,
      });
    }

    // Save updated note
    const savedNote = await this.meetingNoteRepository.save(meetingNote);

    return savedNote;
  }
}
