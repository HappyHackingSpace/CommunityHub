import type { SearchTasksOptions } from '../../../domain/repositories/task.repository.interface';

export class SearchPublicTasksQuery {
  constructor(public readonly options: SearchTasksOptions) {}
}
