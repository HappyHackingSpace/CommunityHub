import { ValueObject } from 'src/shared/domain/value-object';

interface CommentContentProps {
  value: string;
}

export class CommentContent extends ValueObject<CommentContentProps> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 1000;

  private constructor(props: CommentContentProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(content: string): CommentContent {
    if (!this.isValid(content)) {
      throw new Error(
        `Comment content must be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH} characters`,
      );
    }
    return new CommentContent({ value: content.trim() });
  }

  private static isValid(content: string): boolean {
    if (!content || content.trim().length === 0) return false;
    const trimmed = content.trim();
    return (
      trimmed.length >= this.MIN_LENGTH && trimmed.length <= this.MAX_LENGTH
    );
  }
}
