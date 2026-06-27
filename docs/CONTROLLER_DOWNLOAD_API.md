# Controller App — Download API Structure

**Production base URL:** `https://api.shikkhasomoy.com`  
**Swagger:** `https://api.shikkhasomoy.com/api-docs`

**Auth header (all protected routes):**
```
Authorization: Bearer <JWT>
```

---

## Login

```
POST /api/auth/login
Content-Type: application/json

Body:
  username      (required)
  password      (required)
  device_id     (optional)

Response:
  token
  username
```

---

# SECTION 1 — DOWNLOAD BELL

## 1.1 Bell sounds (audio library)

| Step | Method | Path | Purpose |
|------|--------|------|---------|
| 1 | GET | `/api/sounds/bell/version` | Check if library changed; get file list + URLs |
| 2 | GET | `/api/sounds/bell` | Full bell sound list |
| 3 | GET | `{url}` or `/uploads/{filename}` | Download audio file (no auth) |
| 4 | POST | `/api/sounds/bell/upload` | Upload bell file (optional; multipart field `sound`) |

**Version response shape:**
- type: `bell`
- version: number (max sound id)
- files[]: name, url, checksum, size_bytes, type

**List item shape:**
- id, name, filename, url, size_bytes, type, created_at

**Allowed upload:** .mp3, .wav, .ogg (max 20 MB)

---

## 1.2 Bell schedules (default templates + user schedules)

| Step | Method | Path | Purpose |
|------|--------|------|---------|
| 1 | GET | `/api/schedules/templates` | Admin default schedule list (global) |
| 2 | POST | `/api/schedules/import-templates` | Copy enabled templates into logged-in user |
| 3 | GET | `/api/schedules/all` | User schedules (including disabled) |
| 4 | GET | `/api/schedules` | User schedules (enabled only) |
| 5 | GET | `/api/schedules/version` | Poll for schedule changes |
| 6 | POST | `/api/schedules` | Create user's own schedule |
| 7 | PUT | `/api/schedules/{id}` | Update user's schedule |
| 8 | DELETE | `/api/schedules/{id}` | Delete user's schedule |

**Template / schedule fields:**
- id
- label
- hour (0–23)
- minute (0–59)
- days (bitmask: Mon=1, Tue=2, Wed=4, Thu=8, Fri=16, Sat=32, Sun=64)
- sound_file (filename from bell sounds — must be downloaded first)
- is_enabled
- routine_type (e.g. SCHOOL)

**import-templates response:**
- message
- imported (count added)
- total (templates available)

**schedules/version response:**
- version (string token — compare with saved local value)

---

## 1.3 Bell section — recommended flow

```
Login
  → GET /api/sounds/bell/version
  → Download new files from files[].url
  → GET /api/schedules/templates (show user "default schedules")
  → POST /api/schedules/import-templates (user confirms)
  → GET /api/schedules/all (save locally)
  → Poll: GET /api/sounds/bell/version + GET /api/schedules/version
```

---

# SECTION 2 — DOWNLOAD AZAN

## 2.1 Azan sounds (audio library)

| Step | Method | Path | Purpose |
|------|--------|------|---------|
| 1 | GET | `/api/sounds/azan/version` | Check if library changed; get file list + URLs |
| 2 | GET | `/api/sounds/azan` | Full azan sound list |
| 3 | GET | `{url}` or `/uploads/{filename}` | Download audio file (no auth) |
| 4 | POST | `/api/sounds/azan/upload` | Upload azan file (optional; multipart field `sound`) |

**Version response shape:**
- type: `azan`
- version: number
- files[]: name, url, checksum, size_bytes, type

**List item shape:** same as bell; type = `azan`

---

## 2.2 Azan prayer times (NOT sounds — separate API)

| Step | Method | Path | Purpose |
|------|--------|------|---------|
| 1 | GET | `/api/azan/version` | Poll if prayer times changed |
| 2 | GET | `/api/azan?date=YYYY-MM-DD` | Prayer times for one day (default: today) |
| 3 | GET | `/api/azan/range?from=YYYY-MM-DD&to=YYYY-MM-DD` | Prayer times for date range (~30 days) |

**Azan time item shape:**
- prayer_name (Fajr, Dhuhr, Asr, Maghrib, Isha)
- hour
- minute
- is_enabled
- sound_file (filename — match with downloaded azan sounds)
- date

---

## 2.3 Azan section — recommended flow

```
Login
  → GET /api/sounds/azan/version
  → Download new azan audio files
  → GET /api/azan/version (or GET /api/azan/range)
  → Save prayer times locally
  → Match each prayer's sound_file to local azan cache
  → Poll: GET /api/sounds/azan/version + GET /api/azan/version (separately)
```

---

# QUICK REFERENCE

| Feature | Version (poll) | List | Download file | Apply / import |
|---------|----------------|------|---------------|----------------|
| Bell sounds | GET `/api/sounds/bell/version` | GET `/api/sounds/bell` | GET url | — |
| Bell default schedules | — | GET `/api/schedules/templates` | — | POST `/api/schedules/import-templates` |
| User bell schedules | GET `/api/schedules/version` | GET `/api/schedules/all` | — | CRUD `/api/schedules` |
| Azan sounds | GET `/api/sounds/azan/version` | GET `/api/sounds/azan` | GET url | — |
| Azan prayer times | GET `/api/azan/version` | GET `/api/azan` or `/api/azan/range` | — | set in app |

---

# IMPORTANT NOTES

1. Bell sound version and azan sound version are **independent** — poll both.
2. `sound_file` in schedules and azan times = **filename** from the sounds API (not display name).
3. There is **no** `GET /api/schedules/{id}` for single schedule details — use list and filter by id.
4. There is **no** `GET /api/schedules/templates/{id}` — use templates list.
5. User role in database is `user` (not `device`).
6. Sound URLs should be **https://** in production.
7. Static files: `https://api.shikkhasomoy.com/uploads/{filename}`

---

# ERRORS

| HTTP | Meaning |
|------|---------|
| 401 | Missing or invalid JWT |
| 403 | Admin-only route |
| 400 | Bad request (validation) |
| 404 | Not found |
| 500 | Server error — body: `{ "error": "message" }` |
