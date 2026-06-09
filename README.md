# Residio — Premium Society Management Platform

Residio is a modern, portfolio-ready MERN-stack society management system designed to streamline apartment and housing community operations. It includes notices, visitor logs, facility bookings, maintenance tracking, billing, dynamic analytics, and real-time alerts.

---

## Technical Stack

- **Frontend**: React (Vite), TailwindCSS, Recharts, Lucide Icons, Socket.io-client, React Hot Toast, QRCode.react.
- **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.io, Razorpay.
- **Authentication**: JSON Web Tokens (JWT) with secure HTTP-only configurations & bcrypt password hashing.

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) **or** a MongoDB Atlas URI configured in `backend/.env`.

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Configure MONGO_URI, JWT_SECRET, and optional keys (Razorpay, OpenAI)
npm run seed           # Runs once — populates demo societies and user profiles
npm run dev            # API runs at http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env   # Set VITE_API_URL if connecting to a remote API
npm run dev            # Frontend runs at http://localhost:5173
```

---

## Demo Accounts (After Seed)

Password for all: `Admin@1234`

| Role | Email | Description |
|------|-------|-------------|
| **App Admin** | `admin@app.com` | Super admin managing societies and user accounts. |
| **Society Admin** | `societyadmin@greenvalley.com` | Manage greenvalley society notices, billing, facilities, staff, and parking. |
| **Resident** | `resident@greenvalley.com` | View billing, register guests, submit tickets, request parking, and book facilities. |
| **Security** | `security@greenvalley.com` | Verify visitor QR passes, log walk-ins, check check-in/check-out logs. |

---

## Implemented Features (MERN Overhaul)

### Core Functions
- **Real-Time Notice Board**: Dynamic announcements with search, urgent priority filters, and custom category badges.
- **Maintenance & Payments**: Automatic monthly dues creation with embedded Razorpay gateway checkouts.
- **Facility Bookings**: Grid calendar checking and booking for common facilities (clubhouse, gym).
- **Security Check-Ins**: Interactive guest registers, walk-in notifications, and check-out logs.
- **Vault & Polls**: Multi-user shared file storage and real-time voting on community issues.

### Premium UI/UX & Accessibility Enhancements
- **Dynamic Chart Theming**: Analytics dashboards use `MutationObserver` to sync color strokes in Recharts with the active website theme (Clean Corporate, Warm Modern, Midnight Dashboard, Graphite Pro) on-the-fly.
- **Robust Accessibility**: ESC key handlers, auto-focus input traps, and standard Lucide close icons implemented on all modal panels.
- **Onboarding Experience**: Dismissible greeting checks to guide new residents, saved locally.
- **Pre-Approved Visitor Passes**: Resident invitation panels with instant SVG QR pass overlays using `qrcode.react`.
- **Non-destructive QR Scanner**: Clean teardowns and reconstruction of the HTML5-qrcode camera feeds, avoiding full-page browser reloads.
- **Layout Sizing Stability**: Responsive column splits for facility bookings, fluid grid cards for dashboards, and fixed-width forms to eliminate content jumping.

---

## Documentation

- **[PROJECT_SPEC.md](./PROJECT_SPEC.md)**: Details permission hierarchies, API paths, schemas, and complete lists of routes.
- **[FUNCTIONALITIES.md](./FUNCTIONALITIES.md)**: Comprehensive breakdown of every feature, detailing code implementation, UI states, and data contracts.
