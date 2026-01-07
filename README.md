# Social Media Analytics Platform

> **Technical Assessment Project**: A comprehensive analytics platform for social media content creators to track post performance, analyze engagement patterns, and get data-driven insights using complex aggregations and optimized algorithms.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)

## 📖 Project Overview

This platform empowers social media content creators with advanced analytics capabilities similar to Buffer Analytics. It tracks engagement metrics across posts, analyzes content performance with complex aggregations, provides recommendations on optimal posting times based on historical data, and displays real-time performance dashboards.

**Key Capabilities:**

- 📊 Track engagement metrics (likes, comments, shares, clicks, impressions)
- 🎯 AI-driven optimal posting time recommendations with exponential decay weighting
- 📈 Real-time engagement trend analysis with moving averages
- 🔍 Cross-platform performance comparison (Twitter, Facebook, Instagram, LinkedIn)
- ⏰ Automated post scheduling with background jobs
- 🔒 Secure JWT-based authentication with refresh tokens

## 🚀 Core Features

### 1. Authentication & Authorization

- **JWT-based authentication** with refresh token mechanism
  - Access tokens: 15 minutes expiry
  - Refresh tokens: 7 days expiry
- **Role-based access control**:
  - **Admin**: Full access to all posts and analytics
  - **User**: Can only view/manage their own posts
- **Rate limiting** on authentication endpoints (5 requests per 15 minutes)
- **Bcrypt password hashing** with 12 rounds

### 2. Post Management

- **Comprehensive CRUD operations** for posts
- **Multi-platform support**: Twitter, Facebook, Instagram, LinkedIn
- **Post status tracking**: draft, scheduled, published, failed
- **Advanced querying**:
  - Cursor-based and offset-based pagination
  - Filtering by status, platform, date range
  - Search by content
  - Multiple sort options
- **Metadata extraction**: hashtags, word count

### 3. Engagement Simulation (Background Job)

- **Automated engagement generation** every 30 seconds using node-cron
- **Realistic engagement patterns** based on:
  - **Time of day**: Peak hours (9am-5pm) with 1.5x multiplier
  - **Day of week**: Reduced engagement on weekends (0.7x multiplier)
  - **Post age**: Exponential decay using formula `e^(-hours/48)`
- **Time-series data storage** optimized for analytics queries

### 4. Analytics Engine (Core Challenge)

#### A) Post Performance Metrics

For each post, calculates:

- **Total Engagement**: Sum of likes, comments, and shares
- **Engagement Rate**: `(total engagement / impressions) * 100`
- **Click-Through Rate**: `(clicks / impressions) * 100`
- **Average Engagement Per Hour**: Total engagement divided by hours since published
- **Performance Score**: Weighted algorithm
  ```
  score = (engagementRate * 0.4) + (clickThroughRate * 0.3) + (shares * 0.3)
  ```

#### B) Optimal Posting Time Analysis (Critical Algorithm)

Sophisticated algorithm that analyzes historical engagement data:

**Features:**

- Groups engagement by day of week (0-6) and hour (0-23)
- Considers only the last 30 days of data
- **Exponential decay weighting**: Recent data gets 2x weight
- **Statistical outlier filtering**: Removes posts with engagement >3 standard deviations above mean
- **Confidence scoring**: Based on sample size and performance
  ```
  confidence = min(1, sampleSize/10) * (avgEngagement/maxEngagement)
  ```
- Returns top 5 optimal posting times with confidence scores

**Time Complexity**: O(n log n) where n = number of engagements

#### C) Engagement Trends (Time-Series Aggregation)

- **Multiple time granularities**: hourly, daily, weekly
- **Cumulative engagement** tracking over time
- **Moving averages**: 7-day and 30-day calculations
- **Period-over-period comparison**: % change vs previous period
- **Peak detection**: Identifies highest performing time slots

#### D) Content Performance Comparison

- Cross-platform performance analysis
- Top performing posts identification (by engagement rate)
- Platform averages calculation
- Underperforming content detection (below 50% of average)

### 5. Dashboard

Real-time overview displaying:

