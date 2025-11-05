import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateTaskStatusCommand } from './update-task-status.command';
import { Task } from '../../../domain/entities/task.entity';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '../../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../../domain/enums/activity-action.enum';

@CommandHandler(UpdateTaskStatusCommand)
export class UpdateTaskStatusHandler
  implements ICommandHandler<UpdateTaskStatusCommand>
{
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  async execute(command: UpdateTaskStatusCommand): Promise<Task> {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.canUpdateStatusBy(command.userId)) {
      throw new ForbiddenException(
        'Only the assignee can update the task status',
      );
    }

    const oldStatus = task.status;
    task.updateStatus(command.status);

    const updatedTask = await this.taskRepository.update(task);

    // Log status update
    const log = ActivityLog.create({
      taskId: updatedTask.id,
      userId: command.userId,
      action: ActivityAction.STATUS_UPDATED,
      details: {
        oldStatus,
        newStatus: command.status,
      },
    });
    await this.activityLogRepository.save(log);

    return updatedTask;
  }
}
