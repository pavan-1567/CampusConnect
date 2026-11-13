# CampusConnect – REST API Reference Documentation

**Base URL:** `/api/v1`  
**Standard Response Formats:**
- **Success:** `{ "success": true, "message": "...", "data": { ... } }`
- **Error:** `{ "success": false, "message": "...", "errors": [ ... ] }`

---

## 1. Authentication Endpoints (`/api/v1/auth`)

### `POST /auth/register`
Register a new student account. Automatically cross-references `CollegeRoster`.
- **Access:** Public
- **Body:**
  ```json
  {
    "collegeId": "CS2023001",
    "name": "John Doe",
    "email": "john.doe@campusconnect.edu",
    "phone": "+1 555-0101",
    "department": "Computer Science & Engineering",
    "academicYear": "3rd Year",
    "password": "Password@123",
    "confirmPassword": "Password@123"
  }
  ```
- **Response (201):** Returns user profile and sets HttpOnly JWT cookie.

### `POST /auth/login`
Authenticate either student or administrative user.
- **Access:** Public
- **Body:**
  ```json
  {
    "collegeId": "CS2023001",
    "password": "Password@123"
  }
  ```
- **Response (200):** Sets HttpOnly JWT cookie and returns user object.

### `POST /auth/logout`
Clears session cookie and invalidates client credentials.
- **Access:** Private

### `GET /auth/me`
Retrieves current authenticated user profile.
- **Access:** Private

### `PATCH /auth/change-password`
Changes current account password.
- **Access:** Private

---

## 2. Student & Profile Endpoints (`/api/v1/users`)

### `GET /users/dashboard`
Returns personal dashboard metrics, activity history, and unread notification counts.
- **Access:** Private (Student)

### `PATCH /users/profile`
Updates permitted profile attributes (`name`, `phone`, `department`, `academicYear`).
- **Access:** Private (Student)

---

## 3. Lost Items Endpoints (`/api/v1/lost-items`)

### `POST /lost-items`
Submit a new lost item report.
- **Access:** Private (Student)
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `itemName`, `category`, `description`, `lastSeenLocation`, `lostDate`, `lostTime`, `identifyingDetails`, `contactNumber`, `image` (file).

### `GET /lost-items`
Public browse search with server-side filtering, sorting, and pagination.
- **Access:** Public / Authenticated
- **Query Params:** `page`, `limit`, `search`, `category`, `location`, `status`, `startDate`, `endDate`.
- **Note:** Private identifying details and contact numbers are excluded.

### `GET /lost-items/my`
Returns all lost reports submitted by logged-in student, including response counts.
- **Access:** Private (Student)

### `GET /lost-items/:id`
Retrieves single lost report details. Private details included only if requester is owner or admin.
- **Access:** Public / Authenticated

### `PATCH /lost-items/:id`
Update an eligible lost item report (status `OPEN` or `UNDER_REVIEW`).
- **Access:** Private (Owner)

### `PATCH /lost-items/:id/cancel`
Cancel an eligible lost item report (sets status to `CLOSED`).
- **Access:** Private (Owner)

---

## 4. Found Items Endpoints (`/api/v1/found-items`)

### `POST /found-items`
Submit a report for an item found on campus.
- **Access:** Private (Student)
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `itemName`, `category`, `description`, `foundLocation`, `foundDate`, `foundTime`, `privateObservations`, `possessionStatus`, `image` (file).

### `GET /found-items`
Public browse of found items with pagination and filters.
- **Access:** Public / Authenticated

### `GET /found-items/my`
Returns all found items reported by the logged-in student.
- **Access:** Private (Student)

### `GET /found-items/:id`
Single found item view. Private observations masked for non-finders/non-admins.
- **Access:** Public / Authenticated

---

## 5. Responses Endpoints (`/api/v1/responses`)

### `POST /responses`
Respond to a lost item request, with option to link an existing found report.
- **Access:** Private (Student)
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `lostItemId`, `foundItemId` (optional), `message`, `description`, `foundLocation`, `foundDate`, `evidenceImage` (file).

### `GET /responses/my`
Retrieves all responses submitted by logged-in student.
- **Access:** Private (Student)

### `GET /responses/lost/:lostItemId`
Retrieves responses for a lost item. Accessible only to owner or admin.
- **Access:** Private (Owner or Admin)

---

## 6. Notifications Endpoints (`/api/v1/notifications`)

### `GET /notifications`
Returns in-app notifications with unread counts and pagination.
- **Access:** Private

### `PATCH /notifications/:id/read`
Marks single notification as read.
- **Access:** Private

### `PATCH /notifications/read-all`
Marks all user notifications as read.
- **Access:** Private

---

## 7. Admin Endpoints (`/api/v1/admin`)
*All endpoints below strictly require `protect` and `authorize('admin')`.*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/dashboard` | Returns overall college statistics, KPI charts, and recent activity. |
| `GET` | `/admin/students` | Search and filter all student accounts. |
| `PATCH` | `/admin/students/:id/status` | Approve pending registration, activate or deactivate accounts. |
| `POST` | `/admin/roster/import` | Import authorized student records via JSON/CSV payload. |
| `GET` | `/admin/lost-items` | Complete unmasked view of lost reports. |
| `PATCH` | `/admin/lost-items/:id` | Update report status, remarks, or close with recorded reason. |
| `GET` | `/admin/found-items` | Complete unmasked view of found reports and custody tracking. |
| `PATCH` | `/admin/found-items/:id` | Update status, custody, or record deposit at admin office. |
| `GET` | `/admin/responses` | List all student responses for administrative triage. |
| `PATCH` | `/admin/responses/:id` | Review, accept for matching, or reject response with remarks. |
| `GET` | `/admin/matches` | List potential matches. |
| `GET` | `/admin/matches/suggestions/:lostItemId` | Computes weighted matching scores across available found catalog. |
| `POST` | `/admin/matches` | Confirms potential match and queues for ownership verification. |
| `PATCH` | `/admin/matches/:id` | Update match status and administrative notes. |
| `PATCH` | `/admin/verification/:matchId` | Formally approve ownership claim or reject with recorded rationale. |
| `GET` | `/admin/handovers` | List scheduled, completed, and cancelled handovers. |
| `POST` | `/admin/handovers` | Schedule collection appointment at College Admin Block. |
| `PATCH` | `/admin/handovers/:id` | Record item deposit, complete return, or record cancellation. |
| `GET` | `/admin/analytics` | Return rate, department metrics, category volume, average velocity. |
| `GET` | `/admin/audit-logs` | Query immutable audit log records. |

