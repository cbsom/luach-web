# Event Reminder Implementation Guide

## Current Status

Currently, the `remindDayOf` and `remindDayBefore` fields are **stored** in the event data but **do not trigger actual notifications**. They are simply preferences that are saved to IndexedDB.

---

## Web-Based Notification Options

Here are the practical options for implementing event reminders in a web environment:

### **1. Browser Push Notifications (Recommended for PWA)**

**How it works:**

- Use the Web Push API
- Requires user permission
- Works even when browser is closed (if PWA is installed)
- Requires a service worker

**Pros:**

- ✅ Native browser notifications
- ✅ Works offline (if PWA)
- ✅ No backend required for basic implementation
- ✅ Free

**Cons:**

- ❌ Requires user to grant permission
- ❌ Requires service worker setup
- ❌ Limited to when user's device is on
- ❌ Can't schedule far in advance reliably

**Implementation:**

```javascript
// Request permission
const permission = await Notification.requestPermission();

// Schedule notification (requires service worker)
navigator.serviceWorker.ready.then((registration) => {
  registration.showNotification("Event Reminder", {
    body: "Tomorrow is Harry's Birthday!",
    icon: "/icon.png",
    badge: "/badge.png",
    tag: "event-reminder-123",
  });
});
```

---

### **2. Email Notifications (Most Reliable)**

**How it works:**

- Backend service checks events daily
- Sends emails for upcoming events
- Requires email service integration

**Pros:**

- ✅ Most reliable
- ✅ Works regardless of browser/device state
- ✅ Users check email regularly
- ✅ Can include rich content

**Cons:**

- ❌ Requires backend server
- ❌ Requires email service (SendGrid, AWS SES, etc.)
- ❌ Monthly costs
- ❌ Need user email addresses

**Architecture:**

```
User Browser → IndexedDB (local events)
              ↓ (sync to cloud)
Backend Server → Cloud Database (events + user emails)
              ↓ (daily cron job)
Email Service → Send reminders to users
```

**Services to use:**

- **SendGrid** (12,000 free emails/month)
- **AWS SES** ($0.10 per 1,000 emails)
- **Mailgun** (5,000 free emails/month)
- **Resend** (3,000 free emails/month)

---

### **3. SMS Notifications**

**How it works:**

- Similar to email but via SMS
- Requires phone numbers
- Uses services like Twilio

**Pros:**

- ✅ Very high open rate
- ✅ Immediate delivery
- ✅ Works on any phone

**Cons:**

- ❌ Expensive ($0.0075+ per SMS)
- ❌ Requires phone numbers
- ❌ Requires backend
- ❌ Privacy concerns

---

### **4. In-App Notifications (Current Capability)**

**How it works:**

- Show notifications when user opens the app
- Check for upcoming events on load
- Display banner/modal for reminders

**Pros:**

- ✅ No backend required
- ✅ No permissions needed
- ✅ Easy to implement
- ✅ Free

**Cons:**

- ❌ Only works when user visits the site
- ❌ Not proactive
- ❌ Easy to miss

**Implementation:**

```javascript
// On app load, check for events
const today = new jDate();
const tomorrow = today.addDays(1);

const todayEvents = events.filter((e) => e.remindDayOf && isEventOnDate(e, today));

const tomorrowEvents = events.filter((e) => e.remindDayBefore && isEventOnDate(e, tomorrow));

if (todayEvents.length > 0 || tomorrowEvents.length > 0) {
  showReminderBanner(todayEvents, tomorrowEvents);
}
```

---

### **5. Calendar Integration**

**How it works:**

- Export events to user's calendar (Google, Apple, Outlook)
- Calendar app handles reminders
- Use iCal format

**Pros:**

- ✅ Leverages existing calendar apps
- ✅ Users already have reminder preferences set
- ✅ No backend needed
- ✅ Free

**Cons:**

- ❌ Requires manual export/import
- ❌ Not automatic
- ❌ Sync issues

**Implementation:**

```javascript
// Generate .ics file
function generateICS(event) {
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.name}
DTSTART:${formatDate(event.jDate)}
DESCRIPTION:${event.notes}
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

  // Download .ics file
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.name}.ics`;
  link.click();
}
```

---

## **Recommended Implementation Strategy**

### **Phase 1: In-App Notifications (Immediate)**

Implement today with no backend:

1. **On app load**, check for events with reminders
2. **Show banner** at top of calendar for today's events
3. **Show modal** for tomorrow's events (if `remindDayBefore`)
4. **Store "seen" state** in localStorage to avoid repeated notifications

### **Phase 2: Browser Push Notifications (Short-term)**

Add PWA capabilities:

1. **Create service worker**
2. **Request notification permission**
3. **Schedule notifications** when user visits app
4. **Show notifications** even when browser is minimized

### **Phase 3: Email Notifications (Long-term)**

Build backend service:

1. **Add user accounts** (email + password)
2. **Sync events to cloud** (Firebase, Supabase, or custom backend)
3. **Daily cron job** checks for upcoming events
4. **Send emails** via SendGrid/SES
5. **User settings** for notification preferences

---

## **Quick Win: In-App Notifications**

Here's a simple implementation you can add today:

```typescript
// Add to App.tsx
useEffect(() => {
  const checkReminders = () => {
    const today = new jDate();
    const tomorrow = today.addDays(1);

    const todayReminders = events.filter((e) => {
      if (!e.remindDayOf) return false;
      return isEventToday(e, today);
    });

    const tomorrowReminders = events.filter((e) => {
      if (!e.remindDayBefore) return false;
      return isEventToday(e, tomorrow);
    });

    // Show reminders
    if (todayReminders.length > 0) {
      showTodayReminders(todayReminders);
    }

    if (tomorrowReminders.length > 0) {
      showTomorrowReminders(tomorrowReminders);
    }
  };

  checkReminders();
}, [events]);
```

---

## **Cost Comparison**

| Solution        | Setup Cost | Monthly Cost | Reliability                 |
| --------------- | ---------- | ------------ | --------------------------- |
| In-App          | Free       | Free         | Low (user must visit)       |
| Browser Push    | Free       | Free         | Medium (requires device on) |
| Email           | $0-500     | $0-50        | High                        |
| SMS             | $0-500     | $50-500      | Very High                   |
| Calendar Export | Free       | Free         | Medium (manual)             |

---

## **My Recommendation**

**Start with:**

1. ✅ **In-App notifications** (implement today)
2. ✅ **Calendar export** (add .ics download button)

**Later add:** 3. ✅ **Browser Push** (when you make it a PWA) 4. ✅ **Email notifications** (when you add user accounts)

This gives users immediate value while building toward a more robust solution.

---

## **Next Steps**

Would you like me to implement:

1. **In-app reminder banner** (shows on app load)
2. **Calendar export** (.ics file download)
3. **Service worker setup** (for push notifications)
4. **Backend planning** (for email notifications)

Let me know which direction you'd like to go!
