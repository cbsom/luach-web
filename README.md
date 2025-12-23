# <img src="public/icon.svg" width="48" height="48" valign="middle"> Luach – Jewish Calendar

A **beautiful**, modern React + TypeScript application that brings the Hebrew calendar to life. It blends **rich visual design** with **powerful functionality**: Zmanim calculations, bilingual support, cloud sync, and a native desktop experience via PWA.

## ✨ Core Features

- **Interactive Calendar** – Hebrew dates with Gregorian equivalents, smooth month/year navigation, and keyboard shortcuts.
- **Zmanim Sidebar** – Daily prayer times calculated for any location, displayed in a clean glass‑morphic panel.
- **Cloud Sync** – Optional Google Login to sync your events and settings across devices.
- **Email Reminders** – Receive automated email notifications for your events (Yahrzeits, Anniversaries, etc.).
- **Desktop & Mobile App (PWA)** – Install it directly to your taskbar or home screen for a fast, native-like experience.
- **Offline Reliability** – Events are stored in **IndexedDB**, allowing the app to work even without an internet connection.
- **Theming** – Warm 🔥, Dark 🌙, and Light ☀️ themes with smooth transitions.

## 🚀 Installation & Usage

### 💻 Desktop / Mobile Install (Recommended)

You can install Luach as a standalone application:

1. Visit **[luach-web.web.app](https://luach-web.web.app)** in Chrome or Edge.
2. Click the **Install** icon in the address bar (or "Add to Home Screen" on mobile).
3. The app will now appear in your app drawer and can be pinned to your taskbar.

### 🛠️ Developer Setup

```bash
# Clone and install
git clone https://github.com/yourusername/luach-web.git
cd luach-web
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛠️ Technology Stack

- **React 19** – UI components and state management.
- **TypeScript** – Type-safe development.
- **Vite** – High-performance build tool and PWA generator.
- **Firebase** – Authentication, Firestore (Cloud Sync), and Cloud Functions (Email Reminders).
- **jcal-zmanim** – Accurate Jewish calendar and Zmanim calculations.
- **IndexedDB** – Local storage for extreme reliability and offline use.

## ⌨️ Keyboard Shortcuts

- **← → ↑ ↓** – Navigate dates.
- **T** – Jump to today.
- **Esc** – Close any open modal.
- **Enter** – Add new event for selected date.

## 📄 License

MIT License – feel free to use, modify, and share.
