# Residio — Premium Society Management Platform
## Project Specification & Architecture Master Blueprint

This document specifies the system architecture, roles, schema structures, route mappings, and frontend pages of the **Residio** platform.

---

## 1. Project Overview

**Residio** is a multi-tenant society management web application for housing estates, gated communities, and residential buildings. The platform centralizes and automates community administration: announcements, visitor logs, digital facility bookings, maintenance invoicing, community vault files, real-time alerts, and staff directories.

### Key Architectural Tenets
1. **Multi-Tenant Isolation**: Each society is logically isolated. Residents, guards, and local society administrators only see data matching their assigned `societyId`.
2. **Platform Administration**: A global **App Admin** approves registering societies and manages user rosters platform-wide.
3. **Role-Based Access Control (RBAC)**: Custom middlewares enforce access levels at both the API layer (JWT validation) and React router layer.
4. **Theme Synchronization**: Frontend layouts adapt dynamically to four premium presets (Clean Corporate, Warm Modern, Midnight Dashboard, Graphite Pro), propagating styling variables to Recharts visualizations.

---

## 2. System Roles & Permissions

| Role | Target Users | Description & Primary Permissions |
|------|--------------|-----------------------------------|
| **App Admin** | Platform Owners | platform oversight; create, edit, approve, or reject societies; manage global user rosters; view system audit logs. |
| **Society Admin** | Society Managers / Committee | Manage local announcements; generate maintenance invoices; allocate parking; approve facility bookings; manage staff and security rosters; view analytics. |
| **Resident** | Flat Owners / Tenants | View notice boards; file support tickets; pay maintenance fees (Razorpay); request facility slots; pre-approve guests (QR generation); report parking issues. |
| **Security** | Gate Guards / Staff | Verify resident pre-approved guest QR codes; register walk-in guests; log visitor check-in and check-out events; manage shift registers. |

---

## 3. Core Database Collections

The MongoDB database utilizes 23 distinct collections:

| Collection | Purpose | Key Associations |
|------------|---------|------------------|
| `users` | User credentials, roles, profiles, and flat associations. | `societyId` |
| `societies` | Gated community master records (names, addresses, metrics). | — |
| `notices` | Community notice board announcements. | `societyId`, `postedBy` |
| `visitors` | Guest pre-approvals, walk-in registers, and QR tokens. | `societyId`, `loggedBy` |
| `maintenances` | Monthly billing invoices per flat. | `societyId`, `residentId` |
| `payments` | Transaction receipts mapping to Razorpay checkouts. | `societyId`, `userId` |
| `bookings` | Amenity reservations (clubhouse, tennis courts). | `societyId`, `userId` |
| `parkings` | Gated parking slots ledger and ownership logs. | `societyId`, `ownerId` |
| `staffs` | Local service staff registry (maids, cleaners, plumbers). | `societyId` |
| `supporttickets` | Helpdesk service requests submitted by residents. | `societyId`, `userId` |
| `polls` | Real-time community voting polls and surveys. | `societyId` |
| `documentvaults`| Digital file cabinets for guidelines, certificates, and deeds. | `societyId` |
| `auditlogs` | Action trace logs for security audits. | `societyId`, `userId` |
| `notifications` | In-app alerts, broadcast logs, and push queues. | `userId` |
| `penalties` | Fines and penalty notifications issued to residents. | `societyId`, `residentId` |
| `eventproposals` | Community event proposals seeking approvals. | `societyId` |
| `expenses` | Society ledger expenses. | `societyId` |
| `securityshifts` | Active guard duty shift logs. | `societyId` |
| `societyrequests`| Requests for new society additions. | — |
| `societywallets` | Accounts holding maintenance balances. | `societyId` |
| `wallettransactions`| Ledger details for wallet transactions. | `societyId` |
| `residentmembers`| Auxiliary household members (spouse, child, etc.). | `userId` |
| `conversations` | AI Chatbot conversation histories. | `userId` |

---

## 4. Key MongoDB Schema Outlines

### User
```js
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['app_admin', 'society_admin', 'resident', 'security'], required: true },
  societyId: { type: ObjectId, ref: 'Society' },
  flatNumber: String,
  isActive: { type: Boolean, default: true }
}
```

### Visitor (Pre-approvals & Walk-ins)
```js
{
  societyId: { type: ObjectId, ref: 'Society', required: true },
  visitorName: { type: String, required: true },
  visitorPhone: String,
  flatToVisit: { type: String, required: true },
  purpose: String,
  checkIn: Date,
  checkOut: Date,
  loggedBy: { type: ObjectId, ref: 'User', required: true },
  approvalToken: String,
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'expired', 'checked_in', 'checked_out'], 
    default: 'pending' 
  },
  preApproved: { type: Boolean, default: false },
  expectedAt: Date,
  guestEmail: String,
  qrCodeDataUrl: String,
  approvedBy: { type: ObjectId, ref: 'User' }
}
```

---

## 5. Backend API Route Modules

Express routes are modularized across 22 router files in `backend/routes/`:

