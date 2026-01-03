import React from "react";
import { jDate, JewishMonthsHeb, JewishMonthsEng, Utils } from "jcal-zmanim";
import { Modal } from "./Modal";

interface JumpDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  textInLanguage: any;
  lang: "en" | "he";
  jumpGregDate: string;
  setJumpGregDate: (val: string) => void;
  jumpJDay: number;
  setJumpJDay: (val: number) => void;
  jumpJMonth: number;
  setJumpJMonth: (val: number) => void;
  jumpJYear: number;
  setJumpJYear: (val: number) => void;
  handleJumpToGregorian: () => void;
  handleJumpToJewish: () => void;
  mode?: "jump" | "change"; // "jump" for navigation, "change" for event date
}

export const JumpDateModal: React.FC<JumpDateModalProps> = ({
  isOpen,
  onClose,
  textInLanguage,
  lang,
  jumpGregDate,
  setJumpGregDate,
  jumpJDay,
  setJumpJDay,
  jumpJMonth,
  setJumpJMonth,
  jumpJYear,
  setJumpJYear,
  handleJumpToGregorian,
  handleJumpToJewish,
  mode = "jump",
}) => {
  const isChangeMode = mode === "change";

  const title = isChangeMode
    ? lang === "he"
      ? "שנה תאריך"
      : "Change Date"
    : textInLanguage.goToDate;

  const jewishButtonText = isChangeMode
    ? lang === "he"
      ? "שנה תאריך העברי"
      : "Change Hebrew Date"
    : textInLanguage.goToJewish;

  const gregorianButtonText = isChangeMode ? (lang === "he" ? "שנה" : "Change") : textInLanguage.go;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex items-center gap-3">
          <button
            onClick={handleJumpToJewish}
            className="px-6 py-3 btn-warm rounded-xl font-bold border transition-all flex-1">
            {jewishButtonText}
          </button>
        </div>
      }>
      <div className="flex flex-col gap-8">
        {/* Gregorian */}
        <div className="space-y-4">
          <h4 className="font-bold text-accent-amber uppercase tracking-wider text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-amber"></span>
            {textInLanguage.gregDate}
          </h4>
          <div className="flex gap-2 py-3">
            <input
              type="date"
              className="form-input"
              value={jumpGregDate}
              onChange={(e) => setJumpGregDate(e.target.value)}
            />
            <button
              onClick={handleJumpToGregorian}
              className="px-6 btn-warm border rounded-xl font-bold transition-all">
              {gregorianButtonText}
            </button>
          </div>
        </div>

        <div className="divider opacity-50"></div>

        {/* Jewish */}
        <div className="space-y-4">
          <h4 className="font-bold text-accent-gold uppercase tracking-wider text-sm py-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
            {textInLanguage.jewDate}
          </h4>
          <div className={`flex gap-2 flex-col ${lang === "he" ? "rtl" : "ltr"}`}>
            <div className="form-group flex flex-row items-center mb-3">
              <label className="text-text-secondary">{textInLanguage.day}</label>
              <select
                className="form-input appearance-none cursor-pointer text-center flex-1"
                value={jumpJDay}
                onChange={(e) => setJumpJDay(parseInt(e.target.value))}>
                {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d} className="bg-bg-primary">
                    {lang === "he" ? Utils.toJewishNumber(d) : d}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group flex flex-row items-center mb-3">
              <label className="text-text-secondary">{textInLanguage.month}</label>
              <select
                className="form-input appearance-none cursor-pointer text-center flex-1"
                value={jumpJMonth}
                onChange={(e) => setJumpJMonth(parseInt(e.target.value))}>
                {(lang === "he" ? JewishMonthsHeb : JewishMonthsEng)
                  .slice(1)
                  .map((m: string, i: number) => (
                    <option key={i} value={i + 1} className="bg-bg-primary">
                      {m}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group flex flex-row items-center mb-3">
              <label className="text-text-secondary">{textInLanguage.year}</label>
              <select
                className="form-input appearance-none cursor-pointer text-center flex-1"
                value={jumpJYear}
                onChange={(e) => setJumpJYear(parseInt(e.target.value))}>
                {(() => {
                  const currentYear = new jDate().Year;
                  return Array.from({ length: 200 }, (_, i) => currentYear - 100 + i).map((y) => (
                    <option key={y} value={y} className="bg-bg-primary">
                      {lang === "he" ? Utils.toJewishNumber(y % 1000) : y}
                    </option>
                  ));
                })()}
              </select>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
