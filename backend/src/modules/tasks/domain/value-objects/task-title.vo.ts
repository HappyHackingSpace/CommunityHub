import { ValueObject } from 'src/shared/domain/value-object';

interface TaskTitleProps {
  value: string;
}

export class TaskTitle extends ValueObject<TaskTitleProps> {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 200;

  private constructor(props: TaskTitleProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(title: string): TaskTitle {
    if (!this.isValid(title)) {
      throw new Error(
        `Task title must be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH} characters`,
      );
    }
    return new TaskTitle({ value: title.trim() });
  }

  private static isValid(title: string): boolean {
    if (!title || title.trim().length === 0) return false;
    const trimmed = title.trim();
    return (
      trimmed.length >= this.MIN_LENGTH && trimmed.length <= this.MAX_LENGTH
    );
  }
}
