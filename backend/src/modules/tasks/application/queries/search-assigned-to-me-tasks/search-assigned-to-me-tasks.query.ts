import type { SearchTasksOptions } from '../../../domain/repositories/task.repository.interface';

export class SearchAssignedToMeTasksQuery {
  constructor(
    public readonly userId: string,
    public readonly options: SearchTasksOptions,
  ) {}
}
