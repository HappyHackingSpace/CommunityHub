import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateTaskCommand } from './create-task.command';
import { Task } from '../../../domain/entities/task.entity';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import type { ITaskTagRepository } from '../../../domain/repositories/task-tag.repository.interface';
import type { IAssignmentHistoryRepository } from '../../../domain/repositories/assignment-history.repository.interface';
import { ActivityLog } from '../../../domain/entities/activity-log.entity';
import { AssignmentHistory } from '../../../domain/entities/assignment-history.entity';
import { ActivityAction } from '../../../domain/enums/activity-action.enum';

@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
    @Inject('ITaskTagRepository')
    private readonly taskTagRepository: ITaskTagRepository,
    @Inject('IAssignmentHistoryRepository')
    private readonly assignmentHistoryRepository: IAssignmentHistoryRepository,
  ) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    const task = Task.create({
      title: command.title,
      description: command.description,
      assignerId: command.assignerId,
      assigneeId: command.assigneeId,
      dueDate: command.dueDate,
      visibility: command.visibility,
    });

    const savedTask = await this.taskRepository.save(task);

    // Log task creation
    const log = ActivityLog.create({
      taskId: savedTask.id,
      userId: command.assignerId,
      action: ActivityAction.CREATED,
      details: {
        title: command.title,
        visibility: savedTask.visibility,
      },
    });
    await this.activityLogRepository.save(log);

    // Attach tags if provided
    if (command.tagIds && command.tagIds.length > 0) {
      await this.taskTagRepository.attachTags(savedTask.id, command.tagIds);
    }

    // Track initial assignment if task is assigned
    if (command.assigneeId) {
      const history = AssignmentHistory.create({
        taskId: savedTask.id,
        assignedBy: command.assignerId,
        assignedTo: command.assigneeId,
      });
      await this.assignmentHistoryRepository.save(history);
    }

    return savedTask;
  }
}
