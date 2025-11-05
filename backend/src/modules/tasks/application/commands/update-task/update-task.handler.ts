import {
  CommandHandler,
  ICommandHandler,
} from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateTaskCommand } from './update-task.command';
import { Task } from '../../../domain/entities/task.entity';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '../../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../../domain/enums/activity-action.enum';

@CommandHandler(UpdateTaskCommand)
export class UpdateTaskHandler implements ICommandHandler<UpdateTaskCommand> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  async execute(command: UpdateTaskCommand): Promise<Task> {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.canBeModifiedBy(command.userId)) {
      throw new ForbiddenException('You are not authorized to modify this task');
    }

    const oldValues = {
      title: task.title.value,
      description: task.description?.value,
      dueDate: task.dueDate,
      visibility: task.visibility,
    };

    task.updateTask({
      title: command.title,
      description: command.description,
      dueDate: command.dueDate,
      visibility: command.visibility,
    });

    const updatedTask = await this.taskRepository.update(task);

    // Log task update
    const log = ActivityLog.create({
      taskId: updatedTask.id,
      userId: command.userId,
      action: ActivityAction.UPDATED,
      details: {
        old: oldValues,
        new: {
          title: updatedTask.title.value,
          description: updatedTask.description?.value,
          dueDate: updatedTask.dueDate,
          visibility: updatedTask.visibility,
        },
      },
    });
    await this.activityLogRepository.save(log);

    return updatedTask;
  }
}
