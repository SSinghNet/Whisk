# Whisk

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

## Bug Tracking

The project uses **GitHub Issues** for bug tracking, feature requests, and task management.

### Accessing the Issue Tracker

1. Navigate to the repository on GitHub
2. Click the **Issues** tab near the top of the page.

### Viewing Existing Bugs

- The Issues list shows all open and closed issues.
- Use the **Labels** filter to filter by `bug`, `feature`, etc.


