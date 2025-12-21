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
          <button onClick={onClose} className="p-2 btn-warm-transparent rounded-xl transition-all">
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
            <div className="flex gap-2">
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
            <h4 className="font-bold text-accent-gold uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
              {t.jewDate}
            </h4>
            <div className={`grid grid-cols-3 gap-2 ${lang === "he" ? "rtl" : "ltr"}`}>
              <div className="form-group">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 block">
                  {t.day}
                </label>
                <select
                  className="form-input appearance-none cursor-pointer text-center"
                  value={jumpJDay}
                  onChange={(e) => setJumpJDay(parseInt(e.target.value))}>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d} className="bg-bg-primary">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 block">
                  {t.month}
                </label>
                <select
                  className="form-input appearance-none cursor-pointer text-center"
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
              <div className="form-group">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 block">
                  {t.year}
                </label>
                <input
                  type="number"
                  className="form-input text-center"
                  value={jumpJYear}
                  onChange={(e) => setJumpJYear(parseInt(e.target.value))}
                />
              </div>
            </div>
            <button
              onClick={handleJumpToJewish}
              className="w-full py-3 mt-2 bg-gradient-to-r from-accent-gold/20 to-accent-gold/10 hover:from-accent-gold/30 hover:to-accent-gold/20 border border-accent-gold/20 text-accent-gold rounded-xl font-bold transition-all shadow-lg hover:shadow-accent-gold/10">
              {t.goToJewish}
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold opacity-60 hover:opacity-100 transition-all">
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
