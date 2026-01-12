export class CommunityName {
  private constructor(private readonly value: string) {}

  public static create(name: string): CommunityName {
    if (!name || name.trim().length === 0) {
      throw new Error('Community name cannot be empty');
    }
    if (name.length > 100) {
      throw new Error('Community name cannot exceed 100 characters');
    }
    return new CommunityName(name.trim());
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: CommunityName): boolean {
    return this.value === other.value;
  }
}
