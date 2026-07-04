export class CommunityDescription {
  private constructor(private readonly value: string) {}

  public static create(description: string): CommunityDescription {
    if (!description || description.trim().length === 0) {
      throw new Error('Community description cannot be empty');
    }
    if (description.length > 1000) {
      throw new Error('Community description cannot exceed 1000 characters');
    }
    return new CommunityDescription(description.trim());
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: CommunityDescription): boolean {
    return this.value === other.value;
  }
}
