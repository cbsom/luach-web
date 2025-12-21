# IndexedDB Implementation Guide

## 📋 Overview

This document explains the IndexedDB implementation for storing user events/occasions in the Luach app.

---

## 🏗️ Architecture

### Files Modified/Created

1. **`src/db.ts`** (NEW) - Database layer with all IndexedDB operations
2. **`src/App.tsx`** (MODIFIED) - Updated to use IndexedDB instead of localStorage

---

## 📊 Database Structure

### Database Details

- **Name:** `LuachDB`
- **Version:** `1`
- **Object Store:** `events`

### Schema

```typescript
{
  id: string; // Primary key (unique identifier)
  name: string; // Event name
  notes: string; // Event notes/description
  type: UserEventTypes; // Event recurrence type
  jYear: number; // Jewish year
  jMonth: number; // Jewish month
  jDay: number; // Jewish day
  sDate: string; // Secular date (ISO string)
  backColor: string; // Background color
  textColor: string; // Text color
  remindDayOf: boolean; // Remind on the day
  remindDayBefore: boolean; // Remind day before
}
```

### Indexes

1. **`type`** - Index on event type for filtering
2. **`jDate`** - Compound index on `[jYear, jMonth, jDay]` for date queries

---

## 🔧 API Functions

### Core Operations

#### `initDB(): Promise<void>`

- Initializes the database
- Creates object store and indexes if they don't exist
- Call once on app startup

```typescript
await initDB();
```

#### `getAllEvents(): Promise<UserEvent[]>`

- Retrieves all events from the database
- Returns empty array if no events exist

```typescript
const events = await getAllEvents();
```

#### `addEvent(event: UserEvent): Promise<void>`

- Adds a new event
- Will fail if event with same ID exists

```typescript
await addEvent(newEvent);
```

#### `updateEvent(event: UserEvent): Promise<void>`

- Updates an existing event
- Will create if doesn't exist (upsert behavior)

```typescript
await updateEvent(modifiedEvent);
```

#### `deleteEvent(id: string): Promise<void>`

- Deletes an event by ID

```typescript
await deleteEvent("event-id-123");
```

#### `saveAllEvents(events: UserEvent[]): Promise<void>`

- Batch operation to save multiple events
- Clears existing events first, then adds all
- More efficient than multiple individual operations

```typescript
await saveAllEvents(eventsArray);
```

#### `migrateFromLocalStorage(): Promise<boolean>`

- One-time migration from old localStorage storage
- Automatically called on first load
- Returns `true` if migration occurred

```typescript
const migrated = await migrateFromLocalStorage();
```

#### `clearAllEvents(): Promise<void>`

- Removes all events from database
- Useful for testing or reset functionality

```typescript
await clearAllEvents();
```

---

## 🔄 Migration Process

### Automatic Migration Flow

1. **App starts** → `useEffect` runs in `App.tsx`
2. **Initialize DB** → `initDB()` creates database structure
3. **Check for migration** → `migrateFromLocalStorage()` runs
   - Checks if `localStorage` has `"luach-events"` key
   - Checks if IndexedDB is empty
   - If both true: migrates data
4. **Load events** → `getAllEvents()` loads from IndexedDB
5. **Clean up** → Removes localStorage key after successful migration

### Manual Migration (if needed)

```typescript
import { migrateFromLocalStorage } from "./db";

// Force migration
await migrateFromLocalStorage();
```

---

## 💾 How Data is Saved

### Before (localStorage)

```typescript
// Synchronous, blocking
const saveEvents = (newEvents: UserEvent[]) => {
  setEvents(newEvents);
  localStorage.setItem("luach-events", JSON.stringify(newEvents));
};
```

### After (IndexedDB)

```typescript
// Asynchronous, non-blocking
const saveEvents = async (newEvents: UserEvent[]) => {
  setEvents(newEvents);

  try {
    await saveAllEvents(newEvents);
    console.log(`✅ Saved ${newEvents.length} events`);
  } catch (error) {
    console.error("❌ Failed to save:", error);
    // Fallback to localStorage
    localStorage.setItem("luach-events", JSON.stringify(newEvents));
  }
};
```

---

## 🎯 Key Benefits

### 1. **Larger Storage Capacity**

- localStorage: ~5-10 MB
- IndexedDB: ~50 MB+ (varies by browser)

### 2. **Asynchronous Operations**

- Non-blocking UI
- Better performance for large datasets

### 3. **Structured Data**

- Indexes for fast queries
- No need to parse JSON every time

### 4. **Future-Proof**

- Easy to add cloud sync later
- Can add more indexes as needed

### 5. **Offline-First**

