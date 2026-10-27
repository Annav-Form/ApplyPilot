Video : https://drive.google.com/file/d/1XqQMjLalV4C2PzLYKvIXv1H9UVqmKRyH/view?usp=sharing

# ApplyPilot — Placement & Internship Tracker

> A modern, full-stack placement and internship tracking platform built for college students to manage job applications, schedule OA and interview rounds, stay ahead of deadlines, and organize company preparation playbooks.

---

## 📌 Problem Statement

During college placement and internship seasons, students apply to dozens of companies across different tiers (MAANG, high-growth startups, mass recruiters, and consultancies). Traditional spreadsheets or generic job boards fail students because:
1. **Scattered Deadlines & Lost OAs:** Application deadlines, HackerRank/Codility tests, and multi-round interviews are spread across emails and portals, leading to missed assessment windows.
2. **Conflated Categorization:** Existing tools force companies into a single rigid tag. Students need to classify companies along **two independent dimensions**:
   - **Company Tier:** *Decent* vs. *Excellent* (stipend/prestige/scale)
   - **Difficulty to Crack:** *Easy to Crack* vs. *Hard to Crack* (interview rigor)  
   *(e.g., a company can be Excellent and Hard to Crack at the same time).*
3. **Disconnected Preparation:** Students don't know what to study for which company group (e.g., dynamic programming and system design for *Excellent / Hard to Crack* vs. core CS fundamentals and SQL for *Decent / Easy to Crack*).

---

## 🎯 Target Users

- **Final-Year & Pre-Final Year College Students:** Managing campus placement drives and off-campus internships.
- **Student Placement Coordinators & Aspirants:** Tracking progress across multiple assessment stages.

---

## 💡 Solution Overview & Core Workflows

**ApplyPilot** provides a dedicated, privacy-focused operating system for student job hunts:

### 1. Flow A: Secure Student Authentication & Multi-Tenancy
- Student registration, login, and JWT-authenticated sessions.
- Passwords securely hashed with **bcryptjs** (salt rounds: 10).
- Strict multi-tenant isolation: every database query strictly checks `req.user._id`. No student can access, edit, or delete another student's applications or playbooks.

### 2. Flow B: Dynamic Application Tracker with Dual Classification
- Full CRUD for applications: Company name, job title, description, application deadline, date applied, status, priority, location, source, and stipend/salary notes.
- **Company Classification Badges**:
  - **Company Tier:** `Decent` | `Excellent`
  - **Interview Difficulty:** `Easy to Crack` | `Hard to Crack`
- Status transitions: `Wishlist` ➔ `Applied` ➔ `Online Assessment` ➔ `Interview` ➔ `Offer` ➔ `Rejected` ➔ `Withdrawn` (supports non-rigid transitions).
- Search by keyword, multi-dimensional filtering, and sorting.
- Confirmation dialogs before destructive actions.

### 3. Flow C: Nested OA & Multi-Round Interview Pipeline
- Track multiple assessment rounds per application:
  - `Online Assessment (OA)`, `Coding Round`, `Technical Interview`, `HR Interview`, `Managerial Interview`, `Other`
- Scheduled date/time, duration, meeting link, and notes.
- **Round Status:** `Upcoming`, `Completed`, `Missed`, `Rescheduled`
- **Round Outcome:** `Cleared ✅`, `Pending ⏳`, `Rejected ❌`, `N/A`
- **Chronological Timeline:** Automatically highlights the **Next Upcoming Round ⏰** and warns about **Pending Outcome Overdue ⚠️** rounds.

### 4. Flow D: Data-Driven Dashboard & In-App Reminder Center
- **Dynamic Live Statistics** derived from MongoDB: Total Applications, In-Progress Applications, Scheduled OAs/Interviews, Offers Received, and Overdue Events.
- **Pipeline Breakdown Chart:** Visual progress bars of application statuses.
- **Classification Distribution:** Tier and Difficulty distribution breakdown.
- **In-App Reminder Center:** Prioritizes overdue deadlines, upcoming assessments in the next 48 hours, and 14-day milestones.
- **Browser Notification Engine:** Optional desktop notifications with honest system disclosures.

