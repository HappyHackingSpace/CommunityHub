import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RequestTaskHandoverCommand } from './request-task-handover.command';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '../../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../../domain/enums/activity-action.enum';
import { TaskHandoverRequestedEvent } from '../../../domain/events/task-handover-requested.event';

@CommandHandler(RequestTaskHandoverCommand)
export class RequestTaskHandoverHandler
  implements ICommandHandler<RequestTaskHandoverCommand>
{
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RequestTaskHandoverCommand): Promise<void> {
    // Find task
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${command.taskId} not found`);
    }

    // Verify user is assigned to this task
    if (task.assigneeId !== command.requestedBy) {
      throw new ForbiddenException(
        'Only the assignee can request handover for this task',
      );
    }

    // Log activity
    const activityLog = ActivityLog.create({
      taskId: command.taskId,
      userId: command.requestedBy,
      action: ActivityAction.HANDOVER_REQUESTED,
      details: { reason: command.reason },
    });
    await this.activityLogRepository.save(activityLog);

    // Publish event
    const event = new TaskHandoverRequestedEvent(
      task.id,
      task.title.value,
      command.requestedBy,
      command.reason,
    );
    this.eventBus.publish(event);
  }
}
