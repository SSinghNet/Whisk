# Whisk
# Running Whisk (Production)

This guide walks you through everything you need to get the Whisk app running on your local machine.

---

## 1. Prerequisites

Before you begin, make sure you have the following installed:

### Node.js
Whisk's frontend tooling requires **Node.js v25.7.0 or higher**.

1. Visit [https://nodejs.org/](https://nodejs.org/) and download the latest version
2. Run the installer and follow the on-screen instructions
3. Once installed, open a terminal and verify your version:
```bash
node --version   # should output v25.x.x or higher
```
If the version shown is lower than `v25.7.0`, please update Node.js before continuing.

---

## 2. Clone the Repository

Open a terminal and run the following commands to download the project to your machine:
```bash
git clone https://github.com/SSinghNet/Whisk.git
cd Whisk
```

This will create a `Whisk/` folder in your current directory and navigate into it.

---

## 3. Install Frontend Dependencies

Navigate into the `frontend/` directory and install the required packages:
```bash
cd frontend
npm install
```

This will download all dependencies listed in `package.json` into a local `node_modules/` folder. This may take a minute — wait until the terminal returns to a prompt before continuing.

---

## 4. Set Up an Emulator

The app runs on iOS or Android. You must have an emulator (or physical device) ready **before** starting the app.

### iOS (Mac only)
1. Install **Xcode** from the [Mac App Store](https://apps.apple.com/us/app/xcode/id497799835)
2. Open Xcode → go to **Settings → Platforms** and download an iOS Simulator runtime
3. Open the simulator by going to **Xcode → Open Developer Tool → Simulator**, or run:
```bash
open -a Simulator
```
4. Wait for the simulator to fully boot (you should see a home screen) before proceeding

### Android (Mac, Windows, or Linux)
1. Install **Android Studio** from [https://developer.android.com/studio](https://developer.android.com/studio)
2. During setup, ensure **Android Virtual Device (AVD)** is selected for installation
3. Open Android Studio → click **More Actions → Virtual Device Manager**
4. Select an existing device and click the **▶ Play** button to launch it, or create a new one via **Create Device**
5. Wait for the emulator to fully boot (you should see a home screen) before proceeding

> ⚠️ The emulator must be fully booted and showing a home screen before you run the app. Starting the app before the emulator is ready is the most common cause of launch failures.

---

## 5. Run the App

From the `frontend/` directory, run the command that matches your emulator:

### iOS
```bash
npm run prod:ios
```

### Android
```bash
npm run prod:android
```

Expo will bundle the app and launch it directly in your running emulator. The first build may take 1–2 minutes. Once complete, the Whisk app will open automatically on the emulator screen.

> **Note:** The backend API is already hosted and running — you do not need to set up or start the backend yourself. Simply running the frontend is enough to use the full app.

## Source Control & Build Process

### Repository Access

Clone the repository:

```bash
git clone https://github.com/SSinghNet/Whisk.git
cd Whisk 
```

### Prerequisites

- **Node.js** `^v25.7.0` — [Download here](https://nodejs.org/)
- For mobile app: [Expo Go](https://expo.dev/client) installed on your device, or an iOS/Android simulator

Verify your Node version:

```bash
node --version   # should output at least v25.x.x
```

---

### Project Structure

```
/
├── frontend/   # React Native Expo app
└── backend/    # Express.js API server
```

---

### Backend (Express.js)

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm i
```

Start the server:

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run start
```

---

### Frontend (React Native / Expo)

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm i
```

Run the app:

```bash
# iOS simulator
npm run ios

# Android emulator
npm run android

# Expo dev server (scan QR code with Expo Go)
npx expo start
```
---

## Data Storage & Access

Whisk uses a **PostgreSQL database hosted on Supabase** (cloud-managed, always-on). No local database setup is required.

- **Host:** `aws-1-us-east-1.pooler.supabase.com`
- **Port:** `5432`
- **Database:** `postgres`

### Option 1 — psql (command line)

```bash
psql "postgresql://postgres.ysdqwrnzxumfrkkcczyi:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

Once connected, run this query to see all recipes and their ingredients:

```sql
SELECT r.title, i.name, ri.amount, ri.unit
FROM recipe r
JOIN recipe_ingredient ri ON r.recipe_id = ri.recipe_id
JOIN ingredient i ON ri.ingredient_id = i.ingredient_id;
```

> The database password is provided separately and is not stored in the repository.

### Option 2 — Any PostgreSQL GUI (TablePlus, DBeaver, pgAdmin)

Use the following connection details:

| Field    | Value                                                   |
|----------|---------------------------------------------------------|
| Host     | `aws-1-us-east-1.pooler.supabase.com`                  |
| Port     | `5432`                                                  |
| Database | `postgres`                                              |
| Username | `postgres.ysdqwrnzxumfrkkcczyi`                        |
| Password | *(provided separately)*                                 |
| SSL      | Required                                                |

---

## Bug Tracking

The project uses **GitHub Issues** for bug tracking, feature requests, and task management.

### Accessing the Issue Tracker

1. Navigate to the repository on GitHub
2. Click the **Issues** tab near the top of the page.

### Viewing Existing Bugs

- The Issues list shows all open and closed issues.
- Use the **Labels** filter to filter by `bug`, `feature`, etc.


