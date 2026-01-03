import React from "react";
import { List, Menu, Sun, Moon, Flame, Droplets, CalendarDays } from "lucide-react";
import { DateNavigation } from "./DateNavigation";
import { getThemeIcon, cycleTheme } from "../utils";
import { Themes } from "../types";

interface HeaderProps {
  lang: "en" | "he";
  textInLanguage: any;
  currentMonthName: string;
  currentYearName: string;
  secondaryDateRange: string;
  navigateMonth: (direction: number) => void;
  navigateYear: (direction: number) => void;
  handleGoToToday: () => void;
  setIsJumpModalOpen: (isOpen: boolean) => void;
  setIsEventsListOpen: (isOpen: boolean) => void;
  onSettingsOpen: () => void;
  theme: Themes;
  setTheme: (theme: Themes) => void;
  calendarView: "jewish" | "secular";
  setCalendarView: (view: "jewish" | "secular") => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  textInLanguage,
  currentMonthName,
  currentYearName,
  secondaryDateRange,
  navigateMonth,
  navigateYear,
  handleGoToToday,
  setIsJumpModalOpen,
  setIsEventsListOpen,
  onSettingsOpen,
  theme,
  setTheme,
  calendarView,
  setCalendarView,
}) => {
  return (
    <header className="glass-panel p-4 px-6 flex items-center justify-between main-header">
      <div className="flex items-center gap-4">
        <button
          onClick={onSettingsOpen}
          className=""
          style={{
            border: "0",
            color: "var(--accent-amber)",
            backgroundColor: "transparent",
          }}
          title={textInLanguage.settings || "Settings"}>
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-1 bg-accent-amber/10 rounded-xl overflow-hidden shadow-inner">
            <img src="./icon.svg" width="32" height="32" alt="Luach Logo" />
          </div>
          <h1 className="text-xl font-black tracking-tight">{textInLanguage.title}</h1>
        </div>
      </div>
      <DateNavigation
        className="nav-controls"
        lang={lang}
        textInLanguage={textInLanguage}
        navigateMonth={navigateMonth}
        navigateYear={navigateYear}
        handleGoToToday={handleGoToToday}
        setIsJumpModalOpen={setIsJumpModalOpen}
      />
      <h1 className="flex gap-4 flex-row justify-between items-center calendar-month-year">
        <div>
          {currentMonthName} {currentYearName}
        </div>
        <div className="secondary-month-year">{secondaryDateRange}</div>
      </h1>
      <div className="flex items-center gap-2">
        <button
          onClick={() => cycleTheme(theme, setTheme)}
          className="no-border no-background cursor-pointer"
          style={{
            paddingBottom: "3px",
          }}
          title={textInLanguage.colorTheme}>
          {getThemeIcon(theme)}
        </button>
        <button
          onClick={() => setCalendarView(calendarView === "jewish" ? "secular" : "jewish")}
          className="no-border no-background cursor-pointer btn-warm"
          title={
            calendarView === "jewish" ? textInLanguage.secularMonth : textInLanguage.jewishMonth
          }>
          <CalendarDays size={14} />
        </button>
        <button
          onClick={() => setIsEventsListOpen(true)}
          className="p-3 btn-warm rounded-2xl border transition-all flex items-center gap-2 font-bold text-sm h-[42px] px-4"
          title={lang === "he" ? "אירועים" : "Events"}>
          <List size={16} />
          <span className="hidden sm:inline">{lang === "he" ? "אירועים" : "Events"}</span>
        </button>
      </div>
    </header>
  );
};
