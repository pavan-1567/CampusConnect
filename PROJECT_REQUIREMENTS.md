# CampusConnect – Project Requirements Specification

## 1. Executive Summary
**Application Name:** CampusConnect  
**Tagline:** "Lost something? Found something? Let's reconnect."  
**Target Audience:** University and College Students, Campus Administration, and Campus Security Staff.  
**Domain:** Campus Belongings Tracking, Lost & Found Management, Chain-of-Custody Verification, and Controlled Handover.

---

## 2. Problem Statement
In dense collegiate environments, students routinely misplace valuable personal items:
- College Identity Cards & Hall Tickets
- Laptops, Chargers, Audio Gear (AirPods, Headphones)
- Wallets, Keys, Government IDs, Passports
- Scientific Calculators, Laboratory Manuals, Textbooks
- Water Bottles, Umbrellas, Apparel

Historically, finders have had no secure channel to identify owners without risking private data leaks or false claimants. Conversely, losers broadcast uncoordinated appeals across disconnected social media groups. CampusConnect resolves this through an administrative bridge: verifying student identity against the official roster, utilizing a rule-based matching engine, safeguarding private verifying details, and executing in-person handovers at the College Admin Block.

---

## 3. User Roles & Access Control
The application enforces strict separation between two primary roles:

### A. Student Role
- **Onboarding:** Register with official College ID, verified automatically against the `CollegeRoster`. Unrostered registrations enter `PENDING_APPROVAL`.
- **Reporting:** 
  - Submit Lost Item reports with optional photos and secret identifying criteria.
  - Submit Found Item reports with possession status (`Still with me` or `Deposited at admin office`).
- **Browsing:** Search, filter, and paginate active lost and found items (with confidential identifying details masked).
- **Responses:** Respond to lost item requests, with the option to link an existing found-item report.
- **Tracking:** Dedicated views for `My Lost Requests`, `My Found Reports`, and `My Responses`.
- **In-App Notifications:** Real-time lifecycle alerts on reviews, matches, verification approvals, and handover appointments.
- **Profile Management:** Update contact number, department, academic year, and password.

### B. Admin Role
- **Security:** Access via dedicated `/auth/admin-login` with seeded credentials. Public registration to admin is strictly barred.
- **Analytics & Dashboard:** Live operational KPI counters, pipeline metrics bar chart, category distribution doughnut, and monthly trend tracking.
- **Student Management:** Full directory search, approve pending registrations, activate/deactivate accounts, and import CSV college rosters.
- **Report Lifecycle:** Full unmasked visibility into lost & found records, including secret identifying traits and student phone numbers.
- **Matching Workspace:** Side-by-side comparison evaluator with automated rule-based match scores across Name (30%), Category (20%), Location (25%), Date (15%), and Description (10%).
- **Ownership Verification:** Formal review of claimant proofs vs. finder observations; approve or reject with recorded audit rationale.
- **Handover Scheduling & Execution:** Schedule collection dates at the College Admin Block, track physical item deposit, and mark final return.
- **Audit Logging:** Immutable timeline of all administrative actions.

---

## 4. Technical Stack Compliance
- **Frontend:** React 18, Vite 5, React Router DOM v6, Redux Toolkit, Axios, Bootstrap 5 (Exclusive CSS framework), Bootstrap Icons, React Toastify, Chart.js & React-Chartjs-2.
- **Backend:** Node.js, Express.js REST API, Mongoose 8 ODM, JWT via HttpOnly secure cookies, bcryptjs, Multer, Cloudinary (with fallback to local storage), express-validator, Helmet, express-rate-limit.
- **Database:** MongoDB Atlas / Local MongoDB instance with indexing, schema validation, and relational references.