| Route Module | Endpoint Prefix | Scope | Description |
|--------------|-----------------|-------|-------------|
| `authRoutes` | `/api/auth` | Public | Credentials registration, logins, token validations. |
| `societyRoutes` | `/api/societies` | Mixed | Query active societies (register select) or configure new entries. |
| `userRoutes` | `/api/users` | Admin | Roster oversight, user activations, and role assignment. |
| `residentRoutes` | `/api/residents` | Resident | Manage secondary household members, register parking queries. |
| `noticeRoutes` | `/api/notices` | Auth | Post notice broadcasts, update priorities, query logs. |
| `visitorRoutes` | `/api/visitors` | Mixed | Pre-approve guest invites, retrieve visitor histories. |
| `maintenanceRoutes` | `/api/maintenance` | Mixed | Invoice creations, billing history ledgers, payment reports. |
| `paymentRoutes` | `/api/payments` | Auth | Razorpay transaction logs, checksum checks, order initializations. |
| `bookingRoutes` | `/api/bookings` | Auth | Schedule amenity bookings, list availability slots. |
| `parkingRoutes` | `/api/parking` | Mixed | Allocate parking slots, assign owners, file violations. |
| `staffRoutes` | `/api/staff` | Mixed | Directory logs, service catalog, cleaner/plumber tasks. |
| `securityShiftRoutes` | `/api/security` | Admin/Guard | Guard profiles, attendance tracking, active shifts log. |
| `supportTicketRoutes`| `/api/support` | Auth | File complaints, update tickets, assign technicians. |
| `votingRoutes` | `/api/voting` | Auth | Setup surveys, record resident choices. |
| `vaultRoutes` | `/api/vault` | Auth | Manage digital guidelines, rules, certificates. |
| `penaltyRoutes` | `/api/penalties` | Mixed | Issue fine notices, track fine clearings. |
| `analyticsRoutes` | `/api/analytics` | Admin | Financial tracking, occupancy rates, parking availability charts. |
| `notificationRoutes` | `/api/notifications` | Auth | Retrieve alerts list, mark notices read. |
| `chatbotRoutes` | `/api/chatbot` | Resident | OpenAI assistant endpoints for interactive FAQs. |
| `uploadRoutes` | `/api/upload` | Auth | Cloudinary/local file upload channels (documents/avatars). |

---

## 6. Frontend Pages & Routing

All routes are declared in [AppRouter.jsx](file:///c:/suntek/Society-Management-App/frontend/src/routes/AppRouter.jsx):

### Public Routes (Unauthenticated)
- `/` — Landing Page (Sticky SaaS bar, Hero pitch, Features Grid, Stats block).
- `/login` — Login Page (Includes Eye/Eyeoff password toggles, Forgot password anchors).
- `/register` — Register Page (Fixed-width layout, selects society, verifies credentials).
- `/403` — Access Forbidden error interface.
- `/verify-visitor` — QR pass landing display.

### Authenticated Shared Routes
- `/notifications` — Active alerts panel.

### Resident Routes (Role: `resident`)
- `/dashboard` — Resident Dashboard (Onboarding welcome cards, Household rosters).
- `/notices` — Broadcast notices board (Includes Urgent filter toggles).
- `/visitors` — Logged visitors ledger for flat.
- `/visitors/pre-approve` — Guest passes page (Generates local SVG QR passes).
- `/maintenance/my` — Invoices check-off dashboard (Razorpay billing).
- `/maintenance/society` — Resident ledger showing overall payments status (read-only).
- `/bookings` — Amenity reservation slots (Mobile split-stacking columns).
- `/bookings/my` — Reservation histories.
- `/support/my` — Helpdesk tickets page.
- `/finances` — Household finances, receipts.
- `/voting` — Polls and election surveys.
- `/vault` — Society document lockers.
- `/penalties` — Fines notices ledger.
- `/parking` — Parking slot check and dispute files.

### Security Routes (Role: `security`)
- `/security/dashboard` — Security Guard welcome gate.
- `/visitors/log` — Universal visitor check-in/out roster.
- `/security/scan` — QR Pass camera reader (Camera feeds toggle non-destructively).

### Society Admin Routes (Role: `society_admin`)
- `/admin/dashboard` — Society statistics, KPIs, quick approvals.
- `/admin/notices` — Announcements control.
- `/admin/maintenance` — Flat billing config, manual adjustments.
- `/admin/bookings` — Facility approvals dashboard.
- `/admin/analytics` — Recharts graphs (Synchronized dynamically to selected layout colors).
- `/admin/visitors` — Global visitor logs.
- `/admin/residents` — Tenant roster, flat linkages.
- `/admin/support` — Helpdesk tickets manager.
- `/admin/finances` — Gated community financial accounts.
- `/admin/voting` — Create polls and track votes.
- `/admin/vault` — Digital document storage configuration.
- `/admin/penalties` — Fine generation dashboard.
- `/admin/audit-logs` — Admin operational audit trail.
- `/admin/parking` — Setup parking slots, allocate slots to flats.
- `/admin/security` — Manage guards shift timings, check attendance.
- `/admin/staff` — Service staff directories, assign chores.

### App Super Admin Routes (Role: `app_admin`)
- `/app-admin/dashboard` — Platform registrations, quick approval metrics.
- `/app-admin/societies` — Add societies, confirm registrations via centered overlay Modals.
- `/app-admin/users` — Manage roles, activate/deactivate accounts.
- `/app-admin/audit-logs` — Global system audit trail logs.

---

## 7. UX & Accessibility Conventions
1. **Interactive Overlays**: No raw window confirm popups are used. Modals use centering wrappers, Escape key listeners, and Lucide `X` icons.
2. **Keyboard Traps**: When a modal opens, focus is caught and bound to the first logical input element using refs.
3. **Form Sizing**: Card structures for authentication lock at `640px` to maintain center margins.
4. **Per-section Loaders**: Analytics charts load separate CSS skeletons rather than showing full-page blocking spinners.
