# School Bell — Project Summary

## What We Built

This project has 3 parts:
1. **Android App** (`school_bell`) — plays bells & azan on schedule
2. **Backend Server** (`school_bell_server`) — Node.js REST API
3. **Admin Panel** (`school_bell_admin`) — React web dashboard

---

## 1. Android App — Key Changes

### MainActivity
- Auto-fetch location when permission is granted (no user tap needed)
- Replaced deprecated `onBackPressed()` with `OnBackPressedDispatcher`

### AzanViewModel
- Added `prefsLoaded` flag — waits for DataStore before fetching location
- GPS check before fetch — shows inline banner if GPS is off
- `checkAndFetchIfNeeded(context)` — called on every screen resume, auto-fetches if no location saved
- Reverse geocoding — shows city/district name from GPS coordinates
- `dismissGpsDialog()` function

### AzanScreen
- Removed manual "Get Location" and "Recalculate" buttons
- Added inline status banners for permission/GPS warnings
- `LaunchedEffect(prefsLoaded)` — auto-fetch on first screen open
- `DisposableEffect` with `ON_RESUME` — auto-fetch when returning from GPS settings
- GPS Coordinates card shows city name + "Moved to a new city? Update" button

### DashboardViewModel
- Added `nextBellTargetMs` (exact epoch ms) to avoid cross-day bell time bugs
- Fixed "Now!" showing after stop sound — now shows next bell correctly
- Fixed `bellPlayingReceiver` missing `RECEIVER_NOT_EXPORTED` flag

### DashboardScreen
- Bell card countdown uses `nextBellTargetMs` (not hour/minute recalculation)
- After stop sound → shows next bell info (today or next day)

### SettingsViewModel & AnnouncementViewModel
- Fixed `bellPlayingReceiver` / `announcementReceiver` missing `RECEIVER_NOT_EXPORTED` flag

---

## 2. Backend Server — `school_bell_server`

**Tech Stack:** Node.js + Express + MySQL + JWT

### Setup
```
cd school_bell_server
npm install
# Configure .env (see below)
npm run dev
```

### .env
```
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=school_bell
JWT_SECRET=school_bell_secret_2024
UPLOAD_DIR=uploads
```

### Database
- Run `database.sql` in phpMyAdmin (XAMPP)
- Default admin: `admin` / `admin123`

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Device login |
| POST | `/api/auth/admin/login` | — | Admin login |
| POST | `/api/device/heartbeat` | Device | Send battery/status |
| GET | `/api/schedules` | Device | Get enabled schedules |
| GET | `/api/schedules/all` | Admin | Get all schedules |
| POST | `/api/schedules` | Admin | Create schedule |
| PUT | `/api/schedules/:id` | Admin | Update schedule |
| DELETE | `/api/schedules/:id` | Admin | Delete schedule |
| GET | `/api/sounds` | Admin | List sounds |
| GET | `/api/sounds/version` | Device | Sound version + file list |
| POST | `/api/sounds/upload` | Admin | Upload sound file |
| DELETE | `/api/sounds/:id` | Admin | Delete sound |
| GET | `/api/announcements/latest` | Device | Latest announcement |
| GET | `/api/announcements` | Device | Announcement list |
| GET | `/api/announcements/admin/all` | Admin | All announcements |
| POST | `/api/announcements` | Admin | Create announcement |
| DELETE | `/api/announcements/:id` | Admin | Delete announcement |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/devices` | Admin | All devices |
| GET | `/api/admin/users` | Admin | All users |
| POST | `/api/admin/users` | Admin | Create user |
| PUT | `/api/admin/users/:id` | Admin | Update user |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |

### Swagger UI
Open: `http://localhost:8080/api-docs`

### Files
```
src/
├── index.js          — Express app entry point
├── db.js             — MySQL connection pool
├── swagger.js        — OpenAPI 3.0 spec
├── middleware/
│   └── auth.js       — JWT auth + admin guard
└── routes/
    ├── auth.js       — Login routes
    ├── device.js     — Heartbeat
    ├── schedules.js  — Bell schedule CRUD
    ├── sounds.js     — Sound upload/list/delete
    ├── announcements.js
    └── admin.js      — Stats, devices, users CRUD
```

---

## 3. Admin Panel — `school_bell_admin`

**Tech Stack:** React + Vite + Tailwind CSS + Axios

### Setup
```
cd school_bell_admin
npm install
npm run dev
# Opens at http://localhost:5173
```

### Login
- URL: `http://localhost:5173`
- Username: `admin`
- Password: `admin123`

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Admin login form |
| Dashboard | `/dashboard` | Stats cards + device table, auto-refresh 30s |
| Devices | `/devices` | Device cards with battery bar, auto-refresh 15s |
| Schedules | `/schedules` | Bell schedule CRUD with day bitmask toggles |
| Sounds | `/sounds` | Upload/preview/delete audio files |
| Announcements | `/announcements` | Send announcements + history |
| Users | `/users` | Create/edit/delete admin & device accounts |

### Responsive Design
- **Mobile** — hamburger menu drawer, card layouts, bottom sheet modals
- **Tablet** — 2-column grid
- **Desktop** — full sidebar, table layouts, 3-column grid

### Files
```
src/
├── App.jsx           — Router + PrivateRoute
├── api.js            — Axios with JWT interceptor + 401 redirect
├── components/
│   └── Layout.jsx    — Responsive sidebar + mobile topbar
└── pages/
    ├── Login.jsx
    ├── Dashboard.jsx
    ├── Devices.jsx
    ├── Schedules.jsx
    ├── Sounds.jsx
    ├── Announcements.jsx
    └── Users.jsx
```

---

## How Everything Connects

```
Android App  ──────────►  Backend API (port 8080)  ◄──────────  Admin Panel (port 5173)
   (device)               MySQL Database (XAMPP)                  (web browser)
```

1. Android app logs in → gets JWT token
2. App sends heartbeat every few minutes (battery, status)
3. App fetches schedules + sounds from server
4. Admin creates schedules/sounds via web panel
5. Admin sends announcements → app receives on next poll