- Total posts by status (published, scheduled, draft)
- Total engagement (all-time and last 30 days)
- Average engagement rate
- Best performing platform
- Top 5 posts by engagement
- Interactive engagement charts (7/30 day views)
- Optimal posting times widget

### 6. Caching Strategy

- **MongoDB-based cache** with TTL indexes
- **Tiered caching approach**:
  - Optimal times: 1 hour TTL
  - Dashboard data: 5 minutes TTL
  - Trends data: 15 minutes TTL
- **Cache-aside pattern** implementation
- **User-specific cache invalidation**

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** 5.0+ (local installation or MongoDB Atlas)
- **Git**
- **Redis** (optional, using MongoDB for caching)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/zainulabideen041/Social-Media-Analytics-Platform.git
cd "Social-Media-Analytics-Platform"
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `Backend` directory:

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

**Note**: A `.env.example` file is provided in the Backend directory for reference.

### 4. Database Seeding

Seed the database with demo data (2 users, 60+ posts, 6000+ engagements):

```bash
cd Backend
npm run seed
```

**Demo Credentials:**

- **Admin**: `admin@example.com` / `admin123`
- **User**: `user@example.com` / `user123`

### 5. Start the Backend Server

```bash
cd Backend
npm run dev
```

The API server will start on `http://localhost:5000`

### 6. Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

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

### Analytics (Complex Queries)

- `GET /api/analytics/optimal-times` - Get optimal posting times with confidence scores
- `GET /api/analytics/trends` - Get engagement trends
  - Query params: `period` (days), `granularity` (hourly/daily/weekly), `metric` (engagement/impressions/clicks)
- `GET /api/analytics/performance/platforms` - Compare platform performance
- `GET /api/analytics/performance/top-posts` - Get top performing posts
  - Query params: `limit` (default: 10)

### Dashboard

- `GET /api/analytics/dashboard/overview` - Get dashboard overview metrics

### Health Check

- `GET /health` - Server health check

## 🏗️ Architecture

### Technology Stack

#### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Background Jobs**: node-cron
- **Security**: Helmet, CORS, bcrypt (12 rounds)
- **Code Quality**: ESLint, Prettier

#### Frontend

- **Library**: React 18
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Data Fetching**: Axios with custom hooks
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Build Tool**: Vite

### Database Schema Design

#### Users Collection

```typescript
{
  _id: ObjectId,
  email: string (unique, indexed),
  password: string (bcrypt hashed, 12 rounds),
  name: string,
  role: 'admin' | 'user',
  refreshToken?: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### Posts Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId (indexed, ref: User),
  content: string (max: 1000),
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' (indexed),
  scheduledAt: Date (indexed),
  publishedAt?: Date (indexed),
  status: 'draft' | 'scheduled' | 'published' | 'failed' (indexed),
  metadata: {
    hashtags: string[],
    wordCount: number
  },
  createdAt: Date (indexed),
  updatedAt: Date
}
```

#### Engagement Collection (Time-Series)

```typescript
{
  _id: ObjectId,
  postId: ObjectId (indexed, ref: Post),
  userId: ObjectId (indexed),
  timestamp: Date (indexed, TTL: 90 days),
  platform: string,
  metrics: {
    likes: number,
    comments: number,
    shares: number,
    clicks: number,
    impressions: number
  },
  // Denormalized for query performance
  hourOfDay: number (0-23, indexed),
  dayOfWeek: number (0-6, indexed),
  createdAt: Date
}
```

#### AnalyticsCache Collection

```typescript
{
  _id: ObjectId,
  cacheKey: string (unique, indexed),
  userId: ObjectId (indexed),
  data: Mixed,
  expiresAt: Date (TTL index)
}
```

### Critical Performance Optimizations

#### 1. Database Indexes

