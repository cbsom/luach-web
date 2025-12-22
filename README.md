# 📅 Luach - Jewish Calendar Web App

A beautiful, modern Jewish calendar application built with React, TypeScript, and Vite. Features multiple themes, bilingual support (English/Hebrew), comprehensive Zmanim calculations, and smart event reminders.

## ✨ Features

### 🎨 **Three Beautiful Themes**

- **🔥 Warm Theme** - Rich brown tones with warm amber accents (default)
- **🌙 Dark Theme** - Sleek pure black with modern aesthetics
- **☀️ Light Theme** - Clean white backgrounds with vibrant colors
- Smooth theme transitions with automatic persistence
- Theme-aware text colors for optimal readability

### 🌍 **Bilingual Support**

- Full English and Hebrew language support
- RTL (Right-to-Left) layout for Hebrew
- Seamless language switching
- Localized date formats and terminology

### 📆 **Calendar Features**

- Interactive Hebrew calendar with Gregorian dates
- **Dynamic row sizing** - Shows 4-6 weeks based on month length
- Navigate by month, year, or jump to specific dates
- Keyboard navigation (arrow keys, 'T' for today)
- Visual indicators for today and selected dates
- Shabbat and Parsha names displayed on calendar
- Holiday highlighting with color-coded indicators

### 🕐 **Zmanim (Jewish Times)**

- Comprehensive daily Zmanim calculations
- Location-based calculations for worldwide cities
- Candle lighting times for Shabbat and Yom Tov
- Sunrise, sunset, and twilight times
- Dedicated Zmanim sidebar with all times

### 📝 **Personal Events & Reminders**

#### Event Management

- Create custom events with Hebrew or Gregorian dates
- Recurring events (yearly, monthly, or one-time)
- Color-coded events with custom background and text colors
- Anniversary tracking with automatic numbering
- Notes and descriptions for each event
- **IndexedDB storage** for reliable offline access

#### Smart Reminders 🔔

- **In-App Reminder Modal** - Beautiful centered modal on app load
- **Day-of reminders** - Get notified on the event day
- **Day-before reminders** - Get advance notice
- **Smart dismissal** - Stays dismissed for 24 hours
- **Auto-reset** - Reminders reappear the next day
- **Keyboard shortcut** - Press Ctrl+Shift+R to manually show reminders

#### Import/Export

- **Export to JSON** - Backup your events
- **Export to CSV** - Spreadsheet format
- **Export to Calendar (.ics)** - Import to Google/Apple/Outlook Calendar
- **Import from JSON/CSV/XML** - Restore or migrate events
- **Duplicate detection** - Automatically skips duplicate events
- **Legacy XML support** - Import from older calendar apps

### 📊 **Events List**

- Comprehensive events list modal
- **Sort by**: Name, Date, or Type
- **Quick actions**: Edit or delete events
- **Visual preview**: See event colors and details
- **Bulk export**: Download all events at once
- **Compact design**: More events visible at once

### 📖 **Jewish Information**

- **Daily Daf Yomi** - Today's Talmud page
- **Weekly Parasha** - Torah portion of the week
- **Omer Count** - During the counting period
- **Pirkei Avot** - Chapter of the week (summer)
- **Special Days** - Rosh Chodesh, Yom Tov, Fast Days
- **Shul Notifications** - Community-relevant information

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/luach-web.git
cd luach-web
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 🛠️ Technology Stack

- **React 18** - UI framework with hooks
- **TypeScript** - Type safety and better DX
- **Vite** - Lightning-fast build tool and dev server
- **jcal-zmanim** - Jewish calendar calculations
- **Lucide React** - Beautiful, consistent icons
- **IndexedDB** - Client-side database for events
- **CSS Custom Properties** - Dynamic theming system

## 💾 Data Storage

### IndexedDB

- All events stored locally in IndexedDB
- Automatic migration from localStorage
- Offline-first architecture
- No server required

### Import/Export

- **JSON Format** - Full data backup
- **CSV Format** - Spreadsheet compatibility
- **iCalendar (.ics)** - Universal calendar format
- **XML Format** - Legacy support

## 🎨 Theming

The app uses CSS custom properties for a flexible theming system:

- Themes automatically saved to localStorage
- Persist across sessions
- Smooth color transitions
- Theme-aware components

**Cycle through themes**: Click the theme button (🔥/🌙/☀️) in the sidebar

## 🌐 Supported Locations

The app includes Zmanim calculations for hundreds of cities worldwide:

- Major cities in Israel, USA, UK, Canada, Australia
- European cities
- South American cities
- Custom location support

Select your location from the dropdown in the sidebar.

## ⌨️ Keyboard Shortcuts

- **Arrow Keys** - Navigate between dates
- **T** - Jump to today's date
- **ESC** - Close modals
- **Ctrl+Shift+R** - Show reminders (if dismissed)

## 📱 Responsive Design

The app is optimized for desktop use with:

- Beautiful glassmorphic design
- Smooth animations and transitions
- Hover effects and micro-interactions
- Premium visual aesthetics

## 🔔 Event Reminders

### In-App Notifications

1. Create an event
2. Enable "Remind me the day before" or "Remind me on the day"
3. Save the event
4. **Modal appears automatically** when you open the app!

### Calendar Integration

1. Click "Events" button
2. Click "Export Calendar"
3. Import .ics file to your calendar app
4. Get notifications from your calendar!

**See [EVENT_REMINDERS_GUIDE.md](EVENT_REMINDERS_GUIDE.md) for detailed information.**

## 📚 Documentation

- **[EVENT_REMINDERS_GUIDE.md](EVENT_REMINDERS_GUIDE.md)** - Complete guide to reminder options
- **[REMINDERS_IMPLEMENTATION.md](REMINDERS_IMPLEMENTATION.md)** - Implementation details
- **[INDEXEDDB_GUIDE.md](INDEXEDDB_GUIDE.md)** - Database architecture
- **[XML_IMPORT_GUIDE.md](XML_IMPORT_GUIDE.md)** - Legacy import instructions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow TypeScript best practices
2. Maintain theme consistency
3. Test across all three themes
4. Ensure bilingual support
5. Update documentation

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [jcal-zmanim](https://www.npmjs.com/package/jcal-zmanim) library
- Icons by [Lucide](https://lucide.dev/)
- Fonts from [Google Fonts](https://fonts.google.com/) (Outfit, Inter, Assistant)

## 🎯 Roadmap

### Planned Features

- [ ] Progressive Web App (PWA) support
- [ ] Browser push notifications
- [ ] Email notification service
- [ ] Mobile responsive design
- [ ] Print functionality
- [ ] Custom Zmanim settings
- [ ] Multi-user support

### Future Enhancements

- [ ] Weekly/Monthly view options
- [ ] Event categories and tags
- [ ] Search functionality
- [ ] Event sharing
- [ ] Calendar subscriptions
- [ ] API for external integrations

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ for the Jewish community**

_Helping Jews worldwide stay connected to their heritage, one date at a time._
