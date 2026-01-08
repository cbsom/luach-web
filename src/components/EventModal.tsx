import React from "react";
import { Trash2 } from "lucide-react";
import { jDate } from "jcal-zmanim";
import { UserEvent, UserEventTypes } from "../types";
import { Modal } from "./Modal";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEvent: UserEvent | null;
  textInLanguage: any;
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
  onDelete: (id: string) => void;
  onChangeDate?: () => void; // Optional callback to open date change modal
  onNavigateToDate?: () => void; // Optional callback to navigate calendar to this date
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  editingEvent,
  textInLanguage,
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
  onDelete,
  onChangeDate,
  onNavigateToDate,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEvent ? textInLanguage.saveEvent : textInLanguage.addNewEvent}
      subtitle={
        <div className="flex items-center gap-2 justify-between">
          <span
            onClick={onNavigateToDate}
            className={
              onNavigateToDate ? "cursor-pointer hover:text-accent-amber transition-colors" : ""
            }
            style={{ color: "var(--accent-coral)", fontWeight: "bold", fontSize: "1.4rem" }}
            title={
              onNavigateToDate ? (lang === "he" ? "נווט לתאריך זה" : "Navigate to this date") : ""
            }>
            {lang === "he" ? selectedJDate.toStringHeb() : selectedJDate.toString()}
          </span>
          {editingEvent && onChangeDate && (
            <button
              onClick={onChangeDate}
              className="p-2 btn-warm border rounded-lg hover:bg-accent-amber/20 transition-all">
              {lang === "he" ? "שנה תאריך" : "Change Date"}
            </button>
          )}
        </div>
      }
      footer={
        <div className="flex items-center gap-3">
          {editingEvent && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    textInLanguage.deleteConfirmation ||
                      "Are you sure you want to delete this event?"
                  )
                ) {
                  onDelete(editingEvent.id);
                  onClose();
                }
              }}
              className="p-3 btn-warm rounded-xl border transition-all"
              title={textInLanguage.deleteEvent}>
              <Trash2 size={18} />
            </button>
          )}
          <button
            onClick={onSave}
            className="flex-grow py-3 btn-warm rounded-xl hover:bg-accent-amber/90 transition-all shadow-lg hover:shadow-accent-amber/20"
            style={{ fontWeight: "bold" }}>
            {textInLanguage.saveEvent}
          </button>
          <button onClick={onClose} className="px-6 py-3 btn-warm rounded-xl border transition-all">
            {textInLanguage.cancel}
          </button>
        </div>
      }>
      <div className="flex flex-col gap-6">
        <div className="form-group">
          <label className="form-label">{textInLanguage.eventName}</label>
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
          <label className="form-label">{textInLanguage.repeatPattern}</label>
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
            <option value={UserEventTypes.OneTime}>{lang === "he" ? "חד פעמי" : "One Time"}</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{textInLanguage.notes}</label>
          <textarea
            className="form-input min-h-[80px]"
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">{textInLanguage.colorTheme}</label>
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
            <label className="form-label">{textInLanguage.textColor}</label>
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
          <label className="form-label">{textInLanguage.reminders}</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={formRemindDayBefore}
                onChange={(e) => setFormRemindDayBefore(e.target.checked)}
                className="w-4 h-4 rounded border-glass-border btn-warm checked:bg-accent-amber focus:ring-1 focus:ring-accent-amber transition-all"
              />
              <span className="text-sm font-medium group-hover:text-accent-amber transition-colors">
                {textInLanguage.dayBefore}
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
                {textInLanguage.dayOf}
              </span>
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
};
