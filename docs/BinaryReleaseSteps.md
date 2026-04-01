# Whisk — Install from Release

> **Download:** [Whisk Beta Release](#) *(insert release link here)*  

---

## Assumptions

Before you begin, make sure the following are in place:

- Installing on **Android** on **Windows x64** or **macOS** (x64 or Apple Silicon)
- Android Emulator is installed and running
- `adb` is installed and available on your system `PATH`

---

## Step 1 — Download the Release Files

From the release page, download:

1. The **APK** file for Android
2. The **backend binary** for your platform:

| File | Platform |
|---|---|
| `whisk-backend-macos-arm64` | macOS (Apple Silicon) |
| `whisk-backend-macos-x64` | macOS (Intel) |
| `whisk-backend-windows-x64.exe` | Windows x64 |
| `whisk-backend-linux-x64` | Linux x64 |

---

## Step 2 — Install the App

Run the following command to install Whisk on your Android emulator:

```bash
adb install -r [apk-file].apk
```

---

## Step 3 — Run the Backend

**macOS / Linux**
```bash
./whisk-backend-*
```

**Windows (PowerShell)**
```powershell
.\whisk-backend-windows-x64.exe
```

---

## Step 4 — Launch Whisk

Open the Android emulator and launch the **Whisk** app. The app will connect to your locally running backend.