# Whisk — Build & Setup Guide

> **Repository:** [github.com/SSinghNet/Whisk](https://github.com/SSinghNet/Whisk)  
> **Issue Tracking:** [github.com/SSinghNet/Whisk/issues](https://github.com/SSinghNet/Whisk/issues)

---

## Assumptions

Before you begin, make sure the following are in place:

- Building from source for **Android** on **Windows x64** or **macOS** (x64 or Apple Silicon)
- Android Emulator is installed and running
- `.env` files have been added for both the **frontend** and **backend** (provided separately)
- `adb` is installed and available on your system `PATH`

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/SSinghNet/Whisk.git
cd Whisk
```

---

## Step 2 — Backend

### 2.1 Install Bun

Bun is used to package the backend binary. Install it from [bun.com](https://bun.com/).

**macOS / Linux**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (PowerShell)**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### 2.2 Build the Backend

```bash
cd backend
```

Run the build script that matches your target system:

| Command | Target |
|---|---|
| `bun run build:macos-arm64` | macOS (Apple Silicon) |
| `bun run build:macos-x64` | macOS (Intel) |
| `bun run build:windows-x64` | Windows x64 |
| `bun run build:linux-x64` | Linux x64 |
| `bun run build:all` | All platforms |

### 2.3 Run the Backend Server

**macOS / Linux**
```bash
./whisk-backend-*
```

**Windows (PowerShell)**
```powershell
.\whisk-backend
```

The backend server will now be running locally.

---

## Step 3 — Frontend (Android)

### 3.1 Install EAS CLI

The frontend is built using [Expo Application Services (EAS)](https://docs.expo.dev/eas/cli/#installation).

```bash
npm install --global eas-cli
```

### 3.2 Create an Expo Account & Log In

1. Create a free account at [expo.dev](https://expo.dev)
2. Log in via the CLI:

```bash
eas login
```

> **Tip:** Use `eas login -b` to log in through the browser instead.

> **Important:** In your Expo project settings on the expo.dev dashboard, set these environment variables under the “Environment Variables” section (or in your EAS secrets) before building:
> - `EXPO_PUBLIC_SUPABASE_URL`
> - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 3.3 Build for Android

```bash
cd frontend
npm run build:android
```

Follow the on-screen prompts. The build will be queued on Expo's servers and takes a few minutes to complete.

> **Note:** `build:ios` and `build:all` scripts are available but require an Apple Developer account and are not covered here.

### 3.4 Install on the Android Emulator

Once the build completes, you have two options:

**Option A — Install directly via Expo (easiest)**  
When prompted by Expo CLI, choose to install and run the build in your emulator automatically.

**Option B — Manual APK install**
1. Navigate to your build on [expo.dev](https://expo.dev) and download the `.apk` file.
2. Install it using `adb`:

```bash
adb install -r [file].apk
```

---

## Summary

```
Whisk/
├── backend/     ← Express.js backend server 
└── frontend/    ← Expo / React Native app
```

| Step | Command |
|---|---|
| Clone repo | `git clone https://github.com/SSinghNet/Whisk.git` |
| Install Bun | `curl -fsSL https://bun.sh/install \| bash` |
| Build backend | `bun run build:<platform>` |
| Run backend | `./whisk-backend-*` |
| Install EAS CLI | `npm install --global eas-cli` |
| Build Android app | `npm run build:android` |
| Install APK | `adb install -r [file].apk` |