<<<<<<< HEAD
# QueueFlow - Queue Management System

> A production-ready, full-stack Queue Management System (QMS) with live token generation, staff approval workflow, role-based authentication, and real-time analytics. Powered by Node.js + MongoDB.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Application Routes](#application-routes)
- [User Roles & Permissions](#user-roles--permissions)
- [Token Lifecycle](#token-lifecycle)
- [API Reference](#api-reference)
- [Screenshots](#screenshots)

---

## Overview

QueueFlow is a complete digital queue management solution designed for hospitals, clinics, government offices, and service centers. It replaces physical token systems with a dynamic, real-time web platform that manages customer flow from token generation all the way through service completion.

---

## Features

- 🔐 **Secure Authentication** — Register/Login with bcrypt hashed passwords stored securely in MongoDB
- 🎫 **Token Generation** — Customers select a service and generate a unique digitally tracked token
- ⏳ **Staff Approval Workflow** — Tokens begin in a "Pending" state and must be approved by staff before entering the live queue
- 📊 **Admin Analytics** — Real-time charts tracking hourly traffic, service distribution, and completion rates
- 🛡️ **Route Protection** — All protected pages (Staff, Admin) redirect to login if accessed without a valid session
- 👥 **Role-Based Access** — Admin, Staff, and Customer roles with different views and permissions
- 🔄 **Live Polling** — Queue status updates automatically every 5 seconds on all dashboards
- 🌙 **Dark Mode** — Full dark/light mode support based on system preference

---

## Technology Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | HTML5, Vanilla JS, TailwindCSS (CDN)    |
| Charts       | Chart.js                                |
| Backend API  | Node.js, Express.js                     |
| Database     | MongoDB (Local), Mongoose ODM           |
| Auth/Crypto  | bcryptjs                                |
| HTTP Client  | Fetch API (native browser)              |

---

## Project Structure

```
queue dash/
├── server.js                  # Express backend & all API routes
├── package.json               # Node.js project config
├── models/
│   ├── Token.js               # Token schema (pending/waiting/serving/completed)
│   ├── User.js                # User schema with role (admin/staff/customer)
│   ├── Service.js             # Service definitions (Doctor, Lab, etc.)
│   └── Counter.js             # Counter model
├── js/
│   ├── core.js                # Shared utilities, dark mode, route protection
│   ├── auth.js                # Login/Register form logic
│   ├── admin-dashboard.js     # Admin charts and metrics
│   ├── analytics-dashboard.js # Analytics charts
│   ├── staff-dashboard.js     # Pending approvals + active queue
│   └── customer-token.js      # Token generation and queue display
├── css/
│   └── style.css              # Global styles and animations
├── assets/                    # Images and icons
├── index.html                 # Landing / Home page
├── auth.html                  # Login & Register page
├── customer-token.html        # Customer token request UI
├── staff-dashboard.html       # Staff control panel
├── admin-dashboard.html       # Admin overview with charts
├── analytics-dashboard.html   # Analytics view
├── settings.html              # System settings
├── status.html                # Public queue status display
└── queue-display.html         # Large queue display board
```

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally

### Steps

**1. Clone or Download the project**
```bash
cd "queue dash"
```

**2. Install Dependencies**
```bash
npm install
```

**3. Start MongoDB**

Make sure MongoDB is running locally. By default, the app connects to:
```
mongodb://127.0.0.1:27017/queueflow
```
> You can verify this using [MongoDB Compass](https://www.mongodb.com/products/compass).

**4. Start the Server**
```bash
node server.js
```

You should see:
```
QueueFlow backend running on port 3000
Connected to MongoDB via local instance!
Default services seeded!
```

**5. Open in the browser**

Navigate to: [http://localhost:3000/auth.html](http://localhost:3000/auth.html)

---

## Application Routes

| Page | URL | Access |
|------|-----|--------|
| Home | `http://localhost:3000/index.html` | Public |
| Login / Register | `http://localhost:3000/auth.html` | Public |
| Customer Token Request | `http://localhost:3000/customer-token.html` | Logged In |
| Staff Dashboard | `http://localhost:3000/staff-dashboard.html` | Staff / Admin |
| Admin Dashboard | `http://localhost:3000/admin-dashboard.html` | Admin Only |
| Analytics | `http://localhost:3000/analytics-dashboard.html` | Admin / Staff |
| Settings | `http://localhost:3000/settings.html` | Admin Only |
| Queue Display Board | `http://localhost:3000/queue-display.html` | Public |

---

## User Roles & Permissions

| Feature | Customer | Staff | Admin |
|---------|----------|-------|-------|
| Generate Token | ✅ | ✅ | ✅ |
| View Live Queue | ✅ | ✅ | ✅ |
| Approve Pending Tokens | ❌ | ✅ | ✅ |
| Call Next / Complete Token | ❌ | ✅ | ✅ |
| View Admin Dashboard | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ✅ | ✅ |
| System Settings | ❌ | ❌ | ✅ |

---

## Token Lifecycle

When a customer requests a token, it goes through the following stages:

```
Customer Requests Token
        │
        ▼
  [pending] ──── Staff sees in "Pending Approvals" panel
        │
        │  Staff clicks "Approve"
        ▼
  [waiting] ──── Token enters the Live Active Queue
        │
        │  Staff clicks "Complete & Next"
        ▼
  [serving] ──── Token is currently being served at counter
        │
        │  Service complete
        ▼
 [completed] ──── Token archived in MongoDB
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and create session |
| `GET` | `/api/queue/stats` | Get live queue metrics |
| `POST` | `/api/queue/token` | Generate a new token (status: pending) |
| `GET` | `/api/queue/pending` | Get all pending approval tokens |
| `PATCH` | `/api/queue/approve/:tokenId` | Approve a pending token |
| `PATCH` | `/api/queue/call` | Mark current token complete, call next |
| `POST` | `/api/queue/reset` | Reset the entire queue |

---

## Notes

- Tokens are generated with a service-based prefix (e.g., `D-001` for Doctor, `L-001` for Lab).
- The system uses `localStorage` for session management (suitable for local deployments).
- Default services are automatically seeded into MongoDB on first run.
- For multi-device testing, open pages in separate browser windows or use Incognito mode.

---

> Built with ❤️ using Node.js, Express, and MongoDB.
=======
# queueflow-qms
>>>>>>> 59b84a4f934751fd4649cc923c7caa50ff5536bc
