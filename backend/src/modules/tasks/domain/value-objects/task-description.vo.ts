import { ValueObject } from 'src/shared/domain/value-object';

interface TaskDescriptionProps {
  value: string;
}

export class TaskDescription extends ValueObject<TaskDescriptionProps> {
  private static readonly MAX_LENGTH = 2000;

  private constructor(props: TaskDescriptionProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(description: string): TaskDescription {
    if (!this.isValid(description)) {
      throw new Error(
        `Task description must not exceed ${this.MAX_LENGTH} characters`,
      );
    }
    return new TaskDescription({ value: description.trim() });
  }

  private static isValid(description: string): boolean {
    if (!description) return true; // Description is optional
    return description.trim().length <= this.MAX_LENGTH;
  }
}
