# 🚀 Zero-Cost Deployment Guide for Render

## Car Rental Backend - Free Tier Deployment

**Last Updated:** February 7, 2026  
**Platform:** Render.com (Free Tier)  
**Estimated Setup Time:** 30-45 minutes

---

## 📋 Table of Contents

1. [Overview & Strategy](#overview--strategy)
2. [Free Tier Limitations](#free-tier-limitations)
3. [Architecture Simplification](#architecture-simplification)
4. [Pre-Deployment Setup](#pre-deployment-setup)
5. [Step 1: PostgreSQL Setup](#step-1-postgresql-setup)
6. [Step 2: Deploy Gateway (Monolith Mode)](#step-2-deploy-gateway-monolith-mode)
7. [Step 3: Environment Variables](#step-3-environment-variables)
8. [Step 4: Database Migration](#step-4-database-migration)
9. [Step 5: Verification](#step-5-verification)
10. [Alternative: Separate Services](#alternative-separate-services-approach)
11. [Elasticsearch Alternative](#elasticsearch-alternative)
12. [Cost Optimization Tips](#cost-optimization-tips)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview & Strategy

### The Challenge
Your project has 6 microservices + PostgreSQL + Elasticsearch. Render's free tier only allows:
- **1 PostgreSQL database** (which you already have pending)
- **Unlimited static sites** (not applicable)
- **Web Services** spin down after 15 minutes of inactivity

### The Solution: Consolidation Strategy

For **zero-cost deployment**, we'll consolidate your microservices into a **single deployable service** that includes all functionality. This is the most practical approach for a portfolio project.

```
BEFORE (Development - 6 services):
┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Gateway │  Auth   │   Car   │ Search  │ Booking │  Notif  │
│  :3000  │  :3001  │  :3002  │  :3003  │  :3004  │  :3005  │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

AFTER (Production - 1 consolidated service):
┌─────────────────────────────────────────────────────────────┐
│              Consolidated API Service :3000                 │
│  (Gateway + Auth + Car + Booking routes in one process)     │
└─────────────────────────────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL  │
                    │   (Render)   │
                    └─────────────┘
```

---

## ⚠️ Free Tier Limitations

### Render Free Tier Includes:
| Resource | Free Tier Limit | Notes |
|----------|-----------------|-------|
| **PostgreSQL** | 1 database, 256 MB | Expires after 90 days, then requires payment |
| **Web Services** | Unlimited | Spin down after 15 min inactivity (~50s cold start) |
| **Bandwidth** | 100 GB/month | Usually sufficient for portfolio |
| **Build Time** | 500 min/month | Enough for multiple deploys |

### What This Means:
- ✅ Your single PostgreSQL database will work
- ✅ One consolidated web service is ideal
- ⚠️ No free Elasticsearch (we'll use PostgreSQL LIKE/ILIKE queries instead)
- ⚠️ Cold starts after inactivity (acceptable for portfolio)
- ⚠️ Database expires after 90 days on free tier

---

## 🏗️ Architecture Simplification

### Option A: Recommended - Single Consolidated Service

Merge all services into the Gateway, making internal function calls instead of HTTP calls.

**Pros:**
- Single deployment = simpler management
- No inter-service latency
- Works perfectly within free tier

**Cons:**
- Not true microservices (but fine for portfolio demonstration)

### Option B: Multiple Free Services (More Complex)

Deploy each service separately (all on free tier).

**Pros:**
- Demonstrates microservices architecture

**Cons:**
- Cold start issues compound (each service spins down independently)
- More complex environment variable management
- Services may not sync startup properly

---

## 🔧 Pre-Deployment Setup

### 1. GitHub Repository
Ensure your code is pushed to GitHub:

```bash
# If not already a git repo
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/car-rental-backend.git
git push -u origin main
```

### 2. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub (recommended for easy repo access)

### 3. Prepare Your Code for Consolidated Deployment

Create a new consolidated entry point. Add this file:

**`packages/gateway/src/consolidated.ts`**
```typescript
// This file consolidates all services for single-process deployment
// Import and register all routes directly instead of proxying

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

// Import route handlers from each service
// (You'll need to refactor slightly to export route plugins)

const app = Fastify({ logger: true });

// Register middleware
app.register(cors, { origin: process.env.FRONTEND_URL || '*' });
app.register(helmet);

// Health check
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000');
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Consolidated server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

---

## 📦 Step 1: PostgreSQL Setup

### Using Your Pending PostgreSQL Database

1. **Go to Render Dashboard** → [dashboard.render.com](https://dashboard.render.com)

2. **Find your pending PostgreSQL** or create new:
   - Click **"New +"** → **"PostgreSQL"**
   - **Name:** `car-rental-db`
   - **Database:** `car_rental`
   - **User:** `car_rental_user`
   - **Region:** Choose closest to your users (e.g., Oregon for US West)
   - **Instance Type:** **Free** ⭐
   - Click **"Create Database"**

3. **Wait for database to be ready** (usually 2-3 minutes)

4. **Copy Connection Details:**
   - Go to your database → **"Connect"** tab
   - Copy the **"External Database URL"** - it looks like:
   ```
   postgresql://car_rental_user:PASSWORD@HOST.render.com:5432/car_rental
   ```

### Enable Required Extensions

Render PostgreSQL supports extensions. Run these via a connection:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

You can run this via:
- **Option 1:** Render's built-in PSQL shell
- **Option 2:** Connect via local `psql` client
- **Option 3:** Include in your Prisma migration

---

## 🌐 Step 2: Deploy Gateway (Monolith Mode)

### Create Web Service

1. **Render Dashboard** → **"New +"** → **"Web Service"**

2. **Connect Repository:**
   - Select your GitHub repo: `car-rental-backend`
   - Click **"Connect"**

3. **Configure Service:**

   | Setting | Value |
   |---------|-------|
   | **Name** | `car-rental-api` |
   | **Region** | Same as your database |
   | **Branch** | `main` |
   | **Root Directory** | _(leave blank)_ |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install -g pnpm && pnpm install && pnpm run build` |
   | **Start Command** | `node packages/gateway/dist/index.js` |
   | **Instance Type** | **Free** ⭐ |

4. **Click "Create Web Service"**

### Alternative Build Commands

If the monorepo build is complex, use this more explicit build command:

```bash
npm install -g pnpm@8 && pnpm install --frozen-lockfile && cd packages/auth-service && pnpm prisma generate && cd ../.. && pnpm run build
```

---

## 🔐 Step 3: Environment Variables

### Add These Environment Variables in Render

Go to your Web Service → **"Environment"** tab → Add these:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `3000` | Render sets this automatically, but add for clarity |
| `DATABASE_URL` | `postgresql://...` | Your Render PostgreSQL external URL |
| `ELASTICSEARCH_URL` | `https://user:pass@cluster.bonsaisearch.net:443` | Your Bonsai cluster URL |
| `JWT_SECRET` | `your-super-secret-jwt-key-min-32-chars` | Generate a strong random string |
| `JWT_EXPIRY` | `15m` | Token expiration |
| `REFRESH_SECRET` | `your-refresh-secret-key-min-32-chars` | Different from JWT_SECRET |
| `REFRESH_EXPIRY` | `7d` | Refresh token expiration |
| `BCRYPT_ROUNDS` | `10` | Password hashing rounds |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Or `*` for development |
| `LOG_LEVEL` | `info` | Production logging level |

### Generate Secure Secrets

Run this in your terminal to generate secrets:

```bash
# For JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### For Consolidated Mode (All Services in One)

If deploying as consolidated service, also add:

| Variable | Value |
|----------|-------|
| `AUTH_SERVICE_URL` | `http://localhost:3001` |
| `CAR_SERVICE_URL` | `http://localhost:3002` |
| `SEARCH_SERVICE_URL` | `http://localhost:3003` |
| `BOOKING_SERVICE_URL` | `http://localhost:3004` |

_(These become internal if you consolidate, but leave them for now)_

---

## 🗄️ Step 4: Database Migration

### Option A: Run Migrations via Render Shell

1. Go to your Web Service → **"Shell"** tab
2. Run:

```bash
cd packages/auth-service && npx prisma migrate deploy
cd ../booking-service && npx prisma migrate deploy
cd ../car-service && npx prisma migrate deploy
```

### Option B: Add Migration to Build Command

Update your build command to include migrations:

```bash
npm install -g pnpm@8 && pnpm install && cd packages/auth-service && pnpm prisma generate && npx prisma migrate deploy && cd ../booking-service && pnpm prisma generate && npx prisma migrate deploy && cd ../car-service && pnpm prisma generate && npx prisma migrate deploy && cd ../.. && pnpm run build
```

### Option C: Use Render's Pre-Deploy Command

In your render.yaml or service settings, add:
```yaml
preDeployCommand: "cd packages/auth-service && npx prisma migrate deploy"
```

---

## ✅ Step 5: Verification

### Test Your Deployment

Once deployed, Render gives you a URL like: `https://car-rental-api.onrender.com`

Test the endpoints:

```bash
# Health check
curl https://car-rental-api.onrender.com/health

# Auth - Register
curl -X POST https://car-rental-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Password123!", "name": "Test User"}'

# Auth - Login
curl -X POST https://car-rental-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Password123!"}'
```

### Expected Response Times
- **First request after inactivity:** 30-60 seconds (cold start)
- **Subsequent requests:** 50-200ms

---

## 🔄 Alternative: Separate Services Approach

If you want to demonstrate true microservices architecture (with free tier limitations):

### Deploy Each Service Separately

Create 4-5 separate Web Services on Render:

| Service | Build Command | Start Command |
|---------|---------------|---------------|
| Gateway | `pnpm install && pnpm --filter @car-rental/gateway build` | `node packages/gateway/dist/index.js` |
| Auth Service | `pnpm install && cd packages/auth-service && pnpm prisma generate && pnpm build` | `node packages/auth-service/dist/index.js` |
| Car Service | `pnpm install && cd packages/car-service && pnpm prisma generate && pnpm build` | `node packages/car-service/dist/index.js` |
| Booking Service | `pnpm install && cd packages/booking-service && pnpm prisma generate && pnpm build` | `node packages/booking-service/dist/index.js` |

### Internal Service URLs

Render provides internal URLs for service-to-service communication:

```
AUTH_SERVICE_URL=http://car-rental-auth:3001
CAR_SERVICE_URL=http://car-rental-car:3002
...
```

⚠️ **Warning:** With multiple free services, cold starts multiply. If Gateway is warm but Auth is cold, login will take 30+ seconds.

---

## 🔍 Elasticsearch Setup (Bonsai Free Tier)

### ✅ Using Bonsai.io Free Tier

You're using [Bonsai.io](https://bonsai.io) which offers a generous free tier:
- **125 MB storage**
- **35,000 documents**
- **Elasticsearch 7.x or 8.x**
- Perfect for portfolio/demo projects!

### Step 1: Create Bonsai Account & Cluster

1. Go to [bonsai.io](https://bonsai.io) and sign up
2. Create a new cluster:
   - **Plan:** Sandbox (Free)
   - **Version:** Elasticsearch 8.x (match your local version)
   - **Region:** Choose closest to your Render region
3. Wait for cluster to provision (~2 minutes)

### Step 2: Get Connection URL

1. Go to your Bonsai dashboard → Your cluster
2. Find the **Access** section
3. Copy the **Full Access URL** - it looks like:
   ```
   https://user123:pass456@cluster-name-123456.us-east-1.bonsaisearch.net:443
   ```

### Step 3: Add to Render Environment Variables

Add this to your Render Web Service environment:

| Variable | Value |
|----------|-------|
| `ELASTICSEARCH_URL` | `https://user:pass@cluster.bonsaisearch.net:443` |

### Step 4: Update Search Service Configuration

Bonsai uses HTTPS on port 443. Ensure your Elasticsearch client handles this:

```typescript
// In search-service/src/utils/config.ts or similar
const elasticsearchClient = new Client({
  node: process.env.ELASTICSEARCH_URL,
  // Bonsai includes auth in the URL, no separate config needed
});
```

### Step 5: Create Index on Bonsai

After deployment, create your cars index. You can do this via:

**Option A: Use curl**
```bash
curl -X PUT "https://user:pass@cluster.bonsaisearch.net:443/cars" \
  -H "Content-Type: application/json" \
  -d '{
    "mappings": {
      "properties": {
        "name": { "type": "text" },
        "model": { "type": "text" },
        "brand": { "type": "keyword" },
        "pricePerDay": { "type": "float" },
        "fuelType": { "type": "keyword" },
        "transmission": { "type": "keyword" },
        "location": { "type": "geo_point" },
        "available": { "type": "boolean" }
      }
    }
  }'
```

**Option B: Create an init script in your app**
Add index creation logic to your search service startup.

### Bonsai Free Tier Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Storage | 125 MB | ~35,000 small documents |
| Shards | 1 primary | No replicas on free tier |
| Requests | Unlimited | Fair use policy |
| Uptime | 99.9% SLA | Very reliable |

### Fallback: PostgreSQL Full-Text Search

If Bonsai limits become an issue, you can fall back to PostgreSQL:

```sql
-- Simple ILIKE search
SELECT * FROM cars 
WHERE name ILIKE '%toyota%' 
   OR model ILIKE '%toyota%';

-- PostgreSQL Full-Text Search (more powerful)
SELECT * FROM cars
WHERE to_tsvector('english', name || ' ' || model) 
   @@ to_tsquery('english', 'toyota');
```

---

## 💰 Cost Optimization Tips

### 1. Keep Database Alive
Render's free PostgreSQL expires after 90 days. Set a reminder to:
- Export your data before expiry
- Create a new free database
- Import data

### 2. Reduce Cold Starts
Use a free cron service to ping your API every 14 minutes:
- [cron-job.org](https://cron-job.org) (free)
- [UptimeRobot](https://uptimerobot.com) (free)

```
URL: https://car-rental-api.onrender.com/health
Interval: Every 14 minutes
```

### 3. Optimize Build Time
Render gives 500 free build minutes/month. To conserve:
- Don't trigger unnecessary deploys
- Cache node_modules if possible
- Use `--frozen-lockfile` to prevent lockfile updates

### 4. Consider Paid Upgrade Path
When ready for production:
- **Render Starter:** $7/month per service
- **PostgreSQL Starter:** $7/month (1 GB)
- **Elasticsearch:** Use Elastic Cloud ($16/month) or Bonsai

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `pnpm: command not found`
```bash
# Fix: Add pnpm install to build command
npm install -g pnpm@8 && pnpm install && pnpm run build
```

**Error:** `Cannot find module '@prisma/client'`
```bash
# Fix: Generate Prisma client before build
cd packages/auth-service && pnpm prisma generate && cd ../..
```

### Database Connection Fails

**Error:** `ECONNREFUSED` or `Connection refused`
- Verify DATABASE_URL is the **External** URL (not Internal)
- Check if database is still active (didn't expire)
- Ensure extensions are enabled

### Service Won't Start

**Error:** `Port already in use`
- Render assigns PORT automatically; ensure you use `process.env.PORT`

**Error:** `Cannot find module`
- Check that build output exists in `dist/` folder
- Verify `start` command path is correct

### Cold Start Too Slow

If 50+ second cold starts are problematic:
1. Set up a health check pinger (see Cost Optimization)
2. Consider upgrading to Render's paid tier ($7/month)

---

## 📁 Recommended render.yaml

Create a `render.yaml` in your project root for Infrastructure as Code:

```yaml
services:
  - type: web
    name: car-rental-api
    runtime: node
    buildCommand: npm install -g pnpm@8 && pnpm install && cd packages/auth-service && pnpm prisma generate && cd ../.. && pnpm run build
    startCommand: node packages/gateway/dist/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: car-rental-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: REFRESH_SECRET
        generateValue: true
      - key: BCRYPT_ROUNDS
        value: "10"
      - key: LOG_LEVEL
        value: info

databases:
  - name: car-rental-db
    databaseName: car_rental
    user: car_rental_user
    plan: free
```

---

## 🎉 Summary

### What You'll Have (Free):
- ✅ 1 Web Service (Gateway with all routes)
- ✅ 1 PostgreSQL Database (256 MB, 90-day limit)
- ✅ 1 Elasticsearch Cluster (Bonsai free tier - 125 MB)
- ✅ Full authentication system
- ✅ Car CRUD operations
- ✅ Booking system with race condition handling
- ✅ Geo-spatial search via Elasticsearch

### What You Won't Have (Free):
- ❌ Multiple separate microservices (consolidated into one)
- ❌ Always-on service (cold starts after 15 min)
- ❌ Database persistence beyond 90 days

### Upgrade Path:
When your project gets traction, upgrade to Render's paid tier for:
- Always-on services ($7/service/month)
- Persistent database ($7/month)
- Add Elasticsearch via Elastic Cloud or Bonsai

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Free Tier FAQ](https://render.com/docs/free)
- [Prisma + Render Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-render)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)

---

**Good luck with your deployment! 🚀**
