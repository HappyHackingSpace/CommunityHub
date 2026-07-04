import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RequestHelpCommand } from './request-help.command';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '../../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../../domain/enums/activity-action.enum';
import { HelpNeededEvent } from '../../../domain/events/help-needed.event';

@CommandHandler(RequestHelpCommand)
export class RequestHelpHandler implements ICommandHandler<RequestHelpCommand> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RequestHelpCommand): Promise<void> {
    // Find task
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${command.taskId} not found`);
    }

    // Verify user is assigned to this task
    if (task.assigneeId !== command.requestedBy) {
      throw new ForbiddenException(
        'Only the assignee can request help for this task',
      );
    }

    // Log activity
    const activityLog = ActivityLog.create({
      taskId: command.taskId,
      userId: command.requestedBy,
      action: ActivityAction.HELP_REQUESTED,
      details: { message: command.message },
    });
    await this.activityLogRepository.save(activityLog);

    // Publish event
    const event = new HelpNeededEvent(
      task.id,
      task.title.value,
      command.requestedBy,
      command.message,
    );
    this.eventBus.publish(event);
  }
}
