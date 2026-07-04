import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { VolunteerForTaskCommand } from './volunteer-for-task.command';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import type { IAssignmentHistoryRepository } from '../../../domain/repositories/assignment-history.repository.interface';
import { ActivityLog } from '../../../domain/entities/activity-log.entity';
import { AssignmentHistory } from '../../../domain/entities/assignment-history.entity';
import { ActivityAction } from '../../../domain/enums/activity-action.enum';
import { TaskAssignedEvent } from '../../../domain/events/task-assigned.event';
import { TaskVisibility } from '../../../domain/enums/task-visibility.enum';

@CommandHandler(VolunteerForTaskCommand)
export class VolunteerForTaskHandler
  implements ICommandHandler<VolunteerForTaskCommand>
{
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
    @Inject('IAssignmentHistoryRepository')
    private readonly assignmentHistoryRepository: IAssignmentHistoryRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: VolunteerForTaskCommand): Promise<void> {
    // Find task
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${command.taskId} not found`);
    }

    // Verify task is public/available for volunteering
    if (task.visibility !== TaskVisibility.PUBLIC) {
      throw new BadRequestException(
        'Can only volunteer for public tasks',
      );
    }

    // Verify task is not already assigned
    if (task.assigneeId) {
      throw new BadRequestException('Task is already assigned');
    }

    // Store previous assignee for history (null in this case)
    const previousAssigneeId = task.assigneeId;

    // Assign task to volunteer
    task.assignTo(command.userId);

    // Save task
    await this.taskRepository.save(task);

    // Create assignment history record
    const assignmentHistory = AssignmentHistory.create({
      taskId: task.id,
      assignedBy: command.userId, // Self-assignment
      assignedTo: command.userId,
      previousAssignee: previousAssigneeId,
    });
    await this.assignmentHistoryRepository.save(assignmentHistory);

    // Log activity
    const activityLog = ActivityLog.create({
      taskId: command.taskId,
      userId: command.userId,
      action: ActivityAction.TASK_VOLUNTEERED,
      details: { volunteerId: command.userId },
    });
    await this.activityLogRepository.save(activityLog);

    // Publish event
    const event = new TaskAssignedEvent(
      task.id,
      task.title.value,
      task.assignerId,
      command.userId,
      task.dueDate,
    );
    this.eventBus.publish(event);
  }
}
