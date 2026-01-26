# Build stage
FROM node:18-alpine3.17 AS builder

RUN npm install -g pnpm@8

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.json ./
COPY packages/booking-service ./packages/booking-service

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
WORKDIR /app/packages/booking-service
RUN pnpm prisma generate

# Build booking service
RUN pnpm run build

# Production stage
FROM node:18-alpine3.17

RUN npm install -g pnpm@8

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./

COPY --from=builder /app/packages/booking-service/dist ./packages/booking-service/dist
COPY --from=builder /app/packages/booking-service/package.json ./packages/booking-service/
COPY --from=builder /app/packages/booking-service/tsconfig.json ./packages/booking-service/
COPY --from=builder /app/packages/booking-service/prisma ./packages/booking-service/prisma

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/booking-service/node_modules ./packages/booking-service/node_modules

WORKDIR /app/packages/booking-service

EXPOSE 3004

ENV NODE_PATH=/app/node_modules

CMD ["node", "dist/index.js"]

ENV NODE_PATH=/app/node_modules

CMD ["node", "dist/index.js"]
