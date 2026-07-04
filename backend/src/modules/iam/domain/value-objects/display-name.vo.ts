import { ValueObject } from 'src/shared/domain/value-object';
interface DisplayNameProps {
  value: string;
}

export class DisplayName extends ValueObject<DisplayNameProps> {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 50;

  private constructor(props: DisplayNameProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(name: string): DisplayName {
    if (!this.isValid(name)) {
      throw new Error(
        `Display name must be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH} characters`
      );
    }

    const normalized = name.trim();
    return new DisplayName({ value: normalized });
  }

  private static isValid(name: string): boolean {
    if (!name || name.trim().length === 0) {
      return false;
    }

    const trimmed = name.trim();
    return trimmed.length >= this.MIN_LENGTH && trimmed.length <= this.MAX_LENGTH;
  }

  public toString(): string {
    return this.value;
  }
}