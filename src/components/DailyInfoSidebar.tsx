import React from "react";
import { BookOpen, HandHelping, Plus, Trash, X } from "lucide-react";
import { Dafyomi, Utils, jDate } from "jcal-zmanim";
import { UserEvent } from "../types";
import { formatTime, getAnniversaryNumber, getRelativeDescription } from "../utils";

interface DailyInfoSidebarProps {
  lang: "en" | "he";
  t: any;
  selectedJDate: jDate;
  selectedEvents: UserEvent[];
  selectedNotes: any;
  selectedZmanim: any;
  location: any;
  handleEditEvent: (event: UserEvent, date: jDate) => void;
  deleteEvent: (id: string) => void;
  handleAddNewEventForDate: (e: React.MouseEvent, date: jDate) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const DailyInfoSidebar: React.FC<DailyInfoSidebarProps> = ({
  lang,
  t,
  selectedJDate,
  selectedEvents,
  selectedNotes,
  selectedZmanim,
  location,
  handleEditEvent,
  deleteEvent,
  handleAddNewEventForDate,
  isMobileOpen,
  onMobileClose,
}) => {
  const prakim = selectedJDate.getPirkeiAvos(location.Israel);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && <div className="sidebar-overlay" onClick={onMobileClose} />}

      <aside className={`sidebar daily-info-sidebar ${isMobileOpen ? "sidebar-mobile-open" : ""}`}>
        {/* Mobile close button */}
        <button
          className="close-btn sidebar-close-btn"
          onClick={onMobileClose}
          aria-label="Close sidebar">
          <X size={24} />
        </button>

        <div className="glass-panel p-6 flex flex-col gap-4 overflow-hidden h-full">
          {/* Header with selected date */}
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black">
              {lang === "he"
                ? selectedJDate.toStringHeb(false, true, location.Israel)
                : selectedJDate.toString(false, false, true, location.Israel)}
            </h2>
            <p className="text-accent-amber font-bold tracking-wide text-sm">
              {selectedJDate
                .getDate()
                .toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { dateStyle: "full" })}
            </p>
            <p className="text-text-secondary text-[11px] opacity-70 italic">
              {getRelativeDescription(selectedJDate, lang)}
            </p>
          </div>

          <div className="divider"></div>

          {/* Add Event Button */}
          <button
            onClick={(e) => handleAddNewEventForDate(e, selectedJDate)}
            className="btn-warm border rounded-xl py-3 flex items-center justify-center gap-2 font-bold text-sm transition-all hover:scale-[1.02] shadow-sm mb-2">
            <Plus size={18} />
            <span>{t.addEvent}</span>
          </button>

          <section className="flex-grow overflow-y-auto pr-1 flex flex-col gap-4">
            {/* EVENTS */}
            {selectedEvents.length > 0 && (
              <div className="flex flex-col gap-2">
                {selectedEvents.map((event) => {
                  const anniv = getAnniversaryNumber(event, selectedJDate);
                  return (
                    <div
                      key={event.id}
                      className="relative p-3 rounded-xl border border-glass-border group hover:brightness-105 transition-all shadow-md"
                      style={{
                        backgroundColor: event.backColor || "var(--accent-amber)",
                        color: event.textColor || "#ffffff",
                      }}>
                      <div className="flex justify-between items-start">
                        <h4
                          className="font-bold flex gap-2 items-center flex-grow text-sm cursor-pointer"
                          onClick={() => handleEditEvent(event, selectedJDate)}>
                          {event.name}
                          {anniv > 0 && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider opacity-80"
                              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                              {anniv}
                            </span>
                          )}
                        </h4>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="p-1 hover:bg-black/10 rounded-md transition-all"
                          title={t.deleteEvent}>
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DAILY NOTES */}
            {selectedNotes.dayNotes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedNotes.dayNotes.map((note: string, idx: number) => (
                  <span
                    key={idx}
                    className="font-bold text-accent-rose border border-accent-rose/10 leading-none shadow-sm text-[11px]"
                    style={{
                      backgroundColor: "rgba(252, 165, 165, 0.15)",
                      padding: "5px 10px",
                      borderRadius: "100px",
                    }}>
                    {note}
                  </span>
                ))}
              </div>
            )}

            {selectedNotes.tefillahNotes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedNotes.tefillahNotes.map((note: string, idx: number) => (
                  <span
                    key={idx}
                    className="font-bold text-accent-amber border border-accent-amber/10 leading-none shadow-sm text-[11px]"
                    style={{
                      backgroundColor: "rgba(251, 191, 36, 0.15)",
                      padding: "5px 10px",
                      borderRadius: "100px",
                    }}>
                    {note}
                  </span>
                ))}
              </div>
            )}

            {/* PARASHA & DAF YOMI */}
            <div className="flex flex-col gap-2">
              {Dafyomi.toString(selectedJDate) && (
                <div className="p-3 rounded-xl bg-accent-gold/5 border border-accent-gold/20 flex items-center gap-3">
                  <BookOpen size={18} className="text-accent-gold flex-shrink-0" />
                  <span className="font-bold text-sm">
                    {lang === "he"
                      ? Dafyomi.toStringHeb(selectedJDate)
                      : Dafyomi.toString(selectedJDate)}
                  </span>
                </div>
              )}

              {prakim.length > 0 && (
                <div className="p-3 rounded-xl bg-accent-coral/5 border border-accent-coral/20 flex items-center gap-3">
                  <BookOpen size={18} className="text-accent-coral flex-shrink-0" />
                  <span className="font-bold text-sm">
                    {lang === "en"
                      ? "Pirkei Avos - " +
                        prakim.map((s: number) => `Perek ${Utils.toJewishNumber(s)}`).join(" & ")
                      : "פרקי אבות - " +
                        prakim.map((s: number) => `פרק ${Utils.toJewishNumber(s)}`).join(" ו")}
                  </span>
                </div>
              )}

              {(() => {
                const candles = selectedJDate.getCandleLighting(location, true);
                if (!candles) return null;
                return (
                  <div className="p-3 rounded-xl bg-accent-amber/10 border border-accent-amber/30 flex items-center gap-3">
                    <HandHelping size={20} className="text-accent-amber flex-shrink-0" />
                    <span className="font-black text-sm">
                      {t.candleLighting}: {formatTime(candles)}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* ZMANIM */}
            <div className="mt-2 flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 px-1">
                {t.zmanim}
              </h3>
              {selectedZmanim.map((zman: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 group hover:border-accent-amber/30 transition-all">
                  <span className="text-xs font-medium text-text-secondary">
                    {lang === "he" ? zman.zmanType.heb : zman.zmanType.eng}
                  </span>
                  <span className="text-sm font-bold font-mono text-accent-amber">
                    {formatTime(zman.time)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
};
