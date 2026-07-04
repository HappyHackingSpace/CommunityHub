import { Injectable } from '@nestjs/common';
import { Meeting } from '../../domain/entities/meeting.entity';

@Injectable()
export class ICalendarService {
  /**
   * Generates an iCalendar (.ics) file content for a meeting
   * Compatible with Google Calendar, Outlook, and Apple Calendar
   */
  generateICalendar(meeting: Meeting, organizerEmail: string): string {
    const lines: string[] = [];

    // iCal header
    lines.push('BEGIN:VCALENDAR');
    lines.push('VERSION:2.0');
    lines.push('PRODID:-//CommunityHub//Meeting Calendar//EN');
    lines.push('CALSCALE:GREGORIAN');
    lines.push('METHOD:REQUEST');

    // Event
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${meeting.id}@communityhub.local`);
    lines.push(`DTSTAMP:${this.formatDateTime(new Date())}`);
    lines.push(`DTSTART:${this.formatDateTime(meeting.startTime)}`);
    lines.push(`DTEND:${this.formatDateTime(meeting.endTime)}`);
    lines.push(`SUMMARY:${this.escapeText(meeting.title.value)}`);

    if (meeting.description) {
      lines.push(`DESCRIPTION:${this.escapeText(meeting.description)}`);
    }

    // Location
    if (meeting.meetingUrl) {
      lines.push(`URL:${meeting.meetingUrl}`);
      lines.push(`LOCATION:${meeting.meetingUrl}`);
    } else if (meeting.location) {
      lines.push(`LOCATION:${this.escapeText(meeting.location)}`);
    }

    // Organizer
    lines.push(`ORGANIZER;CN="Meeting Organizer":mailto:${organizerEmail}`);

    // Status
    lines.push('STATUS:CONFIRMED');
    lines.push('SEQUENCE:0');

    // Recurrence rule if present
    if (meeting.recurrenceRule) {
      lines.push(`RRULE:${meeting.recurrenceRule.toRRuleString()}`);
    }

    // Reminders (alarms)
    // 1 day before
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-P1D');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:Meeting reminder: ${this.escapeText(meeting.title.value)}`);
    lines.push('END:VALARM');

    // 1 hour before
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-PT1H');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:Meeting starts in 1 hour`);
    lines.push('END:VALARM');

    lines.push('END:VEVENT');
    lines.push('END:VCALENDAR');

    return lines.join('\r\n');
  }

  /**
   * Formats a Date to iCalendar format (YYYYMMDDTHHMMSSZ)
   */
  private formatDateTime(date: Date): string {
    const pad = (num: number): string => num.toString().padStart(2, '0');

    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hour = pad(date.getUTCHours());
    const minute = pad(date.getUTCMinutes());
    const second = pad(date.getUTCSeconds());

    return `${year}${month}${day}T${hour}${minute}${second}Z`;
  }

  /**
   * Escapes special characters in text for iCalendar format
   */
  private escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  }

  /**
   * Generates a filename for the .ics file
   */
  generateFileName(meeting: Meeting): string {
    const sanitizedTitle = meeting.title.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `${sanitizedTitle}-${meeting.id}.ics`;
  }
}
