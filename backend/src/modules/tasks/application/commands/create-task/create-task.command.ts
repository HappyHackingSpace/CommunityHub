import { TaskVisibility } from '../../../domain/enums/task-visibility.enum';

export class CreateTaskCommand {
  constructor(
    public readonly title: string,
    public readonly assignerId: string,
    public readonly description?: string,
    public readonly assigneeId?: string,
    public readonly dueDate?: Date,
    public readonly visibility?: TaskVisibility,
    public readonly tagIds?: string[],
  ) {}
}
