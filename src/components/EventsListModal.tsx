import React, { useMemo, useState } from "react";
import { X, Download, Upload, Calendar, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { jDate } from "jcal-zmanim";
import { UserEvent, UserEventTypes } from "../types";
import { getAnniversaryNumber } from "../utils";
import { downloadAllEventsAsICS } from "../calendarExport";

interface EventsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: UserEvent[];
  lang: "en" | "he";
  t: any;
  handleEditEvent: (event: UserEvent, date: jDate) => void;
  deleteEvent: (id: string) => void;
  saveEvents: (events: UserEvent[]) => void;
}

type SortField = "name" | "date" | "type";
type SortDirection = "asc" | "desc";

export const EventsListModal: React.FC<EventsListModalProps> = ({
  isOpen,
  onClose,
  events,
  lang,
  t,
  handleEditEvent,
  deleteEvent,
  saveEvents,
}) => {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Sort events
  const sortedEvents = useMemo(() => {
    const sorted = [...events].sort((a, b) => {
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
  }, [events, sortField, sortDirection]);

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
      "Hebrew Date",
      "Gregorian Date",
      "Background Color",
      "Text Color",
      "Remind Day Of",
      "Remind Day Before",
    ];
    const rows = events.map((e) => {
      const jd = new jDate(e.jYear, e.jMonth, e.jDay);
      return [
        `"${e.name.replace(/"/g, '""')}"`,
        `"${(e.notes || "").replace(/"/g, '""')}"`,
        getEventTypeLabel(e.type),
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
        importedEvents = Array.isArray(parsed) ? parsed : [parsed];
      } else if (fileName.endsWith(".csv")) {
        // Import CSV
        const text = await file.text();
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

        for (let i = 1; i < lines.length; i++) {
          const values =
            lines[i].match(/(?:"([^"]*)"|([^,]+))/g)?.map((v) => v.replace(/^"|"$/g, "").trim()) ||
            [];
          if (values.length < headers.length) continue;

          // Parse CSV row into event
          const name = values[0] || "";
          const notes = values[1] || "";
          const typeStr = values[2] || "";
          const hebrewDate = values[3] || "";
          const backColor = values[5] || "#fde047";
          const textColor = values[6] || "#1e293b";

          // Parse type
          let type = UserEventTypes.HebrewDateRecurringYearly;
          if (typeStr.includes("Monthly")) type = UserEventTypes.HebrewDateRecurringMonthly;
          else if (typeStr.includes("Secular") && typeStr.includes("Yearly"))
            type = UserEventTypes.SecularDateRecurringYearly;
          else if (typeStr.includes("Secular") && typeStr.includes("Monthly"))
            type = UserEventTypes.SecularDateRecurringMonthly;
          else if (typeStr.includes("One Time")) type = UserEventTypes.OneTime;

          // Create event with placeholder date (will be skipped if invalid)
          if (name) {
            importedEvents.push({
              id: `imported-${Date.now()}-${i}`,
              name,
              notes,
              type,
              jYear: 5784,
              jMonth: 1,
              jDay: 1,
              jAbs: jDate.absJd(5784, 1, 1),
              sDate: new Date().toISOString(),
              backColor,
              textColor,
              remindDayOf: values[7] === "Yes",
              remindDayBefore: values[8] === "Yes",
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

  if (!isOpen) return null;

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider transition-colors"
      style={{ color: sortField === field ? "var(--accent-amber)" : "var(--text-secondary)" }}>
      {label}
      {sortField === field &&
        (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
    </button>
  );

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-content glass-panel p-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "800px", width: "90%" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black flex items-center gap-2">
            <Calendar size={20} className="text-accent-amber" />
            {lang === "he" ? "רשימת אירועים" : "Events List"}
            <span className="text-xs font-normal text-text-secondary">({events.length})</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-all"
            title={t.close}>
            <X size={20} />
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2 mb-4">
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

        {/* Sort Controls */}
        <div className="flex gap-3 mb-2 pb-2 border-b border-glass-border text-xs">
          <span className="text-text-secondary">{lang === "he" ? "מיין:" : "Sort:"}</span>
          <SortButton field="name" label={lang === "he" ? "שם" : "Name"} />
          <SortButton field="date" label={lang === "he" ? "תאריך" : "Date"} />
          <SortButton field="type" label={lang === "he" ? "סוג" : "Type"} />
        </div>

        {/* Events List - Scrollable */}
        <div
          className="flex-1 overflow-y-auto pr-1 -mr-1"
          style={{ minHeight: 0, maxHeight: "calc(85vh - 180px)" }}>
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-sm">
              {lang === "he" ? "אין אירועים" : "No events"}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
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
                      padding: "1px 3px",
                      margin: "1px 0",
                    }}
                    onClick={() => handleEditEvent(event, eventDate)}>
                    <div className="flex items-center justify-between brightness-50 transition-all">
                      {/* Event Info */}
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <h3
                          className="font-bold truncate"
                          style={{ color: event.textColor || "#ffffff", fontSize: "11px" }}>
                          {event.name}
                        </h3>
                        {anniv > 0 && (
                          <span
                            className="font-bold text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{
                              backgroundColor: event.textColor || "#ffffff",
                              color: event.backColor || "var(--accent-amber)",
                              fontSize: "10px",
                              padding: "2px",
                            }}>
                            {anniv}
                          </span>
                        )}

                        <div
                          className="flex items-center gap-1.5 text-[8px] flex-shrink-0"
                          style={{
                            color: event.textColor || "#ffffff",
                            opacity: 0.85,
                            fontSize: "10px",
                          }}>
                          <span className="font-semibold">
                            {lang === "he" ? eventDate.toStringHeb() : eventDate.toString()}
                          </span>
                          <span className="opacity-60">•</span>
                          <span className="opacity-75">{getEventTypeLabel(event.type)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event, eventDate);
                          }}
                          className="p-1.5 rounded-md hover:bg-black/20 transition-all"
                          style={{ color: event.textColor || "#ffffff" }}
                          title={t.editEvent}>
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(lang === "he" ? "למחוק אירוע זה?" : "Delete this event?")) {
                              deleteEvent(event.id);
                            }
                          }}
                          className="p-1.5 rounded-md hover:bg-red-500/40 transition-all"
                          style={{ color: event.textColor || "#ffffff" }}
                          title={t.deleteEvent}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
