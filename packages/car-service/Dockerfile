# Build stage
FROM node:18-alpine3.17 AS builder

RUN npm install -g pnpm@8

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.json ./
COPY packages/car-service ./packages/car-service

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client if schema exists
WORKDIR /app/packages/car-service
RUN if [ -f "prisma/schema.prisma" ]; then pnpm prisma generate; fi

# Build car service
RUN pnpm run build

# Production stage
FROM node:18-alpine3.17

RUN npm install -g pnpm@8

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./

COPY --from=builder /app/packages/car-service/dist ./packages/car-service/dist
COPY --from=builder /app/packages/car-service/package.json ./packages/car-service/
COPY --from=builder /app/packages/car-service/tsconfig.json ./packages/car-service/

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/car-service/node_modules ./packages/car-service/node_modules

WORKDIR /app/packages/car-service

EXPOSE 3002

ENV NODE_PATH=/app/node_modules

CMD ["node", "dist/index.js"]

ENV NODE_PATH=/app/node_modules

CMD ["node", "dist/index.js"]
