# 🚀 How to Run the Social Media Analytics Platform

## Prerequisites

- Node.js 18+ installed
- MongoDB running (local or MongoDB Atlas)
- Two terminal windows

---

## Quick Start Guide

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies (if not done)
npm install

# CRITICAL: Create .env file
# Copy .env.example to .env and update values (especially MongoDB URI)

# Seed the database with demo data
npm run seed

# Start the backend server
npm run dev
```

**Backend will run on:** `http://localhost:5000`

**Demo Accounts:**

- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

### 2. Frontend Setup

```bash
# Open a NEW terminal window
# Navigate to frontend
cd frontend

# Install dependencies (if not done)
npm install

# Start the frontend development server
npm run dev
```

**Frontend will run on:** `http://localhost:5173`

### 3. Access the Application

1. Open browser to `http://localhost:5173`
2. You'll be redirected to login page
3. Use demo credentials: `user@example.com` / `user123`
4. Explore the dashboard!

---

## Testing the Features

### Dashboard

- View engagement metrics (30d, 7d)
- See engagement trend chart (last 7 days)
- Check platform performance comparison
- Review top 5 optimal posting times
- Browse top performing posts

### Posts Management

1. Click "Posts" in navigation
2. View list of all posts with status badges
3. Use filters (status, platform)
4. Search posts by content
5. Click "Create Post" to add new post:
   - Enter content (max 1000 chars)
   - Select platform (Twitter/Facebook/Instagram/LinkedIn)
   - Choose status (Draft/Scheduled)
   - Set scheduled time
   - Click "Create Post"
6. Delete draft posts (not published ones)

### API Testing

**Using curl or Postman:**

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'

# Get Optimal Times (use token from login)
curl -X GET http://localhost:5000/api/analytics/optimal-times \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get Dashboard Overview
curl -X GET http://localhost:5000/api/analytics/dashboard/overview \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Background Jobs Verification

The backend automatically runs two background jobs:

1. **Engagement Simulator** (every 30 seconds)

   - Check backend console for: "Generated engagement for X posts"
   - Watch engagement metrics increase in real-time

2. **Post Scheduler** (every minute)
   - Create a post with scheduled time in near future
   - Watch it auto-publish when time comes

---

## Troubleshooting

### Backend won't start

- **MongoDB not running**: Start MongoDB service
- **Port 5000 in use**: Change PORT in .env
- **Missing .env**: Copy from .env.example

### Frontend won't start

- **Port 5173 in use**: Vite will auto-assign new port
- **Dependencies error**: Delete `node_modules` and `npm install` again

### Can't login

- **No data**: Run `npm run seed` in backend
- **Wrong credentials**: Use `user@example.com` / `user123`

### No engagement data showing

- **Wait 30-60 seconds**: Background jobs need time to generate data
- **Refresh page**: New data loads on page refresh

---

## Project Structure

```
Social Media Analytics/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API request handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (analytics, cache)
│   │   ├── jobs/            # Cron jobs (engagement, scheduler)
│   │   ├── middleware/      # Auth, validation, errors
│   │   ├── validation/      # Zod schemas
│   │   └── server.ts        # Entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/           # React pages (Login, Dashboard, Posts)
    │   ├── components/      # Reusable components
    │   ├── store/           # Redux slices
    │   ├── services/        # API services
    │   ├── utils/           # Helper functions
    │   └── main.tsx         # Entry point
    ├── .env                 # API URL configuration
    └── package.json
```

---

## Development Commands

### Backend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production build
npm run seed     # Seed database with demo data
npm run lint     # Check code quality
npm run format   # Format code with Prettier
```

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check code quality
```

---

## Production Deployment

### Backend

1. Set `NODE_ENV=production` in .env
2. Update MongoDB URI to production database
3. Generate strong JWT secrets
4. Run `npm run build`
5. Deploy `dist` folder to hosting (Railway, Render, Heroku)

### Frontend

1. Update `VITE_API_URL` to production backend URL
2. Run `npm run build`
3. Deploy `dist` folder to static hosting (Vercel, Netlify)

---

## Key Features to Test

✅ User authentication with JWT
✅ Post creation with scheduling
✅ Real-time engagement simulation
✅ Optimal posting time recommendations
✅ Engagement trend analysis
✅ Platform performance comparison
✅ Top posts ranking
✅ Automatic post publishing
✅ Beautiful dashboard with charts
✅ Responsive design

Enjoy exploring your Social Media Analytics Platform! 🎉
