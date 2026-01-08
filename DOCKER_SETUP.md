# 🐳 Docker Setup Guide - Social Media Analytics Platform

## Quick Start (One Command Setup!)

```bash
# Clone/Navigate to project directory
cd "Social Media Analytics"

# Start all services
docker-compose up --build
```

That's it! 🎉

---

## What's Included

The `docker-compose.yml` sets up **4 services**:

1. **MongoDB** - Database (Port 27017)
2. **Mongo Express** - Database Admin UI (Port 8081)
3. **Backend** - Node.js API (Port 5000)
4. **Frontend** - React App (Port 5173)

---

## Access Points

| Service           | URL                       | Credentials                |
| ----------------- | ------------------------- | -------------------------- |
| **Frontend**      | http://localhost:5173     | user@example.com / user123 |
| **Backend API**   | http://localhost:5000/api | -                          |
| **Mongo Express** | http://localhost:8081     | admin / admin              |
| **MongoDB**       | mongodb://localhost:27017 | admin / admin123           |

---

## Detailed Setup Instructions

### Prerequisites

- Docker Desktop installed
- Docker Compose installed (comes with Docker Desktop)

### Step 1: Environment Variables (Important!)

The `docker-compose.yml` includes default environment variables, but for **production** you should:

1. Create `.env` file in `Backend` directory:

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/social_media_analytics?authSource=admin
JWT_SECRET=CHANGE-THIS-TO-A-SECURE-RANDOM-STRING-IN-PRODUCTION
JWT_REFRESH_SECRET=CHANGE-THIS-TO-A-DIFFERENT-SECURE-RANDOM-STRING
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

2. Create `.env` file in `Frontend` directory:

```bash
VITE_API_URL=http://localhost:5000/api
```

> **Note**: A reference file `.env.docker` has been created at the root with these configurations.

### Step 2: Start the Application

```bash
# Start all services in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Step 3: Seed the Database

Once the backend is running, seed it with demo data:

```bash
# Access backend container
docker-compose exec backend sh

# Run seed script
npm run seed

# Exit container
exit
```

### Step 4: Access the Application

1. Open browser to **http://localhost:5173**
2. Login with demo credentials:
   - **Email**: `user@example.com`
   - **Password**: `user123`

---

## Docker Commands Cheat Sheet

### Starting & Stopping

```bash
# Start all services
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (clears database!)
docker-compose down -v

# Rebuild containers
docker-compose up --build
```

### Monitoring

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# List running containers
docker-compose ps

# Check container resource usage
docker stats
```

### Accessing Containers

```bash
# Access backend shell
docker-compose exec backend sh

# Access frontend shell
docker-compose exec frontend sh

# Access MongoDB shell
docker-compose exec mongodb mongosh

# Run commands in backend
docker-compose exec backend npm run seed
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove everything including images
docker-compose down -v --rmi all

# Clean up Docker system
docker system prune -a
```

---

## Troubleshooting

### Port Already in Use

If you get port conflict errors:

```yaml
# Edit docker-compose.yml and change ports
ports:
  - "5001:5000" # Backend: Use 5001 instead of 5000
  - "5174:5173" # Frontend: Use 5174 instead of 5173
```

### MongoDB Connection Issues

1. Verify MongoDB is running:

```bash
docker-compose ps
```

2. Check MongoDB logs:

```bash
docker-compose logs mongodb
```

3. Ensure the `MONGODB_URI` matches the service name:

```
mongodb://admin:admin123@mongodb:27017/...
                          ^^^^^^^ must match service name
```

### Backend Won't Start

1. Check logs:

```bash
docker-compose logs backend
```

2. Rebuild backend:

```bash
docker-compose up --build backend
```

3. Access container and check:

```bash
docker-compose exec backend sh
ls -la
npm install
```

### Frontend Hot Reload Not Working

The Vite dev server is configured with `--host 0.0.0.0` to allow external connections. If hot reload isn't working:

1. Ensure volumes are mounted correctly in `docker-compose.yml`
2. Try rebuilding:

```bash
docker-compose up --build frontend
```

### Database Data Persists

MongoDB data is stored in a Docker volume. To reset:

```bash
# Warning: This deletes all data!
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run seed
```

---

## Production Deployment

For production, you should:

1. **Update Environment Variables**:

   - Change JWT secrets to secure random strings
   - Update `MONGODB_URI` to production database
   - Set `NODE_ENV=production`

2. **Use Production Builds**:

Update `docker-compose.yml`:

```yaml
backend:
  # ... existing config ...
  command: ["sh", "-c", "npm run build && npm start"]

frontend:
  # ... existing config ...
  command: ["sh", "-c", "npm run build && npm run preview"]
```

3. **Enable HTTPS** with a reverse proxy (Nginx, Traefik)

4. **Use Docker Secrets** for sensitive data

5. **Set Resource Limits**:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: "1"
        memory: 512M
```

---

## Development Workflow

### Making Code Changes

The `docker-compose.yml` is configured with volume mounts for development:

- Backend: `./Backend/src` → `/app/src`
- Frontend: `./Frontend/src` → `/app/src`

Changes to source files will automatically reload! 🔄

### Installing New Dependencies

```bash
# Backend
docker-compose exec backend npm install <package-name>

# Frontend
docker-compose exec frontend npm install <package-name>

# Then rebuild
docker-compose up -d --build
```

### Running Tests

```bash
# Backend tests
docker-compose exec backend npm test

# Frontend tests
docker-compose exec frontend npm test
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                Docker Network (sma_network)         │
│                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │ MongoDB  │◄───│ Backend  │◄───│ Frontend │     │
│  │  :27017  │    │  :5000   │    │  :5173   │     │
│  └────▲─────┘    └──────────┘    └──────────┘     │
│       │                                             │
│  ┌────┴──────┐                                     │
│  │   Mongo   │                                     │
│  │  Express  │                                     │
│  │   :8081   │                                     │
│  └───────────┘                                     │
└─────────────────────────────────────────────────────┘
         │
         ▼
    Your Browser
```

---

## Health Checks

All services include health checks:

- **MongoDB**: Ping check every 10s
- **Backend**: HTTP check on `/health` endpoint every 30s

Check health status:

```bash
docker-compose ps
```

---

## Next Steps

1. ✅ Start services: `docker-compose up -d`
2. ✅ Seed database: `docker-compose exec backend npm run seed`
3. ✅ Open app: http://localhost:5173
4. ✅ Login with demo credentials
5. ✅ Explore the dashboard!

---

## Support

Having issues? Check:

1. Docker Desktop is running
2. Ports 5000, 5173, 8081, 27017 are available
3. Docker has enough resources (Settings → Resources)

For detailed troubleshooting, see the [Main README](./README.md) or [HOW_TO_RUN.md](./HOW_TO_RUN.md).

---

**Happy Dockerizing! 🐳✨**
