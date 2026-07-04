import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SearchAssignedToMeTasksQuery } from './search-assigned-to-me-tasks.query';
import { PaginatedResponseDto } from '../../dto/pagination.dto';
import { TaskResponseDto } from '../../dto/task-response.dto';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';

@QueryHandler(SearchAssignedToMeTasksQuery)
export class SearchAssignedToMeTasksHandler
  implements IQueryHandler<SearchAssignedToMeTasksQuery>
{
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(
    query: SearchAssignedToMeTasksQuery,
  ): Promise<PaginatedResponseDto<TaskResponseDto>> {
    const { data, total } =
      await this.taskRepository.searchAssignedToMeTasks(
        query.userId,
        query.options,
      );

    const taskDtos = data.map((task) => TaskResponseDto.fromDomain(task));

    return new PaginatedResponseDto(
      taskDtos,
      total,
      query.options.page,
      query.options.limit,
    );
  }
}
