# XML Import Guide

## 📋 Overview

This guide explains how to import your old events from `oldEvents.xml` into the new IndexedDB database.

---

## 🚀 Quick Start

### Step 1: Start the Development Server

Make sure your dev server is running:

```bash
npm run dev
```

### Step 2: Open the Import Tool

Open `import-events.html` in your browser:

```
http://localhost:5173/import-events.html
```

### Step 3: Select the XML File

1. Click "Choose File"
2. Select `oldEvents.xml`
3. Click "Import Events"

### Step 4: Wait for Import

The tool will:

- ✅ Parse the XML file
- ✅ Convert events to the new format
- ✅ Check for duplicates
- ✅ Save to IndexedDB

### Step 5: Verify

1. Click "View Database" to see the count
2. Close the import tool
3. Refresh your main app
4. Your events should now appear!

---

## 📊 What the Import Tool Does

### 1. **XML Parsing**

Reads the `oldEvents.xml` file and extracts all `<UserOccasion>` elements.

### 2. **Data Conversion**

Each XML event is converted from this format:

```xml
<UserOccasion>
  <BackColor ColorHtml="Yellow" />
  <Color ColorHtml="Blue" />
  <JewishDate>
    <AbsoluteDate>719883</AbsoluteDate>
    <GregorianDate>1971-12-22T00:00:00</GregorianDate>
  </JewishDate>
  <Name>טאטי</Name>
  <Notes />
  <UserOccasionType>HebrewDateRecurringYearly</UserOccasionType>
  <SendEmailReminders>true</SendEmailReminders>
</UserOccasion>
```

To this format:

```javascript
{
  id: "imported-1234567890-0",
  name: "טאטי",
  notes: "",
  type: 1, // HebrewDateRecurringYearly
  jYear: 5732,
  jMonth: 10,
  jDay: 5,
  sDate: "1971-12-22T00:00:00.000Z",
  backColor: "#FFFF00", // Yellow
  textColor: "#0000FF", // Blue
  remindDayOf: true,
  remindDayBefore: false
}
```

### 3. **Date Conversion**

The tool uses the `AbsoluteDate` field to create a `jDate` object, which automatically calculates:

- Jewish year, month, day
- Gregorian date
- All necessary fields

### 4. **Color Conversion**

HTML color names are converted to hex codes:

- `Yellow` → `#FFFF00`
- `Blue` → `#0000FF`
- `Lime` → `#00FF00`
- `Maroon` → `#800000`
- Custom hex colors (like `#FF8000`) are preserved

### 5. **Type Mapping**

Event types are mapped from strings to numbers:

```javascript
'HebrewDateRecurringYearly' → 1
'HebrewDateRecurringMonthly' → 2
'SecularDateRecurringYearly' → 3
'SecularDateRecurringMonthly' → 4
'OneTime' → 5
```

### 6. **Duplicate Detection**

Before importing, the tool checks if an event already exists by comparing:

- Event name
- Jewish year
- Jewish month
- Jewish day

If a match is found, the event is skipped to avoid duplicates.

---

## 🎯 Understanding the Import Process

### Visual Feedback

The import tool provides real-time feedback:

**Statistics:**

- **Total Events** - Number of events found in XML
- **Imported** - Number of new events added
- **Errors** - Number of events that failed to import

**Log Messages:**

- 🔵 **Info** (blue) - General information
- ✅ **Success** (green) - Successful operations
- ⚠️ **Warning** (orange) - Non-critical issues
- ❌ **Error** (red) - Failed operations

### Error Handling

If an event fails to import, the tool will:

1. Log the error with the event number
2. Continue with the next event
3. Show the total error count
4. Still import all successful events

Common errors:

- Missing date information
- Invalid XML structure
- Corrupted data

---

## 🔍 Verifying the Import

### Method 1: View Database Button

Click "View Database" in the import tool to see:

- Total number of events in IndexedDB
- Full event list in browser console (F12)

### Method 2: Browser DevTools

1. Open DevTools (F12)
2. Go to **Application** tab
3. Navigate to **IndexedDB** → **LuachDB** → **events**
4. View all imported events

### Method 3: Main App

1. Close the import tool
2. Refresh your main app
3. Navigate through the calendar
4. Events should appear on their respective dates

---

## 📝 Field Mapping Reference

