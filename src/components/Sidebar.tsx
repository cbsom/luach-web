import React from "react";
import { MapPin, BookOpen, HandHelping, X, Plus, Trash, Bell, Check, MenuIcon } from "lucide-react";
import { Locations, Dafyomi, Utils, jDate } from "jcal-zmanim";
import { UserEvent } from "../types";
import { formatTime, getAnniversaryNumber } from "../utils";
import { ToggleSwitch } from "./ToggleSwitch";
import { NotificationService } from "../NotificationService";

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
  handleAddNewEventForDate: (e: React.MouseEvent, date: jDate) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  onLogout: () => void;
  user: any;
  onLogin: () => void;
  todayStartMode: "sunset" | "midnight";
  setTodayStartMode: (mode: "sunset" | "midnight") => void;
  emailEnabled: boolean;
  setEmailEnabled: (enabled: boolean) => void;
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
  handleAddNewEventForDate,
  isMobileOpen,
  onMobileClose,
  onLogout,
  user,
  onLogin,
  todayStartMode,
  setTodayStartMode,
  emailEnabled,
  setEmailEnabled,
}) => {
  const [notifStatus, setNotifStatus] = React.useState(NotificationService.getPermissionStatus());
  const [showSettings, setShowSettings] = React.useState(false);
  const handleEnableNotifications = async () => {
    const status = await NotificationService.requestPermission();
    setNotifStatus(status);
  };

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
  const prakim = selectedJDate.getPirkeiAvos(location.Israel);
  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && <div className="sidebar-overlay" onClick={onMobileClose} />}
      <div
        style={{
          position: "absolute",
          top: "2px",
          left: lang === "he" ? "auto" : "10px",
          right: lang === "he" ? "10px" : "auto",
          cursor: "pointer",
        }}
        onClick={() => setShowSettings(!showSettings)}>
        <MenuIcon size={15} />
      </div>
      <aside className={`sidebar ${isMobileOpen ? "sidebar-mobile-open" : ""}`}>
        {/* Mobile close button */}
        <button className="sidebar-close-btn" onClick={onMobileClose} aria-label="Close sidebar">
          <X size={24} />
        </button>

        <div
          className={
            showSettings
              ? "glass-panel p-4 flex flex-col gap-3 flex-shrink-0 sidebar-top-controls"
              : ""
          }
          style={{
            height: showSettings ? "auto" : "40px",
            overflow: showSettings ? "visible" : "hidden",
          }}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center w-full justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-accent-amber/10 rounded-xl overflow-hidden shadow-inner">
                  <img
                    src="./icon.svg"
                    width="32"
                    height="32"
                    alt="Luach Logo"
                    style={{ display: "block" }}
                  />
                </div>
                <h1 className="text-lg font-black tracking-tight">{t.title}</h1>
              </div>
              {showSettings && (
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
              )}
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

            {/* Today Start Mode Toggle */}
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[9px] font-bold uppercase tracking-wider opacity-60 px-1">
                {t.todayStart}
              </label>
              <ToggleSwitch
                leftLabel={t.sunset}
                rightLabel={t.midnight}
                value={todayStartMode === "sunset" ? "left" : "right"}
                onChange={(val) => setTodayStartMode(val === "left" ? "sunset" : "midnight")}
              />
            </div>

            {/* Email Reminders Toggle */}
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[9px] font-bold uppercase tracking-wider opacity-60 px-1">
                {t.emailReminders}
              </label>
              <ToggleSwitch
                leftLabel={t.on}
                rightLabel={t.off}
                value={emailEnabled ? "left" : "right"}
                onChange={(val) => setEmailEnabled(val === "left")}
              />
            </div>

            {/* Notification Settings */}
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[9px] font-bold uppercase tracking-wider opacity-60 px-1">
                {t.notificationSettings}
              </label>
              {notifStatus === "granted" ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-amber/10 rounded-xl text-accent-amber text-[10px] font-bold">
                  <Check size={12} />
                  <span>{t.notificationsEnabled}</span>
                </div>
              ) : (
                <button
                  onClick={handleEnableNotifications}
                  className="flex items-center justify-center gap-2 px-3 py-1.5 btn-warm border rounded-xl text-[10px] font-bold transition-all hover:bg-accent-amber hover:text-slate-900">
                  <Bell size={12} />
                  <span>{t.enableNotifications}</span>
                </button>
              )}
            </div>

            {/* USER / AUTH SECTION */}
            <div className="mt-auto pt-4 border-t border-glass-border/30">
              {user ? (
                <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        className="rounded-full border border-accent-gold/30"
                        style={{ width: "20px", height: "20px" }}
                      />
                    ) : (
                      <div
                        className="rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold font-bold"
                        style={{ width: "20px", height: "20px", fontSize: "10px" }}>
                        {user.displayName?.[0] || user.email?.[0] || "?"}
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span
                        className="font-bold truncate leading-none mb-0.5"
                        style={{ fontSize: "11px" }}>
                        {user.displayName || user.email}
                      </span>
                      <span
                        className="text-accent-gold font-bold uppercase tracking-widest opacity-70"
                        style={{ fontSize: "9px" }}>
                        {t.cloud}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 hover:bg-red-500/10 text-red-400 hover:text-red-500 rounded-lg transition-all"
                    title={t.signOut}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onLogin}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl btn-warm border font-bold transition-all hover:scale-[1.02] shadow-lg"
                  style={{ width: "100%", fontSize: "11px" }}>
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt=""
                    style={{ width: "14px", height: "14px" }}
                  />
                  <span>{t.signInWithGoogle}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 flex-grow flex flex-col gap-4 overflow-hidden min-h-0">
          <div className="flex flex-col gap-1">
            <h3>
              {lang === "he"
                ? selectedJDate.toStringHeb(false, true, location.Israel)
                : selectedJDate.toString(false, false, true, location.Israel)}
            </h3>
            <p className="text-accent-amber font-bold tracking-wide text-sm">
              {selectedJDate
                .getDate()
                .toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { dateStyle: "full" })}
            </p>
          </div>

          <div className="divider"></div>

          {/* Add Event Button */}
          <button
            onClick={(e) => handleAddNewEventForDate(e, selectedJDate)}
            className="mobile-add-event-btn btn-warm border rounded-xl py-2 flex items-center justify-center gap-2 font-bold text-sm transition-all hover:scale-[1.02]"
            style={{
              padding: "0.25rem",
            }}>
            <Plus size={18} />
            <span>{t.addEvent}</span>
          </button>

          <section className="flex flex-col gap-2 overflow-y-auto pr-1 pl-1 flex-grow min-h-0">
            {/* EVENTS */}
            {selectedEvents.length > 0 && (
              <div className="flex flex-col gap-2">
                {selectedEvents.map((event) => {
                  const anniv = getAnniversaryNumber(event, selectedJDate);
                  return (
                    <div
                      key={event.id}
                      className="relative p-2 rounded-xl border border-glass-border group hover:brightness-105 transition-all shadow-md"
                      style={{
                        backgroundColor: event.backColor || "var(--accent-amber)",
                        color: event.textColor || "#ffffff",
                      }}>
                      <div className="flex justify-between items-start mb-0.5">
                        <h4
                          className="font-bold flex gap-2 items-center flex-grow text-xs"
                          onClick={() => handleEditEvent(event, selectedJDate)}
                          style={{
                            cursor: "pointer",
                          }}>
                          {event.name}
                          {anniv > 0 && (
                            <span
                              className="text-[9px] px-1 py-0.5 rounded font-bold uppercase tracking-wider opacity-80"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.2)",
                              }}>
                              {anniv}
                            </span>
                          )}
                        </h4>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => deleteEvent(event.id)}
                            style={{
                              border: "0",
                              backgroundColor: "transparent",
                              cursor: "pointer",
                            }}
                            title={t.deleteEvent}>
                            <Trash size={15} />
                          </button>
                        </div>
                      </div>
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

            {/* PARASHA & DAF YOMI */}
            <div className="grid grid-cols-2 gap-2">
              {/* Daf Yomi */}
              {Dafyomi.toString(selectedJDate) && (
                <div className="p-1.5 rounded-lg bg-accent-gold/5 border border-accent-gold/20 flex items-center justify-start gap-2">
                  <BookOpen size={17} className="text-accent-gold flex-shrink-0" />
                  <span className="font-bold text-accent-gold text-[10px] text-left leading-tight">
                    {lang === "he"
                      ? Dafyomi.toStringHeb(selectedJDate)
                      : Dafyomi.toString(selectedJDate)}
                  </span>
                </div>
              )}
            </div>
            {prakim.length > 0 && (
              <div className="mt-1 p-1.5 rounded-lg bg-accent-coral/10 border border-accent-coral/20 flex items-center justify-start gap-2">
                <BookOpen size={17} className="text-accent-gold flex-shrink-0" />
                <span className="text-[10px] font-black text-white text-left">
                  {lang === "en"
                    ? "Pirkei Avos - " +
                      prakim.map((s: number) => `Perek ${Utils.toJewishNumber(s)}`).join(" and ")
                    : "פרקי אבות - " +
                      prakim.map((s: number) => `פרק ${Utils.toJewishNumber(s)}`).join(" ו")}
                </span>
              </div>
            )}

            {(() => {
              const candles = selectedJDate.getCandleLighting(location, true);
              return candles ? (
                <div className="mt-1 p-1.5 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-start gap-2">
                  <HandHelping size={20} className="text-accent-gold" />
                  <span className="text-[10px] font-black text-white text-left">
                    {`${t.candleLighting} ${formatTime(candles)}`}
                  </span>
                  <HandHelping size={20} className="text-accent-gold" />
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
    </>
  );
};
