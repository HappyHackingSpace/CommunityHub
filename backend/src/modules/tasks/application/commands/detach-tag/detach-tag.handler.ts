import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DetachTagCommand } from './detach-tag.command';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { ITaskTagRepository } from '../../../domain/repositories/task-tag.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '../../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../../domain/enums/activity-action.enum';

@CommandHandler(DetachTagCommand)
export class DetachTagHandler implements ICommandHandler<DetachTagCommand> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('ITaskTagRepository')
    private readonly taskTagRepository: ITaskTagRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  async execute(command: DetachTagCommand): Promise<void> {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.canBeModifiedBy(command.userId)) {
      throw new ForbiddenException('You cannot modify tags for this task');
    }

    await this.taskTagRepository.detachTag(command.taskId, command.tagId);

    // Log tag removal
    const log = ActivityLog.create({
      taskId: command.taskId,
      userId: command.userId,
      action: ActivityAction.TAG_REMOVED,
      details: { tagId: command.tagId },
    });
    await this.activityLogRepository.save(log);
  }
}
