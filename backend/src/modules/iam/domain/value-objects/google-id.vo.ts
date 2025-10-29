import { ValueObject } from '../../../../shared/domain/value-object';

interface GoogleIdProps {
  value: string;
}

export class GoogleId extends ValueObject<GoogleIdProps> {
  private constructor(props: GoogleIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(googleId: string): GoogleId {
    if (!googleId || googleId.trim().length === 0) {
      throw new Error('Google ID cannot be empty');
    }

    return new GoogleId({ value: googleId.trim() });
  }

  public toString(): string {
    return this.value;
  }
}   