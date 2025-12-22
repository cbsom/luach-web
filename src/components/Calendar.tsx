import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Printer,
  Plus,
  List,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Utils, jDate, getNotifications, Dafyomi } from "jcal-zmanim";
import { UserEvent } from "../types";
import { getAnniversaryNumber } from "../utils";

interface CalendarProps {
  lang: "en" | "he";
  t: any;
  currentJDate: jDate;
  currentMonthName: string;
  secularMonthRange: string;
  monthInfo: { days: jDate[]; year: number; month: number; weeksNeeded: number };
  selectedJDate: jDate;
  location: any;
  events: UserEvent[];
  setCurrentJDate: (date: jDate) => void;
  setSelectedJDate: (date: jDate) => void;
  navigateMonth: (direction: number) => void;
  navigateYear: (direction: number) => void;
  setIsJumpModalOpen: (isOpen: boolean) => void;
  setIsEventsListOpen: (isOpen: boolean) => void;
  handleAddNewEventForDate: (e: React.MouseEvent, date: jDate) => void;
  handleEditEvent: (event: UserEvent, date: jDate) => void;
  getEventsForDate: (date: jDate) => UserEvent[];
}

export const Calendar: React.FC<CalendarProps> = ({
  lang,
  t,
  currentJDate,
  currentMonthName,
  secularMonthRange,
  monthInfo,
  selectedJDate,
  location,
  setCurrentJDate,
  setSelectedJDate,
  navigateMonth,
  navigateYear,
  setIsJumpModalOpen,
  setIsEventsListOpen,
  handleAddNewEventForDate,
  handleEditEvent,
  getEventsForDate,
}) => {
  return (
    <main className="main-content fade-in" style={{ animationDelay: "0.1s" }}>
      <header className="glass-panel p-6 px-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-black flex items-baseline gap-4">
            {currentMonthName} {currentJDate.Year}
            <span className="text-lg font-medium text-text-secondary">{secularMonthRange}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex btn-warm rounded-2xl p-1 border ${
              lang === "he" ? "flex-row-reverse" : ""
            }`}>
            <button
              onClick={() => navigateYear(-1)}
              className={`p-2 btn-warm-transparent rounded-xl ${
                lang === "he" ? "border-l" : "border-r"
              } transition-all border-glass-border/50`}
              title={t.previousYear}>
              <div className="flex -space-x-2">
                {lang === "he" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                {lang === "he" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </div>
            </button>
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 btn-warm-transparent rounded-xl transition-all border-glass-border/50"
              title={t.previousMonth}>
              {lang === "he" ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <button
              onClick={() => {
                const today = new jDate();
                setCurrentJDate(today);
                setSelectedJDate(today);
              }}
              className="px-6 py-2 text-sm font-bold btn-warm-transparent rounded-xl transition-all min-w-[100px]">
              {t.today}
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 btn-warm-transparent rounded-xl transition-all border-glass-border/50"
              title={t.nextMonth}>
              {lang === "he" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
            <button
              onClick={() => navigateYear(1)}
              className={`p-2 btn-warm-transparent rounded-xl ${
                lang === "he" ? "border-r" : "border-l"
              } transition-all border-glass-border/50`}
              title={t.nextYear}>
              <div className="flex -space-x-2">
                {lang === "he" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                {lang === "he" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </div>
            </button>
          </div>

          <button
            onClick={() => setIsJumpModalOpen(true)}
            className="btn-warm rounded-2xl border transition-all flex items-center gap-2 font-bold text-sm"
            style={{
              padding: "0.75rem 1rem",
            }}>
            <CalendarIcon size={16} />
            <span>{t.goToDate}</span>
          </button>

          <button
            onClick={() => setIsEventsListOpen(true)}
            className="btn-warm rounded-2xl border transition-all flex items-center gap-2 font-bold text-sm"
            style={{
              padding: "0.75rem 1rem",
            }}>
            <List size={16} />
            <span>{lang === "he" ? "אירועים" : "Events"}</span>
          </button>
        </div>
      </header>
      <section className="calendar-wrapper">
        <div className="calendar-header-days">
          {(lang === "he"
            ? ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]
            : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Shabbos"]
          ).map((d) => (
            <div
              key={d}
              className={d === (lang === "he" ? "שבת" : "Shabbos") ? "text-accent-amber" : ""}>
              {d}
            </div>
          ))}
        </div>
        <div
          className="calendar-grid"
          style={{
            gridTemplateRows: `repeat(${monthInfo.weeksNeeded}, 1fr)`,
          }}>
          {monthInfo.days.map((date, i) => {
            const isToday = date.Abs === new jDate().Abs;
            const isSelected = date.Abs === selectedJDate.Abs;
            const isOtherMonth = date.Month !== currentJDate.Month;
            const notes = getNotifications(date, { hour: 10, minute: 0 }, location, lang === "en");
            const dafEng = Dafyomi.toString(date);
            const dafHeb = Dafyomi.toStringHeb(date);
            notes.dayNotes = notes.dayNotes.filter((n) => n !== dafEng && n !== dafHeb);
            const dayEvents = getEventsForDate(date);

            // Shabbos or Yom Tov check for lighter background
            const isYomTov = date.isYomTov(location.Israel);
            const isShabbos = date.getDayOfWeek() === 6;
            const isHolidayBg = isShabbos || isYomTov;

            return (
              <div
                key={i}
                className={`day-cell ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${
                  isOtherMonth ? "other-month" : ""
                }`}
                onClick={() => setSelectedJDate(date)}
                style={isHolidayBg ? { background: "rgba(61, 36, 24, 0.3)" } : {}}>
                <div className="day-number-container">
                  <span className="hebrew-day">{Utils.toJewishNumber(date.Day)}</span>
                  <span className="secular-day">{date.getDate().getDate()}</span>
                </div>

                <button
                  className="day-add-btn"
                  onClick={(e) => handleAddNewEventForDate(e, date)}
                  title={t.addEvent}>
                  <Plus size={14} />
                </button>

                <div className="flex flex-col gap-1 justify-center items-center mt-auto overflow-hidden w-full">
                  {date.getDayOfWeek() === 6 && !date.isYomTovOrCholHamoed(location.Israel) && (
                    <div className="shabbos-indicator">
                      {lang === "he"
                        ? date.getSedra(location.Israel).toStringHeb()
                        : date.getSedra(location.Israel).toString()}
                    </div>
                  )}

                  {/* User Events - separate row with wrapping */}
                  {dayEvents.length > 0 && (
                    <div className="flex flex-row flex-wrap gap-1 justify-center items-center w-full">
                      {dayEvents.slice(0, 5).map((e) => {
                        const anniv = getAnniversaryNumber(e, date);
                        return (
                          <button
                            key={e.id}
                            onClick={(evt) => {
                              evt.stopPropagation();
                              handleEditEvent(e, date);
                            }}
                            style={{
                              backgroundColor: e.backColor || "var(--accent-amber)",
                              borderRadius: 6,
                              padding: "2px 4px",
                              textAlign: "center",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderWidth: 0,
                              fontSize: "9px",
                              flexShrink: 0,
                            }}>
                            <span
                              className="truncate font-semibold drop-shadow-md"
                              style={{
                                padding: "1px 2px",
                                color: e.textColor || "#ffffff",
                                fontSize: "10px",
                              }}>
                              {e.name}
                            </span>
                            {anniv > 0 && (
                              <span
                                className="font-bold px-1 py-0.5 rounded"
                                style={{
                                  backgroundColor: e.textColor || "#ffffff",
                                  color: e.backColor || "var(--accent-amber)",
                                  fontSize: "10px",
                                }}>
                                {anniv}
                              </span>
                            )}
                          </button>
                        );
                      })}
                      {dayEvents.length > 5 && (
                        <span className="text-[8px] text-text-secondary">
                          +{dayEvents.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Notifications/Holidays - separate row with wrapping */}
                  {notes.dayNotes.length > 0 && (
                    <div className="flex flex-row flex-wrap gap-1 justify-center items-center w-full">
                      {notes.dayNotes.map((note, idx) => (
                        <div key={idx} className="holiday-indicator">
                          {note}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
