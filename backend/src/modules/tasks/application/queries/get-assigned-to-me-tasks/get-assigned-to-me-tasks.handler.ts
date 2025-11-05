import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAssignedToMeTasksQuery } from './get-assigned-to-me-tasks.query';
import { TaskResponseDto } from '../../dto/task-response.dto';
import { TagResponseDto } from '../../dto/tag-response.dto';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { ITaskTagRepository } from '../../../domain/repositories/task-tag.repository.interface';
import type { ITagRepository } from '../../../domain/repositories/tag.repository.interface';

@QueryHandler(GetAssignedToMeTasksQuery)
export class GetAssignedToMeTasksHandler
  implements IQueryHandler<GetAssignedToMeTasksQuery>
{
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('ITaskTagRepository')
    private readonly taskTagRepository: ITaskTagRepository,
    @Inject('ITagRepository')
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(query: GetAssignedToMeTasksQuery): Promise<TaskResponseDto[]> {
    const tasks = await this.taskRepository.findByAssigneeId(
      query.userId,
      query.status,
    );

    const tasksWithTags = await Promise.all(
      tasks.map(async (task) => {
        const tagIds = await this.taskTagRepository.findTagIdsByTaskId(task.id);
        const tags = tagIds.length > 0 ? await this.tagRepository.findByIds(tagIds) : [];

        const dto = TaskResponseDto.fromDomain(task);
        dto.tags = tags.map((t) => TagResponseDto.fromDomain(t));
        return dto;
      }),
    );

    return tasksWithTags;
  }
}
