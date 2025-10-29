import { ValueObject } from 'src/shared/domain/value-object';

interface MeetingDurationProps {
  minutes: number;
}

export class MeetingDuration extends ValueObject<MeetingDurationProps> {
  private static readonly MIN_DURATION = 15; // 15 minutes
  private static readonly MAX_DURATION = 480; // 8 hours

  private constructor(props: MeetingDurationProps) {
    super(props);
  }

  get minutes(): number {
    return this.props.minutes;
  }

  get hours(): number {
    return Math.floor(this.props.minutes / 60);
  }

  get remainingMinutes(): number {
    return this.props.minutes % 60;
  }

  public static create(minutes: number): MeetingDuration {
    if (!this.isValid(minutes)) {
      throw new Error(
        `Meeting duration must be between ${this.MIN_DURATION} and ${this.MAX_DURATION} minutes`
      );
    }

    return new MeetingDuration({ minutes });
  }

  private static isValid(minutes: number): boolean {
    return (
      Number.isInteger(minutes) &&
      minutes >= this.MIN_DURATION &&
      minutes <= this.MAX_DURATION &&
      minutes % 15 === 0 // Must be in 15-minute increments
    );
  }

  public toString(): string {
    if (this.hours > 0) {
      return this.remainingMinutes > 0
        ? `${this.hours}h ${this.remainingMinutes}m`
        : `${this.hours}h`;
    }
    return `${this.minutes}m`;
  }
}