import React from "react";
import { ChevronLeft, ChevronRight, List, Calendar as CalendarIcon } from "lucide-react";
import { DateNavigation } from "./DateNavigation";

interface MobileFooterProps {
  lang: "en" | "he";
  textInLanguage: any;
  navigateMonth: (direction: number) => void;
  navigateYear: (direction: number) => void;
  handleGoToToday: () => void;
  setIsJumpModalOpen: (isOpen: boolean) => void;
  setIsEventsListOpen: (isOpen: boolean) => void;
}

export const MobileFooter: React.FC<MobileFooterProps> = ({
  lang,
  textInLanguage,
  navigateMonth,
  navigateYear,
  handleGoToToday,
  setIsJumpModalOpen,
  setIsEventsListOpen,
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