### 5. Flow E: Company Preparation Playbooks
- Answer: *"What do I need to study for this company tier?"*
- Group-specific study plans categorized into:
  - `Decent Companies`
  - `Excellent Companies`
  - `Easy to Crack`
  - `Hard to Crack`
- Multi-tag support (e.g., tag both *Excellent* and *Hard to Crack*).
- Estimated study hours, topic notes, and resources.
- Interactive toggle completion with real-time curriculum progress bars.
- Optional 1-click **Load Curated Starter Plan** with high-yield placement topics.

### 6. Demo Usability
- Signed-in students can click **"Load Demo Data"** from the sidebar to populate a realistic set of 6 sample companies (Google, Microsoft, Atlassian, Zomato, Razorpay, Deloitte), nested rounds, and playbook topics into the database.
- Built-in duplicate prevention safeguards against accidental double seeding.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Lucide React icons |
| **Styling** | Vanilla CSS3 (Custom Design System with Dark Navy/Charcoal SaaS theme, HSL/Tailored tokens, responsive sidebar) |
| **Backend** | Node.js, Express.js (REST API, modular routes, controllers, middleware) |
| **Database** | MongoDB with Mongoose ODM |
| **Security & Auth** | JSON Web Tokens (JWT), bcryptjs password hashing |
| **Testing** | Automated integration tests via `mongodb-memory-server` and `supertest` |
| **API Client** | Postman (Collection v2.1.0 and Environment template included) |
| **Deployment** | Single-service web build via Express serving Vite production bundle (`render.yaml` included) |

---

## 🏛️ System Architecture

```mermaid
graph TD
    Client["React + Vite Client (Browser)"]
    Express["Express.js Server (Port 5001)"]
    AuthMW["Auth Middleware (JWT Verify)"]
    DbMW["DB Status Middleware"]
    Mongo["MongoDB / MongoDB Atlas"]

    Client -->|API Requests /api/*| Express
    Client -->|Static Bundle /| Express
    Express --> AuthMW
    AuthMW --> DbMW
    DbMW -->|Mongoose ODM| Mongo
```

---

## 📁 Project Structure

```
End Term Project/
├── client/                               # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── ApplicationFormModal.jsx  # Create/edit application modal
│   │   │   ├── ConfirmModal.jsx          # Reusable destructive action confirmation
│   │   │   ├── DbStatusBanner.jsx        # Database health & Atlas setup modal
│   │   │   ├── DifficultyBadge.jsx       # Easy to Crack / Hard to Crack badge
│   │   │   ├── EmptyState.jsx            # Empty table/card state
│   │   │   ├── Modal.jsx                 # Accessible modal dialog
│   │   │   ├── Navbar.jsx                # Responsive top navigation bar
│   │   │   ├── PlaybookFormModal.jsx     # Playbook topic creator modal
│   │   │   ├── PriorityBadge.jsx         # Low / Medium / High badge
│   │   │   ├── RoundFormModal.jsx        # Schedule/edit round modal
│   │   │   ├── Sidebar.jsx               # Responsive navigation sidebar & demo trigger
│   │   │   ├── StatusBadge.jsx           # Application status badge
│   │   │   └── TierBadge.jsx             # Decent / Excellent company badge
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # User session & DB health context
│   │   │   └── ToastContext.jsx          # Toast alert notifications
│   │   ├── pages/
│   │   │   ├── ApplicationDetailPage.jsx # Full app details & chronological rounds
│   │   │   ├── ApplicationsPage.jsx      # Filterable, sortable list & grid views
│   │   │   ├── DashboardPage.jsx         # Live KPIs, pipeline charts & events
│   │   │   ├── LoginPage.jsx             # Sign in with demo fill button
│   │   │   ├── NotFoundPage.jsx          # 404 handler
│   │   │   ├── PlaybooksPage.jsx         # Category-specific study plans
│   │   │   ├── RegisterPage.jsx          # Student registration
│   │   │   └── RemindersPage.jsx         # In-app reminders & browser alerts
│   │   ├── services/
│   │   │   └── api.js                    # Fetch client with auto JWT & error handling
│   │   ├── App.jsx                       # Route layout & protected routes
│   │   ├── index.css                     # Complete design system & custom CSS
│   │   └── main.jsx                      # React entrypoint
│   ├── index.html                        # HTML template with SEO tags
│   ├── package.json                      # Client package configuration
│   └── vite.config.js                    # Vite configuration with proxy to port 5001
├── server/                               # Express.js REST API Backend
│   ├── config/
│   │   └── db.js                         # Mongoose connection & connection state helper
│   ├── controllers/
│   │   ├── applicationController.js      # Applications CRUD & filtering
│   │   ├── authController.js             # Register, login, profile, logout
│   │   ├── dashboardController.js        # Live statistics & reminder aggregation
│   │   ├── demoController.js             # Realistic dataset seeding & duplicate guard
│   │   ├── playbookController.js         # Playbook CRUD & group calculations
│   │   └── roundController.js            # Nested rounds CRUD & upcoming rounds
│   ├── middleware/
│   │   ├── auth.js                       # JWT authentication guard
│   │   ├── dbCheck.js                    # 503 DB availability guard
│   │   └── errorHandler.js               # Centralized error & 404 handler
│   ├── models/
│   │   ├── Application.js                # Application & nested Round schema
│   │   ├── PlaybookItem.js               # Preparation topic schema
│   │   └── User.js                       # Student user schema with bcrypt
│   ├── routes/
│   │   ├── applicationRoutes.js          # /api/applications routes
│   │   ├── authRoutes.js                 # /api/auth routes
│   │   ├── dashboardRoutes.js            # /api/dashboard routes
│   │   ├── demoRoutes.js                 # /api/demo routes
│   │   ├── playbookRoutes.js             # /api/playbooks routes
│   │   └── roundRoutes.js                # /api/rounds routes
│   ├── app.js                            # Express app configuration & static serving
│   └── index.js                          # Server listener entrypoint (port 5001)
├── tests/
│   └── run-tests.js                      # 18 automated integration tests
├── postman/
│   ├── ApplyPilot.postman_collection.json  # Complete Postman v2.1.0 collection
│   └── ApplyPilot.postman_environment.json # Postman environment template
├── .env.example                          # Environment variable template
├── .gitignore                            # Git ignore rules
├── package.json                          # Root package configuration
├── render.yaml                           # Render cloud deployment blueprint
└── README.md                             # Comprehensive project documentation
```

