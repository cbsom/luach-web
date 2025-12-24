import React from "react";
import { ChevronLeft, ChevronRight, List, Calendar as CalendarIcon } from "lucide-react";

interface MobileFooterProps {
  lang: "en" | "he";
  t: any;
  navigateMonth: (direction: number) => void;
  navigateYear: (direction: number) => void;
  handleGoToToday: () => void;
  setIsJumpModalOpen: (isOpen: boolean) => void;
  setIsEventsListOpen: (isOpen: boolean) => void;
}

export const MobileFooter: React.FC<MobileFooterProps> = ({
  lang,
  t,
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
            onClick={() => setIsJumpModalOpen(true)}
            className="p-2 btn-warm-transparent rounded-xl text-accent-amber"
            title={t.goToDate}>
            <CalendarIcon size={22} />
          </button>
          <button
            onClick={() => setIsEventsListOpen(true)}
            className="p-2 btn-warm-transparent rounded-xl text-accent-amber"
            title={lang === "he" ? "אירועים" : "Events"}>
            <List size={22} />
          </button>
        </div>

        {/* Navigation Group - Center */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => navigateYear(-1)}
            className="p-1.5 btn-warm-transparent rounded-lg text-text-primary"
            title={t.previousYear}>
            <div className="flex -space-x-2">
              {lang === "he" ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              {lang === "he" ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </div>
          </button>

          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 btn-warm-transparent rounded-lg text-text-primary"
            title={t.previousMonth}>
            {lang === "he" ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <button
            onClick={handleGoToToday}
            className="px-3 py-2 text-xs font-bold btn-warm rounded-xl transition-all min-w-[60px]">
            {t.today}
          </button>

          <button
            onClick={() => navigateMonth(1)}
            className="p-2 btn-warm-transparent rounded-lg text-text-primary"
            title={t.nextMonth}>
            {lang === "he" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>

          <button
            onClick={() => navigateYear(1)}
            className="p-1.5 btn-warm-transparent rounded-lg text-text-primary"
            title={t.nextYear}>
            <div className="flex -space-x-2">
              {lang === "he" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              {lang === "he" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
};
