# <img src="public/icon.svg" width="48" height="48" valign="middle"> Luach – Jewish Calendar Web App

A **beautiful**, modern React + TypeScript web application that brings the Hebrew calendar to life. It blends **rich visual design** with **powerful functionality**: Zmanim calculations, bilingual support (English/Hebrew), event management, and offline persistence.

## ✨ Core Features

- **Interactive Calendar** – Hebrew dates with Gregorian equivalents, smooth month/year navigation, keyboard shortcuts, and subtle animations.
- **Zmanim Sidebar** – Daily prayer times calculated for any location, displayed in a clean glass‑morphic panel.
- **Event Management** – Create, edit, delete, and repeat events (yearly, monthly, one‑time). Events are stored in **IndexedDB** for offline‑first reliability.
- **Smart Reminders** – Day‑of and day‑before notifications with persistent dismissal.
- **Import / Export** – JSON, CSV, and iCalendar (.ics) formats for easy backup and integration.
- **Theming** – Warm 🔥, Dark 🌙, and Light ☀️ themes with smooth transitions and persistent selection.
- **Bilingual UI** – English and Hebrew with RTL layout support, instantly switchable.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**

### Installation

```bash
git clone https://github.com/yourusername/luach-web.git
cd luach-web
npm install
```

### Development

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. The app will automatically adjust to your system’s light/dark preference.

### Production Build

```bash
npm run build
# Built assets are placed in the `dist` folder
```

## 🛠️ Technology Stack

- **React 18** with hooks – UI components and state management
- **TypeScript** – type safety and developer ergonomics
- **Vite** – lightning‑fast bundler and dev server
- **jcal-zmanim** – accurate Jewish calendar and Zmanim calculations
- **Lucide React** – crisp, consistent icons
- **IndexedDB** – client‑side storage for events and settings
- **CSS custom properties** – dynamic theming and glass‑morphic effects

## 📦 Data Persistence

All events live in the browser’s **IndexedDB**. On first launch any legacy data in `localStorage` is migrated automatically, ensuring a seamless upgrade path.

## ⌨️ Keyboard Shortcuts

- **← → ↑ ↓** – navigate dates
- **T** – jump to today
- **Esc** – close any open modal
- **Ctrl + Shift + R** – show reminders (if previously dismissed)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run `npm run build` to ensure the TypeScript build succeeds
4. Submit a pull request with a clear description of your changes

## 📄 License

MIT License – feel free to use, modify, and share.

## 📬 Contact

Have questions or ideas? Open an issue on GitHub – we love community feedback!