- Works perfectly offline
- Foundation for Progressive Web App (PWA)

---

## 🔮 Future Enhancements

### 1. Date Range Queries

```typescript
async function getEventsByDateRange(startDate: jDate, endDate: jDate): Promise<UserEvent[]> {
  const db = await openDB();
  const transaction = db.transaction(["events"], "readonly");
  const objectStore = transaction.objectStore("events");
  const index = objectStore.index("jDate");

  // Use IDBKeyRange for efficient queries
  const range = IDBKeyRange.bound(
    [startDate.Year, startDate.Month, startDate.Day],
    [endDate.Year, endDate.Month, endDate.Day]
  );

  return new Promise((resolve, reject) => {
    const request = index.getAll(range);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
```

### 2. Search Functionality

```typescript
async function searchEvents(query: string): Promise<UserEvent[]> {
  const allEvents = await getAllEvents();
  return allEvents.filter(
    (event) =>
      event.name.toLowerCase().includes(query.toLowerCase()) ||
      event.notes.toLowerCase().includes(query.toLowerCase())
  );
}
```

### 3. Cloud Sync Preparation

Add these fields to the schema:

```typescript
interface UserEventWithSync extends UserEvent {
  lastModified: number; // Timestamp
  syncStatus: "pending" | "synced" | "conflict";
  cloudId?: string; // ID from cloud database
}
```

Sync workflow:

```typescript
async function syncWithCloud() {
  // 1. Get all local events with pending status
  const pendingEvents = await getEventsBySyncStatus("pending");

  // 2. Push to cloud API
  const response = await fetch("/api/events/sync", {
    method: "POST",
    body: JSON.stringify(pendingEvents),
  });

  // 3. Get updates from cloud
  const cloudEvents = await response.json();

  // 4. Merge and resolve conflicts
  await mergeCloudEvents(cloudEvents);

  // 5. Mark as synced
  await updateSyncStatus(pendingEvents, "synced");
}
```

---

## 🐛 Debugging

### View Database in Browser DevTools

**Chrome/Edge:**

1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **IndexedDB** → **LuachDB** → **events**
4. View all stored events

**Firefox:**

1. Open DevTools (F12)
2. Go to **Storage** tab
3. Expand **Indexed DB** → **LuachDB** → **events**

### Console Commands

```javascript
// Get database instance
const request = indexedDB.open("LuachDB", 1);
request.onsuccess = (e) => {
  const db = e.target.result;
  console.log("Database:", db);
};

// Delete database (reset)
indexedDB.deleteDatabase("LuachDB");
```

---

## ⚠️ Error Handling

### Common Issues

1. **Browser doesn't support IndexedDB**

   - Fallback to localStorage automatically
   - Check: `'indexedDB' in window`

2. **Storage quota exceeded**

   - Browser will prompt user for permission
   - Can request persistent storage:

   ```typescript
   if (navigator.storage && navigator.storage.persist) {
     const persistent = await navigator.storage.persist();
     console.log("Persistent storage:", persistent);
   }
   ```

3. **Database version conflicts**
   - Increment `DB_VERSION` in `db.ts`
   - Add migration logic in `onupgradeneeded`

---

## 🔒 Privacy & Security

### Data Storage

- All data stored **locally** in user's browser
- No data sent to external servers (yet)
- User can clear data via browser settings

### Future Cloud Sync

- Will require user authentication
- End-to-end encryption recommended
- GDPR compliance considerations

---

## 📝 Manual Tweaking Guide

### Change Database Name

```typescript
// In db.ts
const DB_NAME = "MyCustomDB"; // Change this
```

### Add New Index

```typescript
// In openDB() function, onupgradeneeded event
objectStore.createIndex("myNewIndex", "fieldName", { unique: false });
```

### Add New Field to Events

1. Update `UserEvent` type in `types.ts`
2. No database migration needed (IndexedDB is schema-less)
3. New field will be stored automatically

### Change Storage Limits

```typescript
// Request persistent storage
if (navigator.storage && navigator.storage.persist) {
  await navigator.storage.persist();
}

// Check quota
if (navigator.storage && navigator.storage.estimate) {
  const estimate = await navigator.storage.estimate();
  console.log(`Using ${estimate.usage} of ${estimate.quota} bytes`);
}
```

---

## 📚 Additional Resources

- [MDN IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [IndexedDB Best Practices](https://web.dev/indexeddb-best-practices/)
- [Working with IndexedDB](https://developers.google.com/web/ilt/pwa/working-with-indexeddb)

---

**Questions?** Check the inline comments in `src/db.ts` for detailed explanations of each function!
