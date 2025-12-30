import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Calendar } from "./Calendar";
import { jDate, Utils } from "jcal-zmanim";
import { Themes } from "../types";

describe("Calendar", () => {
  // Basic setup for a month
  const year = 5784;
  const month = 1; // Nissan
  const today = new jDate();
  const currentJDate = new jDate(year, month, 1);

  // Create a dummy list of days for the month view
  // A simplified version, just a few days
  const days: any[] = [
    new jDate(year, month, 1),
    new jDate(year, month, 2),
    new jDate(year, month, 15), // Pesach
  ];

  const monthInfo = {
    days: days,
    year: year,
    month: month,
    weeksNeeded: 5,
  };

  const defaultProps = {
    lang: "en" as const,
    textInLanguage: {
      addEvent: "Add Event",
    },
    currentJDate: currentJDate,
    monthInfo: monthInfo,
    selectedJDate: currentJDate,
    location: { Israel: false, Latitude: 40, Longitude: -74, TimeZone: -5, Elevation: 0 },
    events: [],
    setSelectedJDate: vi.fn(),
    handleAddNewEventForDate: vi.fn(),
    handleEditEvent: vi.fn(),
    getEventsForDate: vi.fn().mockReturnValue([]),
    navigateMonth: vi.fn(),
    today: today,
    calendarView: "jewish" as const,
    theme: Themes.Warm,
  };

  it("renders the days correctly", () => {
    render(<Calendar {...defaultProps} />);
    // Nissan 1 is Rosh Chodesh
    // Nissan 15 is Pesach

    // We verify that the days are rendered by checking for the Jewish day numbers
    // standard jcal-zmanim Utils.toJewishNumber returns Hebrew letters.
    // But the component uses Utils.toJewishNumber(date.Day).
    // 1 = Aleph, 2 = Bet, 15 = Tes-Vav

    // Note: The component renders both Hebrew (via Utils) and secular numbers.
    // We can just check existence of some text.
    // Assuming Utils.toJewishNumber(1) returns 'א'
    expect(screen.getByText(Utils.toJewishNumber(1))).toBeInTheDocument();
    expect(screen.getByText(Utils.toJewishNumber(15))).toBeInTheDocument();
  });

  it("displays holiday indicators for yom tov", () => {
    // We rely on getNotifications being called within the component.
    // Since we are using real jDate objects and jcal-zmanim,
    // Nissan 15 should trigger "Pesach" or "Yom Tov" notes if getNotifications works.
    // However, getNotifications is imported from jcal-zmanim.
    // Let's see if we can spot "Pesach" in the DOM for Nissan 15.

    render(<Calendar {...defaultProps} />);
    // jcal-zmanim english output for Nissan 15 usually includes "Pesach"
    expect(screen.getAllByText(/Pesach/).length).toBeGreaterThan(0);
  });

  it("handles selection of a date", () => {
    render(<Calendar {...defaultProps} />);
    // Find the cell for the 2nd day (Nissan 2)
    // This is tricky without specific test ids, but we can try clicking a known element.
    // Let's find the element containing Utils.toJewishNumber(2).
    const dayTwo = screen.getByText(Utils.toJewishNumber(2));
    fireEvent.click(dayTwo);

    // The click handler is on the parent div usually.
    // We might need to find the parent .day-cell.
    // But bubbling might work if we click the text.
    // Wait, the logic invalidates click if swiped inside component.
    // Since we just click, it should work.

    expect(defaultProps.setSelectedJDate).toHaveBeenCalledWith(expect.objectContaining({ Day: 2 }));
  });

  it("handles adding new event", () => {
    render(<Calendar {...defaultProps} />);
    const addButtons = screen.getAllByTitle("Add Event");
    // Click the first one
    fireEvent.click(addButtons[0]);
    expect(defaultProps.handleAddNewEventForDate).toHaveBeenCalled();
  });
});
