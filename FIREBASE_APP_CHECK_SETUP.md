# Firebase App Check Setup Guide

This guide will walk you through setting up Firebase App Check with reCAPTCHA v3 for the Luach-Web application.

## Why App Check?

App Check protects your Firebase resources (Firestore, Cloud Functions) from abuse by:

- Preventing unauthorized access from bots and scrapers
- Protecting against API quota abuse
- Securing user data and personal events
- Ensuring only legitimate requests from your app reach Firebase

## Setup Steps

### 1. Register Your App with reCAPTCHA v3

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your `luach-web` project
3. Navigate to **App Check** in the left sidebar
4. Click **Get started** (if first time) or **Apps** tab
5. Find your web app and click **Register**
6. Select **reCAPTCHA v3** as the provider
7. Firebase will automatically create a reCAPTCHA v3 site key for you
8. Copy the **Site Key** that appears

### 2. Add the Site Key to Your Environment

1. Create a `.env` file in the root of your project (if it doesn't exist):

   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your reCAPTCHA site key:

   ```
   VITE_RECAPTCHA_SITE_KEY=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

   (Replace with your actual site key from step 1)

3. **Important**: Never commit the `.env` file to git (it's already in `.gitignore`)

### 3. Enable App Check for Firebase Services

Back in the Firebase Console:

#### For Firestore:

1. Go to **Firestore Database** in Firebase Console
2. Click the **Rules** tab
3. Update your rules to enforce App Check (recommended for production):

**Option A: Enforce App Check (Recommended for Production)**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Everything related to a specific user
    match /users/{userId} {
      // Allow user to manage their own base document
      // Requires both authentication AND App Check
      allow read, write: if request.auth != null
                          && request.auth.uid == userId
                          && request.app.check.valid;

      // Access to their personal events
      match /events/{eventId} {
        allow read, write: if request.auth != null
                          && request.auth.uid == userId
                          && request.app.check.valid;
      }

      // Access to their app settings
      match /settings/{docId} {
        allow read, write: if request.auth != null
                          && request.auth.uid == userId
                          && request.app.check.valid;
      }
    }

    // Allow any logged-in user to queue a reminder email
    // Also require App Check to prevent spam
    match /mail/{docId} {
      allow create: if request.auth != null && request.app.check.valid;
      allow read: if false;
    }

    // Explicitly deny anything else by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Option B: Gradual Rollout (Start Here)**
If you want to monitor App Check without blocking users initially, use this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Everything related to a specific user
    match /users/{userId} {
      // Allow user to manage their own base document
      // Log App Check status but don't enforce yet
      allow read, write: if request.auth != null
                          && request.auth.uid == userId;
      // Note: Add "&& request.app.check.valid" once you verify App Check is working

      // Access to their personal events
      match /events/{eventId} {
        allow read, write: if request.auth != null
                          && request.auth.uid == userId;
      }

      // Access to their app settings
      match /settings/{docId} {
        allow read, write: if request.auth != null
                          && request.auth.uid == userId;
      }
    }

    // Allow any logged-in user to queue a reminder email
    match /mail/{docId} {
      allow create: if request.auth != null;
      allow read: if false;
    }

    // Explicitly deny anything else by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Recommendation:** Start with Option B (your current rules), verify App Check is working in the console logs, then upgrade to Option A after a few days of testing.

#### For Cloud Functions:

Your Cloud Functions will automatically be protected once App Check is initialized in the client.

### 4. Test the Implementation

1. Restart your dev server:

   ```bash
   npm run dev
   ```

2. Open the browser console and look for:

   ```
   ✅ Firebase App Check initialized
   ```

3. If you see a warning instead:
   ```
   ⚠️ App Check not initialized: Missing reCAPTCHA site key
   ```
   Double-check that your `.env` file exists and has the correct key.

### 5. Deploy to Production

When deploying to Firebase Hosting:

1. Add the environment variable to your hosting configuration or build process
2. For Firebase Hosting, you can use Firebase environment configuration:

   ```bash
   firebase functions:config:set recaptcha.site_key="YOUR_KEY_HERE"
   ```

3. Or set it in your CI/CD pipeline (GitHub Actions, etc.)

## Monitoring

Once enabled, you can monitor App Check metrics in the Firebase Console:

- Go to **App Check** > **Metrics**
- View verification attempts, success rates, and potential abuse

## Troubleshooting

### "App Check token is invalid" errors

- Make sure your domain is registered in Firebase Console > App Check
- Verify the site key is correct in your `.env` file
- Check that the app is properly registered in Firebase Console

### reCAPTCHA not loading

- Check browser console for errors
- Ensure you're not blocking third-party scripts
- Try in incognito mode to rule out extensions

### Development vs Production

- The same reCAPTCHA key works for both localhost and production
- Firebase automatically whitelists localhost for development

## Free Tier Limits

- reCAPTCHA Enterprise: 10,000 verifications/month (free)
- After that: $1 per 1,000 verifications
- For most personal apps, you'll stay within the free tier

## Additional Resources

- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
