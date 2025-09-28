# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@8

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.json ./
COPY packages/shared ./packages/shared
COPY packages/notification-service ./packages/notification-service

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm run build

# Build notification service
WORKDIR /app/packages/notification-service
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
COPY --from=builder /app/packages/notification-service/dist ./packages/notification-service/dist
COPY --from=builder /app/packages/notification-service/package.json ./packages/notification-service/
COPY --from=builder /app/packages/notification-service/tsconfig.json ./packages/notification-service/

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder /app/packages/notification-service/node_modules ./packages/notification-service/node_modules

WORKDIR /app/packages/notification-service

EXPOSE 3005

ENV NODE_PATH=/app/node_modules

CMD ["node", "dist/index.js"]
