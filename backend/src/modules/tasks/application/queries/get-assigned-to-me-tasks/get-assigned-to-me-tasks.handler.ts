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

    return tasks.map((task) => {
      const dto = TaskResponseDto.fromDomain(task);
      if (task.tags) {
        dto.tags = task.tags.map(t => TagResponseDto.fromDomain(t));
      }
      return dto;
    });
  }
}
