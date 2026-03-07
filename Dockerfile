# ---- Stage 1: Build Frontend ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 2: Build Backend ----
FROM node:20-alpine AS backend-builder
WORKDIR /server
RUN apk add --no-cache openssl
COPY server/package*.json ./
COPY server/prisma ./prisma
RUN npm ci
COPY server/ .
RUN npx prisma generate
RUN npx tsc -p tsconfig.json

# ---- Stage 3: Production ----
FROM node:20-alpine AS production
WORKDIR /app

# SQLite + OpenSSL support for Alpine (required by Prisma)
RUN apk add --no-cache sqlite openssl

# Copy backend
COPY --from=backend-builder /server/package*.json ./
COPY --from=backend-builder /server/node_modules ./node_modules
COPY --from=backend-builder /server/dist ./dist
COPY --from=backend-builder /server/prisma ./prisma

# Copy frontend build (Express serves it as static)
COPY --from=frontend-builder /app/dist ./public

# Environment
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:/app/data/production.db"

# Persistent volume mount point for SQLite DB
VOLUME ["/app/data"]

EXPOSE 3000

# Push schema & start server
CMD ["sh", "-c", "npx prisma db push --schema=./prisma/schema.prisma && node dist/index.js"]
