# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@8

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.json ./
COPY packages/shared ./packages/shared
COPY packages/car-service ./packages/car-service

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
WORKDIR /app/packages/car-service
RUN pnpm prisma generate

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm run build

# Build car service
WORKDIR /app/packages/car-service
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
COPY --from=builder /app/packages/car-service/dist ./packages/car-service/dist
COPY --from=builder /app/packages/car-service/package.json ./packages/car-service/
COPY --from=builder /app/packages/car-service/tsconfig.json ./packages/car-service/
COPY --from=builder /app/packages/car-service/prisma ./packages/car-service/prisma

# Copy production node_modules from builder (includes Prisma Client)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder /app/packages/car-service/node_modules ./packages/car-service/node_modules

WORKDIR /app/packages/car-service

EXPOSE 3002

ENV NODE_PATH=/app/node_modules

CMD ["node", "dist/index.js"]
