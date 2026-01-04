# Luach – Jewish Calendar Application

Luach is a modern, cross-platform Jewish calendar application that blends traditional Hebrew date logic with a premium digital experience. It provides high-accuracy Zmanim, recurring event management, and cloud synchronization.

## 🌐 Live Demo

**Primary URL**: [https://luach-web.web.app/](https://luach-web.web.app/) (Recommended - works on all browsers)

**Alternative URL**: [https://cbsom.github.io/luach-web/](https://cbsom.github.io/luach-web/) (GitHub Pages - authentication works in Firefox only)

> **Note**: For the best experience with Google sign-in and cloud sync, please use the Firebase Hosting URL above.

## ✨ Main Features

- **Hebrew & Secular Calendar**: Switch between a traditional Jewish month view and a standard secular month view.
- **Event Management**:
  - Support for birthdays, Yahrzeits, and any other one-time or recurring occasions.
  - Monthly and yearly recurring events and occasions.
  - Color the date on the calendar. You can set the calendar to show this recurring occasion in any color of your choice, to easily see which occasions or events are coming up.
- **Automated Notifications**:
  - **Email Reminders**: Receive daily email reminding you of upcoming occasions.
  - **Browser Alerts**: You can also receive native system notifications for your occasions.
- **High-Accuracy Zmanim**: Daily _Halachic Zmanim_, with the time calculated via the precise `jcal-zmanim` library for any location worldwide.
- **Bilingual Interface**: Seamlessly switch between English and Hebrew layouts, including full RTL (Right-to-Left) support.
- **Cloud Sync**: Optional Google Authentication to back up and sync your occasions and selected settings across all devices.
- **PWA (Progressive Web App)**: Install Luach directly to your desktop or mobile home screen for a native application experience.

---

## 📖 User Guide

### 📍 Setting Your Location

Daily Zmanim are calculated based on your location:

1. Open the **Settings Sidebar** (menu icon on the top).
2. Use the **Location** dropdown to select your city. There are hundreds of locations available.
3. The calendar and Zmanim will update immediately to reflect the new location's times.

### 📅 Navigation & Grid

- **Switching Views**: Use the toggle in the settings or header to flip between **Jewish Month** and **Secular Month** layouts.
- **Today**: Click the "Today" button (or press `T`) to return to the current date instantly.
- **Day Details**: Selecting any day on the grid will update the **Daily Info Sidebar** with that day's Zmanim, Parasha, and scheduled events.

### ✍️ Adding & Managing Events

1. Select a date on the calendar grid.
2. Click the **(+) Add** button that appears on the cell, or press `Enter`.
3. Provide an event name and choose a **Repeat Pattern** (e.g., "Hebrew Date Recurring Yearly" for a Yahrzeit).
4. Select a background color to highlight the day on your calendar.
5. Set **Reminders** (Day Of / Day Before) to receive notifications.

### ☁️ Syncing Your Data

By default, Luach stores your data **locally** in your browser's IndexedDB. To enable cloud backup:

1. Click **Sign in with Google** in the Sidebar.
2. Once signed in, your events will automatically sync whenever you make a change.
3. You can then access the same events on your phone or another computer.

---

## 🛠 Developer Setup

### Prerequisites

- **Node.js** (Version 22 or higher)
- **Firebase CLI** (`npm install -g firebase-tools`)
- A Firebase project with Firestore, Auth, and Functions enabled.

### Local Environment Configuration

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd luach-web
   ```
2. **Setup Frontend**:
   ```bash
   npm install
   ```
3. **Setup Backend (Functions)**:
   ```bash
   cd functions
   npm install
   cd ..
   ```
4. **Connect to Firebase**:
   ```bash
   firebase login
   firebase use [your-project-id]
   ```

### Running Locally

- **Frontend Development**: `npm run dev` starts the Vite server at `localhost:5173`.
- **Functions Emulator**: `npm --prefix functions run serve` allows you to test Cloud Function logic locally.

---

## 🏗 Deployment

### Hosting

To deploy the web application:

```bash
npm run build
npm run deploy:hosting
```

### Cloud Functions

To deploy the background reminder service:

```bash
npm run deploy:functions
```

## ⌨️ Keyboard Shortcuts

- **Arrow Keys** – Navigate between dates on the grid.
- **T** – Jump to Today.
- **Enter** – Open the "Add Event" dialog for the selected date.
- **Esc** – Close any open modal or sidebar.

## 🛡 License

Private / Proprietary to the Luach-Web project.
