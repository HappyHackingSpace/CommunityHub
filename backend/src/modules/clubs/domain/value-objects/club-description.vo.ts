export class ClubDescription {
  private constructor(private readonly value: string) {}

  public static create(description: string): ClubDescription {
    if (!description || description.trim().length === 0) {
      throw new Error('Club description cannot be empty');
    }
    if (description.length > 500) {
      throw new Error('Club description cannot exceed 500 characters');
    }
    return new ClubDescription(description.trim());
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: ClubDescription): boolean {
    return this.value === other.value;
  }
}
