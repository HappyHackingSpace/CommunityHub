import { Injectable, Inject } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { IMeetingNoteRepository } from '../../domain/repositories/meeting-note.repository.interface';
import { CreateTaskCommand } from '../../../tasks/application/commands/create-task/create-task.command';
import { TaskPriority } from '../../../tasks/domain/enums/task-priority.enum';

/**
 * Service to convert meeting notes/action items into formal tasks
 * This service integrates with the existing Task Module without modifying its core logic
 */
@Injectable()
export class NoteToTaskService {
  constructor(
    @Inject('IMeetingNoteRepository')
    private readonly meetingNoteRepository: IMeetingNoteRepository,
    private readonly commandBus: CommandBus,
  ) {}

  /**
   * Converts a meeting note (especially action items) into a formal task
   * @param noteId - The ID of the meeting note to convert
   * @param assigneeId - The user ID to assign the task to
   * @param dueDate - Optional due date for the task
   * @param priority - Optional priority level
   * @returns The ID of the created task
   */
  async convertNoteToTask(
    noteId: string,
    assigneeId: string,
    dueDate?: Date,
    priority?: 'low' | 'medium' | 'high',
  ): Promise<string> {
    // Fetch the note
    const note = await this.meetingNoteRepository.findById(noteId);

    if (!note) {
      throw new Error('Meeting note not found');
    }

    if (note.isConvertedToTask) {
      throw new Error('This note has already been converted to a task');
    }

    // Map priority string to TaskPriority enum
    let taskPriority: TaskPriority = TaskPriority.MEDIUM;
    if (priority === 'low') taskPriority = TaskPriority.LOW;
    if (priority === 'high') taskPriority = TaskPriority.HIGH;

    // Create a task using the Task Module's CreateTaskCommand
    const createTaskCommand = new CreateTaskCommand(
      note.title, // title
      note.createdBy, // assignerId (who created the note)
      note.content, // description
      assigneeId, // assigneeId
      dueDate, // dueDate
      undefined, // visibility
      taskPriority, // priority
      undefined, // estimatedTime
      undefined, // points
      undefined, // isRecurring
      undefined, // recurringSchedule
      undefined, // requiredSkills
      undefined, // tagIds (we could add tags if needed)
    );

    // Execute the command to create the task
    const taskId = await this.commandBus.execute(createTaskCommand);

    // Mark the note as converted
    note.markAsConvertedToTask(taskId);
    await this.meetingNoteRepository.save(note);

    return taskId;
  }

  /**
   * Bulk converts multiple meeting notes into tasks
   * Useful for converting all action items from a meeting at once
   */
  async convertMultipleNotesToTasks(
    conversions: Array<{
      noteId: string;
      assigneeId: string;
      dueDate?: Date;
      priority?: 'low' | 'medium' | 'high';
    }>,
  ): Promise<Array<{ noteId: string; taskId: string }>> {
    const results: Array<{ noteId: string; taskId: string }> = [];

    for (const conversion of conversions) {
      try {
        const taskId = await this.convertNoteToTask(
          conversion.noteId,
          conversion.assigneeId,
          conversion.dueDate,
          conversion.priority,
        );

        results.push({
          noteId: conversion.noteId,
          taskId,
        });
      } catch (error) {
        // Log the error but continue with other conversions
        console.error(`Failed to convert note ${conversion.noteId}:`, error);
      }
    }

    return results;
  }

  /**
   * Converts all unconverted action items from a meeting into tasks
   */
  async convertMeetingActionItemsToTasks(
    meetingId: string,
    defaultAssigneeId: string,
    dueDate?: Date,
  ): Promise<Array<{ noteId: string; taskId: string }>> {
    const actionItems = await this.meetingNoteRepository.findActionItemsByMeetingId(meetingId);

    const unconvertedItems = actionItems.filter(item => !item.isConvertedToTask);

    const conversions = unconvertedItems.map(item => ({
      noteId: item.id,
      assigneeId: defaultAssigneeId,
      dueDate,
      priority: 'medium' as const,
    }));

    return this.convertMultipleNotesToTasks(conversions);
  }
}
