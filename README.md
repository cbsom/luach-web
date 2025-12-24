# <img src="public/icon.svg" width="48" height="48" valign="middle"> Luach – Jewish Calendar

A **beautiful**, modern Jewish calendar application that blends **rich visual design** with **powerful functionality**. Designed as a successor to legacy desktop calendar apps, Luach brings Zmanim, Hebrew dates, and cloud-synced events to your browser, desktop, and mobile devices.

## ✨ Core Features

- **PWA Experience** – Install it directly to your taskbar or home screen for a fast, native-like experience.
- **Zmanim & Calculations** – High-accuracy prayer times and Hebrew dates for any location worldwide.
- **Cloud Sync** – Optional Google Login to sync your events and settings across all your devices.
- **Email Reminders** – Receive automated email notifications for Yahrzeits, Anniversaries, and more.
- **Browser Alerts** – Native desktop notifications to keep you informed of upcoming events.
- **Bilingual Support** – Complete localization for both **English** and **Hebrew**.
- **Theming** – Choose between **Warm 🔥**, **Dark 🌙**, and **Light ☀️** modes to suit your workspace.

## 📖 User Guide

### 📍 Setting Your Location

Luach automatically calculates Zmanim based on your chosen location.

1. Open the **Sidebar Menu** (top-left menu icon).
2. Select your city from the dropdown list.
3. Zmanim and calendar events (like Parasha and Candle Lighting) will update instantly.

### 📅 Dynamic Calendar Grid

The calendar is designed to be highly visual and informative:

- **Event Highlights**: If a day has a custom event, the entire calendar cell will change color to match that event's category.
- **Selection Highlight**: Selecting a day draws a classic **Astroid** (four-pointed star) overlay—a nod to the legacy Luach software this app replaces.
- **Holiday Indicators**: Candle lighting, Parasha, and Yom Tov indicators are shown directly on the grid.

### ✍️ Managing Events

Luach supports several types of recurring events:

- **Hebrew Date Recurring**: Perfect for Yahrzeits and Hebrew birthdays.
- **Secular Date Recurring**: Standard annual or monthly reminders.
- **One-Time Events**: Simple notes for a specific day.

**To add an event**:

1. Select a date on the grid.
2. Click the **(+) Add** button that appears on the cell (or press `Enter`).
3. Set your labels, colors, and reminder preferences.

### ☁️ Sync & Notifications

Luach prioritizes your data. By default, everything is stored **Locally** in your browser's IndexedDB.

- **Cloud Sync**: Sign in with Google to back up your events and sync them across your phone and computer.
- **Email Reminders**: Once signed in, you can toggle "Email Reminders" to receive automated alerts even when the app is closed.
- **Browser Alerts**: Toggle this to see native system notifications while you are using your computer.

## 🚀 Installation

### 💻 Desktop & Mobile (PWA)

This is the recommended way to use Luach:

1. Visit **[luach-web.web.app](https://luach-web.web.app)** in a modern browser (Chrome or Edge recommended).
2. Look for the **Install** button in the address bar (or select "Add to Home Screen" on mobile).
3. Once installed, Luach will open in its own window without browser toolbars.

## ⌨️ Keyboard Shortcuts

Speed up your workflow with these shortcuts:

- **Arrow Keys (← → ↑ ↓)** – Navigate between dates.
- **T** – Reset view to Today.
- **Enter** – Open the "Add Event" dialog for the selected date.
- **Esc** – Close any open dialog or the sidebar.

## 🛠️ Technology Stack

- **React 19** – Modern, responsive UI.
- **TypeScript** – Robust, type-safe logic.
- **Vite & PWA** – Lightning-fast builds and offline capabilities.
- **Firebase** – Secure authentication, Cloud Firestore, and Cloud Functions.
- **jcal-zmanim** – The industry-standard library for Jewish calendar calculations.

---

_Built with ❤️ for the Jewish community. May it help you stay connected to our heritage through time._
