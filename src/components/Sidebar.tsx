import React from "react";
import {
  Calendar as CalendarIcon,
  MapPin,
  Search,
  Bell,
  Info,
  Sunrise,
  Moon,
  Clock,
} from "lucide-react";
import { Locations, Dafyomi, Utils, jDate } from "jcal-zmanim";
import { UserEvent } from "../types";
import { formatTime, getAnniversaryNumber } from "../utils";

interface SidebarProps {
  lang: "en" | "he";
  setLang: (lang: "en" | "he") => void;
  theme: "warm" | "dark" | "light";
  setTheme: (theme: "warm" | "dark" | "light") => void;
  t: any;
  locationName: string;
  setLocationName: (name: string) => void;
  selectedJDate: jDate;
  selectedEvents: UserEvent[];
  selectedNotes: any;
  selectedZmanim: any;
  location: any;
  handleEditEvent: (event: UserEvent, date: jDate) => void;
  deleteEvent: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  t,
  locationName,
  setLocationName,
  selectedJDate,
  selectedEvents,
  selectedNotes,
  selectedZmanim,
  location,
  handleEditEvent,
  deleteEvent,
}) => {
  const cycleTheme = () => {
    const themes: Array<"warm" | "dark" | "light"> = ["warm", "dark", "light"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "warm":
        return "🔥";
      case "dark":
        return "🌙";
      case "light":
        return "☀️";
    }
  };

  return (
    <aside className="sidebar fade-in">
      <div className="glass-panel p-4 flex flex-col gap-3 flex-shrink-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent-amber/20 rounded-xl text-accent-amber">
                <CalendarIcon size={20} />
              </div>
              <h1 className="text-lg font-black tracking-tight">{t.title}</h1>
            </div>

            <div className="flex gap-2">
              <button
                onClick={cycleTheme}
                className="py-1.5 px-3 rounded-xl btn-warm border transition-all text-[10px] font-black uppercase tracking-tighter"
                style={{
                  padding: "0.5rem 1rem",
                }}
                title={`Theme: ${theme}`}>
                {getThemeIcon()}
              </button>

              <button
                onClick={() => setLang(lang === "en" ? "he" : "en")}
                className="py-1.5 px-3 rounded-xl btn-warm border transition-all text-[10px] font-black uppercase tracking-tighter"
                style={{
                  padding: "0.5rem 1rem",
                }}>
                {lang === "en" ? "עברית" : "EN"}
              </button>
            </div>
          </div>

          <div className="relative w-full flex items-center gap-2">
            <MapPin
              className={`absolute ${
                lang === "he" ? "right-2.5" : "left-2.5"
              } top-1/2 -translate-y-1/2 text-accent-amber pointer-events-none`}
              size={12}
            />
            <select
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className={`w-full btn-warm border rounded-xl py-1.5 ${
                lang === "he" ? "pr-8 pl-2" : "pl-8 pr-2"
              } text-[11px] font-bold focus:ring-1 focus:ring-accent-amber transition-all cursor-pointer outline-none appearance-none`}
              style={{
                padding: "0.5rem 1rem",
              }}>
              {Locations.sort((a, b) => a.Name.localeCompare(b.Name)).map((loc) => (
                <option key={loc.Name} value={loc.Name} className="bg-bg-primary">
                  {lang === "he" && (loc as any).NameHebrew ? (loc as any).NameHebrew : loc.Name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel p-4 flex-grow flex flex-col gap-4 overflow-hidden min-h-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-text-secondary leading-tight">
            {lang === "he" ? selectedJDate.toStringHeb() : selectedJDate.toString()}
          </h2>
          <p className="text-accent-amber font-bold tracking-wide text-sm">
            {selectedJDate
              .getDate()
              .toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { dateStyle: "full" })}
          </p>
        </div>

        <div className="divider"></div>

        <section className="flex flex-col gap-2 overflow-y-auto pr-1 pl-1 flex-grow min-h-0">
          {/* EVENTS */}
          {selectedEvents.length > 0 && (
            <div className="flex flex-col gap-2">
              {selectedEvents.map((event) => {
                const anniv = getAnniversaryNumber(event, selectedJDate);
                return (
                  <div
                    key={event.id}
                    className="relative p-3 rounded border border-glass-border group hover:brightness-105 transition-all shadow-md"
                    style={{
                      backgroundColor: event.backColor || "var(--accent-amber)",
                      color: event.textColor || "#ffffff",
                    }}>
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="font-bold flex gap-2 items-center flex-grow text-xs">
                        {event.name}
                        {anniv > 0 && (
                          <span
                            className="text-[9px] px-1 py-0.5 rounded font-bold uppercase tracking-wider opacity-80"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.2)",
                            }}>
                            #{anniv}
                          </span>
                        )}
                      </h4>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleEditEvent(event, selectedJDate)}
                          className="p-1 bg-black/10 hover:bg-black/20 rounded-md transition-all"
                          title={t.editEvent}>
                          <Search size={10} />
                        </button>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="p-1 bg-black/10 hover:bg-red-500/40 rounded-md transition-all"
                          title={t.deleteEvent}>
                          <span className="text-[9px] font-bold">✕</span>
                        </button>
                      </div>
                    </div>
                    {event.notes && (
                      <p className="text-[10px] opacity-90 line-clamp-2 leading-tight">
                        {event.notes}
                      </p>
                    )}
                    {(event.remindDayOf || event.remindDayBefore) && (
                      <div className="flex gap-1 mt-1 items-center opacity-90">
                        <Bell size={8} />
                        <span className="text-[8px] font-bold uppercase tracking-tighter">
                          {event.remindDayBefore && (lang === "he" ? "לפני" : "Before")}
                          {event.remindDayBefore && event.remindDayOf && " & "}
                          {event.remindDayOf && (lang === "he" ? "ביום עצמו" : "Day Of")}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="divider my-1 opacity-50"></div>
            </div>
          )}

          {/* DAILY NOTES */}
          {(() => {
            return (
              selectedNotes.dayNotes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedNotes.dayNotes.map((note: string, idx: number) => (
                    <span
                      key={idx}
                      className="font-bold text-accent-rose border border-accent-rose/10 leading-none shadow-sm"
                      style={{
                        backgroundColor: "rgba(252, 165, 165, 0.15)",
                        fontSize: "smaller",
                        padding: "4px 7px",
                        borderRadius: "10px",
                      }}>
                      {note}
                    </span>
                  ))}
                </div>
              )
            );
          })()}

          {selectedNotes.tefillahNotes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedNotes.tefillahNotes.map((note: string, idx: number) => (
                <div
                  key={idx}
                  className="font-bold text-accent-amber border border-accent-amber/10 leading-none shadow-sm"
                  style={{
                    backgroundColor: "rgba(251, 191, 36, 0.15)",
                    fontSize: "smaller",
                    padding: "4px 7px",
                    borderRadius: "10px",
                  }}>
                  {note}
                </div>
              ))}
            </div>
          )}

          {(selectedNotes.dayNotes.length > 0 || selectedNotes.tefillahNotes.length > 0) && (
            <div className="divider my-1 opacity-50"></div>
          )}

          {/* DAF YOMI & PARASHA */}
          <div className="grid grid-cols-2 gap-2">
            {/* Daf Yomi */}
            {Dafyomi.toString(selectedJDate) && (
              <div className="p-1.5 rounded-lg bg-accent-gold/5 border border-accent-gold/20 flex items-center justify-start gap-2">
                <Info size={12} className="text-accent-gold flex-shrink-0" />
                <span className="font-bold text-accent-gold text-[10px] text-left leading-tight">
                  {lang === "he"
                    ? Dafyomi.toStringHeb(selectedJDate)
                    : Dafyomi.toString(selectedJDate)}
                </span>
              </div>
            )}

            {/* Weekly Parasha */}
            <div className="p-1.5 rounded-xl btn-warm border flex items-center justify-start gap-2">
              <Sunrise size={12} className="text-accent-gold flex-shrink-0" />
              <span className="font-bold text-accent-gold text-[10px] text-left leading-tight">
                {(lang === "he"
                  ? selectedJDate.getSedra(location.Israel).toStringHeb()
                  : selectedJDate.getSedra(location.Israel).toString()) || t.noParasha}
              </span>
            </div>
          </div>

          {/* OMER & OTHER INFO COMPACT */}
          {selectedJDate.getDayOfOmer() > 0 && (
            <div className="mt-1 p-1.5 rounded-lg bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-start gap-2">
              <span className="text-[10px] font-black text-white text-left">
                {t.omer}:{" "}
                {lang === "he"
                  ? Utils.toJewishNumber(selectedJDate.getDayOfOmer())
                  : selectedJDate.getDayOfOmer()}
              </span>
            </div>
          )}

          {selectedJDate.getPirkeiAvos(location.Israel).length > 0 && (
            <div className="mt-1 p-1.5 rounded-lg bg-accent-coral/10 border border-accent-coral/20 flex items-center justify-start gap-2">
              <span className="text-[10px] font-black text-white text-left">
                {selectedJDate
                  .getPirkeiAvos(location.Israel)
                  .map((s) => (lang === "he" ? Utils.toJewishNumber(s) : s))
                  .join(", ")}
              </span>
            </div>
          )}

          {(() => {
            const candles = selectedJDate.getCandleLighting(location, true);
            return candles ? (
              <div className="mt-1 p-1.5 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-start gap-2">
                <Moon size={10} className="text-accent-gold" />
                <span className="text-[10px] font-black text-white text-left">
                  {formatTime(candles)}
                </span>
              </div>
            ) : null;
          })()}

          {/* ZMANIM (Moved to Bottom) */}
          <div className="divider my-1 opacity-50"></div>

          <div className="grid gap-1">
            {selectedZmanim.map((zman: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 rounded-xl btn-warm border group transition-all">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-[10px] font-medium text-text-secondary truncate">
                    {lang === "he" ? zman.zmanType.heb : zman.zmanType.eng}
                  </span>
                </div>
                <span className="text-xs font-bold font-mono text-accent-amber flex-shrink-0 ml-2">
                  {formatTime(zman.time)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
};
