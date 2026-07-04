import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { AssignMentorCommand } from './assign-mentor.command';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '../../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../../domain/enums/activity-action.enum';
import { MentorAssignedEvent } from '../../../domain/events/mentor-assigned.event';

@CommandHandler(AssignMentorCommand)
export class AssignMentorHandler
  implements ICommandHandler<AssignMentorCommand>
{
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AssignMentorCommand): Promise<void> {
    // Find task
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${command.taskId} not found`);
    }

    // Assign mentor
    task.assignMentor(command.mentorId);

    // Save task
    await this.taskRepository.save(task);

    // Log activity
    const activityLog = ActivityLog.create({
      taskId: command.taskId,
      userId: command.assignedBy,
      action: ActivityAction.MENTOR_ASSIGNED,
      details: { mentorId: command.mentorId },
    });
    await this.activityLogRepository.save(activityLog);

    // Publish event
    const event = new MentorAssignedEvent(
      task.id,
      task.title.value,
      command.mentorId,
      task.assigneeId,
    );
    this.eventBus.publish(event);
  }
}
