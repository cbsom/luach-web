import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  List,
  Calendar as CalendarIcon,
  Menu,
  Info,
} from "lucide-react";
import { Utils, jDate } from "jcal-zmanim";

interface HeaderProps {
  lang: "en" | "he";
  t: any;
  currentJDate: jDate;
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
  t,
  currentJDate,
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
            color: "var(--glass-border-amber)",
            backgroundColor: "transparent",
          }}
          title={t.settings || "Settings"}>
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-1 bg-accent-amber/10 rounded-xl overflow-hidden shadow-inner">
            <img src="./icon.svg" width="32" height="32" alt="Luach Logo" />
          </div>
          <h1 className="text-xl font-black tracking-tight">{t.title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div
          className={`flex btn-warm rounded-2xl p-1 border nav-controls ${
            lang === "he" ? "flex-row-reverse" : ""
          }`}>
          <button
            onClick={() => setIsJumpModalOpen(true)}
            style={{
              margin: "0 1rem",
              border: "0",
              color: "var(--glass-border-amber)",
              backgroundColor: "transparent",
            }}
            title={t.goToDate}>
            <CalendarIcon size={30} />
          </button>
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
            onClick={handleGoToToday}
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
        <h2 className="text-3xl font-black flex items-baseline gap-4 calendar-month-year">
          {currentMonthName} {currentYearName}
          <span className="text-lg font-medium text-text-secondary">{secondaryDateRange}</span>
        </h2>
      </div>
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
