import { jDate } from "jcal-zmanim";
import { UserEvent, UserEventTypes } from "./types";

/**
 * Formats a date for iCalendar format (YYYYMMDD)
 */
function formatICalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

/**
 * Formats a date-time for iCalendar format (YYYYMMDDTHHmmss)
 */
function formatICalDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Escapes special characters for iCalendar format
 */
function escapeICalText(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

/**
 * Generates recurrence rule for recurring events
 */
function getRecurrenceRule(event: UserEvent): string {
    switch (event.type) {
        case UserEventTypes.HebrewDateRecurringYearly:
        case UserEventTypes.SecularDateRecurringYearly:
            return 'RRULE:FREQ=YEARLY';
        case UserEventTypes.HebrewDateRecurringMonthly:
        case UserEventTypes.SecularDateRecurringMonthly:
            return 'RRULE:FREQ=MONTHLY';
        case UserEventTypes.OneTime:
        default:
            return '';
    }
}

/**
 * Generates an iCalendar (.ics) file for a single event
 */
export function generateICS(event: UserEvent): string {
    const jd = new jDate(event.jYear, event.jMonth, event.jDay);
    const startDate = jd.getDate();

    // Set time to 9:00 AM for all-day events
    startDate.setHours(9, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(10, 0, 0, 0); // 1 hour duration

    const now = new Date();
    const uid = `${event.id}@luach-web`;

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Luach Web//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICalDateTime(now)}
DTSTART:${formatICalDateTime(startDate)}
DTEND:${formatICalDateTime(endDate)}
SUMMARY:${escapeICalText(event.name)}`;

    // Add description if notes exist
    if (event.notes) {
        icsContent += `\nDESCRIPTION:${escapeICalText(event.notes)}`;
    }

    // Add recurrence rule
    const rrule = getRecurrenceRule(event);
    if (rrule) {
        icsContent += `\n${rrule}`;
    }

    // Add reminders
    if (event.remindDayBefore) {
        icsContent += `\nBEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Reminder: ${escapeICalText(event.name)} tomorrow
END:VALARM`;
    }

    if (event.remindDayOf) {
        icsContent += `\nBEGIN:VALARM
TRIGGER:-PT2H
ACTION:DISPLAY
DESCRIPTION:Reminder: ${escapeICalText(event.name)} today
END:VALARM`;
    }

    icsContent += `\nEND:VEVENT
END:VCALENDAR`;

    return icsContent;
}

/**
 * Downloads an .ics file for an event
 */
export function downloadEventAsICS(event: UserEvent): void {
    const icsContent = generateICS(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.name.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Generates an .ics file for multiple events
 */
export function generateMultipleEventsICS(events: UserEvent[]): string {
    const now = new Date();

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Luach Web//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH`;

    events.forEach(event => {
        const jd = new jDate(event.jYear, event.jMonth, event.jDay);
        const startDate = jd.getDate();
        startDate.setHours(9, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setHours(10, 0, 0, 0);

        const uid = `${event.id}@luach-web`;

        icsContent += `\nBEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICalDateTime(now)}
DTSTART:${formatICalDateTime(startDate)}
DTEND:${formatICalDateTime(endDate)}
SUMMARY:${escapeICalText(event.name)}`;

        if (event.notes) {
            icsContent += `\nDESCRIPTION:${escapeICalText(event.notes)}`;
        }

        const rrule = getRecurrenceRule(event);
        if (rrule) {
            icsContent += `\n${rrule}`;
        }

        if (event.remindDayBefore) {
            icsContent += `\nBEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Reminder: ${escapeICalText(event.name)} tomorrow
END:VALARM`;
        }

        if (event.remindDayOf) {
            icsContent += `\nBEGIN:VALARM
TRIGGER:-PT2H
ACTION:DISPLAY
DESCRIPTION:Reminder: ${escapeICalText(event.name)} today
END:VALARM`;
        }

        icsContent += `\nEND:VEVENT`;
    });

    icsContent += `\nEND:VCALENDAR`;

    return icsContent;
}

/**
 * Downloads all events as a single .ics file
 */
export function downloadAllEventsAsICS(events: UserEvent[]): void {
    const icsContent = generateMultipleEventsICS(events);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `luach-events-${new Date().toISOString().split('T')[0]}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
