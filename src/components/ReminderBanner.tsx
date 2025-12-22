import React from "react";
import { Bell, X, Calendar } from "lucide-react";
import { jDate } from "jcal-zmanim";
import { UserEvent } from "../types";

interface ReminderModalProps {
  todayEvents: UserEvent[];
  tomorrowEvents: UserEvent[];
  lang: "en" | "he";
  onDismiss: () => void;
  onEventClick: (event: UserEvent, date: jDate) => void;
  isOpen: boolean;
}

export const ReminderBanner: React.FC<ReminderModalProps> = ({
  todayEvents,
  tomorrowEvents,
  lang,
  onDismiss,
  onEventClick,
  isOpen,
}) => {
  if (!isOpen || (todayEvents.length === 0 && tomorrowEvents.length === 0)) {
    return null;
  }

  const today = new jDate();
  const tomorrow = today.addDays(1);

  return (
    <div className="modal-overlay" onClick={onDismiss} style={{ zIndex: 1500 }}>
      <div
        className="modal-content glass-panel p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "500px" }}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent-amber/20 rounded-xl">
              <Bell size={24} className="text-accent-amber" />
            </div>
            <div>
              <h3 className="text-xl font-black flex items-center gap-2">
                {lang === "he" ? "תזכורות אירועים" : "Event Reminders"}
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                {lang === "he" ? "יש לך אירועים קרובים" : "You have upcoming events"}
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-2 rounded-lg hover:bg-white/10 transition-all"
            title={lang === "he" ? "סגור" : "Close"}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Today's Events */}
          {todayEvents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-accent-amber" />
                <p className="text-sm font-bold text-accent-amber uppercase tracking-wider">
                  {lang === "he" ? "היום" : "Today"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {todayEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      onEventClick(event, today);
                      onDismiss();
                    }}
                    className="text-left p-3 rounded-xl hover:brightness-110 transition-all border border-glass-border"
                    style={{
                      backgroundColor: event.backColor || "var(--accent-amber)",
                      color: event.textColor || "#ffffff",
                    }}>
                    <div className="font-bold">{event.name}</div>
                    {event.notes && <div className="text-xs opacity-80 mt-1">{event.notes}</div>}
                    <div className="text-xs opacity-60 mt-1">
                      {lang === "he" ? "לחץ לעריכה" : "Click to edit"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tomorrow's Events */}
          {tomorrowEvents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-accent-gold" />
                <p className="text-sm font-bold text-accent-gold uppercase tracking-wider">
                  {lang === "he" ? "מחר" : "Tomorrow"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {tomorrowEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      onEventClick(event, tomorrow);
                      onDismiss();
                    }}
                    className="text-left p-3 rounded-xl hover:brightness-110 transition-all border border-glass-border"
                    style={{
                      backgroundColor: event.backColor || "var(--accent-gold)",
                      color: event.textColor || "#ffffff",
                    }}>
                    <div className="font-bold">{event.name}</div>
                    {event.notes && <div className="text-xs opacity-80 mt-1">{event.notes}</div>}
                    <div className="text-xs opacity-60 mt-1">
                      {lang === "he" ? "לחץ לעריכה" : "Click to edit"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onDismiss}
            className="px-6 py-2 btn-warm border rounded-xl font-bold transition-all">
            {lang === "he" ? "הבנתי" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
};
