import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SearchPublicTasksQuery } from './search-public-tasks.query';
import { PaginatedResponseDto } from '../../dto/pagination.dto';
import { TaskResponseDto } from '../../dto/task-response.dto';
import { TagResponseDto } from '../../dto/tag-response.dto';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';

@QueryHandler(SearchPublicTasksQuery)
export class SearchPublicTasksHandler
  implements IQueryHandler<SearchPublicTasksQuery>
{
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(
    query: SearchPublicTasksQuery,
  ): Promise<PaginatedResponseDto<TaskResponseDto>> {
    const { data, total } = await this.taskRepository.searchPublicTasks(
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
