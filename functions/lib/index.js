"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyReminders = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const jcal_zmanim_1 = require("jcal-zmanim");
admin.initializeApp();
const db = admin.firestore();
var UserEventTypes;
(function (UserEventTypes) {
    UserEventTypes["OneTime"] = "one-time";
    UserEventTypes["HebrewDateRecurringYearly"] = "hebrew-yearly";
    UserEventTypes["HebrewDateRecurringMonthly"] = "hebrew-monthly";
    UserEventTypes["SecularDateRecurringYearly"] = "secular-yearly";
    UserEventTypes["SecularDateRecurringMonthly"] = "secular-monthly";
})(UserEventTypes || (UserEventTypes = {}));
const isMonthMatch = (occMonth, occYear, currMonth, currYear) => {
    if (currMonth >= 12 && occMonth >= 12) {
        const isOccLeap = jcal_zmanim_1.jDate.isJdLeapY(occYear);
        const isCurrLeap = jcal_zmanim_1.jDate.isJdLeapY(currYear);
        if (isOccLeap !== isCurrLeap) {
            return ((isOccLeap && currMonth === 12) || (isCurrLeap && occMonth === 12 && currMonth === 13));
        }
    }
    return occMonth === currMonth;
};
/**
 * Scheduled function to send daily email reminders.
 * Runs every hour to check for users in different timezones.
 * Only sends if the current time in the user's location is early morning (e.g. 7-8 AM).
 */
exports.dailyReminders = (0, scheduler_1.onSchedule)({
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
        const location = jcal_zmanim_1.Locations.find((l) => l.Name === locationName) ||
            jcal_zmanim_1.Locations.find((l) => l.Name === "Jerusalem");
        const todayStartMode = settings.todayStartMode || "sunset";
        const today = todayStartMode === "sunset" ? jcal_zmanim_1.Utils.nowAtLocation(location) : new jcal_zmanim_1.jDate();
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
        const matches = events.filter((uo) => {
            // Must have reminders enabled for this event
            if (!uo.remindDayOf)
                return false;
            if (uo.type === UserEventTypes.OneTime) {
                return (uo.jAbs === today.Abs ||
                    (uo.jDay === today.Day && uo.jMonth === today.Month && uo.jYear === today.Year));
            }
            const eventStartAbs = uo.jAbs || jcal_zmanim_1.jDate.absJd(uo.jYear, uo.jMonth, uo.jDay);
            if (eventStartAbs > today.Abs)
                return false;
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
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}
//# sourceMappingURL=index.js.map