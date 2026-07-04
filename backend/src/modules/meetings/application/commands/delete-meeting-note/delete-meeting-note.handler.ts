import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteMeetingNoteCommand } from './delete-meeting-note.command';
import type { IMeetingNoteRepository } from '../../../domain/repositories/meeting-note.repository.interface';

@CommandHandler(DeleteMeetingNoteCommand)
export class DeleteMeetingNoteHandler implements ICommandHandler<DeleteMeetingNoteCommand> {
  constructor(
    @Inject('IMeetingNoteRepository')
    private readonly meetingNoteRepository: IMeetingNoteRepository,
  ) {}

  async execute(command: DeleteMeetingNoteCommand): Promise<void> {
    const { noteId, userId } = command;

    // Find meeting note
    const meetingNote = await this.meetingNoteRepository.findById(noteId);
    if (!meetingNote) {
      throw new Error('Meeting note not found');
    }

    // Only creator can delete the note
    if (meetingNote.createdBy !== userId) {
      throw new Error('Only the note creator can delete this note');
    }

    // Delete note
    await this.meetingNoteRepository.delete(noteId);
  }
}
