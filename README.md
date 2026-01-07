# Social Media Analytics Platform

A comprehensive analytics platform for social media content creators to track post performance, analyze engagement patterns, and get data-driven insights for optimal posting times.

## 🚀 Features

### Backend

- **Authentication & Authorization**

  - JWT-based authentication with refresh tokens (15min access, 7d refresh)
  - Role-based access control (Admin & User)
  - Rate limiting on auth endpoints (5 requests per 15 min)

- **Post Management**

  - Create, read, update, delete posts
  - Multi-platform support (Twitter, Facebook, Instagram, LinkedIn)
  - Post scheduling with auto-publishing
  - Draft, scheduled, published, and failed status tracking
  - Pagination, filtering, and search functionality

- **Engagement Simulation**

  - Automated engagement generation every 30 seconds
  - Time-based variations (peak hours, weekends)
  - Post-age decay factor using exponential algorithm
  - Realistic engagement patterns

- **Advanced Analytics**

  - **Optimal Posting Time Analysis**: Sophisticated algorithm with:
    - Exponential decay weighting (recent data gets 2x weight)
    - Statistical outlier filtering (3 standard deviations)
    - Confidence scoring based on sample size
    - Top 5 recommended posting times
  - **Performance Metrics**: Engagement rate, CTR, performance score
  - **Engagement Trends**: Hourly/daily/weekly granularity with moving averages
  - **Platform Comparison**: Compare performance across social platforms
  - **Top Posts**: Identify best-performing content

- **Caching Strategy**
  - Optimal times cached for 1 hour
  - Dashboard data cached for 5 minutes
  - Trends data cached for 15 minutes
  - MongoDB-based cache with TTL

### Frontend (Coming Soon)

- React 18 with TypeScript
- Redux for state management
- Tailwind CSS for styling
- Recharts for data visualization
- Responsive dashboard

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 5.0+ (local or MongoDB Atlas)
- Git

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Social Media Analytics"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/social-media-analytics
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social-media-analytics

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-make-it-very-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-also-very-long-and-random
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

### 4. Database Seeding

Seed the database with demo data (2 users, 60+ posts, 6000+ engagements):

```bash
cd backend
npm run seed
```

**Demo Credentials:**

- **Admin**: `admin@example.com` / `admin123`
- **User**: `user@example.com` / `user123`

### 5. Start the Backend

```bash
cd backend
npm run dev
```

The API server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Posts

- `GET /api/posts` - Get all posts (with pagination, filters, search)
  - Query params: `page`, `limit`, `status`, `platform`, `search`, `sort`, `startDate`, `endDate`
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/:id/analytics` - Get post-specific analytics

### Analytics

- `GET /api/analytics/optimal-times` - Get optimal posting times
- `GET /api/analytics/trends` - Get engagement trends
  - Query params: `period` (days), `granularity` (hourly/daily/weekly), `metric` (engagement/impressions/clicks)
- `GET /api/analytics/performance/platforms` - Compare platform performance
- `GET /api/analytics/performance/top-posts` - Get top performing posts
  - Query params: `limit` (default: 10)
- `GET /api/analytics/dashboard/overview` - Get dashboard overview

### Health Check

- `GET /health` - Server health check

## 🏗️ Architecture

### Database Schema

**Users Collection**

- Email, password (bcrypt hashed), name, role
- Refresh token storage
- Indexed on email

**Posts Collection**

- User reference, content, platform, schedule/publish dates
- Status tracking, metadata (hashtags, word count)
- Compound indexes for performance

**Engagement Collection** (Time-Series)

- Post/user references, timestamp, metrics
- Denormalized time fields (hourOfDay, dayOfWeek)
- TTL index (90 days auto-expiration)
- Optimized for analytics queries

**AnalyticsCache Collection**

- Cache key, user reference, data, expiration
- TTL index for automatic cleanup

### Core Algorithms

#### 1. Optimal Posting Time Analysis

```typescript
Features:
- Groups engagement by day of week (0-6) and hour (0-23)
- Applies exponential decay weighting (recent = 2x)
- Filters outliers using mean + 3*σ
- Calculates confidence: min(1, samples/10) * (avg/max)
- Returns top 5 time slots

