import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetTaskQuery } from './get-task.query';
import { TaskResponseDto } from '../../dto/task-response.dto';
import { CommentResponseDto } from '../../dto/comment-response.dto';
import { ActivityLogResponseDto } from '../../dto/activity-log-response.dto';
import { SubTaskResponseDto } from '../../dto/subtask-response.dto';
import { TagResponseDto } from '../../dto/tag-response.dto';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { ICommentRepository } from '../../../domain/repositories/comment.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import type { ISubTaskRepository } from '../../../domain/repositories/subtask.repository.interface';
import type { ITaskTagRepository } from '../../../domain/repositories/task-tag.repository.interface';
import type { ITagRepository } from '../../../domain/repositories/tag.repository.interface';

@QueryHandler(GetTaskQuery)
export class GetTaskHandler implements IQueryHandler<GetTaskQuery> {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
    @Inject('ISubTaskRepository')
    private readonly subTaskRepository: ISubTaskRepository,
    @Inject('ITaskTagRepository')
    private readonly taskTagRepository: ITaskTagRepository,
    @Inject('ITagRepository')
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(query: GetTaskQuery): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findById(query.taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.canBeViewedBy(query.userId)) {
      throw new ForbiddenException('You cannot view this task');
    }

    // Fetch all related data
    const [comments, activityLogs, subTasks, tagIds] = await Promise.all([
      this.commentRepository.findByTaskId(query.taskId),
      this.activityLogRepository.findByTaskId(query.taskId),
      this.subTaskRepository.findByParentId(query.taskId),
      this.taskTagRepository.findTagIdsByTaskId(query.taskId),
    ]);

    const tags = tagIds.length > 0 ? await this.tagRepository.findByIds(tagIds) : [];

    return TaskResponseDto.fromDomainWithRelations(
      task,
      comments.map((c) => CommentResponseDto.fromDomain(c)),
      activityLogs.map((log) => ActivityLogResponseDto.fromDomain(log)),
      subTasks.map((st) => SubTaskResponseDto.fromDomain(st)),
      tags.map((t) => TagResponseDto.fromDomain(t)),
    );
  }
}
