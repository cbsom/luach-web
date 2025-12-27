import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Printer,
  Plus,
  List,
  Calendar as CalendarIcon,
  Info,
  Globe,
  Palette,
  LogOut,
  Menu,
} from "lucide-react";
import { Utils, jDate, getNotifications, Dafyomi, Locations } from "jcal-zmanim";
import { UserEvent } from "../types";
import { formatTime, getAnniversaryNumber } from "../utils";

interface CalendarProps {
  lang: "en" | "he";
  t: any;
  currentJDate: jDate;
  monthInfo: { days: jDate[]; year: number; month: number; weeksNeeded: number };
  selectedJDate: jDate;
  location: any;
  events: UserEvent[];
  setSelectedJDate: (date: jDate) => void;
  handleAddNewEventForDate: (e: React.MouseEvent, date: jDate) => void;
  handleEditEvent: (event: UserEvent, date: jDate) => void;
  getEventsForDate: (date: jDate) => UserEvent[];
  navigateMonth: (direction: number) => void;
  today: jDate;
  calendarView: "jewish" | "secular";
}

export const Calendar: React.FC<CalendarProps> = ({
  lang,
  t,
  currentJDate,
  monthInfo,
  selectedJDate,
  location,
  events,
  setSelectedJDate,
  handleAddNewEventForDate,
  handleEditEvent,
  getEventsForDate,
  navigateMonth,
  today,
  calendarView,
}) => {
  // Pointer detection for month navigation (Touch, Mouse, Stylus)
  const [pointerStart, setPointerStart] = React.useState<{
    x: number;
    y: number;
    time: number;
    id: number;
  } | null>(null);
  const swipedRef = React.useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only handle primary button (left click) for swiping
    if (e.button !== 0) return;

    // Reset swipe flag on new interaction
    swipedRef.current = false;

    setPointerStart({
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      id: e.pointerId,
    });

    // Capture the pointer to continue receiving events even if moved outside the element
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStart || pointerStart.id !== e.pointerId) return;

    const dx = Math.abs(e.clientX - pointerStart.x);
    const dy = Math.abs(e.clientY - pointerStart.y);

    // If movement is significant, prevent click behavior
    if (dx > 10 || dy > 10) {
      swipedRef.current = true;
    }

    // If we're moving horizontally more than vertically, prevent browser defaults
    if (dx > dy && dx > 10) {
      if (e.cancelable) e.preventDefault();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStart || pointerStart.id !== e.pointerId) return;

    const pointerEnd = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };

    const dx = pointerEnd.x - pointerStart.x;
    const dy = pointerEnd.y - pointerStart.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const duration = pointerEnd.time - pointerStart.time;

    // Thresholds: at least 50px travel, relatively quick swipe (under 500ms)
    const moveThreshold = 50;
    const timeThreshold = 500;

    if (absDx > moveThreshold && absDx > absDy && duration < timeThreshold) {
      // Horizontal swipe
      const isRTL = lang === "he";
      if (dx > 0) {
        // Swipe Right
        navigateMonth(isRTL ? 1 : -1);
      } else {
        // Swipe Left
        navigateMonth(isRTL ? -1 : 1);
      }
    } else if (absDy > moveThreshold && absDy > absDx && duration < timeThreshold) {
      // Vertical swipe
      if (dy > 0) {
        // Swipe Down -> Previous Month
        navigateMonth(-1);
      } else {
        // Swipe Up -> Next Month
        navigateMonth(1);
      }
    } else {
      // If we didn't meet the swipe threshold, consider it not a swipe
      // but only if movement was very minimal.
      if (absDx < 5 && absDy < 5) {
        swipedRef.current = false;
      }
    }

    setPointerStart(null);
  };

  const handlePointerCancel = () => {
    setPointerStart(null);
    swipedRef.current = false;
  };

  return (
    <main
      className="calendar-main fade-in"
      style={{ animationDelay: "0.1s" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}>
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
          style={
            {
              gridTemplateRows: `repeat(${monthInfo.weeksNeeded}, 1fr)`,
              "--weeks": monthInfo.weeksNeeded,
            } as React.CSSProperties
          }>
          {(() => {
            return monthInfo.days.map((date: jDate, i: number) => {
              const isToday = date.Abs === today.Abs;
              const isSelected = date.Abs === selectedJDate.Abs;
              const isOtherMonth =
                calendarView === "jewish"
                  ? date.Month !== currentJDate.Month
                  : date.getDate().getMonth() !== currentJDate.getDate().getMonth();
              const notes = getNotifications(
                date,
                { hour: 10, minute: 0 },
                location,
                lang === "en",
                true,
                false
              );
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
                  onClick={() => {
                    if (swipedRef.current) {
                      swipedRef.current = false;
                      return;
                    }
                    setSelectedJDate(date);
                  }}
                  style={{
                    ...(isHolidayBg ? { backgroundColor: "rgba(61, 36, 24, 0.3)" } : {}),
                    ...(dayEvents.length > 0 && dayEvents[0].backColor
                      ? ({
                          backgroundColor: dayEvents[0].backColor,
                          "--cell-bg": dayEvents[0].backColor,
                          "--text-primary": dayEvents[0].textColor || "#ffffff",
                          "--text-secondary": dayEvents[0].textColor || "#ffffff",
                          ...(isSelected
                            ? { borderColor: dayEvents[0].textColor || "#ffffff" }
                            : {}),
                        } as React.CSSProperties)
                      : {}),
                  }}>
                  {isToday && (
                    <div className="astroid-overlay" style={{ zIndex: 1, pointerEvents: "none" }}>
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        style={{ width: "200%", height: "120%" }}>
                        <path
                          d="M 50 0 Q 50 50 100 50 Q 50 50 50 100 Q 50 50 0 50 Q 50 50 50 0"
                          fill="rgba(0, 0, 100, 0.25)"
                        />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`day-number-container ${
                      calendarView === "secular" ? "flex-row-reverse" : ""
                    }`}>
                    {calendarView === "jewish" ? (
                      <>
                        <span className="hebrew-day">{Utils.toJewishNumber(date.Day)}</span>
                        <span className="secular-day">{date.getDate().getDate()}</span>
                      </>
                    ) : (
                      <>
                        <span className="hebrew-day-secondary">
                          {Utils.toJewishNumber(date.Day)}
                        </span>
                        <span className="secular-day-primary">{date.getDate().getDate()}</span>
                      </>
                    )}
                  </div>

                  <button
                    className="day-add-btn"
                    onClick={(e) => handleAddNewEventForDate(e, date)}
                    title={t.addEvent}>
                    <Plus size={14} />
                  </button>

                  <div className="flex flex-col gap-0.5 justify-center items-center mt-auto overflow-hidden w-full">
                    {/* Parasha */}
                    {date.getDayOfWeek() === 6 && !date.isYomTovOrCholHamoed(location.Israel) && (
                      <div className="shabbos-indicator">
                        {lang === "he"
                          ? date.getSedra(location.Israel).toStringHeb()
                          : date.getSedra(location.Israel).toString()}
                      </div>
                    )}

                    {/* Candle Lighting */}
                    {(() => {
                      const candles = date.getCandleLighting(location, true);
                      return candles ? (
                        <div className="candle-lighting-text">
                          <span className="opacity-70">
                            {lang === "he" ? "הדלקת נרות" : "Candles"}:
                          </span>{" "}
                          {formatTime(candles)}
                        </div>
                      ) : null;
                    })()}

                    {/* User Events */}
                    {dayEvents.length > 0 && (
                      <div className="flex flex-row flex-wrap gap-1 justify-center items-center w-full my-0.5">
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

                    {/* Notifications/Holidays & Special Tags */}
                    {(() => {
                      const allNotes: string[] = [];

                      // 1. Omer
                      const omerDay = date.getDayOfOmer();
                      if (omerDay > 0) {
                        allNotes.push(
                          lang === "he"
                            ? `עומר: ${Utils.toJewishNumber(omerDay)}`
                            : `Omer: ${omerDay}`
                        );
                      }

                      // 2. Chanukah (if not already in dayNotes)
                      // getNotifications usually has it, but we can ensure it

                      // 3. Day Notes (Holidays)
                      (notes.dayNotes || []).forEach((n: string) => allNotes.push(n));

                      // 4. Special Shabbos / Mevarchim (from shulNotes)
                      const shulNotes = (notes as any).shulNotes || [];
                      const shulNotesToDisplay = shulNotes.filter(
                        (n: string) =>
                          n.includes("Mevarchim") ||
                          n.includes("מברכים") ||
                          n.includes("Shkalim") ||
                          n.includes("שקלים") ||
                          n.includes("Zachor") ||
                          n.includes("זכור") ||
                          n.includes("Parah") ||
                          n.includes("פרה") ||
                          n.includes("Hachodesh") ||
                          n.includes("החודש") ||
                          n.includes("Hagadol") ||
                          n.includes("הגדול") ||
                          n.includes("Shuva") ||
                          n.includes("שובה") ||
                          n.includes("Chazon") ||
                          n.includes("חזון") ||
                          n.includes("Shira") ||
                          n.includes("שירה")
                      );
                      shulNotesToDisplay.forEach((n: string) => {
                        if (!allNotes.includes(n)) allNotes.push(n);
                      });

                      return (
                        allNotes.length > 0 && (
                          <div className="flex flex-col gap-0 justify-center items-center w-full">
                            {allNotes.map((note, idx) => (
                              <div key={idx} className="holiday-indicator">
                                {note}
                              </div>
                            ))}
                          </div>
                        )
                      );
                    })()}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </section>
    </main>
  );
};
