# Car Rental Backend - Microservices

Production-grade backend for a car rental platform built with TypeScript, Fastify, Prisma, and Elasticsearch.

## ✅ What's Ready

- ✅ **Complete Shared Package** - All types, validation, utilities
- ✅ **Auth Service** - Full production implementation (reference for other services)  
- ✅ **Docker Compose** - PostgreSQL + Elasticsearch configured
- ✅ **Seed Script** - 20 cars + 2 test users
- ✅ **Infrastructure** - All configs, scripts, documentation

##  Architecture

Microservices-based system with:
- **API Gateway** (Port 3000): Public API, JWT validation, rate limiting
- **Auth Service** (Port 3001): User authentication, token management  
- **Car Service** (Port 3002): Car inventory management
- **Search Service** (Port 3003): Geo-spatial search with Elasticsearch
- **Booking Service** (Port 3004): Atomic booking operations
- **Notification Service** (Port 3005): Email notifications (stub)

##  Quick Start

### Prerequisites
- Node.js 18+ or 20+
- pnpm 8+
- Docker & Docker Compose

### Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start infrastructure:**
   ```bash
   docker compose up -d postgres elasticsearch
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Run migrations:**
   ```bash
   pnpm run migrate:dev
   ```

5. **Seed database:**
   ```bash
   pnpm run seed
   ```

6. **Start services:**
   ```bash
   pnpm run dev
   ```

API Gateway: http://localhost:3000

### Test Credentials
- Email: test@example.com
- Password: Password123

##  API Endpoints

**Auth:**
- POST /auth/signup - Create user
- POST /auth/login - Authenticate
- POST /auth/refresh - Refresh token
- GET /auth/me - Get profile (protected)

**Search:**
- GET /search - Search cars

**Bookings:**
- POST /bookings - Create booking (protected)
- GET /bookings - List bookings (protected)
- GET /bookings/:id - Get booking (protected)

##  Testing

```bash
pnpm run test              # All tests
pnpm run test:coverage     # With coverage
pnpm run test:integration  # Integration tests
```

##  Docker

```bash
docker compose up          # Start all services
docker compose down        # Stop services
docker compose logs -f     # View logs
```

##  Documentation

- [Architecture](./ARCHITECTURE.md)
- [API Specification](./docs/openapi.yaml)

##  Security

- bcrypt password hashing
- JWT + Refresh token rotation
- Rate limiting
- Input validation (Zod)
- SQL injection prevention (Prisma)

##  Tech Stack

- **Runtime:** Node.js 18 LTS
- **Framework:** Fastify 4.x
- **Language:** TypeScript 5.x (strict)
- **Database:** PostgreSQL 15+
- **ORM:** Prisma 5.x
- **Search:** Elasticsearch 8.x
- **Validation:** Zod
- **Testing:** Vitest
- **Package Manager:** pnpm 8.x

##  License

MIT

---

Built as a portfolio project demonstrating modern backend development practices.
