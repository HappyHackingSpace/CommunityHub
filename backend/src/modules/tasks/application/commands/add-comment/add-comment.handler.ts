import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AddCommentCommand } from './add-comment.command';
import { Comment } from '../../../domain/entities/comment.entity';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { ICommentRepository } from '../../../domain/repositories/comment.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '../../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../../domain/enums/activity-action.enum';

@CommandHandler(AddCommentCommand)
export class AddCommentHandler implements ICommandHandler<AddCommentCommand> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  async execute(command: AddCommentCommand): Promise<Comment> {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.canBeViewedBy(command.userId)) {
      throw new ForbiddenException('You cannot comment on this task');
    }

    const comment = Comment.create({
      taskId: command.taskId,
      userId: command.userId,
      content: command.content,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Log comment addition
    const log = ActivityLog.create({
      taskId: command.taskId,
      userId: command.userId,
      action: ActivityAction.COMMENT_ADDED,
    });
    await this.activityLogRepository.save(log);

    return savedComment;
  }
}
