import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface DateNavigationProps {
  lang: "en" | "he";
  textInLanguage: any;
  navigateMonth: (direction: number) => void;
  navigateYear: (direction: number) => void;
  handleGoToToday: () => void;
  setIsJumpModalOpen: (isOpen: boolean) => void;
  showJump?: boolean;
  className?: string;
}

export const DateNavigation: React.FC<DateNavigationProps> = ({
  lang,
  textInLanguage,
  navigateMonth,
  navigateYear,
  handleGoToToday,
  setIsJumpModalOpen,
  className,
}) => {
  return (
    <div className={`flex items-center gap-6 ${className}`}>
      <div
        className={`flex btn-warm rounded-2xl p-1 border ${
          lang === "he" ? "flex-row-reverse" : ""
        }`}>
        <button
          onClick={() => setIsJumpModalOpen(true)}
          className="btn-warm"
          style={{
            margin: "0 1rem",
            border: "0",
            color: "var(--accent-amber)",
            backgroundColor: "transparent",
          }}
          title={textInLanguage.goToDate}>
          <CalendarIcon size={30} />
        </button>
        <button
          onClick={() => navigateYear(-1)}
          className={`p-2 btn-warm rounded-xl ${
            lang === "he" ? "border-l" : "border-r"
          } transition-all border-glass-border/50`}
          title={textInLanguage.previousYear}>
          <div className="flex -space-x-2">
            {lang === "he" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {lang === "he" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </div>
        </button>
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 btn-warm rounded-xl transition-all border-glass-border/50"
          title={textInLanguage.previousMonth}>
          {lang === "he" ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <button
          onClick={handleGoToToday}
          className="px-6 py-2 text-sm font-bold btn-warm rounded-xl transition-all min-w-[100px]">
          {textInLanguage.today}
        </button>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 btn-warm rounded-xl transition-all border-glass-border/50"
          title={textInLanguage.nextMonth}>
          {lang === "he" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
        <button
          onClick={() => navigateYear(1)}
          className={`p-2 btn-warm rounded-xl ${
            lang === "he" ? "border-r" : "border-l"
          } transition-all border-glass-border/50`}
          title={textInLanguage.nextYear}>
          <div className="flex -space-x-2">
            {lang === "he" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            {lang === "he" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </div>
        </button>
      </div>
    </div>
  );
};
