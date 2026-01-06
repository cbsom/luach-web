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
const addAnniversary = (match, targetDate) => {
    const anniversary = targetDate.Year - (match.jYear || 0);
    return {
        ...match,
        anniversary: anniversary
    };
};
exports.dailyReminders = (0, scheduler_1.onSchedule)({
    schedule: "every 1 hours",
    region: "us-central1"
}, async (event) => {
    console.log("🚀 Starting daily reminders check...");
    const usersSnap = await db.collection("users").get();
    for (const userDoc of usersSnap.docs) {
        try {
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
            const isHe = settings.lang === "he";
            const locationName = settings.locationName || "Jerusalem";
            const location = jcal_zmanim_1.Locations.find((l) => l.Name === locationName) ||
                jcal_zmanim_1.Locations.find((l) => l.Name === "Jerusalem");
            const todayStartMode = settings.todayStartMode || "sunset";
            const today = todayStartMode === "sunset" ? jcal_zmanim_1.Utils.nowAtLocation(location) : new jcal_zmanim_1.jDate();
            const statusRef = db.collection("users").doc(userId).collection("status").doc("lastDailyCheck");
            const lastCheckSnap = await statusRef.get();
            const lastCheck = lastCheckSnap.data();
            if (lastCheck && lastCheck.jAbs === today.Abs) {
                console.log(`ℹ️ Already processed ${today.toString()} for user ${userId} (${userId}). Skipping.`);
                continue;
            }
            const eventsSnap = await db.collection("users").doc(userId).collection("events").get();
            const events = eventsSnap.docs.map((d) => d.data());
            const isEventOnDate = (uo, date) => {
                const sDate = date.getDate();
                const type = uo.type;
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
            const tomorrow = today.addDays(1);
            const todayMatches = events.filter(e => e.remindDayOf && isEventOnDate(e, today)).map(e => addAnniversary(e, today));
            const tomorrowMatches = events.filter(e => e.remindDayBefore && isEventOnDate(e, tomorrow)).map(e => addAnniversary(e, tomorrow));
            if (todayMatches.length > 0 || tomorrowMatches.length > 0) {
                console.log(`📧 Sending reminders to ${settings.email} (User: ${userId}, Today: ${todayMatches.length}, Tomorrow: ${tomorrowMatches.length})`);
                const labels = {
                    en: {
                        today: "Today",
                        tomorrow: "Tomorrow",
                        subject: "Luach Reminders",
                        greeting: "Good morning!",
                        intro: "You have the following events coming up:",
                        footer: "Sent by Luach-Web. You can disable these in your settings.",
                        anniversary: "Year number"
                    },
                    he: {
                        today: "היום",
                        tomorrow: "מחר",
                        subject: "תזכורות לוח",
                        greeting: "בוקר טוב!",
                        intro: "יש לך את האירועים הבאים בקרוב:",
                        footer: "נשלח על ידי Luach-Web. ניתן לבטל תזכורות אלו בהגדרות.",
                        anniversary: "שנה"
                    }
                };
                const t = isHe ? labels.he : labels.en;
                const buildMatchList = (matches, label, targetDate) => {
                    if (matches.length === 0)
                        return "";
                    const list = matches.map(m => {
                        const anniversary = m.anniversary || 0;
                        let anniversaryText = "";
                        if (anniversary > 0 && (m.type === 1 || m.type === 3 || m.type === "hebrew-yearly" || m.type === "secular-yearly")) {
                            if (isHe) {
                                anniversaryText = ` (שנה ה-${anniversary})`;
                            }
                            else {
                                anniversaryText = ` (${anniversary}${getOrdinal(anniversary)} ${t.anniversary})`;
                            }
                        }
                        return `<li><b>${m.name}</b>${anniversaryText}${m.notes ? `: ${m.notes}` : ''}</li>`;
                    }).join("");
                    const dateStr = isHe ? targetDate.toStringHeb() : targetDate.toString();
                    return `<h4>${label} (${dateStr}):</h4><ul>${list}</ul>`;
                };
                const emailBody = `
                    ${buildMatchList(todayMatches, t.today, today)}
                    ${buildMatchList(tomorrowMatches, t.tomorrow, tomorrow)}
                `;
                let subject = "";
                const connector = isHe ? ": " : " is ";
                const formatEventsList = (events) => {
                    return events.map(m => {
                        const anniversary = m.anniversary || 0;
                        const showAnniversary = anniversary > 0 && (m.type === 1 || m.type === 3 || m.type === "hebrew-yearly" || m.type === "secular-yearly");
                        return `${m.name}${showAnniversary ? ` (${anniversary})` : ''}`;
                    }).join(", ");
                };
                const parts = [];
                if (todayMatches.length > 0) {
                    parts.push(`${t.today}${connector}${formatEventsList(todayMatches)}`);
                }
                if (tomorrowMatches.length > 0) {
                    parts.push(`${t.tomorrow}${connector}${formatEventsList(tomorrowMatches)}`);
                }
                subject = parts.join(", ");
                const mailId = `digest_${userId}_${today.Abs}`;
                await db.collection("mail").doc(mailId).set({
                    to: settings.email,
                    message: {
                        subject: subject,
                        html: `
                            <div dir="${isHe ? 'rtl' : 'ltr'}" style="font-family: sans-serif;">
                                <h3>${t.greeting}</h3>
                                <p>${t.intro}</p>
                                ${emailBody}
                                <hr/>
                                <p><small>${t.footer}</small></p>
                            </div>
                        `
                    }
                }, { merge: true });
                console.log(`✅ Mail doc created for ${settings.email}`);
            }
            else {
                console.log(`ℹ️ No event matches for user ${userId} on ${today.toString()}`);
            }
            await statusRef.set({
                jAbs: today.Abs,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        catch (error) {
            console.error(`❌ Error processing user ${userDoc.id}:`, error);
        }
    }
    console.log("✅ Daily reminders check complete.");
});
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}
//# sourceMappingURL=index.js.map