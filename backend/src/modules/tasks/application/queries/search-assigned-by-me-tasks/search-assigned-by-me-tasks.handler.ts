import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SearchAssignedByMeTasksQuery } from './search-assigned-by-me-tasks.query';
import { PaginatedResponseDto } from '../../dto/pagination.dto';
import { TaskResponseDto } from '../../dto/task-response.dto';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';

@QueryHandler(SearchAssignedByMeTasksQuery)
export class SearchAssignedByMeTasksHandler
  implements IQueryHandler<SearchAssignedByMeTasksQuery>
{
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(
    query: SearchAssignedByMeTasksQuery,
  ): Promise<PaginatedResponseDto<TaskResponseDto>> {
    const { data, total } =
      await this.taskRepository.searchAssignedByMeTasks(
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
