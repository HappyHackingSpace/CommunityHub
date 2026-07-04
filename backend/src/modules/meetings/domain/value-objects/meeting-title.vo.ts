import { ValueObject } from 'src/shared/domain/value-object';

interface MeetingTitleProps {
  value: string;
}

export class MeetingTitle extends ValueObject<MeetingTitleProps> {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 200;

  private constructor(props: MeetingTitleProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(title: string): MeetingTitle {
    if (!this.isValid(title)) {
      throw new Error(
        `Meeting title must be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH} characters`
      );
    }

    const normalized = title.trim();
    return new MeetingTitle({ value: normalized });
  }

  private static isValid(title: string): boolean {
    if (!title || title.trim().length === 0) {
      return false;
    }

    const trimmed = title.trim();
    return trimmed.length >= this.MIN_LENGTH && trimmed.length <= this.MAX_LENGTH;
  }

  public toString(): string {
    return this.value;
  }
}