import { ValueObject } from 'src/shared/domain/value-object';

interface TagNameProps {
  value: string;
}

export class TagName extends ValueObject<TagNameProps> {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 50;

  private constructor(props: TagNameProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(name: string): TagName {
    if (!this.isValid(name)) {
      throw new Error(
        `Tag name must be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH} characters`,
      );
    }
    return new TagName({ value: name.trim().toLowerCase() });
  }

  private static isValid(name: string): boolean {
    if (!name || name.trim().length === 0) return false;
    const trimmed = name.trim();
    return trimmed.length >= this.MIN_LENGTH && trimmed.length <= this.MAX_LENGTH;
  }
}
