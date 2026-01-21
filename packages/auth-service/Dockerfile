# Build stage
FROM node:18-alpine3.17 AS builder

RUN npm install -g pnpm@8

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.json ./
COPY packages/auth-service ./packages/auth-service

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
WORKDIR /app/packages/auth-service
RUN pnpm prisma generate

# Build auth service
RUN pnpm run build

# Production stage
FROM node:18-alpine3.17

RUN npm install -g pnpm@8

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./

COPY --from=builder /app/packages/auth-service/dist ./packages/auth-service/dist
COPY --from=builder /app/packages/auth-service/package.json ./packages/auth-service/
COPY --from=builder /app/packages/auth-service/tsconfig.json ./packages/auth-service/
COPY --from=builder /app/packages/auth-service/prisma ./packages/auth-service/prisma

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/auth-service/node_modules ./packages/auth-service/node_modules

WORKDIR /app/packages/auth-service

EXPOSE 3001

ENV NODE_PATH=/app/node_modules

CMD ["node", "dist/index.js"]

ENV NODE_PATH=/app/node_modules

CMD ["node", "dist/index.js"]
