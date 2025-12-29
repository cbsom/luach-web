import { jDate, type Time } from "jcal-zmanim";
import { UserEvent, UserEventTypes } from "./types";

export const formatTime = (time: Time | undefined) => {
    if (!time) return "--:--";
    const minutes = Math.floor(time.minute);
    return `${time.hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

export const getAnniversaryNumber = (event: UserEvent, date: jDate) => {
    // If we have jAbs, use its components (Year) for accurate delta.
    const startYear = event.jAbs ? new jDate(event.jAbs).Year : event.jYear;

    switch (event.type) {
        case UserEventTypes.HebrewDateRecurringYearly:
            return date.Year - startYear;
        case UserEventTypes.HebrewDateRecurringMonthly: {
            let months = 0;
            for (let y = event.jYear; y < date.Year; y++) {
                months += jDate.isJdLeapY(y) ? 13 : 12;
            }
            months += date.Month - event.jMonth;
            return months;
        }
        case UserEventTypes.SecularDateRecurringYearly:
            return date.getDate().getFullYear() - new Date(event.sDate).getFullYear();
        case UserEventTypes.SecularDateRecurringMonthly: {
            const d1 = new Date(event.sDate);
            const d2 = date.getDate();
            return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
        }
        default:
            return 0;
    }
};
export const getRelativeDescription = (targetJDate: jDate, lang: "en" | "he"): string => {
    const today = new jDate();
    if (targetJDate.Abs === today.Abs) {
        return lang === "en" ? "Today" : "היום";
    }

    const isFuture = targetJDate.Abs > today.Abs;
    const d1 = isFuture ? today.getDate() : targetJDate.getDate();
    const d2 = isFuture ? targetJDate.getDate() : today.getDate();

    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    let days = d2.getDate() - d1.getDate();

    if (days < 0) {
        months--;
        const lastMonth = new Date(d2.getFullYear(), d2.getMonth(), 0);
        days += lastMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    const parts = [];
    if (years > 0) {
        if (lang === "en") {
            parts.push(`${years} ${years === 1 ? "year" : "years"}`);
        } else {
            if (years === 1) parts.push("שנה");
            else if (years === 2) parts.push("שנתיים");
            else parts.push(`${years} שנים`);
        }
    }
    if (months > 0) {
        if (lang === "en") {
            parts.push(`${months} ${months === 1 ? "month" : "months"}`);
        } else {
            if (months === 1) parts.push("חודש");
            else if (months === 2) parts.push("חודשיים");
            else parts.push(`${months} חודשים`);
        }
    }
    if (days > 0) {
        if (lang === "en") {
            parts.push(`${days} ${days === 1 ? "day" : "days"}`);
        } else {
            if (days === 1) parts.push("יום");
            else if (days === 2) parts.push("יומיים");
            else parts.push(`${days} ימים`);
        }
    }

    let result = "";
    if (lang === "en") {
        if (parts.length === 0) return "Today";
        if (parts.length === 1) {
            result = parts[0];
        } else if (parts.length === 2) {
            result = parts.join(" and ");
        } else {
            result = parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
        }
        return isFuture ? `in ${result}` : `${result} ago`;
    } else {
        if (parts.length === 0) return "היום";
        if (parts.length === 1) {
            result = parts[0];
        } else if (parts.length === 2) {
            result = parts.join(" ו");
        } else {
            result = parts.slice(0, -1).join(", ") + " ו" + parts[parts.length - 1];
        }
        return isFuture ? `בעוד ${result}` : `לפני ${result}`;
    }
};
export const getThemeIcon = (theme: "light" | "dark" | "warm" | "tcheles") => {
    switch (theme) {
        case "warm":
            return "🔥";
        case "dark":
            return "🌙";
        case "light":
            return "☀️";
        case "tcheles":
            return "💎";
    }
};
export const cycleTheme = (theme: "light" | "dark" | "warm" | "tcheles", setTheme: (theme: "light" | "dark" | "warm" | "tcheles") => void) => {
    const themes: ("warm" | "dark" | "light" | "tcheles")[] = ["warm", "dark", "light", "tcheles"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
};
