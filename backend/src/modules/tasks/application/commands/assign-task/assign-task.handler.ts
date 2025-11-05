import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AssignTaskCommand } from './assign-task.command';
import { Task } from '../../../domain/entities/task.entity';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { IAssignmentHistoryRepository } from '../../../domain/repositories/assignment-history.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import { AssignmentHistory } from '../../../domain/entities/assignment-history.entity';
import { ActivityLog } from '../../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../../domain/enums/activity-action.enum';

@CommandHandler(AssignTaskCommand)
export class AssignTaskHandler implements ICommandHandler<AssignTaskCommand> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IAssignmentHistoryRepository')
    private readonly assignmentHistoryRepository: IAssignmentHistoryRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  async execute(command: AssignTaskCommand): Promise<Task> {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.canBeModifiedBy(command.userId)) {
      throw new ForbiddenException('You are not authorized to assign this task');
    }

    const previousAssignee = task.assigneeId;
    task.assignTo(command.assigneeId);

    const updatedTask = await this.taskRepository.update(task);

    // Create assignment history
    const history = AssignmentHistory.create({
      taskId: command.taskId,
      assignedBy: command.userId,
      assignedTo: command.assigneeId,
      previousAssignee,
    });
    await this.assignmentHistoryRepository.save(history);

    // Log assignment
    const log = ActivityLog.create({
      taskId: command.taskId,
      userId: command.userId,
      action: ActivityAction.ASSIGNED,
      details: {
        previousAssignee,
        newAssignee: command.assigneeId,
      },
    });
    await this.activityLogRepository.save(log);

    return updatedTask;
  }
}
