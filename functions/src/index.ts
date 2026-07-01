import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as https from "https";
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

interface UserEvent {
    type: UserEventTypes | string | number;
    jYear?: number;
    jMonth?: number;
    jDay?: number;
    sDate?: string;
    remindDayOf?: boolean;
    remindDayBefore?: boolean;
    name?: string;
    notes?: string;
    anniversary?: number;
}

interface AuthenticatedLuachUser {
    uid: string;
    email: string | null;
    name: string | null;
    authSource: "firebase" | "google";
}

interface GoogleTokenInfo {
    aud?: string;
    sub?: string;
    email?: string;
    email_verified?: string | boolean;
    name?: string;
    error?: string;
    error_description?: string;
}

class ApiError extends Error {
    constructor(
        readonly status: number,
        message: string
    ) {
        super(message);
    }
}

const getBearerToken = (authorization: string | undefined) => {
    const match = authorization?.match(/^Bearer\s+(.+)$/i);
    return match?.[1];
};

const sendApiError = (res: any, error: unknown) => {
    if (error instanceof ApiError) {
        res.status(error.status).json({ error: error.message });
        return;
    }

    console.error("Unhandled Luach API error", error);
    res.status(500).json({ error: "Internal server error" });
};

const getJson = <T>(url: string): Promise<T> => {
    return new Promise((resolve, reject) => {
        https
            .get(url, (response) => {
                let body = "";
                response.setEncoding("utf8");
                response.on("data", (chunk: string) => {
                    body += chunk;
                });
                response.on("end", () => {
                    if ((response.statusCode || 500) >= 400) {
                        reject(new Error(`HTTP ${response.statusCode}: ${body}`));
                        return;
                    }

                    try {
                        resolve(JSON.parse(body) as T);
                    } catch (error) {
                        reject(error);
                    }
                });
            })
            .on("error", reject);
    });
};

const resolveUidForGoogleAccount = async (tokenInfo: GoogleTokenInfo) => {
    const usersRef = db.collection("users");

    if (tokenInfo.sub) {
        const directUidSnap = await usersRef.doc(tokenInfo.sub).get();
        if (directUidSnap.exists) {
            return tokenInfo.sub;
        }

        const googleUidSnap = await usersRef
            .where("googleProviderUid", "==", tokenInfo.sub)
            .limit(1)
            .get();
        if (!googleUidSnap.empty) {
            return googleUidSnap.docs[0].id;
        }
    }

    if (tokenInfo.email) {
        const emailSnap = await usersRef
            .where("email", "==", tokenInfo.email)
            .limit(2)
            .get();

        if (emailSnap.size === 1) {
            return emailSnap.docs[0].id;
        }

        if (emailSnap.size > 1) {
            throw new ApiError(409, "Multiple Luach users match this Google email");
        }
    }

    throw new ApiError(403, "No Luach user is linked to this Google account");
};

const verifyGoogleAccessToken = async (token: string): Promise<AuthenticatedLuachUser> => {
    const tokenInfo = await getJson<GoogleTokenInfo>(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`
    );

    if (tokenInfo.error || !tokenInfo.sub) {
        throw new ApiError(401, tokenInfo.error_description || "Invalid Google OAuth token");
    }

    const expectedAudience = process.env.GOOGLE_OAUTH_CLIENT_ID;
    if (expectedAudience && tokenInfo.aud !== expectedAudience) {
        throw new ApiError(401, "Google OAuth token audience is not allowed");
    }

    if (tokenInfo.email_verified === false || tokenInfo.email_verified === "false") {
        throw new ApiError(403, "Google account email is not verified");
    }

    return {
        uid: await resolveUidForGoogleAccount(tokenInfo),
        email: tokenInfo.email || null,
        name: tokenInfo.name || null,
        authSource: "google"
    };
};

const verifyLuachBearerToken = async (authorization: string | undefined): Promise<AuthenticatedLuachUser> => {
    const token = getBearerToken(authorization);
    if (!token) {
        throw new ApiError(401, "Missing Authorization bearer token");
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return {
            uid: decodedToken.uid,
            email: decodedToken.email || null,
            name: decodedToken.name || null,
            authSource: "firebase"
        };
    } catch (error) {
        console.warn("Bearer token is not a Firebase ID token; trying Google OAuth", error);
    }

    return verifyGoogleAccessToken(token);
};

const getUserSettings = async (uid: string) => {
    const settingsSnap = await db
        .collection("users")
        .doc(uid)
        .collection("settings")
        .doc("general")
        .get();

    return settingsSnap.exists ? settingsSnap.data() : null;
};

const getUserEvents = async (uid: string) => {
    const eventsSnap = await db
        .collection("users")
        .doc(uid)
        .collection("events")
        .get();

    return eventsSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
};

export const luachApi = onRequest({
    region: "us-central1",
    cors: true
}, async (req, res) => {
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }

    if (req.method !== "GET") {
        res.set("Allow", "GET, OPTIONS");
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    const route = req.path.replace(/^\/+|\/+$/g, "") || "context";

    try {
        if (route === "health") {
            res.json({ ok: true, service: "luach-api" });
            return;
        }

        const luachUser = await verifyLuachBearerToken(req.header("authorization"));
        const uid = luachUser.uid;

        if (route === "events") {
            res.json({
                uid,
                events: await getUserEvents(uid)
            });
            return;
        }

        if (route === "settings") {
            res.json({
                uid,
                settings: await getUserSettings(uid)
            });
            return;
        }

        if (route === "context") {
            const [settings, events] = await Promise.all([
                getUserSettings(uid),
                getUserEvents(uid)
            ]);

            res.json({
                user: {
                    uid,
                    email: luachUser.email,
                    name: luachUser.name,
                    authSource: luachUser.authSource
                },
                settings,
                events
            });
            return;
        }

        throw new ApiError(404, "Unknown Luach API route");
    } catch (error) {
        sendApiError(res, error);
    }
});

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
const addAnniversary = (match: any, targetDate: jDate) => {
    const anniversary = targetDate.Year - (match.jYear || 0);
    return {
        ...match,
        anniversary: anniversary
    };
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

            const isHe = settings.lang === "he";

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
            const todayMatches: UserEvent[] = events.filter(e => e.remindDayOf && isEventOnDate(e, today)).map(e => addAnniversary(e, today));
            const tomorrowMatches: UserEvent[] = events.filter(e => e.remindDayBefore && isEventOnDate(e, tomorrow)).map(e => addAnniversary(e, tomorrow));

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

                const buildMatchList = (matches: UserEvent[], label: string, targetDate: jDate) => {
                    if (matches.length === 0) return "";
                    const list = matches.map(m => {
                        const anniversary = m.anniversary || 0;
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

                let subject = "";
                const connector = isHe ? ": " : " is ";

                const formatEventsList = (events: UserEvent[]) => {
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
