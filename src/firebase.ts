import { initializeApp } from "firebase/app";
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your web app's Firebase configuration
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

// Initialize Auth immediately
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
const googleProvider = new GoogleAuthProvider();

// Initialize App Check
const initAppCheck = () => {
    try {
        if (import.meta.env.DEV) {
            // @ts-ignore
            self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
            if (import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN) {
                console.log('🔧 App Check debug mode enabled');
            }
        }

        const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
        if (recaptchaSiteKey) {
            const appCheckInstance = initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider(recaptchaSiteKey),
                isTokenAutoRefreshEnabled: true
            });
            console.log('✅ Firebase App Check initialized');

            // Diagnostics
            import('firebase/app-check').then(({ onTokenChanged }) => {
                onTokenChanged(appCheckInstance, (tokenResult) => {
                    if (tokenResult.token) {
                        console.log('🔄 App Check token refreshed:', tokenResult.token.substring(0, 10) + '...');
                    }
                });
            });
        }
    } catch (e) {
        console.error('❌ App Check init failed:', e);
    }
};

initAppCheck();

// Initialize Firestore
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

// Analytics (Safe Init)
const initAnalytics = async () => {
    try {
        const { isSupported, getAnalytics } = await import("firebase/analytics");
        if (await isSupported()) getAnalytics(app);
    } catch (e) { }
};
initAnalytics();

export { db, auth, googleProvider };
