import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAssignedByMeTasksQuery } from './get-assigned-by-me-tasks.query';
import { TaskResponseDto } from '../../dto/task-response.dto';
import { TagResponseDto } from '../../dto/tag-response.dto';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { ITaskTagRepository } from '../../../domain/repositories/task-tag.repository.interface';
import type { ITagRepository } from '../../../domain/repositories/tag.repository.interface';

@QueryHandler(GetAssignedByMeTasksQuery)
export class GetAssignedByMeTasksHandler
  implements IQueryHandler<GetAssignedByMeTasksQuery>
{
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('ITaskTagRepository')
    private readonly taskTagRepository: ITaskTagRepository,
    @Inject('ITagRepository')
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(query: GetAssignedByMeTasksQuery): Promise<TaskResponseDto[]> {
    const tasks = await this.taskRepository.findByAssignerId(
      query.userId,
      query.status,
    );

    return tasks.map((task) => TaskResponseDto.fromDomain(task));
  }
}
