import { TaskVisibility } from '../../../domain/enums/task-visibility.enum';
import { TaskPriority } from '../../../domain/enums/task-priority.enum';

export class CreateTaskCommand {
  constructor(
    public readonly title: string,
    public readonly assignerId: string,
    public readonly description?: string,
    public readonly assigneeId?: string,
    public readonly dueDate?: Date,
    public readonly visibility?: TaskVisibility,
    public readonly priority?: TaskPriority,
    public readonly estimatedTime?: number,
    public readonly points?: number,
    public readonly isRecurring?: boolean,
    public readonly recurringSchedule?: string,
    public readonly requiredSkills?: string[],
    public readonly tagIds?: string[],
  ) {}
}
