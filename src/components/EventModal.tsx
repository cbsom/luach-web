import React from "react";
import { jDate } from "jcal-zmanim";
import { UserEvent, UserEventTypes } from "../types";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEvent: UserEvent | null;
  t: any;
  lang: "en" | "he";
  selectedJDate: jDate;
  formName: string;
  setFormName: (val: string) => void;
  formNotes: string;
  setFormNotes: (val: string) => void;
  formType: UserEventTypes;
  setFormType: (val: UserEventTypes) => void;
  formColor: string;
  setFormColor: (val: string) => void;
  formTextColor: string;
  setFormTextColor: (val: string) => void;
  formRemindDayOf: boolean;
  setFormRemindDayOf: (val: boolean) => void;
  formRemindDayBefore: boolean;
  setFormRemindDayBefore: (val: boolean) => void;
  onSave: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  editingEvent,
  t,
  lang,
  selectedJDate,
  formName,
  setFormName,
  formNotes,
  setFormNotes,
  formType,
  setFormType,
  formColor,
  setFormColor,
  formTextColor,
  setFormTextColor,
  formRemindDayOf,
  setFormRemindDayOf,
  formRemindDayBefore,
  setFormRemindDayBefore,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div
        className="modal-content glass-panel p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black">{editingEvent ? t.saveEvent : t.addNewEvent}</h3>
          <div className="text-accent-amber font-bold text-sm">
            {lang === "he" ? selectedJDate.toStringHeb() : selectedJDate.toString()}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="form-group">
            <label className="form-label">{t.eventName}</label>
            <input
              autoFocus
              className="form-input"
              placeholder={
                lang === "he" ? "לדוגמה: יום הולדת, אזכרה..." : "e.g. Birthday, Yahrtzeit..."
              }
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.repeatPattern}</label>
            <select
              className="form-input appearance-none cursor-pointer"
              value={formType}
              onChange={(e) => setFormType(parseInt(e.target.value))}>
              <option value={UserEventTypes.HebrewDateRecurringYearly}>
                {lang === "he" ? "שנתי (תאריך עברי)" : "Yearly (Hebrew Date)"}
              </option>
              <option value={UserEventTypes.HebrewDateRecurringMonthly}>
                {lang === "he" ? "חודשי (תאריך עברי)" : "Monthly (Hebrew Date)"}
              </option>
              <option value={UserEventTypes.SecularDateRecurringYearly}>
                {lang === "he" ? "שנתי (תאריך לועזי)" : "Yearly (Secular Date)"}
              </option>
              <option value={UserEventTypes.SecularDateRecurringMonthly}>
                {lang === "he" ? "חודשי (תאריך לועזי)" : "Monthly (Secular Date)"}
              </option>
              <option value={UserEventTypes.OneTime}>
                {lang === "he" ? "חד פעמי" : "One Time"}
              </option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t.notes}</label>
            <textarea
              className="form-input min-h-[80px]"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">{t.colorTheme}</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="w-12 h-12 rounded-xl cursor-pointer border-2 btn-warm p-1"
                />
                <span className="text-sm font-mono opacity-60">{formColor}</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t.textColor}</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={formTextColor}
                  onChange={(e) => setFormTextColor(e.target.value)}
                  className="w-12 h-12 rounded-xl cursor-pointer border-2 btn-warm p-1"
                />
                <span className="text-sm font-mono opacity-60">{formTextColor}</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t.reminders}</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formRemindDayBefore}
                  onChange={(e) => setFormRemindDayBefore(e.target.checked)}
                  className="w-4 h-4 rounded border-glass-border btn-warm checked:bg-accent-amber focus:ring-1 focus:ring-accent-amber transition-all"
                />
                <span className="text-sm font-medium group-hover:text-accent-amber transition-colors">
                  {t.dayBefore}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formRemindDayOf}
                  onChange={(e) => setFormRemindDayOf(e.target.checked)}
                  className="w-4 h-4 rounded border-glass-border btn-warm checked:bg-accent-amber focus:ring-1 focus:ring-accent-amber transition-all"
                />
                <span className="text-sm font-medium group-hover:text-accent-amber transition-colors">
                  {t.dayOf}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={onSave}
            className="flex-grow py-3 bg-accent-amber font-bold rounded-xl hover:bg-accent-amber/90 transition-all shadow-lg hover:shadow-accent-amber/20"
            style={{ color: "var(--btn-accent-text)" }}>
            {t.saveEvent}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 btn-warm rounded-xl font-bold border transition-all">
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
