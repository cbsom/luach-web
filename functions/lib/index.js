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
    UserEventTypes[UserEventTypes["OneTime"] = 0] = "OneTime";
    UserEventTypes[UserEventTypes["HebrewDateRecurringYearly"] = 1] = "HebrewDateRecurringYearly";
    UserEventTypes[UserEventTypes["HebrewDateRecurringMonthly"] = 2] = "HebrewDateRecurringMonthly";
    UserEventTypes[UserEventTypes["SecularDateRecurringYearly"] = 3] = "SecularDateRecurringYearly";
    UserEventTypes[UserEventTypes["SecularDateRecurringMonthly"] = 4] = "SecularDateRecurringMonthly";
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
        if (!settings) {
            console.log(`⚠️ No settings found for user ${userId}`);
            continue;
        }
        if (!settings.emailRemindersEnabled) {
            console.log(`ℹ️ Email reminders disabled for user ${userId}`);
            continue;
        }
        if (!settings.email) {
            console.log(`⚠️ No email found for user ${userId}`);
            continue;
        }
        const locationName = settings.locationName || "Jerusalem";
        const location = jcal_zmanim_1.Locations.find((l) => l.Name === locationName) ||
            jcal_zmanim_1.Locations.find((l) => l.Name === "Jerusalem");
        const todayStartMode = settings.todayStartMode || "sunset";
        const today = todayStartMode === "sunset" ? jcal_zmanim_1.Utils.nowAtLocation(location) : new jcal_zmanim_1.jDate();
        const statusRef = db.collection("users").doc(userId).collection("status").doc("lastDailyCheck");
        const lastCheckSnap = await statusRef.get();
        const lastCheck = lastCheckSnap.data();
        if (lastCheck && lastCheck.jAbs === today.Abs) {
            console.log(`ℹ️ Already processed ${today.toString()} for user ${userId}. Skipping.`);
            continue;
        }
        // Check for events
        const eventsSnap = await db.collection("users").doc(userId).collection("events").get();
        const events = eventsSnap.docs.map((d) => d.data());
        const isEventOnDate = (uo, date) => {
            const sDate = date.getDate();
            const type = uo.type;
            // Handle both numeric and string types for safety
            const isOneTime = type === UserEventTypes.OneTime || type === "one-time" || type === 0;
            const isHebrewYearly = type === UserEventTypes.HebrewDateRecurringYearly || type === "hebrew-yearly" || type === 1;
            const isHebrewMonthly = type === UserEventTypes.HebrewDateRecurringMonthly || type === "hebrew-monthly" || type === 2;
            const isSecularYearly = type === UserEventTypes.SecularDateRecurringYearly || type === "secular-yearly" || type === 3;
            const isSecularMonthly = type === UserEventTypes.SecularDateRecurringMonthly || type === "secular-monthly" || type === 4;
            if (isOneTime) {
                return (uo.jAbs === date.Abs ||
                    (uo.jDay === date.Day && uo.jMonth === date.Month && uo.jYear === date.Year));
            }
            const eventStartAbs = uo.jAbs || jcal_zmanim_1.jDate.absJd(uo.jYear, uo.jMonth, uo.jDay);
            if (eventStartAbs > date.Abs)
                return false;
            if (isHebrewYearly) {
                return uo.jDay === date.Day && isMonthMatch(uo.jMonth, uo.jYear, date.Month, date.Year);
            }
            if (isHebrewMonthly) {
                return uo.jDay === date.Day;
            }
            if (isSecularYearly) {
                const occSDate = new Date(uo.sDate);
                return occSDate.getDate() === sDate.getDate() && occSDate.getMonth() === sDate.getMonth();
            }
            if (isSecularMonthly) {
                const occSDate = new Date(uo.sDate);
                return occSDate.getDate() === sDate.getDate();
            }
            return false;
        };
        const todayMatches = events.filter(e => e.remindDayOf && isEventOnDate(e, today));
        const tomorrowMatches = events.filter(e => e.remindDayBefore && isEventOnDate(e, today.addDays(1)));
        if (todayMatches.length > 0 || tomorrowMatches.length > 0) {
            console.log(`📧 Sending reminders to ${settings.email} (Today: ${todayMatches.length}, Tomorrow: ${tomorrowMatches.length})`);
            const buildMatchList = (matches, label, targetDate) => {
                if (matches.length === 0)
                    return "";
                const list = matches.map(m => {
                    const anniversary = targetDate.Year - (m.jYear || 0);
                    const anniversaryText = (anniversary > 0 && !m.jAbs) ? ` (${anniversary}${getOrdinal(anniversary)} Anniversary)` : '';
                    return `<li><b>${m.name}</b>${anniversaryText}${m.notes ? `: ${m.notes}` : ''}</li>`;
                }).join("");
                return `<h4>${label} (${targetDate.toString()}):</h4><ul>${list}</ul>`;
            };
            const emailBody = `
                ${buildMatchList(todayMatches, "Today", today)}
                ${buildMatchList(tomorrowMatches, "Tomorrow", today.addDays(1))}
            `;
            const mailId = `digest_${userId}_${today.Abs}`;
            await db.collection("mail").doc(mailId).set({
                to: settings.email,
                message: {
                    subject: `Luach Reminders - ${today.toString()}`,
                    html: `
                        <h3>Good morning!</h3>
                        <p>You have the following events coming up:</p>
                        ${emailBody}
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