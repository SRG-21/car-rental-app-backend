# Quick Start Guide

## Prerequisites

1. **Install Node.js 18+**
   - Download from: https://nodejs.org/

2. **Install pnpm**
   ```bash
   npm install -g pnpm@8
   ```

3. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop

## Setup Steps

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start Database & Elasticsearch
```bash
docker compose up -d postgres elasticsearch
```

Wait 30 seconds for services to be healthy.

### 3. Setup Environment
```bash
cp .env.example .env
```

### 4. Run Database Migrations
```bash
pnpm run migrate:dev
```

### 5. Seed Test Data
```bash
pnpm run seed
```

Creates 20 cars and 2 test users.

### 6. Start All Services
```bash
pnpm run dev
```

Services will start on ports 3000-3005.

## Test the API

### 1. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

Copy the `accessToken` from the response.

### 2. Search Cars
```bash
curl "http://localhost:3000/search?lat=37.7749&lon=-122.4194"
```

### 3. Create Booking
```bash
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "carId": "PASTE_CAR_ID_FROM_SEARCH",
    "pickupTime": "2025-12-01T10:00:00Z",
    "dropoffTime": "2025-12-05T10:00:00Z"
  }'
```

### 4. View Your Bookings
```bash
curl http://localhost:3000/bookings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Docker not starting:**
- Ensure Docker Desktop is running
- Increase Docker memory to 4GB+

**Database connection failed:**
```bash
docker compose restart postgres
```

**Elasticsearch not ready:**
```bash
docker compose logs elasticsearch
# Wait until you see "Cluster health status changed from [YELLOW] to [GREEN]"
```

## Next Steps

- Read [Architecture Documentation](./ARCHITECTURE.md)
- Check [API Specification](./docs/openapi.yaml)
- Run tests: `pnpm run test`
- View logs: `docker compose logs -f`
