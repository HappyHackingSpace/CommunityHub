import { TaskStatus } from '../../../domain/enums/task-status.enum';

export class GetAssignedByMeTasksQuery {
  constructor(
    public readonly userId: string,
    public readonly status?: TaskStatus,
  ) {}
}
