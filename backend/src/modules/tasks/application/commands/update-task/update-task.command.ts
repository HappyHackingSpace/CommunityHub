import { TaskVisibility } from '../../../domain/enums/task-visibility.enum';

export class UpdateTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
    public readonly title?: string,
    public readonly description?: string,
    public readonly dueDate?: Date,
    public readonly visibility?: TaskVisibility,
  ) {}
}