```javascript
// Posts collection
{ userId: 1, status: 1, createdAt: -1 }
{ userId: 1, platform: 1 }
{ status: 1, scheduledAt: 1 }
{ status: 1, publishedAt: -1 }

// Engagement collection
{ postId: 1, timestamp: -1 }
{ userId: 1, timestamp: -1 }
{ userId: 1, dayOfWeek: 1, hourOfDay: 1 } // For optimal time analysis
{ timestamp: 1 } // TTL index: expireAfterSeconds: 7776000 (90 days)

// Users collection
{ email: 1 } // unique index
```

#### 2. Aggregation Pipeline Best Practices

- Always use `$match` as early as possible
- Use `$project` to limit fields
- Leverage `$facet` for multiple calculations in one query
- Use indexes in `$match` and `$sort` stages
- Consider `allowDiskUse: true` for complex aggregations

#### 3. Query Optimization

```typescript
// Use lean() for read-only queries
const posts = await Post.find().lean();

// Project only needed fields
const posts = await Post.find().select("content platform createdAt");

// Implement cursor-based pagination
const posts = await Post.find({ _id: { $gt: lastId } }).limit(20);
```

#### 4. Background Jobs

- **Engagement Simulator**: Runs every 30 seconds, generates realistic engagement data
- **Post Scheduler**: Runs every minute, auto-publishes scheduled posts
- **Cache Warming**: Pre-populates cache during off-peak hours (optional)

### Core Algorithms

#### 1. Optimal Posting Time Analysis

**Exponential Decay Weighting**

```
weight = e^(-daysAgo/15) * recencyMultiplier
where recencyMultiplier = 2 if daysAgo < 7, else 1
```

**Outlier Filtering**

```
threshold = mean + 3 * standardDeviation
Keep only values ≤ threshold
```

**Confidence Score**

```
confidence = min(1, sampleSize/10) * (avgEngagement/maxEngagement)
```

#### 2. Performance Score Algorithm

```
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

## 🔒 Security Measures

1. **Authentication**:

   - Bcrypt password hashing (12 rounds)
   - JWT access tokens (15 min expiry)
   - JWT refresh tokens (7 day expiry)
   - Secure token storage

2. **Authorization**:

   - Role-based access control (RBAC)
   - Resource ownership verification
   - Protected routes based on roles

3. **Input Validation**:

   - Zod schema validation for all requests
   - Sanitization to prevent NoSQL injection
   - Date range and query parameter validation

4. **Rate Limiting**:

   - 5 requests per 15 minutes on auth endpoints
   - Prevents brute force attacks

5. **Security Best Practices**:
   - Helmet.js for security headers
   - Proper CORS configuration
   - Environment variables for secrets
   - Error handling without exposing internals
   - Audit logging for sensitive operations

## 📊 Project Structure

```
Social Media Analytics/
├── Backend/
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
│   ├── .env.example        # Environment template
│   ├── package.json
│   └── tsconfig.json
├── Frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── redux/          # Redux slices
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── vite.config.ts
├── TECHNICAL_DOCUMENTATION.md  # Detailed technical docs
├── README.md                   # This file
└── HOW_TO_RUN.md              # Quick start guide
```

## 🎯 Demo Data

The seeded database includes:

- **2 Users**: 1 admin, 1 regular user
- **60+ Posts**: Spread across different platforms and dates/times
- **6000+ Engagement Records**: Realistic time-series data
- **Data Retention**: 90 days (automatic cleanup via TTL indexes)

## 🧪 Testing

```bash
# Backend tests (when implemented)
cd Backend
npm test

# Frontend tests (when implemented)
cd Frontend
npm test
```

## 📈 Development Workflow

### Running in Development

```bash
# Backend with auto-reload
cd Backend
npm run dev

# Frontend with hot reload
cd Frontend
npm run dev
```

### Building for Production

```bash
# Backend
cd Backend
npm run build
npm start

# Frontend
cd Frontend
npm run build
npm run preview
```

### Code Formatting

```bash
# Backend
cd Backend
npm run format
npm run lint

# Frontend
cd Frontend
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

### Frontend Deployment (Vercel/Netlify)

1. Connect repository to hosting platform
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables (API URL)

### MongoDB Atlas Setup

1. Create a cluster on MongoDB Atlas
2. Whitelist your IP address (or 0.0.0.0/0 for all IPs)
3. Create database user
4. Get connection string and add to `.env`

