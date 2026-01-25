# Build stage
FROM node:18-alpine3.17 AS builder

RUN npm install -g pnpm@8

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.json ./
COPY packages/gateway ./packages/gateway

RUN pnpm install --frozen-lockfile

# Build gateway
WORKDIR /app/packages/gateway
RUN pnpm run build

# Production stage
FROM node:18-alpine3.17

RUN npm install -g pnpm@8

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./

COPY --from=builder /app/packages/gateway/dist ./packages/gateway/dist
COPY --from=builder /app/packages/gateway/package.json ./packages/gateway/
COPY --from=builder /app/packages/gateway/tsconfig.json ./packages/gateway/

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/gateway/node_modules ./packages/gateway/node_modules

WORKDIR /app/packages/gateway

EXPOSE 3000

ENV NODE_PATH=/app/node_modules

CMD ["node", "dist/index.js"]
