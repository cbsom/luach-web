import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "./Header";
import { Themes } from "../types";

describe("Header", () => {
  const defaultProps = {
    lang: "en" as const,
    textInLanguage: {
      title: "Jewish Calendar",
      settings: "Settings",
      colorTheme: "Color Theme",
      secularMonth: "Secular Month",
      jewishMonth: "Jewish Month",
    },
    currentMonthName: "Tishrei",
    currentYearName: "5785",
    secondaryDateRange: "Sep - Oct",
    navigateMonth: vi.fn(),
    navigateYear: vi.fn(),
    handleGoToToday: vi.fn(),
    setIsJumpModalOpen: vi.fn(),
    setIsEventsListOpen: vi.fn(),
    onSettingsOpen: vi.fn(),
    theme: Themes.Light,
    setTheme: vi.fn(),
    calendarView: "jewish" as const,
    setCalendarView: vi.fn(),
  };

  it("renders the title correctly", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText("Jewish Calendar")).toBeInTheDocument();
    expect(screen.getByText("Tishrei 5785")).toBeInTheDocument();
  });

  it("handles theme cycling interaction", () => {
    render(<Header {...defaultProps} />);
    const themeButton = screen.getByTitle("Color Theme");
    fireEvent.click(themeButton);
    // The Header calls the utility function cycleTheme, which invokes setTheme.
    // We verify setTheme was called.
    expect(defaultProps.setTheme).toHaveBeenCalled();
  });

  it("handles calendar view toggling interaction", () => {
    render(<Header {...defaultProps} />);
    const toggleViewButton = screen.getByTitle("Secular Month"); // Title changes based on current view
    fireEvent.click(toggleViewButton);
    expect(defaultProps.setCalendarView).toHaveBeenCalledWith("secular");
  });

  it("opens settings when settings button is clicked", () => {
    render(<Header {...defaultProps} />);
    const settingsButton = screen.getByTitle("Settings");
    fireEvent.click(settingsButton);
    expect(defaultProps.onSettingsOpen).toHaveBeenCalled();
  });
});
