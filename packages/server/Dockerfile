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
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# Copy shared source and prisma schema, then generate client, then build.
COPY packages/shared/prisma ./packages/shared/prisma
COPY packages/shared/prisma.config.ts ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src
RUN pnpm --filter @todolist/shared exec prisma generate --config prisma.config.ts
RUN pnpm --filter @todolist/shared run build

# Copy server source and compile TypeScript.
COPY packages/server/tsconfig.json ./packages/server/

# Copy source and compile TypeScript.
COPY packages/server/src ./packages/server/src
RUN pnpm --filter server exec tsc

# ─────────────────────────────────────────────
# Stage 2: runtime
# Installs only production dependencies and copies
# the compiled JS from the builder stage.
# No devDeps, no source files.
# ─────────────────────────────────────────────
FROM node:24-alpine
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate
WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy compiled output from builder — source and devDeps stay behind.
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Copy Prisma config and migrations needed for prisma migrate deploy at runtime.
COPY packages/shared/prisma.config.ts ./packages/shared/
COPY packages/shared/prisma/schema.prisma ./packages/shared/prisma/
COPY packages/shared/prisma/migrations ./packages/shared/prisma/migrations

WORKDIR /app/packages/server
EXPOSE 3000
# Run migrations from shared (where schema lives), then start the server.
# Shell form is required here to support the && operator.
CMD ["sh", "-c", "cd /app/packages/shared && /app/node_modules/.pnpm/node_modules/.bin/prisma migrate deploy --config prisma.config.ts && cd /app/packages/server && exec node dist/server.js"] 
