/**
 * IndexedDB Database Layer for Luach Events
 * 
 * This module provides a clean abstraction over IndexedDB for storing user events/occasions.
 * 
 * WHY IndexedDB?
 * - Larger storage capacity (50MB+ vs localStorage's 5-10MB)
 * - Asynchronous operations (non-blocking UI)
 * - Structured data with indexes for fast queries
 * - Better foundation for future cloud sync
 * - Native browser support, no dependencies
 * 
 * DATABASE STRUCTURE:
 * - Database Name: "LuachDB"
 * - Version: 1
 * - Object Store: "events"
 *   - keyPath: "id" (unique identifier for each event)
 *   - Indexes:
 *     - "type" - for filtering by event type
 *     - "jDate" - compound index [jYear, jMonth, jDay] for date queries
 * 
 * USAGE:
 * - initDB() - Initialize database (call once on app start)
 * - getAllEvents() - Retrieve all events
 * - addEvent(event) - Add a new event
 * - updateEvent(event) - Update an existing event
 * - deleteEvent(id) - Delete an event by ID
 * - migrateFromLocalStorage() - One-time migration from old localStorage
 */

import { UserEvent } from "./types";

const DB_NAME = "LuachDB";
const DB_VERSION = 1;
const STORE_NAME = "events";

/**
 * Opens a connection to IndexedDB
 * Creates the database and object store if they don't exist
 * 
 * @returns Promise<IDBDatabase> - The database instance
 */
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        // Open (or create) the database
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // This event is triggered when the database needs to be created or upgraded
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Create the object store if it doesn't exist
            // keyPath: "id" means each event's "id" field will be the unique key
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });

                // Create indexes for efficient querying
                // Index on "type" allows us to quickly filter events by type
                objectStore.createIndex("type", "type", { unique: false });

                // Compound index on Jewish date components for date-based queries
                // This allows efficient queries like "get all events in a specific month/year"
                objectStore.createIndex("jDate", ["jYear", "jMonth", "jDay"], { unique: false });
            }
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
}

/**
 * Initialize the database
 * Should be called once when the app starts
 * 
 * @returns Promise<void>
 */
export async function initDB(): Promise<void> {
    try {
        const db = await openDB();
        db.close(); // Close the connection after initialization
        console.log("✅ IndexedDB initialized successfully");
    } catch (error) {
        console.error("❌ Failed to initialize IndexedDB:", error);
        throw error;
    }
}

/**
 * Get all events from the database
 * 
 * HOW IT WORKS:
 * 1. Opens a read-only transaction
 * 2. Gets the object store
 * 3. Retrieves all records
 * 4. Returns them as an array
 * 
 * @returns Promise<UserEvent[]> - Array of all events
 */
export async function getAllEvents(): Promise<UserEvent[]> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        // Create a read-only transaction
        const transaction = db.transaction([STORE_NAME], "readonly");
        const objectStore = transaction.objectStore(STORE_NAME);

        // Get all records
        const request = objectStore.getAll();

        request.onsuccess = () => {
            db.close();
            resolve(request.result || []);
        };

        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
}

/**
 * Add a new event to the database
 * 
 * NOTE: If an event with the same ID already exists, this will fail.
 * Use updateEvent() to modify existing events.
 * 
 * @param event - The event to add
 * @returns Promise<void>
 */
export async function addEvent(event: UserEvent): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        // Create a read-write transaction
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(STORE_NAME);

        // Add the event
        const request = objectStore.add(event);

        request.onsuccess = () => {
            db.close();
            resolve();
        };

        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
}

/**
 * Update an existing event
 * 
 * NOTE: This uses put() which will add the event if it doesn't exist,
 * or update it if it does (based on the ID).
 * 
 * @param event - The event to update
 * @returns Promise<void>
 */
export async function updateEvent(event: UserEvent): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(STORE_NAME);

        // put() will update if exists, or add if doesn't exist
        const request = objectStore.put(event);

        request.onsuccess = () => {
            db.close();
            resolve();
        };

        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
}

/**
 * Delete an event by ID
 * 
 * @param id - The ID of the event to delete
 * @returns Promise<void>
 */
export async function deleteEvent(id: string): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(STORE_NAME);

        const request = objectStore.delete(id);

        request.onsuccess = () => {
            db.close();
            resolve();
        };

        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
}

/**
 * Save multiple events at once (batch operation)
 * More efficient than calling addEvent/updateEvent multiple times
 * 
 * @param events - Array of events to save
 * @returns Promise<void>
 */
export async function saveAllEvents(events: UserEvent[]): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(STORE_NAME);

        // Clear existing events first
        objectStore.clear();

        // Add all events
        events.forEach((event) => {
            objectStore.add(event);
        });

        transaction.oncomplete = () => {
            db.close();
            resolve();
        };

        transaction.onerror = () => {
            db.close();
            reject(transaction.error);
        };
    });
}

/**
 * Migrate events from localStorage to IndexedDB
 * This is a one-time operation that should run on first load
 * 
 * HOW IT WORKS:
 * 1. Checks if localStorage has events
 * 2. Checks if IndexedDB is empty
 * 3. If both conditions are true, migrates the data
 * 4. Removes the localStorage key after successful migration
 * 
 * @returns Promise<boolean> - True if migration occurred, false otherwise
 */
export async function migrateFromLocalStorage(): Promise<boolean> {
    try {
        // Check if localStorage has events
        const localStorageData = localStorage.getItem("luach-events");
        if (!localStorageData) {
            console.log("ℹ️ No localStorage data to migrate");
            return false;
        }

        // Check if IndexedDB already has events
        const existingEvents = await getAllEvents();
        if (existingEvents.length > 0) {
            console.log("ℹ️ IndexedDB already has data, skipping migration");
            return false;
        }

        // Parse and migrate the data
        const events: UserEvent[] = JSON.parse(localStorageData);
        await saveAllEvents(events);

        // Remove from localStorage after successful migration
        localStorage.removeItem("luach-events");

        console.log(`✅ Migrated ${events.length} events from localStorage to IndexedDB`);
        return true;
    } catch (error) {
        console.error("❌ Migration failed:", error);
        // Don't throw - we don't want to break the app if migration fails
        return false;
    }
}

/**
 * Clear all events from the database
 * Useful for testing or reset functionality
 * 
 * @returns Promise<void>
 */
export async function clearAllEvents(): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(STORE_NAME);

        const request = objectStore.clear();

        request.onsuccess = () => {
            db.close();
            resolve();
        };

        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
}

/**
 * FUTURE ENHANCEMENT IDEAS:
 * 
 * 1. Query by date range:
 *    async function getEventsByDateRange(startDate: jDate, endDate: jDate)
 * 
 * 2. Query by type:
 *    async function getEventsByType(type: UserEventTypes)
 * 
 * 3. Search by name:
 *    async function searchEvents(query: string)
 * 
 * 4. Cloud sync integration:
 *    - Add "lastModified" timestamp to events
 *    - Add "syncStatus" field (pending, synced, conflict)
 *    - Implement sync functions to push/pull from cloud
 * 
 * 5. Conflict resolution:
 *    - Track local and remote versions
 *    - Implement merge strategies
 */
