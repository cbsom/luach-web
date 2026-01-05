import { initializeApp } from "firebase/app";

import {
    getFirestore,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDa7LHhl6ncVqLdIJEokyeq3JCQwihL-aA",
    authDomain: "luach-web.firebaseapp.com",
    projectId: "luach-web",
    storageBucket: "luach-web.firebasestorage.app",
    messagingSenderId: "265711408278",
    appId: "1:265711408278:web:f32215478c1e2277581eb7",
    measurementId: "G-BWPEBF9H8S"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally
// It often fails in local dev, private modes, or if the library fails to load
const initAnalytics = async () => {
    try {
        const { isSupported, getAnalytics } = await import("firebase/analytics");
        const supported = await isSupported();
        if (supported) {
            return getAnalytics(app);
        }
    } catch (e) {
        // Silently fail - analytics isn't critical
    }
};

initAnalytics();

// Initialize Firestore with persistent cache enabled (Offline Support)
// This replacement for getFirestore() sets up IndexedDB persistence automatically
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

// Initialize Auth with persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
