import React from "react";
import { List, Menu } from "lucide-react";
import { DateNavigation } from "./DateNavigation";

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
        lang={lang}
        textInLanguage={textInLanguage}
        navigateMonth={navigateMonth}
        navigateYear={navigateYear}
        handleGoToToday={handleGoToToday}
        setIsJumpModalOpen={setIsJumpModalOpen}
      />
      <h2 className="text-3xl font-black flex items-baseline gap-4 calendar-month-year">
        {currentMonthName} {currentYearName}
        <span className="text-lg font-medium text-text-secondary">{secondaryDateRange}</span>
      </h2>
      <div className="flex items-center gap-2">
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
