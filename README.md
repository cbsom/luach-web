# 📅 Luach - Jewish Calendar Web App

A beautiful, modern Jewish calendar application built with React, TypeScript, and Vite. Features multiple themes, bilingual support (English/Hebrew), and comprehensive Zmanim calculations.

## ✨ Features

### 🎨 **Three Beautiful Themes**

- **🔥 Warm Theme** - Rich brown tones with warm amber accents
- **🌙 Dark Theme** - Sleek pure black with modern aesthetics
- **☀️ Light Theme** - Clean white backgrounds with vibrant colors

### 🌍 **Bilingual Support**

- Full English and Hebrew language support
- RTL (Right-to-Left) layout for Hebrew
- Seamless language switching

### 📆 **Calendar Features**

- Interactive Hebrew calendar with Gregorian dates
- Navigate by month, year, or jump to specific dates
- Keyboard navigation (arrow keys, 'T' for today)
- Visual indicators for today and selected dates
- Shabbat and holiday highlighting

### 🕐 **Zmanim (Jewish Times)**

- Comprehensive daily Zmanim calculations
- Location-based calculations for worldwide cities
- Candle lighting times
- Sunrise, sunset, and more

### 📝 **Personal Events**

- Create custom events with Hebrew or Gregorian dates
- Recurring events (yearly, monthly, or one-time)
- Color-coded events with custom colors
- Reminder notifications (day-of and day-before)
- Anniversary tracking

### 📖 **Jewish Information**

- Daily Daf Yomi
- Weekly Parasha
- Omer count (during the counting period)
- Pirkei Avot chapters
- Special day notifications (Rosh Chodesh, Yom Tov, etc.)

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

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **jcal-zmanim** - Jewish calendar calculations
- **Lucide React** - Beautiful icons
- **CSS Custom Properties** - Theming system

## 🎨 Theming

The app uses CSS custom properties for a flexible theming system. Themes are automatically saved to localStorage and persist across sessions.

Click the theme button (🔥/🌙/☀️) in the sidebar to cycle through themes.

## 🌐 Supported Locations

The app includes Zmanim calculations for hundreds of cities worldwide. Select your location from the dropdown in the sidebar.

## ⌨️ Keyboard Shortcuts

- **Arrow Keys** - Navigate between dates
- **T** - Jump to today's date
- **ESC** - Close modals

## 📱 Responsive Design

The app is optimized for desktop use with a beautiful glassmorphic design and smooth animations.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [jcal-zmanim](https://www.npmjs.com/package/jcal-zmanim) library
- Icons by [Lucide](https://lucide.dev/)
- Fonts from [Google Fonts](https://fonts.google.com/)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ for the Jewish community**
