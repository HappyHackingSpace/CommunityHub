import type { SearchTasksOptions } from '../../../domain/repositories/task.repository.interface';

export class SearchAssignedByMeTasksQuery {
  constructor(
    public readonly userId: string,
    public readonly options: SearchTasksOptions,
  ) {}
}
