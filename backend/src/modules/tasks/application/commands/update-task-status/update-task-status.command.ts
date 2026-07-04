import { TaskStatus } from '../../../domain/enums/task-status.enum';

export class UpdateTaskStatusCommand {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
    public readonly status: TaskStatus,
  ) {}
}
