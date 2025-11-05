import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AttachTagsCommand } from './attach-tags.command';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { ITaskTagRepository } from '../../../domain/repositories/task-tag.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '../../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../../domain/enums/activity-action.enum';

@CommandHandler(AttachTagsCommand)
export class AttachTagsHandler implements ICommandHandler<AttachTagsCommand> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('ITaskTagRepository')
    private readonly taskTagRepository: ITaskTagRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  async execute(command: AttachTagsCommand): Promise<void> {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.canBeModifiedBy(command.userId)) {
      throw new ForbiddenException('You cannot modify tags for this task');
    }

    await this.taskTagRepository.attachTags(command.taskId, command.tagIds);

    // Log tag attachment
    const log = ActivityLog.create({
      taskId: command.taskId,
      userId: command.userId,
      action: ActivityAction.TAG_ADDED,
      details: { tagIds: command.tagIds },
    });
    await this.activityLogRepository.save(log);
  }
}
