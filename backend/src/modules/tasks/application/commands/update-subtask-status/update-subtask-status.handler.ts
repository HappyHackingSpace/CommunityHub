import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateSubTaskStatusCommand } from './update-subtask-status.command';
import { SubTask } from '../../../domain/entities/subtask.entity';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { ISubTaskRepository } from '../../../domain/repositories/subtask.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '../../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../../domain/enums/activity-action.enum';

@CommandHandler(UpdateSubTaskStatusCommand)
export class UpdateSubTaskStatusHandler
  implements ICommandHandler<UpdateSubTaskStatusCommand>
{
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('ISubTaskRepository')
    private readonly subTaskRepository: ISubTaskRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  async execute(command: UpdateSubTaskStatusCommand): Promise<SubTask> {
    const subTask = await this.subTaskRepository.findById(command.subTaskId);

    if (!subTask) {
      throw new NotFoundException('SubTask not found');
    }

    const parentTask = await this.taskRepository.findById(subTask.parentId);

    if (!parentTask) {
      throw new NotFoundException('Parent task not found');
    }

    if (!parentTask.canUpdateStatusBy(command.userId)) {
      throw new ForbiddenException(
        'Only the assignee can update subtask status',
      );
    }

    const oldStatus = subTask.status;
    subTask.updateStatus(command.status);

    const updatedSubTask = await this.subTaskRepository.update(subTask);

    // Log subtask status update
    const log = ActivityLog.create({
      taskId: parentTask.id,
      userId: command.userId,
      action: ActivityAction.SUBTASK_UPDATED,
      details: {
        subTaskTitle: subTask.title,
        oldStatus,
        newStatus: command.status,
      },
    });
    await this.activityLogRepository.save(log);

    return updatedSubTask;
  }
}
