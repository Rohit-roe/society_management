# Society Management App — Project Specification

## 1. Project Overview

The **Society Management App** is a MERN stack web application for apartment and housing societies. It centralizes day-to-day operations: announcements, visitor records, and maintenance dues tracking. Each society is isolated in the system; residents, security staff, and society administrators only see data for their own society. A platform **App Admin** creates societies and manages users across the platform.

---

## 2. System Roles & Permissions

| Role | Description | Key permissions |
|------|-------------|-----------------|
| **App Admin** | Platform owner | Create/edit/delete societies; view all users; change user roles; cannot use public registration |
| **Society Admin** | Manages one society | Post/edit/delete notices; create maintenance records; update payment status; view all visitors and residents in society |
| **Resident** | Flat owner/tenant | View notices; log visitors for own flat; view own maintenance and society-wide maintenance (read-only) |
| **Security** | Gate staff | Log visitors for any flat; view society visitor log; check visitors out |

**Access control:** JWT authentication + role middleware on every protected API route.

---

## 3. Registration Flow

1. User opens **Register** and selects an existing **society/apartment** from the dropdown (societies are created only by App Admin).
2. User enters name, email, password, phone, and role (**Resident** or **Security**).
3. If role is **Resident**, **flat number** is required (e.g. `A-101`).
4. Backend validates that the society exists; rejects `app_admin` self-registration.
5. On success, user is redirected to **Login**.

---

## 4. Full System Features (Roadmap)

| Feature | Phase |
|---------|-------|
| Authentication (login/register) | Phase 1 |
| Role-based access | Phase 1 |
| Society management | Phase 1 |
| Notice board | Phase 1 |
| Visitor logging | Phase 1 |
| Maintenance tracking | Phase 1 |
| Maintenance payment integration (Razorpay) | Phase 2 |
| Facility booking | Phase 2 |
| Real-time notifications (Socket.io) | Phase 2 |
| AI chatbot assistant | Phase 2 |
| Analytics dashboard | Phase 2 |

---

## 5. Phase 1 Implementation

Phase 1 includes **only**:

- JWT login/register
- Society selection during registration
- Role-based access (4 roles)
- Notice board (login required to view)
- Visitor logging (record only; **no** approval workflow)
- Maintenance tracking
- Residents: view own maintenance + all flats’ status for current month (read-only)
- Society Admin: manually update maintenance payment status
- **No** payment gateway in Phase 1

---

## 6. Database Collections

| Collection | Purpose |
|------------|---------|
| `users` | Accounts, roles, society link, flat number |
| `societies` | Apartment/society master data |
| `notices` | Society announcements |
| `visitors` | Visitor check-in/check-out logs |
| `maintenances` | Monthly dues per flat |

---

## 7. MongoDB Schema Suggestions

### User

```js
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String,
  role: enum ['app_admin','society_admin','resident','security'],
  societyId: ObjectId → Society,
  flatNumber: String,
  isActive: Boolean (default true),
  timestamps: true
}
```

### Society

```js
{
  name, address, city: String (required),
  totalFlats: Number (required),
  createdBy: ObjectId → User,
  timestamps: true
}
```

### Notice

```js
{
  societyId: ObjectId (required),
  title, body: String (required),
  priority: enum ['normal','urgent'],
  postedBy: ObjectId → User,
  timestamps: true
}
```

### Visitor

```js
{
  societyId: ObjectId (required),
  visitorName: String (required),
  visitorPhone, purpose: String,
  flatToVisit: String (required),
  checkIn: Date,
  checkOut: Date,
  loggedBy: ObjectId → User,
  timestamps: true
}
```

### Maintenance

```js
{
  societyId: ObjectId (required),
  residentId: ObjectId → User,
  flatNumber: String (required),
  month: Number (1–12),
  year: Number,
  amount: Number,
  status: enum ['pending','paid','overdue'],
  paidOn: Date,
  updatedBy: ObjectId → User,
  unique index: (societyId, flatNumber, month, year)
}
```

---

## 8. Backend API Routes

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register (not app_admin) |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/societies` | Public | List societies (register dropdown) |
| POST | `/api/societies` | App Admin | Create society |
| PUT | `/api/societies/:id` | App Admin | Update society |
| DELETE | `/api/societies/:id` | App Admin | Delete society |
| GET | `/api/users` | App Admin | All users |
| GET | `/api/users/society` | Society Admin | Users in own society |
| PUT | `/api/users/:id/role` | App Admin | Change role |
| DELETE | `/api/users/:id` | App Admin | Delete user |
| GET | `/api/notices` | Authenticated | Notices for user’s society |
| POST | `/api/notices` | Society Admin | Create notice |
| PUT | `/api/notices/:id` | Society Admin | Update notice |
| DELETE | `/api/notices/:id` | Society Admin | Delete notice |
| GET | `/api/visitors` | Society Admin, Security | All society visitors |
| GET | `/api/visitors/flat` | Resident | Visitors for own flat |
| POST | `/api/visitors` | Resident, Security | Log visitor |
| PATCH | `/api/visitors/:id/checkout` | Resident, Security | Check out |
| GET | `/api/maintenance` | Society Admin | All records |
| GET | `/api/maintenance/my` | Resident | Own flat history |
| GET | `/api/maintenance/all` | Resident, Society Admin | Current month, all flats |
| POST | `/api/maintenance` | Society Admin | Create record |
| PATCH | `/api/maintenance/:id` | Society Admin | Update status |

---

## 9. Frontend Pages

| Route | Role | Page |
|-------|------|------|
| `/` | Public | Landing |
| `/login`, `/register` | Public | Auth |
| `/403` | Public | Forbidden |
| `/dashboard` | Resident | Dashboard |
| `/notices` | Resident | Notice board |
| `/visitors` | Resident | Visitor log (own flat) |
| `/maintenance/my` | Resident | My maintenance |
| `/maintenance/society` | Resident, Society Admin | All flats (current month) |
| `/security/dashboard` | Security | Security home |
| `/visitors/log` | Security | Log visitors |
| `/admin/*` | Society Admin | Notices, maintenance, visitors, residents |
| `/app-admin/*` | App Admin | Societies, users |

---

## 10. Suggested MERN Folder Structure

```
society-management-app/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/seedAdmin.js
│   ├── utils/
│   ├── server.js
│   └── .env
├── frontend/
│   └── src/
│       ├── api/axios.js
│       ├── components/
│       ├── context/AuthContext.jsx
│       ├── pages/
│       │   ├── public/
│       │   ├── resident/
│       │   ├── societyAdmin/
│       │   ├── security/
│       │   └── appAdmin/
│       └── routes/
├── PROJECT_SPEC.md
└── README.md
```

---

## 11. Phase 2 / Future Features

- **Online payments** — Razorpay for maintenance collection
- **Visitor approval** — Pre-approve guests, QR codes
- **Facility booking** — Clubhouse, gym, etc.
- **Real-time notifications** — Socket.io push
- **AI chatbot** — Society FAQ assistant
- **Analytics dashboard** — Charts (Recharts) for dues, visitors, occupancy

---

*This document is the master blueprint for the portfolio project. Phase 1 implementation lives in `backend/` and `frontend/`.*
