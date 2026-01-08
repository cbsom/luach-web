# Deployment Guide for Luach-Web

## Quick Deploy

### Deploy Everything (Hosting + Functions)

```bash
npm run deploy:all
```

### Deploy Only Hosting

```bash
npm run deploy:hosting
```

### Deploy Only Functions

```bash
npm run deploy:functions
```

## Environment Variables & Deployment

### How It Works:

1. **Local Development:**

   - `.env` file contains `VITE_RECAPTCHA_SITE_KEY`
   - Vite reads it and makes it available as `import.meta.env.VITE_RECAPTCHA_SITE_KEY`
   - Hot-reloads when you change the `.env` file

2. **Build Process:**

   - `npm run build` compiles TypeScript and bundles with Vite
   - Vite **replaces** all `import.meta.env.VITE_RECAPTCHA_SITE_KEY` with the actual value
   - The value gets **embedded** in your JavaScript files in the `dist` folder
   - The `.env` file itself is **NOT** copied to `dist`

3. **Deployment:**
   - `npm run deploy:hosting` now automatically runs `npm run build` first
   - Firebase CLI uploads the `dist` folder to Firebase Hosting
   - Your site key is already baked into the JavaScript - no `.env` needed on the server

### Important Notes:

✅ **The `.env` file stays local** - It's in `.gitignore` and never gets committed or deployed

✅ **The site key gets embedded** - It's compiled into your JavaScript bundle during build

✅ **This is safe** - The site key is meant to be public (it's a reCAPTCHA **site** key, not a secret)

❌ **Don't commit `.env`** - Keep it local only. Use `.env.example` for documentation

## Pre-Deployment Checklist:

Before running `npm run deploy:hosting`, ensure:

- [ ] `.env` file exists in the project root
- [ ] `VITE_RECAPTCHA_SITE_KEY` is set in `.env`
- [ ] You've tested locally with `npm run dev`
- [ ] You see `✅ Firebase App Check initialized` in browser console
- [ ] All tests pass (if applicable)

## Deployment Steps:

### First Time Setup:

```bash
# 1. Ensure .env exists
cp .env.example .env

# 2. Add your reCAPTCHA site key to .env
# Edit .env and set VITE_RECAPTCHA_SITE_KEY=your_actual_key

# 3. Test locally
npm run dev
# Open browser, check console for "✅ Firebase App Check initialized"

# 4. Deploy
npm run deploy:hosting
```

### Regular Deployments:

```bash
# Just run the deploy command - it will build automatically
npm run deploy:hosting
```

## Verifying Deployment:

After deployment:

1. Visit your production site: `https://luach-web.web.app`
2. Open browser console (F12)
3. Look for: `✅ Firebase App Check initialized`
4. Check Firebase Console → App Check → Metrics for verification attempts

## Troubleshooting:

### "App Check not initialized" in production

- **Cause:** `.env` file was missing during build
- **Fix:** Ensure `.env` exists, then rebuild and redeploy:
  ```bash
  npm run deploy:hosting
  ```

### Site key showing as "undefined" in console

- **Cause:** Environment variable not set during build
- **Fix:** Check that `.env` has `VITE_RECAPTCHA_SITE_KEY=...` and rebuild

### Different environments (staging vs production)

If you need different keys for different environments:

```bash
# Create environment-specific files
.env.development  # Used by default in dev
.env.production   # Used during build

# Or use command line:
VITE_RECAPTCHA_SITE_KEY=your_key npm run build
```

## CI/CD Integration (Future)

If you set up GitHub Actions or similar:

```yaml
# Example GitHub Actions workflow
- name: Build and Deploy
  env:
    VITE_RECAPTCHA_SITE_KEY: ${{ secrets.RECAPTCHA_SITE_KEY }}
  run: |
    npm run build
    npm run deploy:hosting
```

Store `RECAPTCHA_SITE_KEY` in GitHub Secrets.

## Summary:

- ✅ `.env` file is **local only** (gitignored)
- ✅ Site key gets **embedded during build**
- ✅ `npm run deploy:hosting` **automatically builds first**
- ✅ No need to manually manage environment variables on the server
- ✅ Safe to have the site key in your JavaScript (it's meant to be public)
