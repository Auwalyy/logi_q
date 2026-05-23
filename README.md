# 🚛 Parka — Smart Transport Queue Management

> Digitizing African transport hubs, bus parks, and cargo loading stations.

![Parka](https://img.shields.io/badge/Parka-Transport%20Hub-2563eb?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20MongoDB-10b981?style=for-the-badge)
![Africa's Talking](https://img.shields.io/badge/API-Africa's%20Talking-f59e0b?style=for-the-badge)

---

## What is Parka?

Parka is a modern transport park and truck queue management platform built for African transport hubs. It replaces paper-based queuing, manual departure coordination, and verbal driver communication with a fully digital, SMS-first, mobile-ready system.

**Target hubs:** Kano Central Park · Sabon Gari Terminal · Interstate logistics corridors · West African cargo systems

---

## Features

| Feature | Description |
|---|---|
| Smart Queue Management | Digital queue numbering, live position tracking, ETA calculation |
| USSD Access (`*123#`) | Drivers join queues, check position, confirm departure, report emergencies — no smartphone needed |
| SMS Notifications | Automated alerts for queue updates, loading, departure, delays, boarding |
| OTP Departure Verification | 6-digit OTP sent via SMS before departure confirmation |
| Voice Emergency Alerts | Automated voice calls to emergency contacts on incident report |
| Admin Dashboard | Live queue monitor, trip tracking, delay management, analytics |
| Analytics | Busiest routes, avg wait time, daily departures, cargo stats — with charts |
| Passenger Boarding Alerts | Bulk SMS to passengers before departure |

---

## Tech Stack

```
Frontend          Backend           Database      APIs
─────────         ───────           ────────      ────
React 18          Node.js           MongoDB       Africa's Talking SMS
Vite              Express.js        Mongoose      Africa's Talking USSD
Tailwind CSS 3    JWT Auth                        Africa's Talking Voice
Recharts          bcryptjs
React Router 6    dotenv
Lucide Icons
```

---

## Project Structure

```
parka/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # StatCard, Badge, Spinner, Modal
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── MobileNav.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.jsx   # Auth context
│   │   │   └── useFetch.js   # Data fetching hook
│   │   ├── lib/
│   │   │   └── api.js        # Axios client
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Queues.jsx
│   │       ├── Trips.jsx
│   │       ├── Drivers.jsx
│   │       ├── Analytics.jsx
│   │       ├── Emergencies.jsx
│   │       └── Notifications.jsx
│
└── server/                   # Node.js backend
    ├── models/
    │   ├── User.js
    │   ├── Driver.js
    │   ├── Vehicle.js
    │   ├── Queue.js
    │   ├── Trip.js
    │   ├── Notification.js
    │   └── Emergency.js
    ├── routes/
    │   ├── auth.js
    │   ├── drivers.js
    │   ├── queues.js
    │   ├── trips.js
    │   ├── vehicles.js
    │   ├── analytics.js
    │   ├── emergencies.js
    │   ├── notifications.js
    │   └── ussd.js
    ├── services/
    │   └── africasTalking.js # SMS, Voice, USSD helpers
    ├── middleware/
    │   └── auth.js           # JWT protect + adminOnly
    ├── seed.js               # Demo data seeder
    └── index.js              # Express app entry
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Africa's Talking account (sandbox for testing)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/parka.git
cd parka
npm install          # installs concurrently at root
npm run install:all  # installs server + client deps
```

### 2. Configure Environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/parka
JWT_SECRET=your_strong_secret_here
AT_API_KEY=your_africastalking_api_key
AT_USERNAME=your_africastalking_username
AT_SENDER_ID=PARKA
EMERGENCY_PHONES=+2348012345678,+2348087654321
```

### 3. Seed Demo Data

```bash
npm run seed
```

This creates:
- Admin account: `admin@parka.ng` / `password123`
- 8 drivers, 8 vehicles, 3 active queues, 30 historical trips

### 4. Run Development Servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin/manager login |
| POST | `/api/auth/register` | Create manager account |

### Queues
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/queues` | List all active queues |
| POST | `/api/queues` | Create queue |
| GET | `/api/queues/:id` | Queue detail with entries |
| POST | `/api/queues/:id/join` | Driver joins queue |
| PUT | `/api/queues/:id/entries/:entryId/load` | Start loading |
| PUT | `/api/queues/:id/entries/:entryId/depart` | Confirm departure |

### Trips
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips` | List trips (filter by status/route/date) |
| POST | `/api/trips` | Schedule trip |
| PUT | `/api/trips/:id/depart` | Mark departed + SMS driver |
| PUT | `/api/trips/:id/delay` | Log delay + SMS driver & passengers |
| POST | `/api/trips/:id/boarding-alert` | Bulk SMS passengers |

### Drivers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/drivers` | List all drivers |
| POST | `/api/drivers/register` | Register driver |
| POST | `/api/drivers/:id/send-otp` | Send OTP via SMS |
| POST | `/api/drivers/:id/verify-otp` | Verify OTP |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/overview` | KPI summary |
| GET | `/api/analytics/routes` | Busiest routes |
| GET | `/api/analytics/departures-by-day` | Daily departure chart data |
| GET | `/api/analytics/cargo` | Cargo volume by destination |

### USSD
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ussd/callback` | Africa's Talking USSD webhook |

---

## USSD Flow (`*123#`)

```
Welcome to PARKA
1. Join Queue
2. Check Queue Position
3. Confirm Departure
4. Report Emergency

→ 1 → Select Route → Joined! Position #3, ETA 14:30
→ 2 → Queue: Kano→Lagos | Position: #2 | Status: waiting
→ 3 → Enter OTP → Departure confirmed!
→ 4 → Select type → Enter location → Emergency reported + voice alert triggered
```

---

## Africa's Talking Integration

### SMS Triggers
| Event | Recipient | Message |
|---|---|---|
| Join queue | Driver | Position, route, ETA |
| Loading bay called | Driver | Proceed to bay now |
| Departure confirmed | Driver | Safe travels |
| Delay logged | Driver + Passengers | Delay duration |
| OTP request | Driver | 6-digit code |
| Boarding alert | Passengers | Bay, departure time |

### Voice Alerts
Triggered automatically when an emergency is reported (via USSD or dashboard). Calls all numbers in `EMERGENCY_PHONES`.

### USSD Setup
In your Africa's Talking dashboard:
- Create a USSD service with shortcode `*123#`
- Set callback URL to: `https://your-domain.com/api/ussd/callback`

---

## Deployment

### Backend (Railway / Render)

```bash
# Set environment variables in dashboard, then:
cd server && npm start
```

### Frontend (Vercel / Netlify)

```bash
cd client
npm run build
# Deploy the dist/ folder
# Set VITE_API_URL=https://your-backend.railway.app/api
```

### MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Whitelist `0.0.0.0/0` for cloud deployment
3. Update `MONGO_URI` with Atlas connection string

---

## Color System

| Token | Hex | Usage |
|---|---|---|
| `brand-600` | `#2563eb` | Primary actions, active states |
| `brand-400` | `#60a5fa` | Icons, highlights |
| `gray-950` | `#030712` | App background |
| `gray-900` | `#111827` | Cards, sidebar |
| `gray-800` | `#1f2937` | Inputs, table rows |
| `emerald-400` | `#34d399` | Success, active, available |
| `amber-400` | `#fbbf24` | Warnings, delays |
| `red-400` | `#f87171` | Emergencies, errors |

---

## Roadmap

- [ ] Real-time updates via WebSocket / Socket.io
- [ ] Driver mobile app (React Native)
- [ ] Passenger self-service portal
- [ ] Cargo manifest scanning (QR)
- [ ] Multi-park / multi-city support
- [ ] Payment integration (Paystack / Flutterwave)
- [ ] WhatsApp Business API notifications

---

## Built For

> Kano Transport Parks · Interstate Logistics Hubs · West African Cargo Systems

**Parka** — Making African transport smarter, one queue at a time. 🚛
