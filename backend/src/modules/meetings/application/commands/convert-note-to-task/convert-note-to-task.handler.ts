import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ConvertNoteToTaskCommand } from './convert-note-to-task.command';
import type { IMeetingNoteRepository } from '../../../domain/repositories/meeting-note.repository.interface';

@CommandHandler(ConvertNoteToTaskCommand)
export class ConvertNoteToTaskHandler implements ICommandHandler<ConvertNoteToTaskCommand> {
  constructor(
    @Inject('IMeetingNoteRepository')
    private readonly meetingNoteRepository: IMeetingNoteRepository,
  ) {}

  async execute(command: ConvertNoteToTaskCommand): Promise<{ taskId: string }> {
    const { noteId, userId } = command;

    // Find meeting note
    const meetingNote = await this.meetingNoteRepository.findById(noteId);
    if (!meetingNote) {
      throw new Error('Meeting note not found');
    }

    // Only action items can be converted to tasks
    if (meetingNote.noteType !== 'action_item') {
      throw new Error('Only action items can be converted to tasks');
    }

    // Mark as converted to task
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    meetingNote.markAsConvertedToTask(taskId);

    // Save updated note
    const savedNote = await this.meetingNoteRepository.save(meetingNote);

    return { taskId };
  }
}
