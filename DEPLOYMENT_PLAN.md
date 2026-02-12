# 🚀 End-to-End Deployment Plan
## Car Rental Backend - Microservices Platform

**Document Version:** 1.0  
**Last Updated:** December 3, 2025  
**Project:** Car Rental Backend Microservices  
**Target Environments:** Development, Staging, Production

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Summary](#architecture-summary)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Deployment Strategies](#deployment-strategies)
5. [Environment Configuration](#environment-configuration)
6. [Database Migration Strategy](#database-migration-strategy)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Container Orchestration](#container-orchestration)
9. [Cloud Deployment Options](#cloud-deployment-options)
10. [Monitoring & Observability](#monitoring--observability)
11. [Security Hardening](#security-hardening)
12. [Rollback Procedures](#rollback-procedures)
13. [Post-Deployment Validation](#post-deployment-validation)
14. [Disaster Recovery](#disaster-recovery)

---

## 🎯 Overview

This deployment plan covers the complete process of deploying a microservices-based car rental platform from local development to production. The system consists of 6 microservices, 2 databases, and an API gateway.

### System Components

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| **API Gateway** | Fastify | 3000 | Request routing, rate limiting, auth validation |
| **Auth Service** | Fastify + Prisma | 3001 | User authentication, JWT management |
| **Car Service** | Fastify + Prisma | 3002 | Car inventory CRUD operations |
| **Search Service** | Fastify + Elasticsearch | 3003 | Geo-spatial car search |
| **Booking Service** | Fastify + Prisma | 3004 | Booking management with race condition handling |
| **Notification Service** | Fastify | 3005 | Email notifications |
| **PostgreSQL** | Database | 5432 | Relational data store |
| **Elasticsearch** | Search Engine | 9200 | Full-text and geo-spatial search |

### Key Features
- ✅ **Monorepo**: pnpm workspace with shared utilities
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Validation**: Zod schemas for all inputs
- ✅ **Security**: JWT auth, bcrypt hashing, Helmet middleware
- ✅ **Data Integrity**: Prisma ORM with exclusion constraints
- ✅ **Containerization**: Docker multi-stage builds
- ✅ **Health Checks**: All services have health endpoints

---

## 🏗️ Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                     Load Balancer                       │
│                  (AWS ALB / GCP LB)                     │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   API Gateway :3000                     │
│            (Rate Limiting + JWT Validation)             │
└────┬────────┬────────┬────────┬────────┬───────────────┘
     │        │        │        │        │
   ┌─▼──┐  ┌─▼──┐  ┌──▼─┐  ┌──▼─┐  ┌──▼─┐
   │Auth│  │Car │  │Srch│  │Book│  │Ntfy│
   │3001│  │3002│  │3003│  │3004│  │3005│
   └──┬─┘  └──┬─┘  └──┬─┘  └──┬─┘  └────┘
      │       │       │       │
   ┌──▼───────▼───────┴───────▼───┐  ┌────────────┐
   │     PostgreSQL :5432          │  │Elasticsearch│
   │  (Users, Cars, Bookings)      │  │    :9200    │
   └───────────────────────────────┘  └────────────┘
```

---

## ✅ Pre-Deployment Checklist

### Code Readiness
- [ ] All services built and tested locally
- [ ] Unit tests passing (target: >80% coverage)
- [ ] Integration tests passing
- [ ] Linting and type checking passing
- [ ] No critical security vulnerabilities (run `pnpm audit`)
- [ ] Documentation updated

### Infrastructure Readiness
- [ ] Domain name registered (e.g., `api.carrental.com`)
- [ ] SSL/TLS certificates obtained (Let's Encrypt or AWS ACM)
- [ ] Cloud provider account setup (AWS/GCP/Azure)
- [ ] Database hosting decided (RDS, Cloud SQL, or self-hosted)
- [ ] Elasticsearch hosting decided (AWS OpenSearch, Elastic Cloud, or self-hosted)
- [ ] Container registry setup (Docker Hub, ECR, GCR, or ACR)

### Security Readiness
- [ ] Secrets management strategy defined (AWS Secrets Manager, GCP Secret Manager, Vault)
- [ ] Environment variables secured
- [ ] Database encryption at rest enabled
- [ ] Network policies defined
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented

### Team Readiness
- [ ] Deployment runbook reviewed
- [ ] Rollback procedures tested
- [ ] On-call schedule established
- [ ] Monitoring alerts configured
- [ ] Incident response plan ready

---

## 🎲 Deployment Strategies

### Strategy 1: Blue-Green Deployment (Recommended for Production)

**Best for:** Zero-downtime deployments, instant rollback capability

```yaml
Phases:
1. Deploy new version to "Green" environment
2. Run smoke tests on Green
3. Switch load balancer to Green
4. Monitor metrics for 15-30 minutes
5. Keep Blue environment for quick rollback
6. After stability confirmed, decommission Blue
```

**Pros:**
- Zero downtime
- Instant rollback
- Full testing before cutover

**Cons:**
- Requires 2x infrastructure
- Complex database migrations

---

### Strategy 2: Rolling Deployment

**Best for:** Cost-effective production deployments

```yaml
Phases:
1. Deploy to 1 instance
2. Health check + smoke test
3. Deploy to next instance
4. Repeat until all instances updated
```

**Pros:**
- No extra infrastructure needed
- Gradual rollout
- Can pause/rollback mid-deployment

**Cons:**
- Longer deployment time
- Version mixing during deployment

---

### Strategy 3: Canary Deployment

**Best for:** High-risk changes, A/B testing

```yaml
Phases:
1. Deploy to 5% of traffic
2. Monitor metrics for 1-2 hours
3. Increase to 25% if stable
4. Increase to 50% if stable
5. Complete rollout to 100%
```

**Pros:**
- Minimal blast radius
- Real-world testing with limited exposure
- Data-driven rollout decisions

**Cons:**
- Complex routing logic
- Requires sophisticated monitoring

---

## 🔧 Environment Configuration

### Development Environment

**Location:** Local developer machines  
**Purpose:** Feature development and testing

```bash
# .env.development
NODE_ENV=development
LOG_LEVEL=debug

# Gateway
PORT=3000
FRONTEND_URL=http://localhost:5173

# Services
AUTH_SERVICE_URL=http://localhost:3001
CAR_SERVICE_URL=http://localhost:3002
SEARCH_SERVICE_URL=http://localhost:3003
BOOKING_SERVICE_URL=http://localhost:3004
NOTIFICATION_SERVICE_URL=http://localhost:3005

# Database (local)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/car_rental

# Elasticsearch (local)
ELASTICSEARCH_URL=http://localhost:9200

# JWT (dev keys - NOT for production)
JWT_SECRET=dev-secret-key-min-32-characters-long-for-testing
REFRESH_SECRET=dev-refresh-secret-min-32-characters-long
JWT_EXPIRY=15m
REFRESH_EXPIRY=7d

# Bcrypt
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=15m
```

---

### Staging Environment

**Location:** Cloud infrastructure (mirrors production)  
**Purpose:** QA testing, integration testing, client demos

```bash
# .env.staging
NODE_ENV=staging
LOG_LEVEL=info

# Gateway (behind ALB/Load Balancer)
PORT=3000
FRONTEND_URL=https://staging.carrental.com

# Services (internal service mesh)
AUTH_SERVICE_URL=http://auth-service:3001
CAR_SERVICE_URL=http://car-service:3002
SEARCH_SERVICE_URL=http://search-service:3003
BOOKING_SERVICE_URL=http://booking-service:3004
NOTIFICATION_SERVICE_URL=http://notification-service:3005

# Database (RDS/Cloud SQL)
DATABASE_URL=postgresql://carrental_user:${DB_PASSWORD}@staging-db.xyz.rds.amazonaws.com:5432/car_rental?ssl=true&connection_limit=10&pool_timeout=20

# Elasticsearch (AWS OpenSearch/Elastic Cloud)
ELASTICSEARCH_URL=https://staging-es.xyz.es.amazonaws.com

# JWT (from Secrets Manager)
JWT_SECRET=${SECRET_JWT_SECRET}
REFRESH_SECRET=${SECRET_REFRESH_SECRET}
JWT_EXPIRY=15m
REFRESH_EXPIRY=7d

# Bcrypt
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15m

# Email (SendGrid/SES)
SENDGRID_API_KEY=${SECRET_SENDGRID_KEY}
```

---

### Production Environment

**Location:** Cloud infrastructure with redundancy  
**Purpose:** Serving real users

```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=warn

# Gateway
PORT=3000
FRONTEND_URL=https://carrental.com

# Services (service mesh with TLS)
AUTH_SERVICE_URL=http://auth-service:3001
CAR_SERVICE_URL=http://car-service:3002
SEARCH_SERVICE_URL=http://search-service:3003
BOOKING_SERVICE_URL=http://booking-service:3004
NOTIFICATION_SERVICE_URL=http://notification-service:3005

# Database (Multi-AZ RDS with read replicas)
DATABASE_URL=postgresql://carrental_user:${DB_PASSWORD}@prod-db.xyz.rds.amazonaws.com:5432/car_rental?ssl=true&connection_limit=20&pool_timeout=30

# Elasticsearch (Production cluster)
ELASTICSEARCH_URL=https://prod-es.xyz.es.amazonaws.com

# JWT (from Secrets Manager with rotation)
JWT_SECRET=${SECRET_JWT_SECRET}
REFRESH_SECRET=${SECRET_REFRESH_SECRET}
JWT_EXPIRY=15m
REFRESH_EXPIRY=7d

# Bcrypt (higher rounds for security)
BCRYPT_ROUNDS=12

# Rate Limiting (stricter)
RATE_LIMIT_MAX=50
RATE_LIMIT_WINDOW=15m

# Email
SENDGRID_API_KEY=${SECRET_SENDGRID_KEY}

# Monitoring
SENTRY_DSN=${SECRET_SENTRY_DSN}
DATADOG_API_KEY=${SECRET_DATADOG_KEY}
```

---

## 🗄️ Database Migration Strategy

### Migration Workflow

```yaml
Phase 1: Pre-Migration (Before Deployment)
  - Backup production database
  - Test migration on staging (using production backup)
  - Review migration SQL for performance impact
  - Identify long-running migrations (>30s)
  - Plan downtime if needed

Phase 2: Migration Execution
  - Enable maintenance mode (if downtime required)
  - Run Prisma migrations: pnpm run migrate:deploy
  - Verify data integrity
  - Run post-migration scripts (indexes, constraints)
  - Disable maintenance mode

Phase 3: Post-Migration Validation
  - Run health checks
  - Verify critical queries
  - Monitor performance metrics
  - Check error logs
```

### Prisma Migration Commands

```bash
# Development: Create and apply migration
cd packages/auth-service
pnpm prisma migrate dev --name add_user_roles

cd packages/car-service
pnpm prisma migrate dev --name add_car_images

cd packages/booking-service
pnpm prisma migrate dev --name add_exclusion_constraint

# Staging/Production: Deploy migrations
pnpm run migrate:deploy

# Generate Prisma Client (after schema changes)
pnpm run prisma:generate

# Reset database (dev only - DESTRUCTIVE)
pnpm run prisma:reset
```

### Critical: Booking Service Exclusion Constraint

This prevents double-booking race conditions. **Must be applied manually:**

```sql
-- Run after initial migration
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
ADD CONSTRAINT booking_no_overlap
EXCLUDE USING gist (
  car_id WITH =,
  tstzrange(pickup_time, dropoff_time) WITH &&
)
WHERE (status != 'cancelled');
```

### Zero-Downtime Migration Strategies

1. **Additive Changes** (Safe - No downtime)
   - Adding new tables
   - Adding nullable columns
   - Adding indexes (use `CONCURRENTLY`)

2. **Backward-Compatible Changes** (Safe with blue-green)
   - Column renames (deploy code first, then migrate)
   - Adding non-null columns with defaults

3. **Breaking Changes** (Requires downtime or multi-phase)
   - Removing columns
   - Changing column types
   - Adding non-null constraints

**Multi-Phase Example:**
```
Phase 1: Add new column (nullable)
Phase 2: Deploy code writing to both old and new columns
Phase 3: Backfill data
Phase 4: Deploy code reading from new column
Phase 5: Remove old column
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create: `.github/workflows/deploy.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18'
  PNPM_VERSION: '8'

jobs:
  # ===================================
  # JOB 1: Lint & Type Check
  # ===================================
  lint:
    name: Lint and Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Get pnpm store directory
        shell: bash
        run: echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm run lint

      - name: Run TypeScript check
        run: pnpm run typecheck

  # ===================================
  # JOB 2: Unit Tests
  # ===================================
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    needs: lint
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: car_rental_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      elasticsearch:
        image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
        env:
          discovery.type: single-node
          xpack.security.enabled: false
          ES_JAVA_OPTS: -Xms512m -Xmx512m
        options: >-
          --health-cmd "curl -f http://localhost:9200/_cluster/health"
          --health-interval 30s
          --health-timeout 10s
          --health-retries 5
        ports:
          - 9200:9200

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma clients
        run: pnpm run prisma:generate

      - name: Run database migrations
        run: pnpm run migrate:test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/car_rental_test

      - name: Run tests with coverage
        run: pnpm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/car_rental_test
          ELASTICSEARCH_URL: http://localhost:9200
          JWT_SECRET: test-secret-key-min-32-characters-long
          REFRESH_SECRET: test-refresh-secret-min-32-characters
          NODE_ENV: test

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  # ===================================
  # JOB 3: Build Docker Images
  # ===================================
  build:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    strategy:
      matrix:
        service:
          - gateway
          - auth-service
          - car-service
          - search-service
          - booking-service
          - notification-service

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ secrets.DOCKER_USERNAME }}/car-rental-${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=semver,pattern={{version}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./packages/${{ matrix.service }}/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ===================================
  # JOB 4: Deploy to Staging
  # ===================================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging-api.carrental.com

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to ECS/EKS (Staging)
        run: |
          # Update ECS task definitions or kubectl apply
          # Example for ECS:
          aws ecs update-service --cluster staging-cluster --service gateway --force-new-deployment
          aws ecs update-service --cluster staging-cluster --service auth-service --force-new-deployment
          # ... repeat for all services

      - name: Run database migrations
        run: |
          # Connect to staging database and run migrations
          # This should be done via a secure method (bastion host, VPN, etc.)
          echo "Running migrations on staging..."

      - name: Run smoke tests
        run: |
          # Basic health checks
          curl -f https://staging-api.carrental.com/health || exit 1

  # ===================================
  # JOB 5: Deploy to Production
  # ===================================
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://api.carrental.com

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Create backup
        run: |
          # Backup production database
          echo "Creating database backup..."

      - name: Deploy to Production (Blue-Green)
        run: |
          # Deploy to green environment
          # Run health checks
          # Switch traffic
          echo "Deploying to production..."

      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## ☸️ Container Orchestration

### Option A: Docker Compose (Development & Small Production)

**Current Setup:** Already configured in `docker-compose.yml`

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f gateway auth-service

# Scale a service
docker compose up -d --scale booking-service=3

# Stop all services
docker compose down

# Remove volumes (DESTRUCTIVE)
docker compose down -v
```

**Pros:**
- Simple setup
- Good for development
- Works on single server

**Cons:**
- No auto-scaling
- No self-healing
- Single point of failure

---

### Option B: Kubernetes (Recommended for Production)

Create deployment manifests:

**File: `k8s/namespace.yaml`**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: car-rental
```

**File: `k8s/configmap.yaml`**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: car-rental-config
  namespace: car-rental
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  AUTH_SERVICE_URL: "http://auth-service:3001"
  CAR_SERVICE_URL: "http://car-service:3002"
  SEARCH_SERVICE_URL: "http://search-service:3003"
  BOOKING_SERVICE_URL: "http://booking-service:3004"
  NOTIFICATION_SERVICE_URL: "http://notification-service:3005"
  ELASTICSEARCH_URL: "http://elasticsearch:9200"
  RATE_LIMIT_MAX: "100"
  RATE_LIMIT_WINDOW: "15m"
  JWT_EXPIRY: "15m"
  REFRESH_EXPIRY: "7d"
  BCRYPT_ROUNDS: "12"
```

**File: `k8s/secrets.yaml`**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: car-rental-secrets
  namespace: car-rental
type: Opaque
data:
  # Base64 encoded values
  DATABASE_URL: <base64-encoded-connection-string>
  JWT_SECRET: <base64-encoded-jwt-secret>
  REFRESH_SECRET: <base64-encoded-refresh-secret>
  SENDGRID_API_KEY: <base64-encoded-api-key>
```

**File: `k8s/deployments/gateway-deployment.yaml`**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway
  namespace: car-rental
  labels:
    app: gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gateway
  template:
    metadata:
      labels:
        app: gateway
    spec:
      containers:
      - name: gateway
        image: yourdockerhub/car-rental-gateway:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: car-rental-config
        - secretRef:
            name: car-rental-secrets
        env:
        - name: PORT
          value: "3000"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: gateway
  namespace: car-rental
spec:
  type: LoadBalancer
  selector:
    app: gateway
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
```

**File: `k8s/deployments/auth-service-deployment.yaml`**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: car-rental
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: yourdockerhub/car-rental-auth-service:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: car-rental-config
        - secretRef:
            name: car-rental-secrets
        env:
        - name: PORT
          value: "3001"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: car-rental
spec:
  selector:
    app: auth-service
  ports:
  - port: 3001
    targetPort: 3001
```

**File: `k8s/hpa.yaml`** (Horizontal Pod Autoscaler)
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: gateway-hpa
  namespace: car-rental
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: gateway
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Deployment Commands:**
```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy services
kubectl apply -f k8s/deployments/

# Apply autoscaling
kubectl apply -f k8s/hpa.yaml

# Check status
kubectl get pods -n car-rental
kubectl get services -n car-rental

# View logs
kubectl logs -f deployment/gateway -n car-rental

# Scale manually
kubectl scale deployment gateway --replicas=5 -n car-rental
```

---

### Option C: AWS ECS (Elastic Container Service)

**Pros:**
- Managed service
- Integrates with AWS ecosystem
- Simpler than Kubernetes

**Setup:**
1. Create ECS cluster
2. Create task definitions for each service
3. Create ECS services
4. Configure Application Load Balancer
5. Set up auto-scaling policies

---

## ☁️ Cloud Deployment Options

### Option 1: AWS Deployment

**Architecture:**
```
Route 53 (DNS)
    ↓
CloudFront (CDN)
    ↓
Application Load Balancer
    ↓
ECS Cluster / EKS
    ↓
┌─────────────┬──────────────┬───────────────┐
│ RDS         │ OpenSearch   │ ElastiCache   │
│ PostgreSQL  │ (Elastic-    │ (Redis for    │
│             │  search)     │ rate limiting)│
└─────────────┴──────────────┴───────────────┘
```

**Services to Use:**
- **Compute:** ECS Fargate or EKS
- **Database:** RDS PostgreSQL (Multi-AZ)
- **Search:** Amazon OpenSearch Service
- **Cache:** ElastiCache Redis
- **Load Balancer:** Application Load Balancer (ALB)
- **DNS:** Route 53
- **CDN:** CloudFront
- **Secrets:** AWS Secrets Manager
- **Monitoring:** CloudWatch + X-Ray
- **CI/CD:** CodePipeline + CodeBuild
- **Container Registry:** ECR

**Estimated Monthly Cost:**
- ECS Fargate (6 services × 2 instances): ~$200
- RDS db.t3.medium (Multi-AZ): ~$150
- OpenSearch t3.small: ~$50
- ALB: ~$25
- **Total:** ~$425/month (with minimal traffic)

---

### Option 2: Google Cloud Platform (GCP)

**Architecture:**
```
Cloud DNS
    ↓
Cloud Load Balancing
    ↓
GKE (Kubernetes)
    ↓
┌─────────────┬──────────────┬───────────────┐
│ Cloud SQL   │ Elasticsearch│ Memorystore   │
│ PostgreSQL  │ (self-hosted)│ Redis         │
└─────────────┴──────────────┴───────────────┘
```

**Services to Use:**
- **Compute:** Google Kubernetes Engine (GKE)
- **Database:** Cloud SQL for PostgreSQL
- **Search:** Self-hosted Elasticsearch on GCE or Elastic Cloud
- **Cache:** Memorystore for Redis
- **Load Balancer:** Cloud Load Balancing
- **Secrets:** Secret Manager
- **Monitoring:** Cloud Monitoring + Cloud Trace
- **Container Registry:** Artifact Registry

**Estimated Monthly Cost:**
- GKE Autopilot: ~$200
- Cloud SQL db-n1-standard-1: ~$120
- Elasticsearch (n1-standard-2): ~$80
- Load Balancer: ~$20
- **Total:** ~$420/month

---

### Option 3: Azure Deployment

**Services to Use:**
- **Compute:** Azure Kubernetes Service (AKS)
- **Database:** Azure Database for PostgreSQL
- **Search:** Azure Cognitive Search or self-hosted
- **Cache:** Azure Cache for Redis
- **Load Balancer:** Azure Application Gateway
- **Secrets:** Azure Key Vault
- **Monitoring:** Azure Monitor
- **Container Registry:** Azure Container Registry (ACR)

---

### Option 4: DigitalOcean (Cost-Effective)

**Services to Use:**
- **Compute:** Kubernetes (DOKS)
- **Database:** Managed PostgreSQL
- **Search:** Self-hosted Elasticsearch Droplet
- **Load Balancer:** DigitalOcean Load Balancer
- **Storage:** Spaces (S3-compatible)
- **Container Registry:** Container Registry

**Estimated Monthly Cost:**
- DOKS (3 nodes): ~$120
- Managed PostgreSQL: ~$60
- Elasticsearch Droplet: ~$40
- Load Balancer: ~$12
- **Total:** ~$232/month

---

### Option 5: Render.com / Railway.app (Simplest)

**Best for:** MVPs, small-scale production

**Pros:**
- Zero DevOps overhead
- Auto-deploy from Git
- Built-in SSL, monitoring

**Cons:**
- Less control
- Higher cost at scale
- Limited customization

---

## 📊 Monitoring & Observability

### Metrics to Track

**Service-Level Metrics:**
- Request rate (requests/second)
- Error rate (4xx, 5xx errors)
- Response time (p50, p95, p99)
- Active connections
- CPU & memory usage

**Business Metrics:**
- User signups
- Successful bookings
- Search queries
- Failed payment attempts
- Average booking value

### Recommended Tools

**1. Prometheus + Grafana**
```yaml
# Expose metrics endpoint in each service
# Add to src/app.ts:

import promClient from 'prom-client';

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Middleware to track metrics
app.addHook('onResponse', (request, reply, done) => {
  httpRequestDuration
    .labels(request.method, request.url, reply.statusCode.toString())
    .observe((Date.now() - request.startTime) / 1000);
  done();
});

app.get('/metrics', async () => {
  return register.metrics();
});
```

**2. Sentry (Error Tracking)**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Add to error middleware
app.setErrorHandler((error, request, reply) => {
  Sentry.captureException(error);
  // ... rest of error handling
});
```

**3. Datadog / New Relic (APM)**
- Full-stack observability
- Distributed tracing
- Log aggregation
- Real user monitoring

**4. CloudWatch (AWS) / Cloud Monitoring (GCP)**
- Native cloud metrics
- Auto-scaling triggers
- Alarm notifications

### Alerting Rules

**Critical Alerts (Page on-call):**
- Service down (health check failing)
- Error rate > 5%
- Database connection pool exhausted
- Disk usage > 90%

**Warning Alerts (Slack notification):**
- Response time p95 > 500ms
- Error rate > 1%
- CPU usage > 80%
- Memory usage > 85%

---

## 🔒 Security Hardening

### Pre-Production Security Checklist

**Environment Variables:**
- [ ] All secrets in secret manager (not in code)
- [ ] JWT secrets are cryptographically random (32+ chars)
- [ ] Database passwords rotated regularly
- [ ] API keys for third-party services secured

**Network Security:**
- [ ] HTTPS/TLS enforced (SSL certificates installed)
- [ ] Database not publicly accessible
- [ ] Services communicate over private network
- [ ] Firewall rules restricting access
- [ ] Rate limiting configured

**Application Security:**
- [ ] Input validation on all endpoints (Zod schemas)
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS prevention (Helmet middleware)
- [ ] CSRF tokens for state-changing operations
- [ ] CORS configured correctly
- [ ] JWT expiry times appropriate
- [ ] Refresh token rotation enabled

**Database Security:**
- [ ] Encryption at rest enabled
- [ ] Encryption in transit (SSL)
- [ ] Principle of least privilege (app user can't DROP DATABASE)
- [ ] Regular backups automated
- [ ] Connection pooling configured

**Dependency Security:**
- [ ] Run `pnpm audit` and fix vulnerabilities
- [ ] Automated dependency updates (Dependabot)
- [ ] License compliance checked

**Monitoring:**
- [ ] Failed login attempt monitoring
- [ ] Unusual traffic pattern alerts
- [ ] Database query performance monitoring
- [ ] Security event logging

### Recommended Security Headers

Already configured via Helmet, but verify:

```typescript
// In app.ts
await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
});
```

---

## ⏮️ Rollback Procedures

### Kubernetes Rollback

```bash
# View deployment history
kubectl rollout history deployment/gateway -n car-rental

# Rollback to previous version
kubectl rollout undo deployment/gateway -n car-rental

# Rollback to specific revision
kubectl rollout undo deployment/gateway --to-revision=3 -n car-rental

# Check rollback status
kubectl rollout status deployment/gateway -n car-rental
```

### Docker Compose Rollback

```bash
# Re-deploy previous version
docker compose pull gateway:v1.2.3
docker compose up -d gateway

# Or rebuild from previous commit
git checkout <previous-commit-sha>
docker compose up -d --build gateway
```

### ECS Rollback

```bash
# Revert to previous task definition
aws ecs update-service \
  --cluster production-cluster \
  --service gateway \
  --task-definition gateway:12  # Previous revision
```

### Database Rollback

**If migration was applied:**

```bash
# Prisma doesn't support automatic rollback
# You need to create a reverse migration manually

# Example: Rollback adding a column
CREATE MIGRATION down_add_user_role.sql:
  ALTER TABLE users DROP COLUMN role;

# Apply manually:
psql $DATABASE_URL < down_add_user_role.sql
```

**Best Practice:** Always have database backup before migration

```bash
# Create backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore if needed
psql $DATABASE_URL < backup-20251203-143000.sql
```

---

## ✅ Post-Deployment Validation

### Automated Smoke Tests

Create: `scripts/smoke-test.sh`

```bash
#!/bin/bash

API_URL=${1:-http://localhost:3000}

echo "🧪 Running smoke tests against $API_URL"

# Test 1: Health check
echo -n "Testing health endpoint... "
if curl -f -s "$API_URL/health" > /dev/null; then
  echo "✅ PASS"
else
  echo "❌ FAIL"
  exit 1
fi

# Test 2: Auth signup
echo -n "Testing user signup... "
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "password": "TestPassword123",
    "name": "Smoke Test User"
  }')

if echo "$SIGNUP_RESPONSE" | grep -q "accessToken"; then
  echo "✅ PASS"
  ACCESS_TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.accessToken')
else
  echo "❌ FAIL"
  echo "$SIGNUP_RESPONSE"
  exit 1
fi

# Test 3: Protected endpoint
echo -n "Testing protected endpoint... "
if curl -f -s "$API_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null; then
  echo "✅ PASS"
else
  echo "❌ FAIL"
  exit 1
fi

# Test 4: Search cars
echo -n "Testing car search... "
if curl -f -s "$API_URL/search?lat=37.7749&lng=-122.4194" > /dev/null; then
  echo "✅ PASS"
else
  echo "❌ FAIL"
  exit 1
fi

echo ""
echo "✅ All smoke tests passed!"
```

Run after deployment:
```bash
chmod +x scripts/smoke-test.sh
./scripts/smoke-test.sh https://api.carrental.com
```

### Manual Validation Checklist

- [ ] Health endpoints return 200
- [ ] User can sign up
- [ ] User can log in
- [ ] JWT authentication works
- [ ] Car search returns results
- [ ] Booking creation works
- [ ] Database queries perform well
- [ ] Elasticsearch is indexing
- [ ] Email notifications send (if enabled)
- [ ] Error responses are properly formatted
- [ ] CORS headers present
- [ ] Rate limiting is active
- [ ] Logs are being collected
- [ ] Metrics are being reported

---

## 🆘 Disaster Recovery

### Backup Strategy

**Database Backups:**
```bash
# Automated daily backups (cron job)
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/car_rental_$(date +\%Y\%m\%d).sql.gz

# Retain: Daily for 7 days, weekly for 4 weeks, monthly for 12 months
```

**Elasticsearch Snapshots:**
```bash
# Create snapshot repository
curl -X PUT "localhost:9200/_snapshot/car_rental_backup" -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/mnt/backups/elasticsearch"
  }
}
'

# Create snapshot
curl -X PUT "localhost:9200/_snapshot/car_rental_backup/snapshot_$(date +%Y%m%d)"
```

### Recovery Time Objective (RTO) & Recovery Point Objective (RPO)

**Target:**
- **RTO:** 1 hour (time to restore service)
- **RPO:** 15 minutes (acceptable data loss)

**Achieving RTO:**
- Automated deployment scripts
- Infrastructure as Code (Terraform/CloudFormation)
- Blue-green deployments allow instant fallback
- Multi-region deployments (future)

**Achieving RPO:**
- Continuous database replication (Multi-AZ RDS)
- Point-in-time recovery enabled
- Transaction logs backed up every 5 minutes

### Disaster Scenarios & Recovery

**Scenario 1: Service Crash**
- **Detection:** Health check fails, alerts fired
- **Auto-Recovery:** Kubernetes restarts pod automatically
- **Manual:** `kubectl delete pod <name>` to force restart

**Scenario 2: Database Corruption**
- **Recovery:**
  1. Stop all services
  2. Restore from latest backup
  3. Apply transaction logs for point-in-time recovery
  4. Verify data integrity
  5. Restart services

**Scenario 3: Elasticsearch Cluster Failure**
- **Recovery:**
  1. Provision new Elasticsearch cluster
  2. Restore from latest snapshot
  3. Re-index missing data from PostgreSQL
  4. Update service configurations

**Scenario 4: Full Region Outage (AWS)**
- **Recovery:**
  1. Switch DNS to secondary region
  2. Promote read replica to primary database
  3. Start services in secondary region
  4. Monitor and validate

**Scenario 5: Accidental Data Deletion**
- **Recovery:**
  1. Identify timestamp of deletion
  2. Restore database to point before deletion
  3. Extract deleted records
  4. Re-insert into production database
  5. Verify user data integrity

---

## 📅 Deployment Timeline

### Week 1: Preparation Phase
- **Day 1-2:** Code freeze, final testing
- **Day 3-4:** Security audit, dependency updates
- **Day 5:** Create deployment runbook, train team

### Week 2: Staging Deployment
- **Day 1:** Deploy to staging environment
- **Day 2-3:** QA testing, load testing
- **Day 4:** Fix any issues found
- **Day 5:** Staging sign-off

### Week 3: Production Preparation
- **Day 1:** Create database backups
- **Day 2:** Pre-production checklist verification
- **Day 3:** Set up monitoring and alerts
- **Day 4:** Dry-run deployment on staging
- **Day 5:** Final team review

### Week 4: Production Deployment
- **Day 1:** Deploy off-peak hours (2 AM - 6 AM)
- **Day 2:** Monitor metrics, address issues
- **Day 3-4:** Continued monitoring
- **Day 5:** Post-deployment review, document lessons learned

---

## 🎯 Success Criteria

### Technical Metrics
- ✅ Zero downtime deployment
- ✅ All health checks passing
- ✅ Response time p95 < 300ms
- ✅ Error rate < 0.5%
- ✅ All services auto-scaling correctly

### Business Metrics
- ✅ No user complaints about downtime
- ✅ Booking conversion rate maintained or improved
- ✅ Search performance satisfactory
- ✅ Zero data loss

---

## 📚 Additional Resources

### Documentation
- [Fastify Documentation](https://www.fastify.io/)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Elasticsearch Production Deployment](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup.html)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)

### Internal Documentation
- See `ARCHITECTURE.md` for system design
- See `README.md` for local development
- See `IMPLEMENTATION_COMPLETE.md` for implementation details
- See `QUICK_START.md` for setup instructions

---

## 🤝 Support

### Deployment Team
- **DevOps Lead:** [Name] - Infrastructure, CI/CD
- **Backend Lead:** [Name] - Services, APIs
- **Database Admin:** [Name] - Migrations, backups
- **Security Lead:** [Name] - Security review, compliance

### Emergency Contacts
- **On-Call Engineer:** [Phone]
- **Slack Channel:** #car-rental-ops
- **Incident Response:** [Runbook link]

---

## ✅ Deployment Checklist (Print & Use)

```
PRE-DEPLOYMENT
  ☐ All tests passing
  ☐ Security audit complete
  ☐ Database backup created
  ☐ Deployment runbook reviewed
  ☐ Team notified
  ☐ Maintenance window scheduled (if needed)

DEPLOYMENT
  ☐ Deploy to staging first
  ☐ Run smoke tests on staging
  ☐ Run database migrations
  ☐ Deploy services in order (auth → car → search → booking → gateway)
  ☐ Verify health checks
  ☐ Monitor error rates

POST-DEPLOYMENT
  ☐ Run smoke tests on production
  ☐ Verify critical user journeys
  ☐ Monitor for 1 hour
  ☐ Check error logs
  ☐ Verify metrics dashboard
  ☐ Send deployment announcement
  ☐ Document any issues encountered

AFTER 24 HOURS
  ☐ Review metrics vs. baseline
  ☐ Check for any errors/warnings
  ☐ User feedback review
  ☐ Post-deployment retrospective
```

---

**End of Deployment Plan**

For questions or updates to this plan, contact the DevOps team.

**Last Updated:** December 3, 2025  
**Version:** 1.0  
**Status:** Ready for Review ✅
