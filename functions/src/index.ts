import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { jDate, Locations, Utils } from "jcal-zmanim";

admin.initializeApp();
const db = admin.firestore();

enum UserEventTypes {
    OneTime = "one-time",
    HebrewDateRecurringYearly = "hebrew-yearly",
    HebrewDateRecurringMonthly = "hebrew-monthly",
    SecularDateRecurringYearly = "secular-yearly",
    SecularDateRecurringMonthly = "secular-monthly",
}

const isMonthMatch = (occMonth: number, occYear: number, currMonth: number, currYear: number) => {
    if (currMonth >= 12 && occMonth >= 12) {
        const isOccLeap = jDate.isJdLeapY(occYear);
        const isCurrLeap = jDate.isJdLeapY(currYear);
        if (isOccLeap !== isCurrLeap) {
            return (
                (isOccLeap && currMonth === 12) || (isCurrLeap && occMonth === 12 && currMonth === 13)
            );
        }
    }
    return occMonth === currMonth;
};

/**
 * Scheduled function to send daily email reminders.
 * Runs every hour to check for users in different timezones.
 * Only sends if the current time in the user's location is early morning (e.g. 7-8 AM).
 */
export const dailyReminders = onSchedule({
    schedule: "every 1 hours",
    region: "us-central1" // Default region, good to be explicit
}, async (event) => {
    console.log("🚀 Starting daily reminders check...");
    const usersSnap = await db.collection("users").get();

    for (const userDoc of usersSnap.docs) {
        const userId = userDoc.id;
        const settingsSnap = await db
            .collection("users")
            .doc(userId)
            .collection("settings")
            .doc("general")
            .get();
        const settings = settingsSnap.data();

        if (!settings || !settings.emailRemindersEnabled || !settings.email) {
            continue;
        }

        const locationName = settings.locationName || "Jerusalem";
        const location =
            Locations.find((l) => l.Name === locationName) ||
            Locations.find((l) => l.Name === "Jerusalem")!;

        const todayStartMode = settings.todayStartMode || "sunset";
        const today = todayStartMode === "sunset" ? Utils.nowAtLocation(location) : new jDate();

        // Determine local hour to see if we should send Now
        // We want to send reminders around 7:00 AM local time.
        // Simple timezone offset calculation (approximate since Locations doesn't have offset)
        // Actually, we can use the current time and check if it's the right "Jewish Date"
        // and if we haven't sent it yet.

        // To keep it simple and robust across timezones:
        // If we haven't sent a reminder for THIS Jewish Date yet, and it's morning time in the user's location.
        // Since we don't have TZ offsets easily, we'll just check if jAbs changed.

        const statusRef = db.collection("users").doc(userId).collection("status").doc("lastDailyCheck");
        const lastCheckSnap = await statusRef.get();
        const lastCheck = lastCheckSnap.data();

        if (lastCheck && lastCheck.jAbs === today.Abs) {
            // Already processed for today
            continue;
        }

        // Check for events
        const eventsSnap = await db.collection("users").doc(userId).collection("events").get();
        const events = eventsSnap.docs.map((d) => d.data());
        const sDate = today.getDate();

        const matches = events.filter((uo: any) => {
            // Must have reminders enabled for this event
            if (!uo.remindDayOf) return false;

            if (uo.type === UserEventTypes.OneTime) {
                return (
                    uo.jAbs === today.Abs ||
                    (uo.jDay === today.Day && uo.jMonth === today.Month && uo.jYear === today.Year)
                );
            }

            const eventStartAbs = uo.jAbs || jDate.absJd(uo.jYear, uo.jMonth, uo.jDay);
            if (eventStartAbs > today.Abs) return false;

            switch (uo.type) {
                case UserEventTypes.HebrewDateRecurringYearly:
                    return uo.jDay === today.Day && isMonthMatch(uo.jMonth, uo.jYear, today.Month, today.Year);
                case UserEventTypes.HebrewDateRecurringMonthly:
                    return uo.jDay === today.Day;
                case UserEventTypes.SecularDateRecurringYearly: {
                    const occSDate = new Date(uo.sDate);
                    return occSDate.getDate() === sDate.getDate() && occSDate.getMonth() === sDate.getMonth();
                }
                case UserEventTypes.SecularDateRecurringMonthly: {
                    const occSDate = new Date(uo.sDate);
                    return occSDate.getDate() === sDate.getDate();
                }
                default:
                    return false;
            }
        });

        if (matches.length > 0) {
            console.log(`📧 Sending ${matches.length} reminders to ${settings.email}`);

            // Group multiple reminders into one email?
            // For now, "Trigger Email" extension usually works per-doc.
            // Let's send a single digest email.
            const mailId = `digest_${userId}_${today.Abs}`;
            const emailBody = matches.map(m => {
                const anniversary = today.Year - (m.jYear || 0);
                const anniversaryText = anniversary > 0 ? ` (${anniversary}${getOrdinal(anniversary)} Anniversary)` : '';
                return `<li><b>${m.name}</b>${anniversaryText}${m.notes ? `: ${m.notes}` : ''}</li>`;
            }).join("");

            await db.collection("mail").doc(mailId).set({
                to: settings.email,
                message: {
                    subject: `Luach Daily Reminders - ${today.toString()}`,
                    html: `
              <h3>Good morning!</h3>
              <p>You have the following events today, <b>${today.toString()}</b>:</p>
              <ul>
                ${emailBody}
              </ul>
              <hr/>
              <p><small>Sent by Luach-Web. You can disable these in your settings.</small></p>
            `
                }
            }, { merge: true });
        }

        // Mark as processed
        await statusRef.set({
            jAbs: today.Abs,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    console.log("✅ Daily reminders check complete.");
});

function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"],
        v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}
