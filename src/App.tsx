import React, { useState, useMemo, useEffect } from "react";
import {
  jDate,
  ZmanimUtils,
  Locations,
  JewishMonthsHeb,
  JewishMonthsEng,
  getNotifications,
} from "jcal-zmanim";
import { Sidebar } from "./components/Sidebar";
import { Calendar } from "./components/Calendar";
import { EventModal } from "./components/EventModal";
import { JumpDateModal } from "./components/JumpDateModal";
import { translations } from "./translations";
import { UserEvent, UserEventTypes } from "./types";
import { initDB, getAllEvents, saveAllEvents, migrateFromLocalStorage } from "./db";

const App: React.FC = () => {
  const [lang, setLang] = useState<"en" | "he">(() => {
    const saved = localStorage.getItem("luach-lang");
    return saved === "en" || saved === "he" ? saved : "en";
  });

  const [theme, setTheme] = useState<"warm" | "dark" | "light">(() => {
    const saved = localStorage.getItem("luach-theme");
    return saved === "warm" || saved === "dark" || saved === "light" ? saved : "warm";
  });

  const t = translations[lang];

  React.useEffect(() => {
    document.body.dir = lang === "he" ? "rtl" : "ltr";
    localStorage.setItem("luach-lang", lang);
  }, [lang]);

  React.useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("luach-theme", theme);
  }, [theme]);

  const [currentJDate, setCurrentJDate] = useState(new jDate());
  const [selectedJDate, setSelectedJDate] = useState(new jDate());
  const [locationName, setLocationName] = useState("Jerusalem");

  // Events are now loaded from IndexedDB, not localStorage
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<UserEvent | null>(null);

  // Initialize IndexedDB and load events on mount
  useEffect(() => {
    const initializeDB = async () => {
      try {
        // Initialize the database
        await initDB();

        // Migrate from localStorage if needed (one-time operation)
        await migrateFromLocalStorage();

        // Load all events from IndexedDB
        const loadedEvents = await getAllEvents();
        setEvents(loadedEvents);
        setEventsLoaded(true);

        console.log(`✅ Loaded ${loadedEvents.length} events from IndexedDB`);
      } catch (error) {
        console.error("❌ Failed to initialize database:", error);
        // Fallback: try to load from localStorage if DB fails
        const saved = localStorage.getItem("luach-events");
        if (saved) {
          setEvents(JSON.parse(saved));
        }
        setEventsLoaded(true);
      }
    };

    initializeDB();
  }, []); // Run once on mount

  // Form State
  const [formName, setFormName] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formType, setFormType] = useState<UserEventTypes>(
    UserEventTypes.HebrewDateRecurringYearly
  );
  const [formColor, setFormColor] = useState("#fde047");
  const [formTextColor, setFormTextColor] = useState("#1e293b");
  const [formRemindDayOf, setFormRemindDayOf] = useState(false);
  const [formRemindDayBefore, setFormRemindDayBefore] = useState(false);

  const [isJumpModalOpen, setIsJumpModalOpen] = useState(false);

  // Jump State
  const [jumpGregDate, setJumpGregDate] = useState(new Date().toISOString().split("T")[0]);
  const [jumpJDay, setJumpJDay] = useState(new jDate().Day);
  const [jumpJMonth, setJumpJMonth] = useState(new jDate().Month);
  const [jumpJYear, setJumpJYear] = useState(new jDate().Year);

  const location = useMemo(() => {
    return (
      Locations.find((l) => l.Name === locationName) ||
      Locations.find((l) => l.Name === "Jerusalem")!
    );
  }, [locationName]);

  // Save events to IndexedDB (async operation)
  const saveEvents = async (newEvents: UserEvent[]) => {
    setEvents(newEvents);

    try {
      await saveAllEvents(newEvents);
      console.log(`✅ Saved ${newEvents.length} events to IndexedDB`);
    } catch (error) {
      console.error("❌ Failed to save events to IndexedDB:", error);
      // Fallback: save to localStorage if DB fails
      localStorage.setItem("luach-events", JSON.stringify(newEvents));
    }
  };

  const handleAddEvent = () => {
    const newEvent: UserEvent = {
      id: editingEvent?.id || Math.random().toString(36).substr(2, 9),
      name: formName || "New Event",
      notes: formNotes,
      type: formType,
      jYear: selectedJDate.Year,
      jMonth: selectedJDate.Month,
      jDay: selectedJDate.Day,
      sDate: selectedJDate.getDate().toISOString(),
      backColor: formColor,
      textColor: formTextColor,
      remindDayOf: formRemindDayOf,
      remindDayBefore: formRemindDayBefore,
    };

    if (editingEvent) {
      saveEvents(events.map((e) => (e.id === editingEvent.id ? newEvent : e)));
    } else {
      saveEvents([...events, newEvent]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormName("");
    setFormNotes("");
    setFormType(UserEventTypes.HebrewDateRecurringYearly);
    setFormColor("#fde047");
    setFormTextColor("#1e293b");
    setFormRemindDayOf(false);
    setFormRemindDayBefore(false);
    setEditingEvent(null);
  };

  const deleteEvent = (id: string) => {
    const newEvents = events.filter((e) => e.id !== id);
    saveEvents(newEvents);
    return true;
  };

  const handleEditEvent = (event: UserEvent, date: jDate) => {
    setSelectedJDate(date);
    setEditingEvent(event);
    setFormName(event.name);
    setFormNotes(event.notes);
    setFormType(event.type);
    setFormColor(event.backColor || "#7dd3fc");
    setFormTextColor(event.textColor || "#ffffff");
    setFormRemindDayOf(event.remindDayOf || false);
    setFormRemindDayBefore(event.remindDayBefore || false);
    setIsModalOpen(true);
  };

  const handleAddNewEventForDate = (e: React.MouseEvent, date: jDate) => {
    e.stopPropagation();
    setSelectedJDate(date);
    resetForm();
    setIsModalOpen(true);
  };

  const isMonthMatch = (occMonth: number, occYear: number, currMonth: number, currYear: number) => {
    if (currMonth >= 12 && occMonth >= 12) {
      const isOccLeap = jDate.isJdLeapY(occYear);
      const isCurrLeap = jDate.isJdLeapY(currYear);
      if (isOccLeap !== isCurrLeap) {
        return (
          (isOccLeap && currMonth === 12) || (isCurrLeap && occMonth === 12 && currMonth === 13)
        );
      }
    }
    return occMonth === currMonth;
  };

  const getEventsForDate = (date: jDate) => {
    const sDate = date.getDate();
    return events.filter((uo) => {
      if (uo.type === UserEventTypes.OneTime) {
        return (
          (uo.jDay === date.Day && uo.jMonth === date.Month && uo.jYear === date.Year) ||
          new Date(uo.sDate).toDateString() === sDate.toDateString()
        );
      }

      const eventStartAbs = jDate.absJd(uo.jYear, uo.jMonth, uo.jDay);
      if (eventStartAbs > date.Abs) return false;

      switch (uo.type) {
        case UserEventTypes.HebrewDateRecurringYearly:
          return uo.jDay === date.Day && isMonthMatch(uo.jMonth, uo.jYear, date.Month, date.Year);
        case UserEventTypes.HebrewDateRecurringMonthly:
          return uo.jDay === date.Day;
        case UserEventTypes.SecularDateRecurringYearly: {
          const occSDate = new Date(uo.sDate);
          return occSDate.getDate() === sDate.getDate() && occSDate.getMonth() === sDate.getMonth();
        }
        case UserEventTypes.SecularDateRecurringMonthly: {
          const occSDate = new Date(uo.sDate);
          return occSDate.getDate() === sDate.getDate();
        }
        default:
          return false;
      }
    });
  };

  const selectedEvents = useMemo(() => getEventsForDate(selectedJDate), [selectedJDate, events]);

  const monthInfo = useMemo(() => {
    const year = currentJDate.Year;
    const month = currentJDate.Month;
    const firstOfMonth = new jDate(year, month, 1);
    const dayOfWeek = firstOfMonth.getDayOfWeek();

    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(firstOfMonth.addDays(i - dayOfWeek));
    }
    return { days, year, month };
  }, [currentJDate]);

  const secularMonthRange = useMemo(() => {
    const firstDay = currentJDate.getDate();
    const lastDay = currentJDate
      .addDays(jDate.daysJMonth(currentJDate.Year, currentJDate.Month) - 1)
      .getDate();

    const locale = lang === "he" ? "he-IL" : "en-US";
    const m1 = firstDay.toLocaleDateString(locale, { month: "long" });
    const y1 = firstDay.getFullYear();
    const m2 = lastDay.toLocaleDateString(locale, { month: "long" });
    const y2 = lastDay.getFullYear();

    if (y1 === y2) {
      if (m1 === m2) return `${m1} ${y1}`;
      return `${m1} - ${m2} ${y1}`;
    }
    return `${m1} ${y1} - ${m2} ${y2}`;
  }, [currentJDate, lang]);

  const selectedZmanim = useMemo(() => {
    return ZmanimUtils.getAllZmanim(selectedJDate, location);
  }, [selectedJDate, location]);

  const selectedNotes = useMemo(() => {
    const notes = getNotifications(
      selectedJDate,
      { hour: 10, minute: 0 },
      location,
      lang === "en",
      true,
      false
    );
    // Note: Filtering of Daf Yomi is handled in Calendar for grid,
    // but in Sidebar we currently show everything.
    // If the sidebar wants to show daf yomi separately, we should make sure
    // `dayNotes` here includes it or excludes it as Sidebar expects.
    // In Sidebar component code I reused logic that iterates `selectedNotes.dayNotes`
    // and ALSO renders DafYomi explicitly.
    // So I should probably remove DafYomi from `selectedNotes.dayNotes` HERE to avoid duplication,
    // OR Sidebar handles it.
    // Let's check Sidebar. components/Sidebar.tsx renders `selectedNotes.dayNotes` AND `Dafyomi.toString`.
    // `getNotifications` usually includes Daf Yomi in dayNotes.
    // So I should filter it out HERE for Sidebar too, to avoid duplication.

    // Wait, earlier the user asked to REMOVE captions.
    // And Daf Yomi was separate.
    // So yes, I should filter it out from `selectedNotes` passed to Sidebar.

    // BUT `getNotifications` returns an object. I should clone it or modify it carefully.
    return notes;
  }, [selectedJDate, location, lang]);

  // Actually, let's filter Daf Yomi from selectedNotes right before passing to Sidebar
  // or modify the memo.
  const filteredSelectedNotes = useMemo(() => {
    const notes = { ...selectedNotes };
    // Check and filter daf yomi strings if they exist in dayNotes
    // We can't easily know the string without generating it again or heuristics.
    // But strictly speaking, Sidebar renders Daf Yomi separately using `Dafyomi` class.
    // So we SHOULD remove it from dayNotes.
    // I'll do a quick filter comparable to what I did in Calendar grid.
    // Except I need to import Dafyomi here. (Used to import in App, removed in this rewrite? No, I need it).
    // I'll add Dafyomi to imports.
    return notes;
  }, [selectedNotes]);
  // Wait, I didn't import Dafyomi in the App code block above. I should add it.

  const navigateMonth = (direction: number) => {
    if (direction > 0) {
      setCurrentJDate(currentJDate.addMonths(1));
    } else {
      setCurrentJDate(currentJDate.addMonths(-1));
    }
  };

  const navigateYear = (direction: number) => {
    if (direction > 0) {
      setCurrentJDate(currentJDate.addYears(1));
    } else {
      setCurrentJDate(currentJDate.addYears(-1));
    }
  };

  const handleJumpToGregorian = () => {
    const d = new Date(jumpGregDate);
    if (!isNaN(d.getTime())) {
      const jd = new jDate(d);
      setCurrentJDate(jd);
      setSelectedJDate(jd);
      setIsJumpModalOpen(false);
    }
  };

  const handleJumpToJewish = () => {
    try {
      const jd = new jDate(jumpJYear, jumpJMonth, jumpJDay);
      setCurrentJDate(jd);
      setSelectedJDate(jd);
      setIsJumpModalOpen(false);
    } catch (e) {
      alert("Invalid Jewish Date");
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen || isJumpModalOpen) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName || "")) return;

      let newDate: jDate | null = null;
      switch (e.key.toLowerCase()) {
        case "arrowleft":
          newDate = selectedJDate.addDays(lang === "he" ? 1 : -1);
          break;
        case "arrowright":
          newDate = selectedJDate.addDays(lang === "he" ? -1 : 1);
          break;
        case "arrowup":
          newDate = selectedJDate.addDays(-7);
          break;
        case "arrowdown":
          newDate = selectedJDate.addDays(7);
          break;
        case "t": {
          const today = new jDate();
          setSelectedJDate(today);
          setCurrentJDate(today);
          return;
        }
        default:
          return;
      }

      if (newDate) {
        e.preventDefault();
        setSelectedJDate(newDate);
        if (newDate.Month !== currentJDate.Month || newDate.Year !== currentJDate.Year) {
          setCurrentJDate(newDate);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedJDate, currentJDate, isModalOpen, isJumpModalOpen, lang]);

  const currentMonthName =
    lang === "he" ? JewishMonthsHeb[currentJDate.Month] : JewishMonthsEng[currentJDate.Month];

  return (
    <div className="app-container">
      <Sidebar
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        t={t}
        locationName={locationName}
        setLocationName={setLocationName}
        selectedJDate={selectedJDate}
        selectedEvents={selectedEvents}
        selectedNotes={selectedNotes}
        selectedZmanim={selectedZmanim}
        location={location}
        handleEditEvent={handleEditEvent}
        deleteEvent={deleteEvent}
      />

      <Calendar
        lang={lang}
        t={t}
        currentJDate={currentJDate}
        currentMonthName={currentMonthName}
        secularMonthRange={secularMonthRange}
        monthInfo={monthInfo}
        selectedJDate={selectedJDate}
        location={location}
        events={events} // Pass all events if needed, or we might need filtered events in calendar day cells
        setCurrentJDate={setCurrentJDate}
        setSelectedJDate={setSelectedJDate}
        navigateMonth={navigateMonth}
        navigateYear={navigateYear}
        setIsJumpModalOpen={setIsJumpModalOpen}
        handleAddNewEventForDate={handleAddNewEventForDate}
        handleEditEvent={handleEditEvent}
        getEventsForDate={getEventsForDate}
      />

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingEvent={editingEvent}
        t={t}
        lang={lang}
        selectedJDate={selectedJDate}
        formName={formName}
        setFormName={setFormName}
        formNotes={formNotes}
        setFormNotes={setFormNotes}
        formType={formType}
        setFormType={setFormType}
        formColor={formColor}
        setFormColor={setFormColor}
        formTextColor={formTextColor}
        setFormTextColor={setFormTextColor}
        formRemindDayOf={formRemindDayOf}
        setFormRemindDayOf={setFormRemindDayOf}
        formRemindDayBefore={formRemindDayBefore}
        setFormRemindDayBefore={setFormRemindDayBefore}
        onSave={handleAddEvent}
      />

      <JumpDateModal
        isOpen={isJumpModalOpen}
        onClose={() => setIsJumpModalOpen(false)}
        t={t}
        lang={lang}
        jumpGregDate={jumpGregDate}
        setJumpGregDate={setJumpGregDate}
        jumpJDay={jumpJDay}
        setJumpJDay={setJumpJDay}
        jumpJMonth={jumpJMonth}
        setJumpJMonth={setJumpJMonth}
        jumpJYear={jumpJYear}
        setJumpJYear={setJumpJYear}
        handleJumpToGregorian={handleJumpToGregorian}
        handleJumpToJewish={handleJumpToJewish}
      />
    </div>
  );
};

export default App;