| XML Field                  | New Field                                   | Notes                            |
| -------------------------- | ------------------------------------------- | -------------------------------- |
| `Name`                     | `name`                                      | Event name                       |
| `Notes`                    | `notes`                                     | Event description                |
| `UserOccasionType`         | `type`                                      | Converted to number              |
| `JewishDate/AbsoluteDate`  | Used to calculate `jYear`, `jMonth`, `jDay` | Primary date source              |
| `JewishDate/GregorianDate` | `sDate`                                     | Fallback if AbsoluteDate missing |
| `BackColor/ColorHtml`      | `backColor`                                 | Converted to hex                 |
| `Color/ColorHtml`          | `textColor`                                 | Converted to hex                 |
| `SendEmailReminders`       | `remindDayOf`                               | Boolean                          |
| N/A                        | `remindDayBefore`                           | Always `false` for imports       |
| N/A                        | `id`                                        | Auto-generated unique ID         |

---

## ⚠️ Important Notes

### 1. **Backup First**

Before importing, it's a good idea to:

- Export your current events (if any)
- Keep a copy of `oldEvents.xml`

### 2. **One-Time Operation**

This import is designed to be run once. Running it multiple times will:

- Skip duplicates (safe)
- But may create duplicates if event names/dates change

### 3. **Reminder Settings**

- `SendEmailReminders="true"` → `remindDayOf: true`
- `remindDayBefore` is always set to `false` for imported events
- You can edit these later in the app

### 4. **Color Defaults**

If a color is missing or invalid:

- Default background: `#fde047` (amber/yellow)
- Default text: `#1e293b` (dark blue)

---

## 🐛 Troubleshooting

### "Please select an XML file first"

- Make sure you clicked "Choose File" and selected `oldEvents.xml`

### "XML parsing failed"

- Check that the XML file is valid
- Try opening it in a text editor to verify structure

### "No valid date found"

- Some events may have corrupted date data
- These will be skipped, but others will still import

### Events not appearing in app

1. Check browser console for errors
2. Verify events are in IndexedDB (DevTools)
3. Try refreshing the app
4. Check if events are on the correct dates

### Import button does nothing

1. Open browser console (F12)
2. Look for error messages
3. Make sure dev server is running
4. Try a hard refresh (Ctrl+Shift+R)

---

## 🔧 Manual Tweaking

### Modify Color Conversion

Edit the `convertColorToHex` function in `import-events.html`:

```javascript
const colorMap = {
  Yellow: "#FFFF00", // Change to your preferred yellow
  Blue: "#0000FF", // Change to your preferred blue
  // Add more colors as needed
};
```

### Change Duplicate Detection Logic

Edit the duplicate check in `importEvents` function:

```javascript
const isDuplicate = existingEvents.some(
  (existing) =>
    existing.name === newEvent.name && // Match by name
    existing.jYear === newEvent.jYear && // And year
    existing.jMonth === newEvent.jMonth && // And month
    existing.jDay === newEvent.jDay // And day
);
```

### Add Custom Field Mapping

In the `convertOccasionToEvent` function, add:

```javascript
// Example: Import custom field
const customField = getTextContent(occasion, "CustomFieldName");

return {
  // ... existing fields
  customField: customField, // Add to event object
};
```

---

## 📚 Technical Details

### How Absolute Dates Work

The XML uses "Absolute Date" which is the number of days since a reference point (Jewish calendar epoch). The `jDate` class from `jcal-zmanim` can convert this directly:

```javascript
const jd = new jDate(absDate); // Creates jDate from absolute day number
```

This automatically calculates:

- Jewish year, month, day
- Gregorian date
- Day of week
- And more

### Why Module Script?

The import tool uses `<script type="module">` to:

- Import ES6 modules (`db.js`, `jcal-zmanim`)
- Use modern JavaScript features
- Maintain clean code structure

### Database Safety

The import process:

1. Reads existing events
2. Merges with new events
3. Saves all at once

This ensures:

- No data loss
- Atomic operation
- Rollback on error

---

## ✅ Success Checklist

After import, verify:

- [ ] No errors in import log
- [ ] "Imported" count matches expectations
- [ ] Events visible in DevTools IndexedDB
- [ ] Events appear in main app
- [ ] Colors look correct
- [ ] Event types are correct
- [ ] Dates are accurate

---

## 🎉 Next Steps

After successful import:

1. Delete `import-events.html` (optional)
2. Keep `oldEvents.xml` as backup
3. Test your events in the app
4. Edit any events that need adjustments
5. Enjoy your imported occasions!

---

**Questions?** Check the browser console for detailed logs and error messages!
