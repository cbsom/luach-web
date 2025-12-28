import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { jDate, Locations, Utils } from "jcal-zmanim";

admin.initializeApp();
const db = admin.firestore();

enum UserEventTypes {
    OneTime = 0,
    HebrewDateRecurringYearly = 1,
    HebrewDateRecurringMonthly = 2,
    SecularDateRecurringYearly = 3,
    SecularDateRecurringMonthly = 4,
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

export const dailyReminders = onSchedule({
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

            const lang = settings.lang === "he" ? "he" : "en";
            const isHe = lang === "he";

            const locationName = settings.locationName || "Jerusalem";
            const location =
                Locations.find((l) => l.Name === locationName) ||
                Locations.find((l) => l.Name === "Jerusalem")!;

            const todayStartMode = settings.todayStartMode || "sunset";
            const today = todayStartMode === "sunset" ? Utils.nowAtLocation(location) : new jDate();

            const statusRef = db.collection("users").doc(userId).collection("status").doc("lastDailyCheck");
            const lastCheckSnap = await statusRef.get();
            const lastCheck = lastCheckSnap.data();

            if (lastCheck && lastCheck.jAbs === today.Abs) {
                console.log(`ℹ️ Already processed ${today.toString()} for user ${userId} (${userId}). Skipping.`);
                continue;
            }

            const eventsSnap = await db.collection("users").doc(userId).collection("events").get();
            const events = eventsSnap.docs.map((d) => d.data());

            const isEventOnDate = (uo: any, date: jDate) => {
                const sDate = date.getDate();
                const type = uo.type;

                const isOneTime = type === UserEventTypes.OneTime || type === "one-time" || type === 0;
                const isHebrewYearly = type === UserEventTypes.HebrewDateRecurringYearly || type === "hebrew-yearly" || type === 1;
                const isHebrewMonthly = type === UserEventTypes.HebrewDateRecurringMonthly || type === "hebrew-monthly" || type === 2;
                const isSecularYearly = type === UserEventTypes.SecularDateRecurringYearly || type === "secular-yearly" || type === 3;
                const isSecularMonthly = type === UserEventTypes.SecularDateRecurringMonthly || type === "secular-monthly" || type === 4;

                if (isOneTime) {
                    return (
                        uo.jAbs === date.Abs ||
                        (uo.jDay === date.Day && uo.jMonth === date.Month && uo.jYear === date.Year)
                    );
                }

                const eventStartAbs = uo.jAbs || jDate.absJd(uo.jYear, uo.jMonth, uo.jDay);
                if (eventStartAbs > date.Abs) return false;

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
            const todayMatches = events.filter(e => e.remindDayOf && isEventOnDate(e, today));
            const tomorrowMatches = events.filter(e => e.remindDayBefore && isEventOnDate(e, tomorrow));

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
                        anniversary: "Anniversary"
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

                const buildMatchList = (matches: any[], label: string, targetDate: jDate) => {
                    if (matches.length === 0) return "";
                    const list = matches.map(m => {
                        const anniversary = targetDate.Year - (m.jYear || 0);
                        let anniversaryText = "";
                        if (anniversary > 0 && (m.type === 1 || m.type === 3 || m.type === "hebrew-yearly" || m.type === "secular-yearly")) {
                            if (isHe) {
                                anniversaryText = ` (שנה ה-${anniversary})`;
                            } else {
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

                const allNames = [...todayMatches, ...tomorrowMatches].map(m => m.name);
                const namesSummary = allNames.length > 3
                    ? allNames.slice(0, 3).join(", ") + "..."
                    : allNames.join(", ");

                const subject = `${t.subject}: ${namesSummary}`;

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
            } else {
                console.log(`ℹ️ No event matches for user ${userId} on ${today.toString()}`);
            }

            await statusRef.set({
                jAbs: today.Abs,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error(`❌ Error processing user ${userDoc.id}:`, error);
        }
    }
    console.log("✅ Daily reminders check complete.");
});

function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"],
        v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}
