# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@8

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.json ./
COPY packages/shared ./packages/shared
COPY packages/search-service ./packages/search-service

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm run build

# Build search service
WORKDIR /app/packages/search-service
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
COPY --from=builder /app/packages/search-service/dist ./packages/search-service/dist
COPY --from=builder /app/packages/search-service/package.json ./packages/search-service/
COPY --from=builder /app/packages/search-service/tsconfig.json ./packages/search-service/

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder /app/packages/search-service/node_modules ./packages/search-service/node_modules

WORKDIR /app/packages/search-service

EXPOSE 3003

ENV NODE_PATH=/app/node_modules

CMD ["node", "dist/index.js"]
