import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Register service worker with self-healing check if an external cleaner (e.g. Glary Utilities)
// wiped CacheStorage while leaving the service worker registration active.
registerSW({
  immediate: true,
  async onRegisteredSW(swUrl, registration) {
    if (!registration || !navigator.onLine || !("caches" in window)) return;

    const verifyPrecache = async () => {
      try {
        const cacheNames = await caches.keys();
        const precacheName = cacheNames.find((name) => name.includes("workbox-precache"));
        if (!precacheName) {
          return false;
        }
        const cache = await caches.open(precacheName);
        const keys = await cache.keys();
        return keys.length > 0;
      } catch {
        return true;
      }
    };

    // Only check once the service worker has finished activating
    if (registration.active && !registration.installing && !registration.waiting) {
      const hasPrecache = await verifyPrecache();
      if (!hasPrecache) {
        console.warn(
          "⚠️ Service Worker precache was cleared externally. Re-installing Service Worker...",
        );
        await registration.unregister();
        await navigator.serviceWorker.register(swUrl, { scope: registration.scope });
      }
    }
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
