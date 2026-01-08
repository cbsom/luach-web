import { initializeApp } from "firebase/app";

import {
    getFirestore,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

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

// Initialize App Check with reCAPTCHA v3
// IMPORTANT: Replace 'YOUR_RECAPTCHA_V3_SITE_KEY' with your actual reCAPTCHA v3 site key
// To get a site key:
// 1. Go to Firebase Console > App Check
// 2. Register your app with reCAPTCHA v3
// 3. Copy the site key and replace it below
const initAppCheck = async () => {
    try {
        // Enable debug token in development
        if (import.meta.env.DEV && !!import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN) {
            // @ts-ignore
            self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
            console.log('🔧 App Check debug mode enabled for local development');
        }

        // Only initialize in production or if you have a valid reCAPTCHA key
        const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

        if (recaptchaSiteKey) {
            const appCheckInstance = initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider(recaptchaSiteKey),
                isTokenAutoRefreshEnabled: true // Automatically refresh tokens
            });
            console.log('✅ Firebase App Check initialized');
        } else {
            console.warn('⚠️ App Check not initialized: Missing reCAPTCHA site key');
            console.warn('Set VITE_RECAPTCHA_SITE_KEY in your .env file');
        }
    } catch (error: any) {
        console.error('❌ App Check initialization failed:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
    }
};

initAppCheck();

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
