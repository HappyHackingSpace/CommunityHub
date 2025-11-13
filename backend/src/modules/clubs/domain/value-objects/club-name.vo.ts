export class ClubName {
  private constructor(private readonly value: string) {}

  public static create(name: string): ClubName {
    if (!name || name.trim().length === 0) {
      throw new Error('Club name cannot be empty');
    }
    if (name.length > 100) {
      throw new Error('Club name cannot exceed 100 characters');
    }
    return new ClubName(name.trim());
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: ClubName): boolean {
    return this.value === other.value;
  }
}
