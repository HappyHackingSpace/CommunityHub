import { RecurrenceFrequency } from '../enums/recurrence-frequency.enum';

interface RecurrenceRuleProps {
  frequency: RecurrenceFrequency;
  interval: number; // Repeat every X days/weeks/months/years
  until?: Date; // End date for recurrence
  count?: number; // Number of occurrences
  byWeekDay?: number[]; // 0-6 (Sunday-Saturday) for weekly recurrence
  byMonthDay?: number; // 1-31 for monthly recurrence
}

export class RecurrenceRule {
  private constructor(private readonly props: RecurrenceRuleProps) {
    this.validate();
  }

  get frequency(): RecurrenceFrequency {
    return this.props.frequency;
  }

  get interval(): number {
    return this.props.interval;
  }

  get until(): Date | undefined {
    return this.props.until;
  }

  get count(): number | undefined {
    return this.props.count;
  }

  get byWeekDay(): number[] | undefined {
    return this.props.byWeekDay;
  }

  get byMonthDay(): number | undefined {
    return this.props.byMonthDay;
  }

  static create(props: RecurrenceRuleProps): RecurrenceRule {
    return new RecurrenceRule(props);
  }

  /**
   * Generates an iCalendar RRULE string
   * Example: FREQ=WEEKLY;INTERVAL=1;BYDAY=TH;UNTIL=20251231T235959Z
   */
  toRRuleString(): string {
    let rrule = `FREQ=${this.props.frequency.toUpperCase()};INTERVAL=${this.props.interval}`;

    if (this.props.byWeekDay && this.props.byWeekDay.length > 0) {
      const weekDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      const days = this.props.byWeekDay.map(day => weekDays[day]).join(',');
      rrule += `;BYDAY=${days}`;
    }

    if (this.props.byMonthDay) {
      rrule += `;BYMONTHDAY=${this.props.byMonthDay}`;
    }

    if (this.props.until) {
      const until = this.props.until.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      rrule += `;UNTIL=${until}`;
    } else if (this.props.count) {
      rrule += `;COUNT=${this.props.count}`;
    }

    return rrule;
  }

  /**
   * Parses an iCalendar RRULE string
   */
  static fromRRuleString(rruleString: string): RecurrenceRule {
    const parts = rruleString.split(';');
    const props: any = {};

    parts.forEach(part => {
      const [key, value] = part.split('=');

      switch (key) {
        case 'FREQ':
          props.frequency = value.toLowerCase() as RecurrenceFrequency;
          break;
        case 'INTERVAL':
          props.interval = parseInt(value, 10);
          break;
        case 'UNTIL':
          const year = parseInt(value.substring(0, 4), 10);
          const month = parseInt(value.substring(4, 6), 10) - 1;
          const day = parseInt(value.substring(6, 8), 10);
          const hour = parseInt(value.substring(9, 11), 10);
          const minute = parseInt(value.substring(11, 13), 10);
          const second = parseInt(value.substring(13, 15), 10);
          props.until = new Date(Date.UTC(year, month, day, hour, minute, second));
          break;
        case 'COUNT':
          props.count = parseInt(value, 10);
          break;
        case 'BYDAY':
          const weekDayMap: { [key: string]: number } = {
            'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6
          };
          props.byWeekDay = value.split(',').map(day => weekDayMap[day]);
          break;
        case 'BYMONTHDAY':
          props.byMonthDay = parseInt(value, 10);
          break;
      }
    });

    return RecurrenceRule.create(props);
  }

  private validate(): void {
    if (this.props.interval < 1) {
      throw new Error('Recurrence interval must be at least 1');
    }

    if (this.props.until && this.props.count) {
      throw new Error('Cannot specify both UNTIL and COUNT in recurrence rule');
    }

    if (this.props.byWeekDay) {
      this.props.byWeekDay.forEach(day => {
        if (day < 0 || day > 6) {
          throw new Error('Invalid weekday in recurrence rule');
        }
      });
    }

    if (this.props.byMonthDay) {
      if (this.props.byMonthDay < 1 || this.props.byMonthDay > 31) {
        throw new Error('Invalid month day in recurrence rule');
      }
    }
  }
}
