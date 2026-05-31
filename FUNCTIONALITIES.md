# Society Management App — Complete Functionality Guide

This document explains **every major feature** in the project: what it does, **why** it was built that way, and **how** it works technically (frontend, backend, and database). Use it alongside [PROJECT_SPEC.md](./PROJECT_SPEC.md) and [README.md](./README.md).

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Phase 1 — Core Platform](#2-phase-1--core-platform)
3. [Phase 2 — Advanced Operations](#3-phase-2--advanced-operations)
4. [Phase 3 — Intelligent Features](#4-phase-3--intelligent-features)
5. [Security & Access Control](#5-security--access-control)
6. [Environment Variables](#6-environment-variables)
7. [API Route Reference](#7-api-route-reference)

---

## 1. Architecture Overview

### Why MERN?

| Layer | Technology | Why we use it |
|-------|------------|----------------|
| **Database** | MongoDB | Flexible schemas for societies, visitors, bookings; easy to scale for a portfolio app |
| **Backend** | Express.js + Node.js | Simple REST APIs, large ecosystem, pairs well with React |
| **Frontend** | React (Vite) | Component-based UI, fast dev server, good for role-based dashboards |
| **Auth** | JWT + bcrypt | Stateless API auth; passwords never stored in plain text |

### How requests flow

```
Browser (React) → Axios (+ JWT header) → Express API → Mongoose → MongoDB
                              ↓
                    Socket.io (real-time, parallel)
```

### Folder structure (why it is split this way)

- **`backend/models`** — One file per collection; keeps data shape in one place.
- **`backend/controllers`** — Business logic; routes stay thin.
- **`backend/routes`** — URL + middleware (auth, roles) only.
- **`backend/middleware`** — Reusable `verifyToken` and `requireRole`.
- **`frontend/src/pages`** — Grouped by role (`resident`, `societyAdmin`, `security`, `appAdmin`, `public`).
- **`frontend/src/context`** — Global state for auth and WebSocket connection.

---

## 2. Phase 1 — Core Platform

Phase 1 delivers a **working society app without payments or AI**. Everything else builds on this.

---

### 2.1 Authentication (Login & Register)

**What it does:** Users sign up and log in. The API returns a JWT used on every protected request.

**Why JWT?**  
The server does not need to store sessions in memory. Each request carries the token; the backend verifies it and loads the user. This fits REST APIs and deployment on serverless hosts.

**How it works:**

1. **Register** (`POST /api/auth/register`)
   - User picks an existing **society** from the database (societies are created only by App Admin).
   - Residents must send **flat number**; security does not.
   - `app_admin` cannot self-register (blocked in `authController`).
   - Password is hashed in `User` model `pre('save')` with **bcrypt** (10 rounds).

2. **Login** (`POST /api/auth/login`)
   - Compares password with bcrypt.
   - Returns `{ token, role, societyId, flatNumber, email, name }`.
   - Frontend stores user + token in **localStorage** via `AuthContext`.

3. **Protected routes**
   - `authMiddleware` reads `Authorization: Bearer <token>`, verifies JWT, attaches `req.user`.
   - `ProtectedRoute` in React redirects to `/login` if no user, or `/403` if wrong role.

**Key files:** `backend/models/User.js`, `backend/controllers/authController.js`, `frontend/src/context/AuthContext.jsx`

---

### 2.2 Society Management (App Admin)

**What it does:** App Admin creates and manages apartment societies. New users can only register into societies that already exist.

**Why separate App Admin?**
One platform can host many societies. App Admin is the “super user” who onboard societies; Society Admin runs day-to-day operations inside one society.

**How it works:**

- **Public:** `GET /api/societies` — name and city for the registration dropdown.
- **App Admin only:** `POST`, `PUT`, `DELETE /api/societies` — full CRUD.
- Fields: `name`, `address`, `city`, `totalFlats` (used later for **occupancy analytics**).

**Key files:** `backend/models/Society.js`, `frontend/src/pages/appAdmin/ManageSocietiesPage.jsx`

---

### 2.3 Notice Board

**What it does:** Society Admin posts announcements; residents (and others in the society) read them after login.

**Why login required to view?**
Notices are internal to the society. Scoping by `societyId` on every query prevents cross-society data leaks.

**How it works:**

- `GET /api/notices` — All authenticated users in that society see notices (filtered by `req.user.societyId`).
- `POST/PUT/DELETE` — **Society Admin only** (`requireRole(['society_admin'])`).
- Fields: `title`, `body`, `priority` (`normal` | `urgent`).
- Urgent notices get a red border/badge in the UI.

**Phase 2/3 addition:** Creating a notice triggers **Socket.io** + **saved notifications** for residents (see §4.1).

**Key files:** `backend/models/Notice.js`, `frontend/src/pages/resident/NoticeBoardPage.jsx`, `frontend/src/pages/societyAdmin/ManageNoticesPage.jsx`

---

### 2.4 Visitor Logging

**What it does:** Record who entered the society, which flat they visit, check-in/check-out times.

**Why it matters:** Security and residents need an audit trail of gate entries.

**How it works (Phase 1 baseline):**

- **Resident:** Logs visitors for their own flat; sees only their flat’s history (`GET /api/visitors/flat`).
- **Security:** Logs for any flat; sees all society visitors (`GET /api/visitors`).
- **Checkout:** `PATCH /api/visitors/:id/checkout` sets `checkOut` timestamp.

**Phase 2 extensions:** Pre-approval, QR, walk-in approval (see §3.2).

**Key files:** `backend/models/Visitor.js`, `frontend/src/pages/resident/VisitorLogPage.jsx`

---

### 2.5 Maintenance Tracking

**What it does:** Track monthly maintenance dues per flat: amount, status (`pending`, `paid`, `overdue`).

**Why manual status updates in Phase 1?**
Many societies still collect cash or bank transfer. Admin marks paid after verification; online payment comes in Phase 2.

**How it works:**

| Who | Endpoint | Capability |
|-----|----------|------------|
| Resident | `GET /api/maintenance/my` | Own flat history |
| Resident / Admin | `GET /api/maintenance/all` | Current month, all flats (read-only for residents) |
| Society Admin | `GET /api/maintenance` | All records |
| Society Admin | `POST /api/maintenance` | Create monthly record |
| Society Admin | `PATCH /api/maintenance/:id` | Update status |

- Unique index on `(societyId, flatNumber, month, year)` prevents duplicate bills.
- **StatusBadge** component colors rows green / yellow / red.

**Key files:** `backend/models/Maintenance.js`, `frontend/src/pages/resident/MyMaintenancePage.jsx`, `frontend/src/pages/societyAdmin/ManageMaintenancePage.jsx`

---

### 2.6 Role Dashboards

**What it does:** Each role lands on a dashboard with quick links and summary cards.

| Role | Route | Purpose |
|------|-------|---------|
| Resident | `/dashboard` | Recent notices, maintenance snippet |
| Society Admin | `/admin/dashboard` | Counts: residents, notices, pending/overdue dues |
| Security | `/security/dashboard` | Visitor log + QR scan links |
| App Admin | `/app-admin/dashboard` | Society and user counts |

**Why dashboards?**
Reduces clicks to common tasks and demonstrates role-based UX in a portfolio demo.

---

### 2.7 Database Seeding

**What it does:** `npm run seed` creates demo society, App Admin, Society Admin, Resident, and Security users.

**Why seed script?**
App Admin cannot use public registration. Evaluators need instant login without manual DB work.

**Default password:** `Admin@1234` (documented in README).

---

## 3. Phase 2 — Advanced Operations

---

### 3.1 Online Maintenance Payments (Razorpay)

**What it does:** Residents pay maintenance online via Razorpay checkout; status becomes `paid` automatically.

**Why Razorpay?**
Popular in India, strong test mode, clear docs for orders + signature verification.

**How it works:**

1. **Create order** (`POST /api/payments/create-order`)
   - Resident clicks **Pay Now** on a pending/overdue row.
   - Backend creates Razorpay order (amount in **paise** = INR × 100).
   - Saves `Payment` document with `razorpayOrderId`, status `created`.
   - Returns `orderId`, `keyId` for frontend widget.

2. **Browser verify** (`POST /api/payments/verify`)
   - After Razorpay checkout, frontend sends `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`.
   - Backend verifies HMAC with `RAZORPAY_KEY_SECRET`.
   - Updates `Payment` and `Maintenance` via shared helper `completePayment()`.

3. **Webhook** (`POST /api/payments/webhook`) — **server-side backup**
   - Razorpay calls your server on `payment.captured`.
   - Uses **raw body** parser (registered **before** `express.json()` in `server.js`) so signature matches.
   - Verified with `RAZORPAY_WEBHOOK_SECRET`.
   - Same `completePayment()` logic — reliable if user closes browser before verify.

**Why both verify + webhook?**
Verify gives instant UI feedback; webhook ensures payment is recorded even if the client fails.

**Frontend:** Razorpay script in `index.html`; `window.Razorpay(options).open()` in `MyMaintenancePage.jsx`.

**Key files:** `backend/models/Payment.js`, `backend/utils/paymentHelpers.js`, `backend/controllers/paymentController.js`

---

### 3.2 Visitor Approval & QR Codes

**What it does:** Residents pre-approve expected guests; guest gets QR/link; security scans at gate for instant check-in. Walk-in guests need resident approval.

**Why QR + pre-approval?**
Reduces gate friction for planned visits; security still controls actual entry via scan.

**How it works:**

1. **Pre-approve** (`POST /api/visitors/pre-approve`)
   - Resident enters guest name, email, expected time.
   - Backend generates **UUID token**, builds URL: `{FRONTEND_URL}/verify-visitor?token=...`
   - **qrcode** library creates base64 PNG.
   - Optional **Nodemailer** email to guest (`EMAIL_USER`, `EMAIL_PASS`).
   - Visitor record: `preApproved: true`, `approvalStatus: 'approved'`, `checkIn: null` until scan.

2. **Public pass page** (`/verify-visitor`)
   - Guest opens link without login.
   - `GET /api/visitors/public/:token` returns pass details (no check-in).

3. **Security scan** (`GET /api/visitors/verify/:token` — auth required)
   - `html5-qrcode` reads QR URL, extracts token, calls API.
   - Sets `checkIn`, notifies resident via notification + socket event.

4. **Walk-in** (security logs visitor)
   - `approvalStatus: 'pending'`, no check-in until resident approves.
   - Resident sees list on Visitor page → Approve / Reject.

**Key files:** `backend/utils/sendEmail.js`, `frontend/src/pages/resident/PreApproveVisitorPage.jsx`, `frontend/src/pages/security/QRScannerPage.jsx`, `frontend/src/pages/public/VerifyVisitorPage.jsx`

---

### 3.3 Facility Booking

**What it does:** Residents book shared facilities (clubhouse, gym, pool, parking) by date and time slot. Admin approves or rejects.

**Why admin approval?**
Prevents conflicts and misuse; admin can enforce society rules.

**How it works:**

- **Rules enforced in backend:**
  - Max **2 hours per resident per day** (sum of `durationHours`).
  - **Conflict detection** — overlapping `startTime`/`endTime` on same facility/date.
- `POST /api/bookings` — Resident creates `pending` booking.
- `PATCH /api/bookings/:id` — Admin sets `approved` or `rejected`.
- Frontend: `react-datepicker` + time slot grid; taken slots disabled.

**Key files:** `backend/models/Booking.js`, `frontend/src/pages/resident/FacilityBookingPage.jsx`, `frontend/src/pages/resident/MyBookingsPage.jsx`, `frontend/src/pages/societyAdmin/ManageBookingsPage.jsx`

---

## 4. Phase 3 — Intelligent Features

---

### 4.1 Real-Time Notifications (Socket.io)

**What it does:** Users see a bell icon with unread count; events appear without refreshing the page. History is stored in MongoDB.

**Why Socket.io?**
HTTP polling wastes requests. WebSockets give instant push when admin posts notice, payment completes, visitor checks in, etc.

**How it works:**

1. **Server** — `http.createServer(app)` + `socket.io` attached (not `app.listen` alone).
2. **Rooms** — On login, client emits `join_society` with `societyId`; all society members share a room.
3. **Persist** — `sendNotification()` in `utils/notifications.js`:
   - Creates `Notification` document per user.
   - Emits `new_notification` to society room.
4. **Triggers:**
   - New notice → notify residents
   - Payment completed → notify payer
   - Maintenance status change → notify resident
   - Booking approved/rejected → notify resident
   - Visitor check-in / support ticket → notify relevant users
5. **Frontend** — `SocketContext` connects when user has `societyId`; `NotificationBell` increments count; `/notifications` page lists history with mark read.

**Why DB + socket?**
Socket for online users; DB for users who were offline when event happened.

**Key files:** `backend/models/Notification.js`, `backend/socket/socketHandler.js`, `frontend/src/context/SocketContext.jsx`, `frontend/src/components/common/NotificationBell.jsx`

---

### 4.2 AI Chatbot Assistant (OpenAI)

**What it does:** Floating chat widget for residents. Answers questions using real data from their account (maintenance, notices, bookings).

**Why OpenAI + context injection?**
Generic chatbots hallucinate balances. We fetch live data and put it in the **system prompt** so answers match the database.

**How it works:**

1. `POST /api/chat` with `{ message }`.
2. `buildUserContext()` loads last 3 maintenance rows, notices, bookings for `req.user`.
3. **Conversation** model stores last 10 messages per user (multi-turn).
4. Model: `gpt-4o-mini` (configurable via `OPENAI_MODEL`) — cost-effective.
5. **Support tickets:** If message matches keywords (`complaint`, `support`, `ticket`, etc.), creates `SupportTicket` and notifies Society Admin.

**Why residents only in UI?**
Chatbot context is built around flat, maintenance, and bookings — resident-specific data.

**Key files:** `backend/models/Conversation.js`, `backend/controllers/chatbotController.js`, `frontend/src/components/common/ChatbotWidget.jsx`

---

### 4.3 Support Tickets

**What it does:** Formal complaint records from chatbot (or future manual entry). Admin marks resolved.

**Why separate from notices?**
Notices are broadcasts; tickets are actionable items tied to one resident.

**How it works:**

- Auto-created from chatbot keyword detection.
- `GET /api/support` — Residents see own; Admin sees society.
- `PATCH /api/support/:id` — Admin sets `resolved`.
- Pages: `/support/my`, `/admin/support`.

**Key files:** `backend/models/SupportTicket.js`, `backend/controllers/supportTicketController.js`

---

### 4.4 Analytics Dashboard (Recharts)

**What it does:** Society Admin sees charts: revenue, collection breakdown, visitor traffic, facility usage, occupancy, notice activity.

**Why MongoDB aggregation + Recharts?**
No extra analytics DB needed; aggregation pipelines compute summaries on demand. Recharts renders responsive charts in React.

**How it works:**

| Endpoint | Chart | Data |
|----------|-------|------|
| `/api/analytics/revenue` | Bar | Paid maintenance by month (current year) |
| `/api/analytics/collection` | Pie | pending/paid/overdue counts (current month) |
| `/api/analytics/visitors` | Line | Daily check-ins (last 30 days) |
| `/api/analytics/facilities` | Bar | Approved bookings per facility |
| `/api/analytics/summary` | Stat cards | Residents, totalFlats, **occupancy %**, vacant flats, dues |
| `/api/analytics/notices` | Horizontal bar | Recent notices (engagement proxy) |
| `/api/maintenance/analytics` | Stacked bar | Monthly totals by status |

**Occupancy formula:** `(active residents / society.totalFlats) × 100`

**Key files:** `backend/controllers/analyticsController.js`, `frontend/src/pages/societyAdmin/AnalyticsDashboard.jsx`

---

## 5. Security & Access Control

### Role matrix (summary)

| Feature | app_admin | society_admin | resident | security |
|---------|-----------|---------------|----------|----------|
| Manage societies | ✅ | ❌ | ❌ | ❌ |
| Manage users (platform) | ✅ | ❌ | ❌ | ❌ |
| Notices CRUD | ❌ | ✅ | Read | Read* |
| Maintenance admin | ❌ | ✅ | Own + read all | ❌ |
| Pay maintenance | ❌ | ❌ | ✅ | ❌ |
| Pre-approve visitor | ❌ | ❌ | ✅ | ❌ |
| Log visitor | ❌ | ❌ | ✅ | ✅ |
| Scan QR | ❌ | ❌ | ❌ | ✅ |
| Book facility | ❌ | ❌ | ✅ | ❌ |
| Approve bookings | ❌ | ✅ | ❌ | ❌ |
| Analytics | ❌ | ✅ | ❌ | ❌ |
| Chatbot | ❌ | ❌ | ✅ | ❌ |

\*Notices require login; security users with `societyId` can fetch notices API.

### Practices used

- Passwords hashed (bcrypt), never returned in API responses (`select('-password')`).
- JWT secret in `.env`, not committed.
- Society-scoped queries (`societyId: req.user.societyId`) on sensitive data.
- Razorpay webhook signature verification.
- Public visitor pass endpoint exposes only non-sensitive pass fields (no auth, token is secret).

---

## 6. Environment Variables

| Variable | Required for | Purpose |
|----------|----------------|---------|
| `MONGO_URI` | Always | MongoDB connection |
| `JWT_SECRET` | Always | Sign/verify tokens |
| `PORT` | Optional | API port (default 5000) |
| `FRONTEND_URL` | QR links, CORS | e.g. `http://localhost:5173` |
| `RAZORPAY_KEY_ID` | Payments | Test/live key |
| `RAZORPAY_KEY_SECRET` | Payments | Order + verify HMAC |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook | Webhook HMAC |
| `EMAIL_USER` / `EMAIL_PASS` | QR emails | Gmail app password |
| `OPENAI_API_KEY` | Chatbot | OpenAI API |
| `OPENAI_MODEL` | Optional | Default `gpt-4o-mini` |
| `VITE_API_URL` | Frontend | API base URL |
| `VITE_SOCKET_URL` | Frontend | Socket.io server URL |

---

## 7. API Route Reference

### Auth
- `POST /api/auth/register` — Public
- `POST /api/auth/login` — Public

### Societies
- `GET /api/societies` — Public
- `POST/PUT/DELETE /api/societies` — App Admin

### Users
- `GET /api/users` — App Admin
- `GET /api/users/society` — Society Admin
- `PUT /api/users/:id/role` — App Admin

### Notices, Visitors, Maintenance, Bookings
- See `PROJECT_SPEC.md` tables; visitor adds `/pre-approve`, `/verify/:token`, `/public/:token`, `/pending`, `/approve`, `/reject`.

### Payments
- `POST /api/payments/create-order` — Resident
- `POST /api/payments/verify` — Resident
- `POST /api/payments/webhook` — Razorpay (raw body, no JWT)

### Notifications
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`

### Chat
- `POST /api/chat` — Resident
- `GET/DELETE /api/chat/history` — Resident
- `POST /api/chatbot/message` — Legacy compatible

### Analytics
- `GET /api/analytics/revenue|collection|visitors|facilities|summary|notices` — Society Admin

### Support
- `GET /api/support` — Resident (own), Society Admin (society)
- `PATCH /api/support/:id` — Society Admin

---

## Summary: Phase Completion

| Phase | Status |
|-------|--------|
| **Phase 1** | ✅ Complete — auth, societies, notices, visitors, maintenance, dashboards |
| **Phase 2** | ✅ Complete — Razorpay (+ webhook), QR visitors, facility booking, real-time events |
| **Phase 3** | ✅ Complete — persistent notifications, AI chatbot, support tickets, analytics + occupancy + notice chart |

For setup and demo accounts, see [README.md](./README.md).
