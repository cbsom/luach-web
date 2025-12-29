import React from "react";
import { CalendarDays, List } from "lucide-react";
import { DateNavigation } from "./DateNavigation";
import { cycleTheme, getThemeIcon } from "../utils";

interface MobileFooterProps {
  lang: "en" | "he";
  textInLanguage: any;
  navigateMonth: (direction: number) => void;
  navigateYear: (direction: number) => void;
  handleGoToToday: () => void;
  setIsJumpModalOpen: (isOpen: boolean) => void;
  setIsEventsListOpen: (isOpen: boolean) => void;
  theme: "warm" | "dark" | "light" | "tcheles";
  setTheme: (theme: "warm" | "dark" | "light" | "tcheles") => void;
  calendarView: "jewish" | "secular";
  setCalendarView: (view: "jewish" | "secular") => void;
}

export const MobileFooter: React.FC<MobileFooterProps> = ({
  lang,
  textInLanguage,
  navigateMonth,
  navigateYear,
  handleGoToToday,
  setIsJumpModalOpen,
  setIsEventsListOpen,
  theme,
  setTheme,
  calendarView,
  setCalendarView,
}) => {
  return (
    <footer className="mobile-footer glass-panel border-t">
      <div className="flex items-center justify-between w-full p-2 px-4 h-full">
        {/* Actions Group - Left */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEventsListOpen(true)}
            className="p-2 btn-warm rounded-xl text-accent-amber"
            title={lang === "he" ? "אירועים" : "Events"}>
            <List size={22} />
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
            onClick={() => cycleTheme(theme, setTheme)}
            className="no-border no-background cursor-pointer"
            style={{
              paddingBottom: "7px",
            }}
            title={textInLanguage.colorTheme}>
            {getThemeIcon(theme)}
          </button>
        </div>
        <DateNavigation
          lang={lang}
          textInLanguage={textInLanguage}
          navigateMonth={navigateMonth}
          navigateYear={navigateYear}
          handleGoToToday={handleGoToToday}
          setIsJumpModalOpen={setIsJumpModalOpen}
        />
      </div>
    </footer>
  );
};