---

## 🗄️ Data Models

### 1. User Model (`server/models/User.js`)
- `name` (String, required, trimmed)
- `email` (String, required, unique, lowercase, regex-validated)
- `password` (String, required, minlength 6, bcrypt-hashed)
- `college` (String, student's university)
- `targetRole` (String, e.g. "Software Engineer")
- `graduationYear` (Number, e.g. 2027)
- `createdAt`, `updatedAt` (Timestamps)

### 2. Application Model (`server/models/Application.js`)
- `user` (ObjectId, ref: 'User', indexed)
- `company` (String, required)
- `role` (String, required)
- `tier` (Enum: `['Decent', 'Excellent']`, required)
- `difficulty` (Enum: `['Easy to Crack', 'Hard to Crack']`, required)
- `status` (Enum: `['Wishlist', 'Applied', 'Online Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn']`)
- `priority` (Enum: `['Low', 'Medium', 'High']`)
- `deadline` (Date, application deadline)
- `appliedDate` (Date, date submitted)
- `salary` (String, stipend or CTC package note)
- `location` (String, e.g. "Bangalore / Remote")
- `source` (String, e.g. "On-Campus", "Referral", "LinkedIn")
- `jobUrl` (String, URL)
- `description` (String, role requirements)
- `additionalNotes` (String, personal preparation notes)
- `rounds` (Array of nested Round Subdocuments)

### 3. Nested Round Schema
- `_id` (ObjectId)
- `roundType` (Enum: `['Online Assessment', 'Coding Round', 'Technical Interview', 'HR Interview', 'Managerial Interview', 'Other']`)
- `name` (String, e.g. "Round 2 - Live Coding")
- `scheduledAt` (Date, required)
- `status` (Enum: `['Upcoming', 'Completed', 'Missed', 'Rescheduled']`)
- `outcome` (Enum: `['Cleared', 'Pending', 'Rejected', 'N/A']`)
- `durationMinutes` (Number, e.g. 60)
- `meetingLink` (String, meeting or assessment URL)
- `notes` (String, questions asked & feedback)

### 4. PlaybookItem Model (`server/models/PlaybookItem.js`)
- `user` (ObjectId, ref: 'User', indexed)
- `topic` (String, required)
- `targetGroups` (Array of Strings: `['Decent', 'Excellent', 'Easy to Crack', 'Hard to Crack']`)
- `priority` (Enum: `['Low', 'Medium', 'High']`)
- `isCompleted` (Boolean, default: false)
- `completedAt` (Date, null if incomplete)
- `estimatedHours` (Number, default: 2)
- `notes` (String, problem links & resources)

---

## ⚙️ Environment Variables

Create a `.env` file in the project root based on `.env.example`:

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `5001` | Server listening port *(5001 avoids macOS AirPlay port 5000 conflict)* |
| `NODE_ENV` | Optional | `development` | Set to `production` in production environments |
| `MONGODB_URI` | Required for persistent storage | None | MongoDB Atlas or local MongoDB connection URI |
| `JWT_SECRET` | Required | Built-in fallback | Secret key for signing and verifying JWT authentication tokens |
| `JWT_EXPIRES_IN` | Optional | `7d` | Token expiration lifespan |

---

## 🚀 Setup & Running Locally

### Prerequisites
- **Node.js** (v18 or higher; tested on v26)
- **npm** (v9 or higher)
- **MongoDB** (A free MongoDB Atlas cluster OR local MongoDB service)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <your-repository-url>
cd "End Term Project"

# Install both backend and frontend dependencies
npm run install-all
```

### 2. Configure Environment
```bash
# Copy the example environment template
cp .env.example .env
```
Open `.env` and configure your `MONGODB_URI` (see below for free MongoDB Atlas setup).

### 3. Run Automated Tests
Test all backend routes, Mongoose models, validations, and multi-tenant isolation using the built-in in-memory MongoDB runner:
```bash
npm test
```
*Expected Result: `🎉 Automated Tests Complete: 18 passed, 0 failed.`*

### 4. Start Development Mode
Runs both the backend API server and Vite hot-reloading dev server simultaneously:
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5001`

### 5. Build & Run for Production (Single Web Service)
```bash
# Build the production React bundle into client/dist
npm run build

# Start the unified production web service
npm start
```
The full application will be accessible at: `http://localhost:5001`.

---

## 🍃 Free MongoDB Atlas Setup Guide

If you don't have MongoDB installed locally, configure a 100% free MongoDB Atlas database in 3 minutes:

1. **Sign Up:** Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. **Deploy Cluster:** Choose the **M0 Free Shared Cluster** (500MB storage, no credit card required).
3. **Create Database User:**
   - In Atlas, go to **Security** ➔ **Database Access**.
   - Click **Add New Database User**. Choose username & password (e.g. `applypilot_user` / `YourSecurePassword123`).
4. **Allow Network Access:**
   - Go to **Security** ➔ **Network Access**.
   - Click **Add IP Address** ➔ Select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. **Get Connection String:**
   - In **Deployment** ➔ **Database**, click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the URI and paste it into `.env`:
   ```bash
   MONGODB_URI=mongodb+srv://applypilot_user:YourSecurePassword123@cluster0.xxxx.mongodb.net/applypilot?retryWrites=true&w=majority
   ```
6. Restart the server (`npm start` or `npm run dev`).

*(Note: If MongoDB is disconnected, ApplyPilot shows a clear, non-intrusive setup banner and prevents silent data corruption).*

---

## 📡 REST API Reference

All protected endpoints require an `Authorization: Bearer <token>` header.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register student with name, email, password, college |
| `POST` | `/api/auth/login` | Public | Authenticate student and obtain JWT |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated student profile |
| `PUT` | `/api/auth/profile` | Private | Update student details and target role |
| `POST` | `/api/auth/logout` | Private | Logout session |

### Applications (`/api/applications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/applications` | Private | List applications (supports search, status, tier, difficulty, priority, sort) |
| `POST` | `/api/applications` | Private | Create new application |
| `GET` | `/api/applications/:id` | Private | Get single application with sorted rounds |
| `PUT` | `/api/applications/:id` | Private | Update application details |
| `PATCH` | `/api/applications/:id/status`| Private | Quick status change |
| `DELETE` | `/api/applications/:id` | Private | Delete application and all its rounds |

### Nested Assessment & Interview Rounds
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/applications/:appId/rounds` | Private | Add an OA or Interview round to an application |
| `PUT` | `/api/applications/:appId/rounds/:roundId` | Private | Update round details & record outcome |
| `DELETE` | `/api/applications/:appId/rounds/:roundId` | Private | Delete round |
| `GET` | `/api/rounds/upcoming` | Private | Get all upcoming rounds across all jobs |

### Dashboard & Metrics (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Private | Returns live KPI counts, pipeline chart data, upcoming deadlines & reminders |

### Preparation Playbooks (`/api/playbooks`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/playbooks` | Private | List study items & calculate category progress |
| `POST` | `/api/playbooks` | Private | Create preparation topic with category tags |
| `PUT` | `/api/playbooks/:id` | Private | Update topic details |
| `PATCH` | `/api/playbooks/:id/toggle` | Private | Toggle topic completion status |
| `DELETE` | `/api/playbooks/:id` | Private | Delete study topic |
| `POST` | `/api/playbooks/seed-starter` | Private | Load curated starter curriculum (if empty) |

### Demo Data (`/api/demo`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/demo/seed` | Private | Seeds 6 realistic applications, nested rounds, and playbooks (duplicate guarded) |

### Health Check (`/api/health`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Returns service health, version, and MongoDB connection state |

---

## 📮 Postman Collection Usage

1. **Import Files into Postman:**
   - Launch Postman.
   - Click **Import** and select:
     - `postman/ApplyPilot.postman_collection.json`
     - `postman/ApplyPilot.postman_environment.json`
2. **Select Environment:**
   - In the top right of Postman, select the environment **ApplyPilot Local Environment**.
   - The default `baseUrl` is configured to `http://localhost:5001`.
3. **Execute Requests in Sequence:**
   - **Step 1:** Run `0. Health Check ➔ API Health & DB Status`.
   - **Step 2:** Run `1. Authentication ➔ Register Student` or `Login Student`.
     - *The test script automatically captures the returned JWT token into the `{{authToken}}` environment variable!*
   - **Step 3:** Run `2. Dashboard & Reminders ➔ Get Dashboard Statistics & Deadlines`.
   - **Step 4:** Run `3. Applications ➔ Create Application`.
     - *Automatically stores `{{applicationId}}`.*
   - **Step 5:** Run `4. OA & Interview Rounds ➔ Add Round`.
     - *Automatically stores `{{roundId}}`.*
   - **Step 6:** Run `5. Preparation Playbooks` and `6. Demo Seeding`.

---

## ☁️ Deployment Guide (Render)

This repository includes a `render.yaml` blueprint configured for unified single-service hosting:

### Option A: Deploy via Render Blueprint (Recommended)
1. Push your repository to GitHub.
2. Log into [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** ➔ **Blueprint**.
4. Select your GitHub repository.
5. In the environment variable prompts, set:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: Leave as auto-generated or enter a custom secret.
6. Click **Apply**. Render will automatically run `npm run build` and launch the web service with `npm start`.

### Option B: Deploy Manually as a Web Service
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `NODE_ENV`: `production`
  - `PORT`: `10000`
  - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
  - `JWT_SECRET`: `<A random 32+ character string>`

---

## ⚖️ Known Limitations & Honest System Disclosures

1. **Browser Notifications:**
   - ApplyPilot uses the standard Web Notification API (`Notification.requestPermission()`).
   - Browser push notifications are triggered while the application tab is active in the user's browser.
   - Offline notifications or scheduled background SMS/email alerts require external transactional email infrastructure (such as SendGrid or AWS SES) and persistent background job workers (such as BullMQ/Redis). For complete reliability without background infrastructure, students should rely on the **In-App Reminder Center**, which is persistently synchronized with MongoDB.
2. **Local macOS Port 5000 Conflict:**
   - Apple's AirPlay Receiver daemon binds to port 5000 by default on macOS Monterey/Ventura/Sonoma/Sequoia.
   - ApplyPilot defaults to **port 5001** in development to prevent `EADDRINUSE` port collision errors.

---

## 📄 License
ISC License. Built for student productivity and college placement success.
