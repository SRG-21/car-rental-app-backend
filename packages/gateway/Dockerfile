# Build stage
FROM node:18-alpine AS builder

RUN npm install -g pnpm@8

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.json .npmrc ./
COPY packages/shared ./packages/shared
COPY packages/gateway ./packages/gateway

RUN pnpm install --frozen-lockfile

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm run build

# Build gateway
WORKDIR /app/packages/gateway
RUN pnpm run build

# Production stage
FROM node:18-alpine

RUN npm install -g pnpm@8

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/shared/tsconfig.json ./packages/shared/
COPY --from=builder /app/packages/gateway/dist ./packages/gateway/dist
COPY --from=builder /app/packages/gateway/package.json ./packages/gateway/
COPY --from=builder /app/packages/gateway/tsconfig.json ./packages/gateway/

# Copy ALL node_modules from builder (no pruning to preserve workspace links)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder /app/packages/gateway/node_modules ./packages/gateway/node_modules

WORKDIR /app/packages/gateway

EXPOSE 3000

ENV NODE_PATH=/app/node_modules

CMD ["node", "dist/index.js"]
