export enum UserEventTypes {
    OneTime,
    HebrewDateRecurringYearly,
    HebrewDateRecurringMonthly,
    SecularDateRecurringYearly,
    SecularDateRecurringMonthly,
}

export enum Themes { Warm, Dark, Light, Tcheles };


export interface UserEvent {
    id: string;
    name: string;
    notes: string;
    type: UserEventTypes;
    jYear: number;
    jMonth: number;
    jDay: number;
    jAbs: number;
    sDate: string; // ISO string
    backColor?: string;
    textColor?: string;
    remindDayOf?: boolean;
    remindDayBefore?: boolean;
}
