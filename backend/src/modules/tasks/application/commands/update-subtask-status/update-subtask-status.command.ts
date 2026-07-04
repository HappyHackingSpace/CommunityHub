import { TaskStatus } from '../../../domain/enums/task-status.enum';

export class UpdateSubTaskStatusCommand {
  constructor(
    public readonly subTaskId: string,
    public readonly userId: string,
    public readonly status: TaskStatus,
  ) {}
}