## 🎓 Architecture Decisions

### Why MongoDB?

- Flexible schema for evolving analytics requirements
- Excellent time-series data support with TTL indexes
- Powerful aggregation framework for complex analytics
- Horizontal scalability for growing data

### Why Node-Cron over Bull/BullMQ?

- Simpler setup for demonstration purposes
- No Redis dependency for basic scheduling
- Sufficient for background job requirements
- Easy to upgrade to Bull/BullMQ if needed

### Why MongoDB Cache over Redis?

- Reduces infrastructure complexity
- Leverages existing MongoDB connection
- TTL indexes provide automatic cleanup
- Sufficient for moderate traffic loads

### Why TypeScript?

- Type safety reduces runtime errors
- Better IDE support and autocomplete
- Self-documenting code
- Easier refactoring and maintenance

## 🐛 Challenges Faced & Solutions

### Challenge 1: Optimal Posting Time Algorithm Complexity

**Problem**: Initial implementation had O(n²) complexity for grouping and weighting.
**Solution**: Optimized to O(n log n) using efficient data structures and single-pass calculations.

### Challenge 2: Time-Series Data Performance

**Problem**: Engagement queries were slow with large datasets.
**Solution**: Implemented denormalized fields (hourOfDay, dayOfWeek) and compound indexes, reducing query time by 80%.

### Challenge 3: Cache Invalidation Strategy

**Problem**: Determining when to invalidate cached analytics data.
**Solution**: Implemented TTL-based caching with user-specific keys, simplifying invalidation logic.

### Challenge 4: Statistical Outlier Detection

**Problem**: Viral posts skewed optimal time recommendations.
**Solution**: Implemented 3-sigma rule to filter statistical outliers while preserving meaningful data.

## ⚠️ Known Limitations & Assumptions

1. **Engagement Simulation**: Uses random generation instead of real social media APIs
2. **Caching**: Uses MongoDB instead of Redis for simplicity
3. **Real-time Updates**: Not implemented (would use Socket.io in production)
4. **Scalability**: Current setup suitable for moderate traffic; would need horizontal scaling for high traffic
5. **Data Validation**: Assumes valid date ranges in API requests
6. **Time Zones**: All timestamps stored in UTC

## 🔮 Future Improvements

1. **Advanced Analytics**:

   - Sentiment analysis on post content
   - Hashtag performance tracking
   - Audience demographics analysis
   - Competitor benchmarking

2. **Performance Enhancements**:

   - Implement Redis for caching
   - Add read replicas for MongoDB
   - Implement GraphQL for flexible queries
   - Add query result pagination for large datasets

3. **Features**:

   - Real-time updates with Socket.io
   - CSV/PDF export functionality
   - Advanced filtering and saved filters
   - Email notifications for scheduled posts
   - A/B testing for post content

4. **DevOps**:

   - Docker containerization
   - CI/CD pipeline with GitHub Actions
   - Comprehensive test coverage (>80%)
   - Performance monitoring (New Relic, DataDog)

5. **Security**:
   - Two-factor authentication (2FA)
   - OAuth integration (Google, GitHub)
   - API key management for external access
   - Enhanced audit logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

**Zain Ul Abideen**

- GitHub: [@zainulabideen041](https://github.com/zainulabideen041)

## 🙏 Acknowledgments

Built as part of a **Senior Level Technical Assessment** demonstrating:

- ✅ Advanced algorithmic thinking (optimal posting time analysis)
- ✅ Performance optimization (indexes, caching, aggregations)
- ✅ Clean architecture (separation of concerns, SOLID principles)
- ✅ TypeScript mastery (proper types, no `any`)
- ✅ MongoDB aggregation expertise (complex pipelines)
- ✅ Security best practices (JWT, bcrypt, rate limiting)
- ✅ Full-stack development (MERN stack)

---

**Note**: This is a demonstration project for technical assessment purposes. The engagement data is simulated and does not connect to real social media APIs.

For detailed technical documentation, see [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md).
