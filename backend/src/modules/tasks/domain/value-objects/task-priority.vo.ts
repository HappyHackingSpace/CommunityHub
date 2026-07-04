import { TaskPriority as TaskPriorityEnum } from '../enums/task-priority.enum';

export class TaskPriority {
  private readonly value: TaskPriorityEnum;

  private constructor(value: TaskPriorityEnum) {
    this.value = value;
  }

  public static create(value: TaskPriorityEnum): TaskPriority {
    if (!Object.values(TaskPriorityEnum).includes(value)) {
      throw new Error('Invalid task priority');
    }
    return new TaskPriority(value);
  }

  public getValue(): TaskPriorityEnum {
    return this.value;
  }

  public equals(other: TaskPriority): boolean {
    return this.value === other.value;
  }

  public isHigherThan(other: TaskPriority): boolean {
    const priorities = [
      TaskPriorityEnum.LOW,
      TaskPriorityEnum.MEDIUM,
      TaskPriorityEnum.HIGH,
      TaskPriorityEnum.CRITICAL,
    ];
    return priorities.indexOf(this.value) > priorities.indexOf(other.value);
  }
}
