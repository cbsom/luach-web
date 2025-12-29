import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DailyInfoSidebar } from "./DailyInfoSidebar";
import { jDate } from "jcal-zmanim";

describe("DailyInfoSidebar", () => {
  // Create a specific date for testing (e.g.,Nissan 15 - Pesach)
  // Note: jDate constructor: new jDate(year, month, day) - Jewish Date
  // 5784 Nissan 15
  const pesachDate = new jDate(5784, 1, 15);

  // Mock user events
  const mockEvents = [
    {
      id: "1",
      name: "Test Event 1",
      jYear: 5784,
      jMonth: 1,
      jDay: 15,
      type: 1,
      color: "#000000",
      notes: "",
      jAbs: 0,
      sDate: new Date().toISOString(),
    },
  ];

  // Mock notes
  const mockNotes = {
    dayNotes: ["Pesach", "Yom Tov"],
    tefillahNotes: ["Yaaleh Viyavo"],
    shulNotes: [],
  };

  // Mock zmanim
  const mockZmanim = [
    { zmanType: { id: 1, eng: "Alos", heb: "עלות" }, time: { hour: 5, minute: 30 } },
    { zmanType: { id: 2, eng: "Sunrise", heb: "הנץ" }, time: { hour: 6, minute: 45 } },
  ];

  const defaultProps = {
    lang: "en" as const,
    textInLanguage: {
      addEvent: "Add Event",
      deleteEvent: "Delete Event",
      candleLighting: "Candle Lighting",
      zmanim: "Zmanim",
    },
    selectedJDate: pesachDate,
    selectedEvents: mockEvents,
    selectedNotes: mockNotes,
    selectedZmanim: mockZmanim,
    location: { Israel: false, Latitude: 40, Longitude: -74 }, // Generic location
    handleEditEvent: vi.fn(),
    deleteEvent: vi.fn(),
    handleAddNewEventForDate: vi.fn(),
    isMobileOpen: true,
    onMobileClose: vi.fn(),
    isDesktopHidden: false,
    onToggleDesktopMode: vi.fn(),
  };

  it("renders the selected date correctly", () => {
    render(<DailyInfoSidebar {...defaultProps} />);
    // jDate.toString for Nissan 15 5784 is roughly "15 Nissan 5784"
    expect(screen.getByText(/Nissan/i)).toBeInTheDocument();
    expect(screen.getByText(/5784/i)).toBeInTheDocument();
  });

  it("renders daily notes (holidays)", () => {
    render(<DailyInfoSidebar {...defaultProps} />);
    expect(screen.getByText("Pesach")).toBeInTheDocument();
    expect(screen.getByText("Yom Tov")).toBeInTheDocument();
  });

  it("renders tefillah notes", () => {
    render(<DailyInfoSidebar {...defaultProps} />);
    expect(screen.getByText("Yaaleh Viyavo")).toBeInTheDocument();
  });

  it("renders zmanim correctly", () => {
    render(<DailyInfoSidebar {...defaultProps} />);
    expect(screen.getByText("Alos")).toBeInTheDocument();
    expect(screen.getByText("05:30")).toBeInTheDocument();
    expect(screen.getByText("Sunrise")).toBeInTheDocument();
    expect(screen.getByText("06:45")).toBeInTheDocument();
  });

  it("renders user events", () => {
    render(<DailyInfoSidebar {...defaultProps} />);
    expect(screen.getByText("Test Event 1")).toBeInTheDocument();
  });

  it("calls handleAddNewEventForDate when add button is clicked", () => {
    render(<DailyInfoSidebar {...defaultProps} />);
    const addButton = screen.getByText("Add Event");
    fireEvent.click(addButton);
    expect(defaultProps.handleAddNewEventForDate).toHaveBeenCalled();
  });
});
