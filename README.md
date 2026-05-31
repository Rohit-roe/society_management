# Society Management App (MERN — Phase 1)

Portfolio-ready society management system: notices, visitor logging, and maintenance tracking with role-based access.

## Stack

- **MongoDB** + **Express** + **React (Vite)** + **Node.js**
- JWT authentication, bcrypt password hashing

## Quick start

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) **or** MongoDB Atlas URI in `backend/.env`

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # edit MONGO_URI and JWT_SECRET if needed
npm run seed           # once — creates demo society and users
npm run dev            # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # optional: VITE_API_URL
npm run dev            # http://localhost:5173
```

## Demo accounts (after seed)

Password for all: `Admin@1234`

| Role | Email |
|------|-------|
| App Admin | admin@app.com |
| Society Admin | societyadmin@greenvalley.com |
| Resident | resident@greenvalley.com |
| Security | security@greenvalley.com |

## Documentation

See **[PROJECT_SPEC.md](./PROJECT_SPEC.md)** for roles, API routes, schemas, and Phase 2 roadmap.

See **[FUNCTIONALITIES.md](./FUNCTIONALITIES.md)** for a detailed explanation of every feature — what it does, why it exists, and how it is implemented.

## Deployment notes

- Set `MONGO_URI` and `JWT_SECRET` on your host (Railway/Render).
- Set `VITE_API_URL` to your deployed API before building the frontend (`npm run build`).
- Host frontend on Vercel/Netlify; API on Railway/Render.

## Phase 1 scope

- Auth + society selection on register
- Notice board (login required)
- Visitor log + checkout
- Maintenance records + admin status updates

## Phase 2 & 3 (implemented)

- **Razorpay** — Pay Now on maintenance (add `RAZORPAY_*` to `backend/.env`)
- **Visitor approval** — pre-approve + QR scan at gate; walk-in resident approval
- **Facility booking** — calendar slots, admin approve/reject
- **Real-time notifications** — Socket.io + notification bell + history page
- **AI chatbot** — OpenAI assistant for residents (add `OPENAI_API_KEY`)
- **Analytics** — Recharts dashboard for society admins

Optional: `EMAIL_USER` / `EMAIL_PASS` for sending visitor QR emails via Gmail.
