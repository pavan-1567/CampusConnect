# CampusConnect – Campus Lost & Found Management System

> **Tagline:** *"Lost something? Found something? Let's reconnect."*

CampusConnect is a production-grade, centralized MERN stack web platform exclusively engineered for college environments to bridge the gap between students who lose personal belongings and students who find them, facilitated by college administrators who verify legitimate ownership and coordinate physical handovers.

---

## 1. Why CampusConnect Is Needed

In any bustling college or university campus, students constantly misplace essential personal belongings:
- College Identity Cards & Hall Tickets
- Mobile Phones, Laptops, Audio Gear (AirPods, Earphones), and Chargers
- Wallets, Government IDs, Keys, and Bags
- Scientific Calculators, Laboratory Manuals, and Notebooks

When another student discovers these items, there is rarely any secure way to identify the owner without risking private personal details. Similarly, students who lose items have had to resort to fragmented social media groups or bulletin boards with zero verification or return guarantees.

**CampusConnect solves this problem** by introducing:
1. **Roster-verified student accounts** to prevent fraudulent external accounts.
2. **Confidential identifying criteria** so that sensitive serial numbers or private marks are hidden from public browse listings and only revealed to administrators during verification.
3. **An intelligent rule-based matching engine** that suggests candidate matches based on item attributes.
4. **Administrative ownership verification and chain-of-custody tracking** with handovers conducted in person at the College Admin Block.

---

## 2. Key Objectives

1. **Centralize Campus Reporting:** One unified digital repository for all lost and found property across campus departments.
2. **Prevent False Claims:** Requiring physical ownership verification, matching private identifying marks against student college IDs.
3. **Protect Student Privacy:** Masking private telephone numbers, student emails, and identifying details in all public browse views.
4. **Streamline Administration:** Providing college administrators with dashboards, comparison workspaces, automated notifications, and audit logging.

---

## 3. Technology Stack

### Frontend
- **Framework:** React.js (v18) built with **Vite**
- **Routing:** React Router DOM (v6) with Role-Based Route Guards
- **State Management:** Redux Toolkit & React-Redux
- **HTTP Client:** Axios with Interceptors & Credentials
- **Styling:** **Bootstrap 5** (Strictly the only CSS framework, utilizing Bootstrap grid, components, and utility classes)
- **Icons:** Bootstrap Icons
- **Notifications:** React Toastify
- **Analytics & Data Visualization:** Chart.js & React-Chartjs-2

### Backend
- **Runtime & Framework:** Node.js & Express.js (REST API Architecture)
- **Database & ODM:** MongoDB Atlas / Local MongoDB with Mongoose (v8)
- **Authentication:** JSON Web Tokens (JWT) stored in secure, HttpOnly cookies + password hashing with bcryptjs
- **File Uploads:** Multer with Cloudinary CDN integration and fallback to local `/uploads` disk storage
- **Validation:** Express-Validator middleware
- **Security:** Helmet headers, Express-Rate-Limit, CORS with credential handling, cookie-parser

---

## 4. Project Structure

```text
CC Lost&Found/
├── client/                     # Frontend Vite React Single Page Application
│   ├── public/                 # Static assets & SVG Favicon
│   ├── src/
│   │   ├── app/                # Redux Toolkit store (store.js)
│   │   ├── components/         # Reusable Bootstrap UI components
│   │   │   └── common/         # StatusBadge, ItemCard, EmptyState, Pagination, LoadingSpinner, Modal
│   │   ├── features/           # Redux slices (auth, lostItems, foundItems, responses, notifications, admin)
│   │   ├── layouts/            # AuthLayout, StudentLayout (with Offcanvas), AdminLayout
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, AdminLogin, AccessDenied, PendingApproval
│   │   │   ├── student/        # StudentDashboard, ReportLost, ReportFound, Browse, Details, MyLost, MyFound, MyResponses, Profile, Notifications
│   │   │   └── admin/          # AdminDashboard, Students, LostAdmin, FoundAdmin, ResponsesAdmin, Matches, Verification, Handovers, Analytics, AuditLogs, Settings
│   │   ├── routes/             # AppRoutes, ProtectedRoute, RoleRoute
│   │   ├── services/           # Axios API services for all modules
│   │   ├── App.jsx             # Root React component
│   │   ├── main.jsx            # Entry point with Bootstrap & Toastify imports
│   │   └── index.css           # Bootstrap theme variable overrides
│   ├── package.json
│   ├── vercel.json             # Vercel SPA deployment configuration
│   └── vite.config.js          # Vite config with backend proxy
│
├── server/                     # Backend Express REST API Server
│   ├── config/                 # db.js (MongoDB connection with fallback), cloudinary.js
│   ├── controllers/            # auth, user, lostItem, foundItem, response, match, handover, admin
│   ├── middleware/             # authMiddleware, roleMiddleware, uploadMiddleware, errorMiddleware
│   ├── models/                 # User, CollegeRoster, LostItem, FoundItem, Response, Match, Notification, Handover, AuditLog
│   ├── routes/                 # authRoutes, userRoutes, lostItemRoutes, foundItemRoutes, responseRoutes, notificationRoutes, adminRoutes
│   ├── seeders/                # adminSeeder.js, demoSeeder.js
│   ├── services/               # matchingService.js (weighted rule-based algorithm), notificationService.js, emailService.js
│   ├── tests/                  # auth.test.js, workflow.test.js (Jest & Supertest automated suite)
│   ├── utils/                  # generateToken.js, responseHandler.js
│   ├── validators/             # authValidator.js, lostItemValidator.js, foundItemValidator.js
│   ├── uploads/                # Local disk storage for uploaded photos (.gitkeep preserved)
│   ├── app.js                  # Express app configuration
│   ├── server.js               # HTTP server entry point
│   └── package.json
│
├── DEVELOPMENT_PROGRESS.md     # Phase-by-phase implementation log
├── PROJECT_REQUIREMENTS.md     # Detailed business & functional specifications
├── SYSTEM_ARCHITECTURE.md      # Architecture, security & matching algorithm docs
├── DATABASE_SCHEMA.md          # Complete Mongoose schemas & ER diagram
├── API_DOCUMENTATION.md        # REST API endpoint reference
├── DEPLOYMENT_GUIDE.md         # Vercel, Render & MongoDB Atlas guide
├── TESTING_REPORT.md           # 13/13 automated test suite & build report
├── render.yaml                 # Render backend deployment configuration
├── .env.example                # Root environment template
└── package.json                # Root orchestration scripts
```

