# ---- Build Frontend ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Build Backend ----
FROM node:20-alpine AS backend-builder
WORKDIR /server
COPY server/package*.json ./
COPY server/prisma ./prisma
RUN npm ci
COPY server/ .
# Generate prisma client for backend builder
RUN npx prisma generate
RUN npx tsc index.ts

# ---- Production Image ----
FROM node:20-alpine AS production
WORKDIR /app

# Enable SQLite in Alpine
RUN apk add --no-cache sqlite  

# 1. Copy backend built files
COPY --from=backend-builder /server/package*.json ./
COPY --from=backend-builder /server/node_modules ./node_modules
COPY --from=backend-builder /server/dist ./dist
COPY --from=backend-builder /server/index.js ./index.js
COPY --from=backend-builder /server/prisma ./prisma

# 2. Copy frontend build to public folder (so Express can serve it)
COPY --from=frontend-builder /app/dist ./public

# Environment Configuration
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:./data/production.db"

# Create persistence directory for Dokploy Volume
RUN mkdir -p /app/data

# Expose standard web port
EXPOSE 3000

# Push migrations & Run server
CMD npx prisma db push --schema=./prisma/schema.prisma && node index.js
