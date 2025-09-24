# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@8

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.json ./
COPY packages/shared ./packages/shared
COPY packages/booking-service ./packages/booking-service

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
WORKDIR /app/packages/booking-service
RUN pnpm prisma generate

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm run build

# Build booking service
WORKDIR /app/packages/booking-service
RUN pnpm run build

# Prune dev dependencies
WORKDIR /app
RUN pnpm install --frozen-lockfile --prod

# Production stage
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm@8

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./

# Copy built packages
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/shared/tsconfig.json ./packages/shared/
COPY --from=builder /app/packages/booking-service/dist ./packages/booking-service/dist
COPY --from=builder /app/packages/booking-service/package.json ./packages/booking-service/
COPY --from=builder /app/packages/booking-service/tsconfig.json ./packages/booking-service/
COPY --from=builder /app/packages/booking-service/prisma ./packages/booking-service/prisma

# Copy production node_modules from builder (includes Prisma Client)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder /app/packages/booking-service/node_modules ./packages/booking-service/node_modules

WORKDIR /app/packages/booking-service

EXPOSE 3004

ENV NODE_PATH=/app/node_modules

CMD ["node", "dist/index.js"]
