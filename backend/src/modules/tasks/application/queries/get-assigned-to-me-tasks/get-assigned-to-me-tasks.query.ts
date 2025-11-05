import { TaskStatus } from '../../../domain/enums/task-status.enum';

export class GetAssignedToMeTasksQuery {
  constructor(
    public readonly userId: string,
    public readonly status?: TaskStatus,
  ) {}
}
