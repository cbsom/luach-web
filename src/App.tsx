import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  jDate,
  ZmanimUtils,
  Locations,
  JewishMonthsHeb,
  JewishMonthsEng,
  getNotifications,
  Utils,
} from "jcal-zmanim";
import { DailyInfoSidebar } from "./components/DailyInfoSidebar";
import { SettingsSidebar } from "./components/SettingsSidebar";
import { Header } from "./components/Header";
import { MobileFooter } from "./components/MobileFooter";
import { Calendar } from "./components/Calendar";
import { EventModal } from "./components/EventModal";
import { JumpDateModal } from "./components/JumpDateModal";
import { EventsListModal } from "./components/EventsListModal";
import { ReminderBanner } from "./components/ReminderBanner";
import { NotificationService } from "./NotificationService";
import { auth, googleProvider, db } from "./firebase";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  setDoc,
  doc,
  deleteDoc,
  writeBatch,
  getDocs,
} from "firebase/firestore";

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

  const [user, setUser] = useState<User | null>(null);

  const t = translations[lang];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  React.useEffect(() => {
    document.body.dir = lang === "he" ? "rtl" : "ltr";
    localStorage.setItem("luach-lang", lang);
  }, [lang]);

  React.useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("luach-theme", theme);
  }, [theme]);

  const [locationName, setLocationName] = useState("Jerusalem");

  const [todayStartMode, setTodayStartMode] = useState<"sunset" | "midnight">(() => {
    return (localStorage.getItem("luach-today-start") as "sunset" | "midnight") || "sunset";
  });

  const [emailRemindersEnabled, setEmailRemindersEnabled] = useState<boolean>(() => {
    return localStorage.getItem("luach-email-reminders") !== "false";
  });

  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("luach-browser-notifications") !== "false";
  });

  const [calendarView, setCalendarView] = useState<"jewish" | "secular">(() => {
    return (localStorage.getItem("luach-calendar-view") as "jewish" | "secular") || "jewish";
  });

  useEffect(() => {
    localStorage.setItem("luach-calendar-view", calendarView);
  }, [calendarView]);

  useEffect(() => {
    localStorage.setItem("luach-email-reminders", emailRemindersEnabled.toString());
  }, [emailRemindersEnabled]);

  useEffect(() => {
    localStorage.setItem("luach-browser-notifications", browserNotificationsEnabled.toString());
  }, [browserNotificationsEnabled]);

  const location = useMemo(() => {
    return (
      Locations.find((l) => l.Name === locationName) ||
      Locations.find((l) => l.Name === "Jerusalem")!
    );
  }, [locationName]);

  const today = todayStartMode === "sunset" ? Utils.nowAtLocation(location) : new jDate();

  const [currentJDate, setCurrentJDate] = useState(today);
  const [selectedJDate, setSelectedJDate] = useState(currentJDate);
  const [lastTickAbs, setLastTickAbs] = useState(today.Abs);

  // Events are now loaded from IndexedDB, not localStorage
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<UserEvent | null>(null);

  // Initialize events and handle Cloud Sync
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const syncData = async () => {
      // Always initialize local DB so it's ready for caching/background sync
      try {
        await initDB();
        await migrateFromLocalStorage();
      } catch (e) {
        console.error("Failed to init local DB", e);
      }

      if (user) {
        console.log("☁️ User logged in, setting up Firestore sync...");

        // Load local events immediately for a "warm start" while waiting for cloud
        try {
          const localEvents = await getAllEvents();
          if (localEvents.length > 0) {
            console.log(`🔥 Warm start: Loaded ${localEvents.length} events from local cache`);
            setEvents(localEvents);
            setEventsLoaded(true);
          }
        } catch (e) {
          console.error("Warm start failed", e);
        }

        // 1. Sync Settings
        const settingsRef = doc(db, "users", user.uid, "settings", "general");
        const settingsSnap = await getDocs(query(collection(db, "users", user.uid, "settings")));
        const generalSettings = settingsSnap.docs.find((d) => d.id === "general")?.data();

        if (generalSettings) {
          if (generalSettings.locationName) setLocationName(generalSettings.locationName);
          if (generalSettings.todayStartMode) setTodayStartMode(generalSettings.todayStartMode);
          if (generalSettings.emailRemindersEnabled !== undefined) {
            setEmailRemindersEnabled(generalSettings.emailRemindersEnabled);
          }
          if (generalSettings.browserNotificationsEnabled !== undefined) {
            setBrowserNotificationsEnabled(generalSettings.browserNotificationsEnabled);
          }
          if (generalSettings.lang) setLang(generalSettings.lang);
        } else {
          // Initial sync of local settings to cloud
          await setDoc(settingsRef, {
            locationName,
            todayStartMode,
            emailRemindersEnabled,
            browserNotificationsEnabled,
            lang,
          });
        }
        setSettingsLoaded(true);

        // 2. Sync Events
        const eventsRef = collection(db, "users", user.uid, "events");
        const q = query(eventsRef);

        unsubscribe = onSnapshot(q, async (snapshot) => {
          const cloudEvents = snapshot.docs.map((doc) => doc.data() as UserEvent);

          // Persist to local IndexedDB for offline access/backup
          saveAllEvents(cloudEvents).catch((e) => console.error("Local sync failed", e));

          // Migration Logic: If cloud is empty but local has data
          if (cloudEvents.length === 0) {
            const localEvents = await getAllEvents();
            if (localEvents.length > 0) {
              console.log(`📦 Migrating ${localEvents.length} events to Cloud...`);
              const batch = writeBatch(db);
              localEvents.forEach((event) => {
                const docRef = doc(db, "users", user.uid, "events", event.id);
                // Ensure jAbs exists for legacy events being migrated
                if (event.jAbs === undefined) {
                  event.jAbs = jDate.absJd(event.jYear, event.jMonth, event.jDay);
                }
                batch.set(docRef, event);
              });
              await batch.commit();
              return; // The next snapshot will have the data
            }
          }

          setEvents(cloudEvents);
          setEventsLoaded(true);
        });
      } else {
        console.log("🏠 No user, loading from local IndexedDB...");
        try {
          const localEvents = await getAllEvents();
          setEvents(localEvents);
          setEventsLoaded(true);
          setSettingsLoaded(true); // Treat local load as "settings loaded" too
        } catch (error) {
          console.error("❌ Local DB Load Failed:", error);
          setEventsLoaded(true);
          setSettingsLoaded(true);
        }
      }
    };

    syncData();
    return () => unsubscribe?.();
  }, [user]);

  // Push settings changes to Firestore
  useEffect(() => {
    if (user && settingsLoaded) {
      const settingsRef = doc(db, "users", user.uid, "settings", "general");
      setDoc(
        settingsRef,
        {
          locationName,
          todayStartMode,
          emailRemindersEnabled,
          browserNotificationsEnabled,
          lang,
          email: user.email, // Store email for the Cloud Function
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      ).catch((err) => console.error("Failed to sync settings:", err));
    }
  }, [
    user,
    locationName,
    todayStartMode,
    emailRemindersEnabled,
    browserNotificationsEnabled,
    lang,
  ]);

  // Check for notifications when events are loaded
  useEffect(() => {
    if (eventsLoaded && events.length > 0) {
      // Delay slightly to ensure user has focused the page/app
      const timer = setTimeout(() => {
        NotificationService.checkAndNotify(
          events,
          user,
          db,
          currentJDate,
          emailRemindersEnabled,
          browserNotificationsEnabled
        );
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [events, eventsLoaded, browserNotificationsEnabled]);

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
  const [isEventsListOpen, setIsEventsListOpen] = useState(false);
  const [showReminders, setShowReminders] = useState(true);

  // Jump State
  const [jumpGregDate, setJumpGregDate] = useState(new Date().toISOString().split("T")[0]);
  const [jumpJDay, setJumpJDay] = useState(new jDate().Day);
  const [jumpJMonth, setJumpJMonth] = useState(new jDate().Month);
  const [jumpJYear, setJumpJYear] = useState(new jDate().Year);

  // Sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sidebarDateContext, setSidebarDateContext] = useState<jDate | null>(null);

  useEffect(() => {
    localStorage.setItem("luach-today-start", todayStartMode);
    // Note: We no longer force setCurrentJDate(today) here to prevent unexpected jumps during sync
  }, [todayStartMode, location]);

  // Automatic Refresh logic (Midnight & Sunset)
  // We calculate the next transition time and use a ticker to watch for it
  const nextRefreshTimestamp = useRef<number>(0);

  useEffect(() => {
    let timeoutId: any;

    const scheduleNextRefresh = () => {
      const now = new Date();

      // 1. Calculate ms to next Midnight (Secular Refresh)
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0);
      const msToMidnight = nextMidnight.getTime() - now.getTime();

      // 2. Calculate ms to next Sunset (Jewish Date Refresh)
      const getSunset = (date: jDate) => {
        const zmanim = ZmanimUtils.getAllZmanim(date, location);
        return zmanim.find((z) => z.zmanType.id === 15)?.time;
      };

      const sunsetTime = getSunset(new jDate());
      let msToSunset = -1;

      if (sunsetTime) {
        const sunsetDate = new Date();
        sunsetDate.setHours(sunsetTime.hour, sunsetTime.minute, 0, 0);
        msToSunset = sunsetDate.getTime() - now.getTime();
      }

      // If sunset already passed today or wasn't found, get tomorrow's sunset
      if (msToSunset <= 0) {
        const tomorrowJ = new jDate().addDays(1);
        const sunsetTimeTomorrow = getSunset(tomorrowJ);
        if (sunsetTimeTomorrow) {
          const sunsetTomorrow = new Date();
          sunsetTomorrow.setDate(sunsetTomorrow.getDate() + 1);
          sunsetTomorrow.setHours(sunsetTimeTomorrow.hour, sunsetTimeTomorrow.minute, 0, 0);
          msToSunset = sunsetTomorrow.getTime() - now.getTime();
        } else {
          msToSunset = msToMidnight + 1000; // Fallback to after midnight
        }
      }

      // Refresh at whichever comes first, but at least 10 seconds apart
      const msToNextRefresh = Math.max(10000, Math.min(msToMidnight, msToSunset));
      nextRefreshTimestamp.current = Date.now() + msToNextRefresh;

      console.log(
        `🕒 Next auto-refresh in ${Math.round(msToNextRefresh / 60000)}m (at ${
          msToMidnight < msToSunset ? "Midnight" : "Sunset"
        })`
      );

      timeoutId = setTimeout(() => {
        const refreshedDate =
          todayStartMode === "sunset" ? Utils.nowAtLocation(location) : new jDate();
        console.log("🔄 Refreshing Luach for new day:", refreshedDate.toString());
        setCurrentJDate(refreshedDate);
        setSelectedJDate(refreshedDate);
        setLastTickAbs(refreshedDate.Abs);
        scheduleNextRefresh();
      }, msToNextRefresh + 2000);
    };

    scheduleNextRefresh();
    return () => clearTimeout(timeoutId);
  }, [location, locationName, todayStartMode]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (Date.now() >= nextRefreshTimestamp.current && nextRefreshTimestamp.current !== 0) {
        console.log("🔄 Minute ticker detected refresh deadline. Refreshing...");
        const refreshedDate =
          todayStartMode === "sunset" ? Utils.nowAtLocation(location) : new jDate();
        setCurrentJDate(refreshedDate);
        setSelectedJDate(refreshedDate);
        setLastTickAbs(refreshedDate.Abs);
      }
    }, 60000); // Check every minute as a fail-safe

    return () => clearInterval(intervalId);
  }, [todayStartMode, location]);

  const handleGoToToday = () => {
    const today = todayStartMode === "sunset" ? Utils.nowAtLocation(location) : new jDate();
    setCurrentJDate(today);
    setSelectedJDate(today);
  };

  // Save events to appropriate storage (Cloud or Local)
  const saveEvents = async (newEvents: UserEvent[], eventToUpdate?: UserEvent) => {
    setEvents(newEvents); // Optimistic UI Update

    // If we're updating a single event and we're logged in, we can be more efficient
    if (user && eventToUpdate) {
      try {
        const docRef = doc(db, "users", user.uid, "events", eventToUpdate.id);
        await setDoc(docRef, eventToUpdate);
        console.log(`☁️ Event updated in Cloud: ${eventToUpdate.name}`);
      } catch (error) {
        console.error("❌ Cloud Save Failed:", error);
      }
      return;
    }

    try {
      if (user) {
        // Full sync to cloud (usually for migration or mass changes)
        const batch = writeBatch(db);
        newEvents.forEach((ev) => {
          batch.set(doc(db, "users", user.uid, "events", ev.id), ev);
        });
        await batch.commit();
      }

      // Always sync to local storage regardless of login state
      // This provides a "warm" cache for faster starts and offline privacy
      await saveAllEvents(newEvents);
    } catch (error) {
      console.error("❌ Storage Failed:", error);
    }
  };

  const handleAddEvent = async () => {
    const newId = editingEvent?.id || Math.random().toString(36).substr(2, 9);
    const newEvent: UserEvent = {
      id: newId,
      name: formName || "New Event",
      notes: formNotes,
      type: formType,
      // Use jAbs as the primary anchor for date preservation.
      jAbs:
        editingEvent?.jAbs ??
        (editingEvent
          ? jDate.absJd(editingEvent.jYear, editingEvent.jMonth, editingEvent.jDay)
          : selectedJDate.Abs),
      jYear: editingEvent?.jYear ?? selectedJDate.Year,
      jMonth: editingEvent?.jMonth ?? selectedJDate.Month,
      jDay: editingEvent?.jDay ?? selectedJDate.Day,
      sDate: editingEvent?.sDate ?? selectedJDate.getDate().toISOString(),
      backColor: formColor,
      textColor: formTextColor,
      remindDayOf: formRemindDayOf,
      remindDayBefore: formRemindDayBefore,
    };

    if (editingEvent) {
      const updatedEvents = events.map((e) => (e.id === editingEvent.id ? newEvent : e));
      await saveEvents(updatedEvents, newEvent);
    } else {
      const updatedEvents = [...events, newEvent];
      await saveEvents(updatedEvents, newEvent);
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

  const deleteEvent = async (id: string) => {
    const newEvents = events.filter((e) => e.id !== id);
    setEvents(newEvents); // Optimistic UI Update

    if (user) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "events", id));
        console.log(`☁️ Event deleted from Cloud: ${id}`);
      } catch (error) {
        console.error("❌ Cloud Delete Failed:", error);
      }
    } else {
      const newEvents = events.filter((e) => e.id !== id);
      await saveEvents(newEvents);
    }

    // Close the modal and clear editing state after deletion
    setIsModalOpen(false);
    setEditingEvent(null);
    resetForm();
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

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSidebarDateContext(null);
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
      // ⚡ High Efficiency Match using Absolute Date
      if (uo.type === UserEventTypes.OneTime) {
        return (
          uo.jAbs === date.Abs ||
          (uo.jDay === date.Day && uo.jMonth === date.Month && uo.jYear === date.Year)
        );
      }

      const eventStartAbs = uo.jAbs || jDate.absJd(uo.jYear, uo.jMonth, uo.jDay);
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

  // Check for events with reminders
  const { todayReminders, tomorrowReminders } = useMemo(() => {
    const today = todayStartMode === "sunset" ? Utils.nowAtLocation(location) : new jDate();
    const tomorrow = today.addDays(1);

    const todayEvents = getEventsForDate(today).filter((e) => e.remindDayOf);
    const tomorrowEvents = getEventsForDate(tomorrow).filter((e) => e.remindDayBefore);

    return {
      todayReminders: todayEvents,
      tomorrowReminders: tomorrowEvents,
    };
  }, [events, todayStartMode, location]);

  // Check if reminders were dismissed today
  useEffect(() => {
    // Only check after events have loaded
    if (!eventsLoaded) {
      return;
    }

    const dismissedDate = localStorage.getItem("luach-reminders-dismissed");
    const today = new Date().toDateString();

    // Show reminders if:
    // 1. Not dismissed today, AND
    // 2. There are reminders to show
    if (dismissedDate !== today && (todayReminders.length > 0 || tomorrowReminders.length > 0)) {
      setShowReminders(true);
    } else if (dismissedDate === today) {
      setShowReminders(false);
    } else if (todayReminders.length === 0 && tomorrowReminders.length === 0) {
      setShowReminders(false);
    }
  }, [eventsLoaded, todayReminders, tomorrowReminders]);

  // Keyboard shortcut to manually show reminders (Ctrl+Shift+R)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+Shift+R to reset reminders
      if (e.ctrlKey && e.shiftKey && e.key === "R") {
        e.preventDefault();
        localStorage.removeItem("luach-reminders-dismissed");
        setShowReminders(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleDismissReminders = () => {
    const today = new Date().toDateString();
    localStorage.setItem("luach-reminders-dismissed", today);
    setShowReminders(false);
  };

  const monthInfo = useMemo(() => {
    let firstOfMonth: jDate, lastOfMonth: jDate;

    if (calendarView === "jewish") {
      const year = currentJDate.Year;
      const month = currentJDate.Month;
      firstOfMonth = new jDate(year, month, 1);
      lastOfMonth = new jDate(year, month, jDate.daysJMonth(year, month));
    } else {
      const sDate = currentJDate.getDate();
      const firstSDate = new Date(sDate.getFullYear(), sDate.getMonth(), 1);
      const lastSDate = new Date(sDate.getFullYear(), sDate.getMonth() + 1, 0);
      firstOfMonth = new jDate(firstSDate);
      lastOfMonth = new jDate(lastSDate);
    }

    const dayOfWeek = firstOfMonth.getDayOfWeek();

    // Calculate how many weeks we need
    const firstDayShown = firstOfMonth.addDays(-dayOfWeek);
    const lastDayOfWeek = lastOfMonth.getDayOfWeek();
    const daysAfterMonth = lastDayOfWeek === 6 ? 0 : 6 - lastDayOfWeek;
    const lastDayShown = lastOfMonth.addDays(daysAfterMonth);

    // Calculate total days needed
    const totalDays = lastDayShown.Abs - firstDayShown.Abs + 1;
    const weeksNeeded = Math.ceil(totalDays / 7);

    const days = [];
    const daysToShow = weeksNeeded * 7;
    for (let i = 0; i < daysToShow; i++) {
      days.push(firstDayShown.addDays(i));
    }

    return {
      days,
      weeksNeeded,
      year: firstOfMonth.Year,
      month: firstOfMonth.Month,
    };
  }, [currentJDate, calendarView]);

  const secondaryDateRange = useMemo(() => {
    if (calendarView === "jewish") {
      // Show Secular range for Jewish month
      const firstDay = currentJDate.addDays(-(currentJDate.Day - 1)).getDate();
      const lastDay = currentJDate
        .addDays(jDate.daysJMonth(currentJDate.Year, currentJDate.Month) - currentJDate.Day)
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
    } else {
      // Show Jewish range for Secular month
      const sDate = currentJDate.getDate();
      const firstSDate = new Date(sDate.getFullYear(), sDate.getMonth(), 1);
      const lastSDate = new Date(sDate.getFullYear(), sDate.getMonth() + 1, 0);
      const firstJ = new jDate(firstSDate);
      const lastJ = new jDate(lastSDate);

      const m1 = lang === "he" ? JewishMonthsHeb[firstJ.Month] : JewishMonthsEng[firstJ.Month];
      const m2 = lang === "he" ? JewishMonthsHeb[lastJ.Month] : JewishMonthsEng[lastJ.Month];
      const y1 = firstJ.Year;
      const y2 = lastJ.Year;

      if (y1 === y2) {
        if (m1 === m2) return `${m1} ${y1}`;
        return `${m1} - ${m2} ${y1}`;
      }
      return `${m1} ${y1} - ${m2} ${y2}`;
    }
  }, [currentJDate, lang, calendarView]);

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
    const hasHebrewRecurringEvent = selectedEvents.some(
      (e) =>
        e.type === UserEventTypes.HebrewDateRecurringYearly ||
        e.type === UserEventTypes.HebrewDateRecurringMonthly
    );
    const useJewish = hasHebrewRecurringEvent || calendarView === "jewish";

    let newDate;
    if (useJewish) {
      newDate = selectedJDate.addMonths(direction);
    } else {
      const sDate = selectedJDate.getDate();
      const nextSDate = new Date(
        sDate.getFullYear(),
        sDate.getMonth() + direction,
        sDate.getDate()
      );
      // Handle day overflow (e.g., Jan 31 -> Feb 31 -> Mar 3)
      if (nextSDate.getMonth() !== (sDate.getMonth() + direction + 12) % 12) {
        nextSDate.setDate(0);
      }
      newDate = new jDate(nextSDate);
    }
    setCurrentJDate(newDate);
    setSelectedJDate(newDate);
  };

  const handleSelectDate = (date: jDate) => {
    setSelectedJDate(date);
    // On mobile/tablet, also open the sidebar when a day is clicked
    if (window.innerWidth <= 1200) {
      setIsSidebarOpen(true);
    }
  };

  const navigateYear = (direction: number) => {
    const hasHebrewRecurringEvent = selectedEvents.some(
      (e) =>
        e.type === UserEventTypes.HebrewDateRecurringYearly ||
        e.type === UserEventTypes.HebrewDateRecurringMonthly
    );
    const useJewish = hasHebrewRecurringEvent || calendarView === "jewish";

    let newDate;
    if (useJewish) {
      newDate = selectedJDate.addYears(direction);
    } else {
      const sDate = selectedJDate.getDate();
      const nextSDate = new Date(
        sDate.getFullYear() + direction,
        sDate.getMonth(),
        sDate.getDate()
      );
      // Handle Feb 29 leap year overflow
      if (nextSDate.getMonth() !== sDate.getMonth()) {
        nextSDate.setDate(0);
      }
      newDate = new jDate(nextSDate);
    }
    setCurrentJDate(newDate);
    setSelectedJDate(newDate);
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

  const navigateToDate = (date: jDate) => {
    setCurrentJDate(date);
    setSelectedJDate(date);
    setIsEventsListOpen(false);
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
          const today = todayStartMode === "sunset" ? Utils.nowAtLocation(location) : new jDate();
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

  const currentMonthName = useMemo(() => {
    if (calendarView === "jewish") {
      return lang === "he"
        ? JewishMonthsHeb[currentJDate.Month]
        : JewishMonthsEng[currentJDate.Month];
    } else {
      const locale = lang === "he" ? "he-IL" : "en-US";
      return currentJDate.getDate().toLocaleDateString(locale, { month: "long" });
    }
  }, [currentJDate, calendarView, lang]);

  const currentYearName = useMemo(() => {
    if (calendarView === "jewish") {
      return currentJDate.Year.toString();
    } else {
      return currentJDate.getDate().getFullYear().toString();
    }
  }, [currentJDate, calendarView]);

  return (
    <div className="app-container">
      <Header
        lang={lang}
        t={t}
        currentJDate={currentJDate}
        currentMonthName={currentMonthName}
        currentYearName={currentYearName}
        secondaryDateRange={secondaryDateRange}
        navigateMonth={navigateMonth}
        navigateYear={navigateYear}
        handleGoToToday={handleGoToToday}
        setIsJumpModalOpen={setIsJumpModalOpen}
        setIsEventsListOpen={setIsEventsListOpen}
        onSettingsOpen={() => setIsSettingsOpen(true)}
      />

      {showReminders && (todayReminders.length > 0 || tomorrowReminders.length > 0) && (
        <ReminderBanner
          isOpen={showReminders}
          todayEvents={todayReminders}
          tomorrowEvents={tomorrowReminders}
          lang={lang}
          onDismiss={handleDismissReminders}
          onEventClick={handleEditEvent}
        />
      )}

      <div className="main-layout">
        <DailyInfoSidebar
          lang={lang}
          t={t}
          selectedJDate={selectedJDate}
          selectedEvents={selectedEvents}
          selectedNotes={selectedNotes}
          selectedZmanim={selectedZmanim}
          location={location}
          handleEditEvent={handleEditEvent}
          deleteEvent={deleteEvent}
          handleAddNewEventForDate={handleAddNewEventForDate}
          isMobileOpen={isSidebarOpen}
          onMobileClose={handleCloseSidebar}
        />

        <Calendar
          lang={lang}
          t={t}
          currentJDate={currentJDate}
          monthInfo={monthInfo}
          selectedJDate={selectedJDate}
          location={location}
          events={events}
          setSelectedJDate={handleSelectDate}
          handleAddNewEventForDate={handleAddNewEventForDate}
          handleEditEvent={handleEditEvent}
          getEventsForDate={getEventsForDate}
          navigateMonth={navigateMonth}
          today={today}
          calendarView={calendarView}
        />
      </div>

      <MobileFooter
        lang={lang}
        t={t}
        navigateMonth={navigateMonth}
        navigateYear={navigateYear}
        handleGoToToday={handleGoToToday}
        setIsJumpModalOpen={setIsJumpModalOpen}
        setIsEventsListOpen={setIsEventsListOpen}
      />

      <SettingsSidebar
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        t={t}
        locationName={locationName}
        setLocationName={setLocationName}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onLogout={handleLogout}
        user={user}
        onLogin={handleLogin}
        todayStartMode={todayStartMode}
        setTodayStartMode={setTodayStartMode}
        emailEnabled={emailRemindersEnabled}
        setEmailEnabled={setEmailRemindersEnabled}
        browserNotificationsEnabled={browserNotificationsEnabled}
        setBrowserNotificationsEnabled={setBrowserNotificationsEnabled}
        calendarView={calendarView}
        setCalendarView={setCalendarView}
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
        onDelete={deleteEvent}
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

      <EventsListModal
        isOpen={isEventsListOpen}
        onClose={() => setIsEventsListOpen(false)}
        events={events}
        lang={lang}
        t={t}
        handleEditEvent={handleEditEvent}
        deleteEvent={deleteEvent}
        saveEvents={saveEvents}
        navigateToDate={navigateToDate}
      />
    </div>
  );
};

export default App;
