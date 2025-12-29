import React, { useState, useRef, useEffect } from "react";
import { MapPin, X, Palette, Bell, Check, Globe } from "lucide-react";
import { Locations, jDate } from "jcal-zmanim";
import { ToggleSwitch } from "./ToggleSwitch";
import { NotificationService } from "../NotificationService";
import { cycleTheme, getThemeIcon } from "../utils";

interface SettingsSidebarProps {
  lang: "en" | "he";
  setLang: (lang: "en" | "he") => void;
  theme: "warm" | "dark" | "light" | "tcheles";
  setTheme: (theme: "warm" | "dark" | "light" | "tcheles") => void;
  textInLanguage: any;
  locationName: string;
  setLocationName: (name: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: any;
  onLogin: () => void;
  todayStartMode: "sunset" | "midnight";
  setTodayStartMode: (mode: "sunset" | "midnight") => void;
  emailEnabled: boolean;
  setEmailEnabled: (enabled: boolean) => void;
  browserNotificationsEnabled: boolean;
  setBrowserNotificationsEnabled: (enabled: boolean) => void;
  calendarView: "jewish" | "secular";
  setCalendarView: (view: "jewish" | "secular") => void;
  desktopSidebarMode: "permanent" | "hidden";
  setDesktopSidebarMode: (mode: "permanent" | "hidden") => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  textInLanguage,
  locationName,
  setLocationName,
  isOpen,
  onClose,
  onLogout,
  user,
  onLogin,
  todayStartMode,
  setTodayStartMode,
  emailEnabled,
  setEmailEnabled,
  browserNotificationsEnabled,
  setBrowserNotificationsEnabled,
  calendarView,
  setCalendarView,
  desktopSidebarMode,
  setDesktopSidebarMode,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const checkScroll = () => {
    if (sidebarRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = sidebarRef.current;
      // Use a small buffer (2px) for rounding errors
      const atBottom = scrollTop + clientHeight >= scrollHeight - 2;
      setIsAtBottom(atBottom);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small timeout to let content render before initial check
      setTimeout(checkScroll, 100);
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} style={{ zIndex: 1100 }} />}
      <aside
        ref={sidebarRef}
        onScroll={checkScroll}
        className={`settings-sidebar glass-panel scroll-affordance ${isOpen ? "open" : ""} ${
          isAtBottom ? "at-bottom" : "has-more"
        }`}
        style={{ zIndex: 1200 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black tracking-tight">
            {textInLanguage.settings || "Settings"}
          </h2>
          <button className="close-btn settings-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-6 pb-10">
          {/* Theme & Language Icons - Original Style */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">
                {lang === "he" ? "שפה / לעברית" : "Language / English"}
              </label>
              <button
                onClick={() => setLang(lang === "en" ? "he" : "en")}
                className="p-2 w-full py-4 rounded-xl btn-warm border flex items-center justify-center gap-3 font-bold text-sm shadow-md transition-all hover:scale-[1.01]">
                <Globe size={18} className="text-accent-amber" />
                <span>{lang === "en" ? "עברית" : "ENGLISH"}</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">
                {lang === "he" ? "ערכת נושא" : "Appearance Theme"}
              </label>
              <button
                onClick={() => cycleTheme(theme, setTheme)}
                className="w-full py-4 rounded-xl btn-warm border flex items-center justify-center gap-3 font-bold text-sm shadow-md transition-all hover:scale-[1.01]">
                <div className="p-2 text-xl leading-none">{getThemeIcon(theme)}</div>
                <span className="uppercase tracking-wider">
                  {theme === "warm"
                    ? lang === "he"
                      ? "חמים"
                      : "WARM"
                    : theme === "dark"
                    ? lang === "he"
                      ? "כהה"
                      : "DARK"
                    : theme === "light"
                    ? lang === "he"
                      ? "בהיר"
                      : "LIGHT"
                    : lang === "he"
                    ? "תכלת"
                    : "TCHELES"}
                </span>
              </button>
            </div>
          </div>

          {/* Location Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">
              {textInLanguage.location}
            </label>
            <div className="relative w-full flex items-center gap-2">
              <MapPin
                className={`absolute ${
                  lang === "he" ? "right-3" : "left-3"
                } top-1/2 -translate-y-1/2 text-accent-amber pointer-events-none`}
                size={14}
              />
              <select
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className={`w-full btn-warm border rounded-xl py-3 p-2 ${
                  lang === "he" ? "pr-10 pl-4" : "pl-10 pr-4"
                } text-xs font-bold outline-none appearance-none`}>
                {Locations.sort((a, b) => a.Name.localeCompare(b.Name)).map((loc) => (
                  <option key={loc.Name} value={loc.Name} className="bg-bg-primary">
                    {lang === "he" && (loc as any).NameHebrew ? (loc as any).NameHebrew : loc.Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">
                {textInLanguage.todayStart}
              </label>
              <ToggleSwitch
                leftLabel={textInLanguage.sunset}
                rightLabel={textInLanguage.midnight}
                value={todayStartMode === "sunset" ? "left" : "right"}
                onChange={(val) => setTodayStartMode(val === "left" ? "sunset" : "midnight")}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">
                {textInLanguage.emailReminders}
              </label>
              <ToggleSwitch
                leftLabel={textInLanguage.on}
                rightLabel={textInLanguage.off}
                value={emailEnabled ? "left" : "right"}
                onChange={(val) => setEmailEnabled(val === "left")}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">
                {textInLanguage.browserNotifications}
              </label>
              <ToggleSwitch
                leftLabel={textInLanguage.on}
                rightLabel={textInLanguage.off}
                value={browserNotificationsEnabled ? "left" : "right"}
                onChange={async (val) => {
                  const enabled = val === "left";
                  if (enabled) await NotificationService.requestPermission();
                  setBrowserNotificationsEnabled(enabled);
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">
                {textInLanguage.calendarView}
              </label>
              <ToggleSwitch
                leftLabel={textInLanguage.jewishMonth}
                rightLabel={textInLanguage.secularMonth}
                value={calendarView === "jewish" ? "left" : "right"}
                onChange={(val) => setCalendarView(val === "left" ? "jewish" : "secular")}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">
                {textInLanguage.desktopSidebar}
              </label>
              <ToggleSwitch
                leftLabel={textInLanguage.sidePanelVisible}
                rightLabel={textInLanguage.sidePanelHidden}
                value={desktopSidebarMode === "permanent" ? "left" : "right"}
                onChange={(val) => setDesktopSidebarMode(val === "left" ? "permanent" : "hidden")}
              />
            </div>
          </div>

          {/* Auth Section */}
          <div className="mt-4 pt-6 border-t border-glass-border/30">
            {user ? (
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-8 h-8 rounded-full border border-accent-gold/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold font-bold">
                      {user.displayName?.[0] || "?"}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-bold text-xs truncate max-w-[120px]">
                      {user.displayName || user.email}
                    </span>
                    <span className="text-[9px] text-accent-gold font-bold uppercase tracking-widest opacity-70">
                      {textInLanguage.cloud}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl btn-warm border font-bold text-xs transition-all hover:scale-[1.02] shadow-lg">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt=""
                  className="w-4 h-4"
                />
                <span>{textInLanguage.signInWithGoogle}</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
