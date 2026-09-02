# 📱 How to Convert & Launch FLAMES to Google Play Store

This guide walks you step-by-step through converting your FLAMES web application into an Android App Bundle (`.aab`) and releasing it to the **Google Play Store**.

---

## 🚀 Recommended Conversion Pathways

There are two primary methods:
1. **Method 1: Capacitor (Recommended)** – Generates a full native Android project with splash screens, icons, offline storage, and full access to native Android APIs / AdMob / Google Play In-App Billing.
2. **Method 2: Bubblewrap (Google TWA)** – Google's official Trusted Web Activity tool that wraps your live GitHub Pages URL into a signed Play Store `.aab` in 1 command.

---

## 🛠️ Method 1: Using Capacitor (Full Native Android App)

### Step 1: Initialize Capacitor in your project
Make sure you have Node.js and npm installed. In your project directory:

```bash
cd "/Users/bharatashokchakra/Quick Game"

# Initialize npm package if not already done
npm init -y

# Install Capacitor core & CLI
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Step 2: Configure Capacitor
Initialize the Capacitor configuration:

```bash
npx cap init "FLAMES Couples Destiny" "com.flamesgame.app" --web-dir "."
```

This creates a `capacitor.config.json` file.

### Step 3: Add Android Platform
```bash
npx cap add android
```
This creates a complete `android/` directory containing the native Android Studio project.

### Step 4: Sync Web Code into Native Project
Whenever you modify your HTML, CSS, or JS files:
```bash
npx cap sync
```

### Step 5: Open in Android Studio & Build APK/AAB
```bash
npx cap open android
```
This opens **Android Studio**. From Android Studio:
1. Go to **Build** > **Generate Signed Bundle / APK**.
2. Select **Android App Bundle (.aab)**.
3. Choose or create a **Keystore** (signing key).
4. Select **Release** build variant.
5. Click **Finish**. Android Studio outputs your production `app-release.aab` file!

---

## 🌐 Method 2: Using Bubblewrap (Google's Official TWA Tool)

Since your project is already deployed live on GitHub Pages at:
`https://chakrabharatashok-maker.github.io/flames-game/`

You can use Google's official CLI tool `@bubblewrap/cli`:

```bash
# 1. Install Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Initialize from your live PWA manifest
bubblewrap init --manifest=https://chakrabharatashok-maker.github.io/flames-game/manifest.json

# 3. Build your signed Android App Bundle (.aab)
bubblewrap build
```

This generates `app-release-signed.aab` ready for immediate upload to Google Play Console.

---

## 📋 Google Play Console Submission Checklist

### 1. Google Play Developer Account
- Go to [play.google.com/console](https://play.google.com/console) and create a developer account ($25 one-time registration fee).

### 2. Create New App
- **App Name**: `FLAMES - Couples Destiny Game`
- **Default Language**: English (United States)
- **App or Game**: Game (or Lifestyle / Entertainment)
- **Free or Paid**: Free

### 3. Store Listing Assets
Prepare the following graphic assets:
- **App Icon**: 512x512 PNG (Use [`icon-512.png`](file:///Users/bharatashokchakra/Quick%20Game/icon-512.png))
- **Feature Graphic**: 1024x500 PNG/JPEG (Banner showing romantic theme + "FLAMES Couple Destiny Game")
- **Phone Screenshots**: At least 2 screenshots (min 320px, max 3840px). Take screenshots of:
  1. Main Couple Name Input & Theme Selector
  2. Animated Cross-Out & FLAMES Board Arena
  3. Result Card & Compatibility Radar
  4. Fate Spinner Wheel Mini-Game

### 4. App Content & Policies
- **Privacy Policy URL**: You can host a free privacy policy markdown page on your GitHub repo (e.g. `https://chakrabharatashok-maker.github.io/flames-game/privacy.html`).
- **Target Audience**: 13+ / All Ages.
- **Content Rating**: Complete the IARC questionnaire (FLAMES is safe for all audiences, violence: None, explicit: None).

### 5. Upload Release & Launch
1. Go to **Release** > **Production** (or **Closed Testing** for initial testing).
2. Upload your `app-release.aab`.
3. Fill in release notes: `Initial release of FLAMES Couples Destiny Game! Enjoy animated couple predictions, horoscope, and date night mini-games.`
4. Click **Review Release** and **Start rollout to Production**!

---

## ✨ Features Already Prepared for Play Store in this Codebase:
- ✅ Full `manifest.json` with standalone mode and theme colors.
- ✅ Offline Service Worker (`sw.js`) for instant caching.
- ✅ High-res 192x192 and 512x512 adaptive app icons.
- ✅ Touch & mobile-optimized responsive layout (disable double-tap zoom, responsive viewport).
- ✅ Google & Email sign-in gate before revealing results.
