# Build stage
FROM node:18-alpine3.17 AS builder

RUN npm install -g pnpm@8

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.json ./
COPY packages/search-service ./packages/search-service

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build search service
WORKDIR /app/packages/search-service
RUN pnpm run build

# Production stage
FROM node:18-alpine3.17

RUN npm install -g pnpm@8

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./

COPY --from=builder /app/packages/search-service/dist ./packages/search-service/dist
COPY --from=builder /app/packages/search-service/package.json ./packages/search-service/
COPY --from=builder /app/packages/search-service/tsconfig.json ./packages/search-service/

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/search-service/node_modules ./packages/search-service/node_modules

WORKDIR /app/packages/search-service

EXPOSE 3003

ENV NODE_PATH=/app/node_modules

CMD ["node", "dist/index.js"]
