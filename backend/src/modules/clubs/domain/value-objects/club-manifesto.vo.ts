export class ClubManifesto {
  private constructor(private readonly value: string) {}

  public static create(manifesto: string): ClubManifesto {
    if (!manifesto || manifesto.trim().length === 0) {
      throw new Error('Club manifesto cannot be empty');
    }
    if (manifesto.length > 5000) {
      throw new Error('Club manifesto cannot exceed 5000 characters');
    }
    return new ClubManifesto(manifesto.trim());
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: ClubManifesto): boolean {
    return this.value === other.value;
  }
}
