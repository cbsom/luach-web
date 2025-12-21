export enum UserEventTypes {
    OneTime,
    HebrewDateRecurringYearly,
    HebrewDateRecurringMonthly,
    SecularDateRecurringYearly,
    SecularDateRecurringMonthly,
}

export interface UserEvent {
    id: string;
    name: string;
    notes: string;
    type: UserEventTypes;
    jYear: number;
    jMonth: number;
    jDay: number;
    sDate: string; // ISO string
    backColor?: string;
    textColor?: string;
    remindDayOf?: boolean;
    remindDayBefore?: boolean;
}
