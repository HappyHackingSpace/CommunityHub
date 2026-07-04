export class PostContent {
  private constructor(private readonly content: string) {
    this.validate();
  }

  get value(): string {
    return this.content;
  }

  public static create(content: string): PostContent {
    return new PostContent(content.trim());
  }

  private validate(): void {
    if (!this.content || this.content.length === 0) {
      throw new Error('Post content cannot be empty');
    }
    if (this.content.length > 5000) {
      throw new Error('Post content cannot exceed 5000 characters');
    }
  }
}