Time Complexity: O(n log n) where n = number of engagements
```

#### 2. Performance Score

```typescript
score = (engagementRate * 0.4) + (CTR * 0.3) + (shares * 0.3)

Where:
- engagementRate = (likes + comments + shares) / impressions * 100
- CTR = clicks / impressions * 100
```

#### 3. Engagement Simulation

- Runs every 30 seconds (node-cron)
- Multipliers:
  - Peak hours (9am-5pm): 1.5x
  - Weekends: 0.7x
  - Age decay: e^(-hours/48)

### Performance Optimizations

1. **Database Indexes**

   - Compound indexes on frequently queried fields
   - TTL indexes for auto-cleanup
   - Covered queries where possible

2. **Aggregation Pipelines**

   - Early $match stages
   - Field projection
   - Index utilization
   - Efficient $lookup operations

3. **Caching**
   - Cache-aside pattern
   - Tiered TTL (1hr/15min/5min)
   - User-specific cache invalidation

## 🔒 Security

- Bcrypt password hashing (12 rounds)
- JWT access tokens (15 min expiry)
- JWT refresh tokens (7 day expiry)
- Rate limiting on authentication endpoints
- Helmet.js security headers
- Input validation with Zod
- Role-based authorization
- NoSQL injection prevention

## 🧪 Testing

```bash
# Backend tests (when implemented)
cd backend
npm test
```

## 📊 Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Background Jobs**: node-cron
- **Security**: Helmet, CORS, bcrypt
- **Code Quality**: ESLint, Prettier

## 📈 Development Workflow

### Running in Development

```bash
# Backend with auto-reload
cd backend
npm run dev
```

### Building for Production

```bash
cd backend
npm run build
npm start
```

### Code Formatting

```bash
cd backend
npm run format
npm run lint
```

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. Set environment variables in hosting platform
2. Ensure MongoDB Atlas connection string is configured
3. Build and deploy:
   ```bash
   npm run build
   npm start
   ```

### MongoDB Atlas Setup

1. Create a cluster on MongoDB Atlas
2. Whitelist your IP address
3. Create database user
4. Get connection string and add to `.env`

## 📝 Project Structure

```
Social Media Analytics/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── jobs/           # Cron jobs (engagement, scheduler)
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── scripts/        # Database seeding
│   │   ├── services/       # Business logic (analytics, cache)
│   │   ├── types/          # TypeScript definitions
│   │   ├── utils/          # Helper functions
│   │   ├── validation/     # Zod schemas
│   │   └── server.ts       # Entry point
│   ├── .env               # Environment variables
│   ├── .env.example       # Environment template
│   ├── package.json
│   └── tsconfig.json
├── frontend/              # (Coming soon)
└── README.md
```

## 🎯 Key Metrics

- **Posts**: 60+ seeded with realistic data
- **Engagements**: 6000+ records with time-based patterns
- **Users**: 2 (1 admin, 1 regular)
- **Platforms**: 4 (Twitter, Facebook, Instagram, LinkedIn)
- **Data Retention**: 90 days (automatic cleanup)

## 🔄 Background Jobs

### Engagement Simulator

- **Frequency**: Every 30 seconds
- **Function**: Generates realistic engagement data
- **Factors**: Time of day, day of week, post age

### Post Scheduler

- **Frequency**: Every minute
- **Function**: Auto-publishes scheduled posts
- **Updates**: Status and publishedAt timestamp

## 📚 Documentation

### Algorithm Explanations

**Exponential Decay Weighting**
Recent data is more valuable. Weight decays over 15 days:

```
weight = e^(-daysAgo/15) * recencyMultiplier
where recencyMultiplier = 2 if daysAgo < 7, else 1
```

**Outlier Filtering**
Removes extreme values to prevent skewed results:

```
threshold = mean + 3 * standardDeviation
Keep only values ≤ threshold
```

**Confidence Score**
Accounts for both sample size and performance:

```
confidence = min(1, sampleSize/10) * (avgEngagement/maxEngagement)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License

## 👤 Author

Your Name

## 🙏 Acknowledgments

Built as part of a technical assessment demonstrating:

- Advanced algorithmic thinking
- Performance optimization
- Clean architecture
- TypeScript mastery
- MongoDB aggregation expertise

---

**Note**: This is a demonstration project for technical assessment purposes. The engagement data is simulated and does not connect to real social media APIs.
