# Build stage
FROM node:18-alpine3.17 AS builder

RUN npm install -g pnpm@8

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.json ./
COPY packages/notification-service ./packages/notification-service

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build notification service
WORKDIR /app/packages/notification-service
RUN pnpm run build

# Production stage
FROM node:18-alpine3.17

RUN npm install -g pnpm@8

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./

COPY --from=builder /app/packages/notification-service/dist ./packages/notification-service/dist
COPY --from=builder /app/packages/notification-service/package.json ./packages/notification-service/
COPY --from=builder /app/packages/notification-service/tsconfig.json ./packages/notification-service/

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/notification-service/node_modules ./packages/notification-service/node_modules

WORKDIR /app/packages/notification-service

EXPOSE 3005

ENV NODE_PATH=/app/node_modules

CMD ["node", "dist/index.js"]
