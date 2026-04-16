# ─────────────────────────────────────────────
# Stage 1: builder
# Installs all dependencies (including devDeps),
# generates the Prisma client, and compiles TypeScript to JS.
# This stage is discarded after the final image is built.
# ─────────────────────────────────────────────
FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate
WORKDIR /app

# Copy workspace manifests first — Docker caches this layer.
# Dependencies are only re-installed when lockfile or package.json changes.
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY packages/server/package.json ./packages/server/
RUN pnpm install --frozen-lockfile

# Copy schema and config, then generate the Prisma client.
# Must happen before copying src/ — generated files land in src/generated/prisma.
COPY packages/server/tsconfig.json ./packages/server/
COPY packages/server/prisma ./packages/server/prisma
COPY packages/server/prisma.config.ts ./packages/server/
RUN pnpm --filter server exec prisma generate

# Copy source and compile TypeScript.
COPY packages/server/src ./packages/server/src
RUN pnpm --filter server exec tsc

# ─────────────────────────────────────────────
# Stage 2: runtime
# Installs only production dependencies and copies
# the compiled JS from the builder stage.
# No devDeps, no source files, no Prisma CLI.
# ─────────────────────────────────────────────
FROM node:24-alpine
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate
WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY packages/server/package.json ./packages/server/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy compiled output from builder — source and devDeps stay behind.
COPY --from=builder /app/packages/server/dist ./packages/server/dist

# Copy Prisma config and migrations needed for prisma migrate deploy at runtime.
COPY packages/server/prisma.config.ts ./packages/server/
COPY packages/server/prisma/schema.prisma ./packages/server/prisma/
COPY packages/server/prisma/migrations ./packages/server/prisma/migrations

WORKDIR /app/packages/server
EXPOSE 3000
# Run migrations then start the server.
# Shell form is required here to support the && operator.
CMD ["sh", "-c", "/app/node_modules/.pnpm/node_modules/.bin/prisma migrate deploy && exec node /app/packages/server/dist/server.js"] 
