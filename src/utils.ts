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
