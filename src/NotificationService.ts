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
     * Request permission from the user to send notifications
     */
    static async requestPermission(): Promise<boolean> {
        if (!("Notification" in window)) return false;
        if (Notification.permission === "granted") return true;

        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    /**
     * Checks all events and triggers notifications for today and tomorrow
     * based on the event's reminder settings.
     */
    static async checkAndNotify(events: UserEvent[], user: User | null, db: Firestore): Promise<void> {
        const hasPermission = await this.requestPermission();
        // Permission check is only for browser notifications, email should proceed

        const today = new jDate();
        const tomorrow = today.addDays(1);

        events.forEach(event => {
            // Check for Tomorrow (Day Before Reminder)
            if (event.remindDayBefore && this.isEventOnDate(event, tomorrow)) {
                if (hasPermission) this.sendNotification(event, tomorrow, "Tomorrow");
                if (user?.email) this.sendEmailNotification(event, tomorrow, "Tomorrow", user.email, db);
            }

            // Check for Today (Day Of Reminder)
            if (event.remindDayOf && this.isEventOnDate(event, today)) {
                if (hasPermission) this.sendNotification(event, today, "Today");
                if (user?.email) this.sendEmailNotification(event, today, "Today", user.email, db);
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
                return event.jYear === date.Year &&
                    event.jMonth === date.Month &&
                    event.jDay === date.Day;

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

    /**
     * Sends an email by adding a document to the 'mail' collection
     */
    private static async sendEmailNotification(
        event: UserEvent,
        date: jDate,
        timeLabel: string,
        userEmail: string,
        db: Firestore
    ): Promise<void> {
        const anniversary = getAnniversaryNumber(event, date);
        const storageKey = `email_${event.id}_${date.Year}_${date.Month}_${date.Day}`;

        // Anti-spam: Only send email once per event/date
        if (localStorage.getItem(storageKey)) return;

        const suffix = anniversary > 0 ? this.getOrdinalSuffix(anniversary) : "";
        const annivText = anniversary > 0 ? ` (${anniversary}${suffix} Anniversary)` : "";

        try {
            await addDoc(collection(db, "mail"), {
                to: userEmail,
                message: {
                    subject: `Luach Reminder: ${event.name} is ${timeLabel.toLowerCase()}!`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #fde047; border-radius: 10px;">
                            <h2 style="color: #b45309;">Luach - Jewish Calendar</h2>
                            <p>Hi there,</p>
                            <p>This is a reminder that <strong>${event.name}${annivText}</strong> occurs ${timeLabel.toLowerCase()} (${date.toString()}).</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p style="font-size: 12px; color: #666;">You are receiving this because you set a reminder on your Luach calendar.</p>
                        </div>
                    `
                }
            });
            localStorage.setItem(storageKey, "true");
            console.log(`✉️ Email queued for: ${event.name}`);
        } catch (error) {
            console.error("❌ Failed to queue email:", error);
        }
    }

    private static getOrdinalSuffix(n: number): string {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }
}