---

## 5. Getting Started & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher, tested on Node v24 LTS)
- [MongoDB](https://www.mongodb.com/) (Local mongod service or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd "CC Lost&Found"
   ```

2. **Configure Environment Variables:**
   - In `server/`, copy `.env.example` to `server/.env`:
     ```ini
     PORT=5000
     NODE_ENV=development
     MONGODB_URI=mongodb://127.0.0.1:27017/campusconnect
     JWT_SECRET=campusconnect_jwt_super_secret_dev_key_2026
     JWT_EXPIRES_IN=7d
     CLIENT_URL=http://localhost:3000

     # Default Administrator Credentials
     ADMIN_COLLEGE_ID=ADM2026
     ADMIN_NAME=Campus Administrator
     ADMIN_EMAIL=admin@campusconnect.edu
     ADMIN_PASSWORD=AdminPass@2026

     # Cloudinary (Optional - falls back to local /uploads if left empty)
     CLOUDINARY_CLOUD_NAME=
     CLOUDINARY_API_KEY=
     CLOUDINARY_API_SECRET=
     ```

3. **Install Dependencies:**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

---

## 6. Database Setup & Seeding

CampusConnect includes comprehensive automated seeders to populate the database with demonstration data.

Ensure your MongoDB instance is running, then run:

```bash
# Seed the full demonstration environment:
npm run seed
```

This seeds:
- The default **Campus Administrator** account (`ADM2026`)
- The **Authorized College Roster** with verified student IDs
- **Verified Demonstration Students** (John Doe, Sarah Miller, Alex Johnson)
- A **Pending Approval Student** (David Brown) for demonstration of account review
- Sample **Lost Items**, **Found Items**, **Student Responses**, and **In-App Notifications**

---

## 7. Demonstration Accounts

You can immediately sign in to test the application using these pre-configured accounts:

| Portal | Role | College ID | Password | Description |
|---|---|---|---|---|
| **Admin Console** | Administrator | `ADM2026` | `AdminPass@2026` | Super admin authority with full dashboard, matching engine, and verification powers. |
| **Student Portal** | Student (Owner) | `CS2023001` | `Password@123` | John Doe (3rd Year CSE) – Has reported a lost student ID card. |
| **Student Portal** | Student (Finder) | `EC2023042` | `Password@123` | Sarah Miller (2nd Year ECE) – Has reported a found item and responded to John. |
| **Student Portal** | Student (Finder) | `ME2024018` | `Password@123` | Alex Johnson (1st Year ME) – Has reported found AirPods in cafeteria. |
| **Student Portal** | Student (Pending) | `CV2024099` | `Password@123` | David Brown (Civil) – Demonstrates pending approval state. |

---

## 8. Running the Application

### Option A: Run Both Together
From the root directory:
```bash
# Terminal 1: Run Express REST API backend (:5000)
npm run server

# Terminal 2: Run Vite React frontend (:3000)
npm run client
```

### Option B: Run Individually
```bash
# Backend only:
cd server
npm run dev

# Frontend only:
cd client
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 9. Running Automated Tests

To run the complete automated integration test suite:

```bash
npm run test:server
```

This executes 13 automated tests across:
- Roster verification during registration
- Pending approval authorization guards
- Complete 7-stage end-to-end lifecycle (Lost report $\to$ Found report $\to$ Response $\to$ Matching engine $\to$ Ownership verification $\to$ Handover scheduling $\to$ Final completion marked `RETURNED`)
- Role-based security checks blocking student access to administrative endpoints

To verify the frontend build:
```bash
npm run build:client
```

---

## 10. Deployment Instructions

### Deploying the Backend on Render
1. Create a new Web Service on [Render](https://render.com) pointing to the `server` directory.
2. Set build command to `npm install` and start command to `node server.js`.
3. Provide environment variables (`NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, etc.).
4. Or simply deploy via the included `render.yaml` blueprint.

### Deploying the Frontend on Vercel
1. Import the repository on [Vercel](https://vercel.com).
2. Set the root directory to `client`.
3. The included `client/vercel.json` will automatically configure client-side routing rewrites for all single-page application routes.
4. Set the `VITE_API_URL` to your live backend domain.

---

## 11. License
CampusConnect is developed for educational and campus community benefit. Distributed under the ISC License.

