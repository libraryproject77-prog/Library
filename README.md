# FXEC ECE LIBRARY - Complete Department Library Management System

> Production-Ready Full-Stack Department Library Management System for the Department of Electronics and Communication Engineering (ECE), Francis Xavier Engineering College (FXEC).

Built with Google Antigravity, following the **Aura Narrative** Google Stitch UI design system (modern minimalist void dark theme with electric violet/purple gradients).

---

## 🏗️ Architecture Overview

The repository is structured as a scalable monorepo:

```
c:\Users\santh\OneDrive\Desktop\Library\
├── apps/
│   ├── web/                    # Next.js 14+ (App Router) Frontend
│   │   ├── app/
│   │   │   ├── (auth)/login/   # Google OAuth & College Email SSO
│   │   │   ├── admin/          # Complete Admin Portal (All Subsystems)
│   │   │   │   ├── dashboard/  # Circulation metrics & Recharts analytics
│   │   │   │   ├── books/      # Catalog & Copy ID generator (e.g. ECE-VLSI-001)
│   │   │   │   ├── rack/       # Virtual Book Rack (Realistic CSS wooden bookshelf)
│   │   │   │   ├── reservations/# Request approvals & rejections
│   │   │   │   ├── issue/      # Physical Book Issue Desk & Due Date calculator
│   │   │   │   ├── return/     # Physical Return Desk & Overdue Penalty calculator
│   │   │   │   ├── members/    # Student & Faculty directory + history
│   │   │   │   ├── reports/    # Real-time CSV export & audit printouts
│   │   │   │   └── notifications/# Automated Reminders (15D, 7D, 3D, 1D, Overdue)
│   │   ├── lib/api.ts          # Unified REST API Client
│   │   └── tailwind.config.ts  # Exact Stitch Aura Narrative design tokens
│   │
│   └── api/                    # Express.js REST API Backend
│       ├── src/
│       │   ├── controllers/    # Books, Copies, Reservations, Borrowing, Reports
│       │   ├── middleware/     # Auth, RBAC, college email domain restriction
│       │   ├── services/       # Store, automated node-cron reminders
│       │   ├── routes/         # REST API routes
│       │   └── app.ts          # Express server with Helmet, CORS, cookies
│       └── prisma/
│           └── schema.prisma   # 11 normalized PostgreSQL tables
│
└── packages/
    └── shared/                 # Shared TypeScript interfaces & Zod schemas
```

---

## 🚀 Running the Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend API (Port 5000)
```bash
npm --workspace=apps/api run dev
```
The API server starts at `http://localhost:5000/api` with automated reminder cron jobs.

### 3. Start the Next.js Frontend (Port 3000)
```bash
npm --workspace=apps/web run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 🔒 Institutional Domain Security
- Only `@francisxavier.ac.in` college emails are allowed.
- Preloaded with Dr. S. K. Rajan (HOD / Admin) for instant validation.

---

## 🪵 Virtual Book Rack (Feature 7)
- Renders every individual physical copy inside a realistic CSS-rendered wooden bookshelf.
- Status LEDs:
  - 🟢 **Green**: AVAILABLE
  - 🟠 **Orange**: RESERVED
  - 🔵 **Blue**: BORROWED
  - ⚪ **Grey**: DAMAGED / LOST
- Spines show unique Copy IDs (e.g. `ECE-VLSI-001`, `ECE-DSP-002`) retrieved live from the database.
