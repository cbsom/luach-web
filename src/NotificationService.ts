import { jDate } from "jcal-zmanim";
import { UserEvent, UserEventTypes } from "./types";
import { getAnniversaryNumber } from "./utils";
import { collection, addDoc, Firestore } from "firebase/firestore";
import { User } from "firebase/auth";

/**
 * Service to handle native system notifications for recurring events.
 */
export class NotificationService {
    /**
     * Request permission from the user to send notifications.
     * MUST be called from a user-generated event.
     */
    static async requestPermission(): Promise<"granted" | "denied" | "default"> {
        if (!("Notification" in window)) return "default";
        const permission = await Notification.requestPermission();
        return permission;
    }

    /**
     * Returns the current permission status without requesting it.
     */
    static getPermissionStatus(): "granted" | "denied" | "default" {
        if (!("Notification" in window)) return "denied";
        return Notification.permission;
    }

    /**
     * Checks all events and triggers notifications for today and tomorrow
     * based on the event's reminder settings.
     */
    static async checkAndNotify(events: UserEvent[], user: User | null, db: Firestore, today: jDate, emailEnabled: boolean, browserNotificationsEnabled: boolean): Promise<void> {
        if (!browserNotificationsEnabled) return;
        const permission = this.getPermissionStatus();
        const canNotify = permission === "granted";

        const tomorrow = today.addDays(1);

        events.forEach(event => {
            // Check for Tomorrow (Day Before Reminder)
            if (event.remindDayBefore && this.isEventOnDate(event, tomorrow)) {
                if (canNotify) this.sendNotification(event, tomorrow, "Tomorrow");
            }

            // Check for Today (Day Of Reminder)
            if (event.remindDayOf && this.isEventOnDate(event, today)) {
                if (canNotify) this.sendNotification(event, today, "Today");
            }
        });
    }

    /**
     * Logic to determine if a recurring event falls on a specific jDate
     */
    private static isEventOnDate(event: UserEvent, date: jDate): boolean {
        switch (event.type) {
            case UserEventTypes.HebrewDateRecurringYearly:
                return event.jMonth === date.Month && event.jDay === date.Day;

            case UserEventTypes.HebrewDateRecurringMonthly:
                return event.jDay === date.Day;

            case UserEventTypes.SecularDateRecurringYearly: {
                const sEventDate = new Date(event.sDate);
                const sTargetDate = date.getDate();
                return sEventDate.getMonth() === sTargetDate.getMonth() &&
                    sEventDate.getDate() === sTargetDate.getDate();
            }

            case UserEventTypes.SecularDateRecurringMonthly: {
                const sEventDate = new Date(event.sDate);
                const sTargetDate = date.getDate();
                return sEventDate.getDate() === sTargetDate.getDate();
            }

            case UserEventTypes.OneTime:
                return event.jAbs === date.Abs || (
                    event.jYear === date.Year &&
                    event.jMonth === date.Month &&
                    event.jDay === date.Day
                );

            default:
                return false;
        }
    }

    /**
     * Triggers the actual browser/system notification
     */
    private static sendNotification(event: UserEvent, date: jDate, timeLabel: string): void {
        const anniversary = getAnniversaryNumber(event, date);
        const storageKey = `notif_${event.id}_${date.Year}_${date.Month}_${date.Day}`;

        // Don't show the same notification twice in the same app session/day
        if (localStorage.getItem(storageKey)) return;

        const title = `${event.name}`;
        let body = `${timeLabel}: ${event.name}`;

        if (anniversary > 0) {
            const suffix = this.getOrdinalSuffix(anniversary);
            body += ` (${anniversary}${suffix} Anniversary)`;
        }

        const notification = new Notification(title, {
            body,
            icon: "/icon.png",
            badge: "/icon.svg",
            requireInteraction: true // Keeps it on screen in some OSs
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        localStorage.setItem(storageKey, "true");
    }


    private static getOrdinalSuffix(n: number): string {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }
}
