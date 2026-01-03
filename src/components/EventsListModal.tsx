import React, { useMemo, useState } from "react";
import { Download, Upload, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { jDate } from "jcal-zmanim";
import { UserEvent, UserEventTypes } from "../types";
import { getAnniversaryNumber } from "../utils";
import { downloadAllEventsAsICS } from "../calendarExport";
import { Modal } from "./Modal";

interface EventsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: UserEvent[];
  lang: "en" | "he";
  textInLanguage: any;
  handleEditEvent: (event: UserEvent, date: jDate) => void;
  deleteEvent: (id: string) => void;
  saveEvents: (events: UserEvent[]) => void;
  navigateToDate: (date: jDate) => void;
}

type SortField = "name" | "date" | "type";
type SortDirection = "asc" | "desc";

export const EventsListModal: React.FC<EventsListModalProps> = ({
  isOpen,
  onClose,
  events,
  lang,
  textInLanguage,
  handleEditEvent,
  deleteEvent,
  saveEvents,
  navigateToDate,
}) => {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  // Sort and Filter events
  const sortedEvents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filtered = events.filter(
      (e) =>
        e.name.toLowerCase().includes(query) || (e.notes && e.notes.toLowerCase().includes(query))
    );

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          // Sort by absolute date of the event's original occurrence
          const dateA = jDate.absJd(a.jYear, a.jMonth, a.jDay);
          const dateB = jDate.absJd(b.jYear, b.jMonth, b.jDay);
          comparison = dateA - dateB;
          break;
        case "type":
          comparison = a.type - b.type;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [events, sortField, sortDirection, searchQuery]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getEventTypeLabel = (type: UserEventTypes) => {
    const labels = {
      [UserEventTypes.HebrewDateRecurringYearly]: lang === "he" ? "שנתי עברי" : "Hebrew Yearly",
      [UserEventTypes.HebrewDateRecurringMonthly]: lang === "he" ? "חודשי עברי" : "Hebrew Monthly",
      [UserEventTypes.SecularDateRecurringYearly]: lang === "he" ? "שנתי לועזי" : "Secular Yearly",
      [UserEventTypes.SecularDateRecurringMonthly]:
        lang === "he" ? "חודשי לועזי" : "Secular Monthly",
      [UserEventTypes.OneTime]: lang === "he" ? "חד פעמי" : "One Time",
    };
    return labels[type] || "Unknown";
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `luach-events-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Notes",
      "Type",
      "jAbs",
      "Hebrew Date",
      "Gregorian Date",
      "Background Color",
      "Text Color",
      "Remind Day Of",
      "Remind Day Before",
    ];
    const rows = events.map((e) => {
      const jd = new jDate(e.jAbs || jDate.absJd(e.jYear, e.jMonth, e.jDay));
      return [
        `"${e.name.replace(/"/g, '""')}"`,
        `"${(e.notes || "").replace(/"/g, '""')}"`,
        getEventTypeLabel(e.type),
        e.jAbs || jDate.absJd(e.jYear, e.jMonth, e.jDay),
        `"${lang === "he" ? jd.toStringHeb() : jd.toString()}"`,
        `"${jd.getDate().toLocaleDateString()}"`,
        e.backColor,
        e.textColor,
        e.remindDayOf ? "Yes" : "No",
        e.remindDayBefore ? "Yes" : "No",
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const dataBlob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `luach-events-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importEvents = async (file: File) => {
    try {
      const fileName = file.name.toLowerCase();
      let importedEvents: UserEvent[] = [];

      if (fileName.endsWith(".json")) {
        // Import JSON
        const text = await file.text();
        const parsed = JSON.parse(text);
        const rawEvents = Array.isArray(parsed) ? parsed : [parsed];

        // Ensure jAbs is populated and date components are consistent
        importedEvents = rawEvents.map((e: any) => {
          let jAbs = e.jAbs;
          let jd: jDate;

          if (!jAbs && e.jYear && e.jMonth && e.jDay) {
            // Calculate jAbs from date components if missing
            jAbs = jDate.absJd(e.jYear, e.jMonth, e.jDay);
            jd = new jDate(e.jYear, e.jMonth, e.jDay);
          } else if (jAbs) {
            // Use jAbs as source of truth and derive date components
            jd = new jDate(jAbs);
          } else {
            // Fallback to placeholder
            jd = new jDate(5784, 1, 1);
            jAbs = jd.Abs;
          }

          return {
            ...e,
            jYear: jd.Year,
            jMonth: jd.Month,
            jDay: jd.Day,
            jAbs,
            sDate: e.sDate || jd.getDate().toISOString(),
          };
        });
      } else if (fileName.endsWith(".csv")) {
        // Import CSV
        const text = await file.text();
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

        // Find the index of jAbs column if it exists
        const jAbsIndex = headers.findIndex((h) => h.toLowerCase() === "jabs");

        for (let i = 1; i < lines.length; i++) {
          const values =
            lines[i].match(/(?:"([^"]*)"|([^,]+))/g)?.map((v) => v.replace(/^"|"$/g, "").trim()) ||
            [];
          if (values.length < headers.length) continue;

          // Parse CSV row into event
          const name = values[0] || "";
          const notes = values[1] || "";
          const typeStr = values[2] || "";

          // Try to get jAbs from CSV if available
          let jAbs: number | undefined;
          let jd: jDate;

          if (jAbsIndex >= 0 && values[jAbsIndex]) {
            // Use jAbs from CSV and derive date components from it
            jAbs = parseInt(values[jAbsIndex]);
            jd = new jDate(jAbs);
          } else {
            // Fallback: use placeholder date
            jd = new jDate(5784, 1, 1);
            jAbs = jd.Abs;
          }

          const backColor = values[jAbsIndex >= 0 ? 6 : 5] || "#fde047";
          const textColor = values[jAbsIndex >= 0 ? 7 : 6] || "#1e293b";

          // Parse type
          let type = UserEventTypes.HebrewDateRecurringYearly;
          if (typeStr.includes("Monthly")) type = UserEventTypes.HebrewDateRecurringMonthly;
          else if (typeStr.includes("Secular") && typeStr.includes("Yearly"))
            type = UserEventTypes.SecularDateRecurringYearly;
          else if (typeStr.includes("Secular") && typeStr.includes("Monthly"))
            type = UserEventTypes.SecularDateRecurringMonthly;
          else if (typeStr.includes("One Time")) type = UserEventTypes.OneTime;

          // Create event with date derived from jAbs
          if (name) {
            importedEvents.push({
              id: `imported-${Date.now()}-${i}`,
              name,
              notes,
              type,
              jYear: jd.Year,
              jMonth: jd.Month,
              jDay: jd.Day,
              jAbs,
              sDate: jd.getDate().toISOString(),
              backColor,
              textColor,
              remindDayOf: values[jAbsIndex >= 0 ? 8 : 7] === "Yes",
              remindDayBefore: values[jAbsIndex >= 0 ? 9 : 8] === "Yes",
            });
          }
        }
      } else if (fileName.endsWith(".xml")) {
        // Import XML
        const text = await file.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const occasions = xmlDoc.querySelectorAll("UserOccasion");

        occasions.forEach((occasion, idx) => {
          const name = occasion.querySelector("Name")?.textContent || "";
          const notes = occasion.querySelector("Notes")?.textContent || "";
          const absDate = parseInt(
            occasion.querySelector("JewishDate AbsoluteDate")?.textContent || "0"
          );
          const occasionType = occasion.querySelector("UserOccasionType")?.textContent || "";

          let backColor =
            occasion.querySelector("BackColor")?.getAttribute("ColorHtml") || "#fde047";
          let textColor = occasion.querySelector("Color")?.getAttribute("ColorHtml") || "#1e293b";

          // Convert color names to hex
          const colorMap: Record<string, string> = {
            Yellow: "#FFFF00",
            Blue: "#0000FF",
            Lime: "#00FF00",
            Black: "#000000",
            White: "#FFFFFF",
            Maroon: "#800000",
            Navy: "#000080",
            Green: "#008000",
            Red: "#FF0000",
            Purple: "#800080",
            Orange: "#FFA500",
          };
          backColor = colorMap[backColor] || backColor;
          textColor = colorMap[textColor] || textColor;

          // Map occasion type
          let type = UserEventTypes.HebrewDateRecurringYearly;
          if (occasionType === "HebrewDateRecurringMonthly")
            type = UserEventTypes.HebrewDateRecurringMonthly;
          else if (occasionType === "SecularDateRecurringYearly")
            type = UserEventTypes.SecularDateRecurringYearly;
          else if (occasionType === "SecularDateRecurringMonthly")
            type = UserEventTypes.SecularDateRecurringMonthly;
          else if (occasionType === "OneTime") type = UserEventTypes.OneTime;

          if (absDate && name) {
            const jd = new jDate(absDate);
            importedEvents.push({
              id: `imported-${Date.now()}-${idx}`,
              name,
              notes,
              type,
              jYear: jd.Year,
              jMonth: jd.Month,
              jDay: jd.Day,
              jAbs: absDate,
              sDate: jd.getDate().toISOString(),
              backColor,
              textColor,
              remindDayOf: occasion.querySelector("SendEmailReminders")?.textContent === "true",
              remindDayBefore: false,
            });
          }
        });
      } else {
        alert("Unsupported file format. Please use JSON, CSV, or XML.");
        return;
      }

      // Filter out duplicates
      const existingKeys = new Set(events.map((e) => `${e.name}-${e.jYear}-${e.jMonth}-${e.jDay}`));

      const newEvents = importedEvents.filter((e) => {
        const key = `${e.name}-${e.jYear}-${e.jMonth}-${e.jDay}`;
        return !existingKeys.has(key);
      });

      if (newEvents.length === 0) {
        alert(
          lang === "he" ? "כל האירועים כבר קיימים" : "All events already exist (duplicates ignored)"
        );
        return;
      }

      // Merge and save
      const mergedEvents = [...events, ...newEvents];
      saveEvents(mergedEvents);

      alert(
        lang === "he"
          ? `יובאו ${newEvents.length} אירועים חדשים (${
              importedEvents.length - newEvents.length
            } כפולים התעלמו)`
          : `Imported ${newEvents.length} new events (${
              importedEvents.length - newEvents.length
            } duplicates ignored)`
      );
    } catch (error) {
      console.error("Import error:", error);
      alert(lang === "he" ? `שגיאה בייבוא: ${error}` : `Import error: ${error}`);
    }
  };

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.csv,.xml";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await importEvents(file);
      }
    };
    input.click();
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="no-border no-outline no-background"
      style={{
        fontSize: "1em",
        padding: "0.5em",
        color: sortField === field ? "var(--accent-amber)" : "var(--text-secondary)",
      }}>
      {label}
      {sortField === field &&
        (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="800px"
      height="90vh"
      title={lang === "he" ? "רשימת אירועים" : "Events List"}
      subtitle={`${events.length} ${lang === "he" ? "אירועים" : "events"}`}
      subHeader={
        <div className="flex flex-col gap-4">
          {/* Export Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportToJSON}
              className="btn-warm border rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-bold hover:brightness-110 transition-all">
              <Download size={16} />
              {lang === "he" ? "ייצא JSON" : "Export JSON"}
            </button>
            <button
              onClick={exportToCSV}
              className="btn-warm border rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-bold hover:brightness-110 transition-all">
              <Download size={16} />
              {lang === "he" ? "ייצא CSV" : "Export CSV"}
            </button>
            <button
              onClick={handleImportClick}
              className="btn-warm border rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-bold hover:brightness-110 transition-all">
              <Upload size={16} />
              {lang === "he" ? "ייבא" : "Import"}
            </button>
            <button
              onClick={() => downloadAllEventsAsICS(events)}
              className="btn-warm border rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-bold hover:brightness-110 transition-all">
              <Download size={16} />
              {lang === "he" ? "ייצא ליומן" : "Export Calendar"}
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4 flex items-center gap-2">
            <span style={{ fontSize: "1.5em" }}>&#128270;</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "he" ? "סינון אירועים..." : "Filter your events..."}
              className={`w-full bg-white/5 border border-glass-border rounded-xl py-4 ${
                lang === "he" ? "pr-12 pl-6 text-right" : "pl-12 pr-6"
              } text-base focus:outline-none focus:border-accent-amber/50 transition-all`}
              style={{ paddingRight: "16px", fontSize: "1.3em" }}
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-3 pb-2 border-glass-border">
            <span className="text-text-secondary">{lang === "he" ? "מיין:" : "Sort:"}</span>
            <SortButton field="name" label={lang === "he" ? "שם" : "Name"} />
            <SortButton field="date" label={lang === "he" ? "תאריך" : "Date"} />
            <SortButton field="type" label={lang === "he" ? "סוג" : "Type"} />
          </div>
        </div>
      }>
      {/* List Content */}
      <div className="flex flex-col gap-2">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-sm">
            {lang === "he" ? "אין אירועים" : "No events"}
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-4">
            {sortedEvents.map((event) => {
              const eventDate = new jDate(event.jYear, event.jMonth, event.jDay);
              const today = new jDate();
              const anniv = getAnniversaryNumber(event, today);

              return (
                <div
                  key={event.id}
                  className="rounded-lg border border-glass-border hover:brightness-110 transition-all cursor-pointer group"
                  style={{
                    backgroundColor: event.backColor || "var(--accent-amber)",
                    padding: "12px 16px",
                  }}
                  onClick={() => {
                    navigateToDate(eventDate);
                    onClose();
                  }}>
                  <div className="flex items-center justify-between brightness-90">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <h3
                        className="font-bold truncate text-sm"
                        style={{ color: event.textColor || "#ffffff" }}>
                        {event.name}
                      </h3>
                      <span className="text-[10px] opacity-70" style={{ color: event.textColor }}>
                        {lang === "he" ? eventDate.toStringHeb() : eventDate.toString()}
                      </span>
                      {anniv > 0 && (
                        <div
                          style={{
                            color: event.backColor || "var(--accent-amber)",
                            backgroundColor: event.textColor || "#ffffff",
                            padding: "2px 4px",
                            borderRadius: "4px",
                            fontSize: "11px",
                          }}>
                          {anniv}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event, eventDate);
                        }}
                        className="p-1.5 hover:bg-black/10 rounded transition-all">
                        <Edit2 size={16} style={{ color: event.textColor }} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(lang === "he" ? "למחוק?" : "Delete?")) deleteEvent(event.id);
                        }}
                        className="p-1.5 hover:bg-red-500/20 rounded transition-all">
                        <Trash2 size={16} style={{ color: event.textColor }} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
