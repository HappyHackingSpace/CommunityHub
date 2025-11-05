import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AddSubTaskCommand } from './add-subtask.command';
import { SubTask } from '../../../domain/entities/subtask.entity';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { ISubTaskRepository } from '../../../domain/repositories/subtask.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '../../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../../domain/enums/activity-action.enum';

@CommandHandler(AddSubTaskCommand)
export class AddSubTaskHandler implements ICommandHandler<AddSubTaskCommand> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('ISubTaskRepository')
    private readonly subTaskRepository: ISubTaskRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  async execute(command: AddSubTaskCommand): Promise<SubTask> {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.canBeModifiedBy(command.userId)) {
      throw new ForbiddenException('You cannot add subtasks to this task');
    }

    const subTask = SubTask.create({
      parentId: command.taskId,
      title: command.title,
    });

    const savedSubTask = await this.subTaskRepository.save(subTask);

    // Log subtask addition
    const log = ActivityLog.create({
      taskId: command.taskId,
      userId: command.userId,
      action: ActivityAction.SUBTASK_ADDED,
      details: { title: command.title },
    });
    await this.activityLogRepository.save(log);

    return savedSubTask;
  }
}
