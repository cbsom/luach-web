import React from "react";
import { jDate, JewishMonthsHeb, JewishMonthsEng } from "jcal-zmanim";

interface JumpDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: any;
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
}

export const JumpDateModal: React.FC<JumpDateModalProps> = ({
  isOpen,
  onClose,
  t,
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
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-panel p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black">{t.goToDate}</h3>
          <button
            onClick={onClose}
            className="btn-warm-transparent transition-all"
            style={{ borderRadius: "100%", width: "2rem", height: "2rem" }}>
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {/* Gregorian */}
          <div className="space-y-4">
            <h4 className="font-bold text-accent-amber uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-amber"></span>
              {t.gregDate}
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
                {t.go}
              </button>
            </div>
          </div>

          <div className="divider opacity-50"></div>

          {/* Jewish */}
          <div className="space-y-4">
            <h4 className="font-bold text-accent-gold uppercase tracking-wider text-sm py-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
              {t.jewDate}
            </h4>
            <div className={`flex gap-2 flex-col ${lang === "he" ? "rtl" : "ltr"}`}>
              <div className="form-group flex flex-row items-center mb-3">
                <label className="text-text-secondary">{t.day}</label>
                <select
                  className="form-input appearance-none cursor-pointer text-center flex-1"
                  value={jumpJDay}
                  onChange={(e) => setJumpJDay(parseInt(e.target.value))}>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d} className="bg-bg-primary">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group flex flex-row items-center mb-3">
                <label className="text-text-secondary">{t.month}</label>
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
                <label className="text-text-secondary">{t.year}</label>
                <input
                  type="number"
                  className="form-input text-center flex-1"
                  value={jumpJYear}
                  onChange={(e) => setJumpJYear(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 py-3">
          <button
            onClick={handleJumpToJewish}
            className="px-6 py-3 btn-warm rounded-xl font-bold border transition-all flex-1">
            {t.goToJewish}
          </button>
        </div>
      </div>
    </div>
  );
};
