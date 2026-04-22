FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate
WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY packages/worker/package.json ./packages/worker/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

COPY packages/shared/prisma ./packages/shared/prisma
COPY packages/shared/prisma.config.ts ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src
RUN pnpm --filter @todolist/shared exec prisma generate --config prisma.config.ts
RUN pnpm --filter @todolist/shared run build

COPY packages/worker/tsconfig.json ./packages/worker/
COPY packages/worker/src ./packages/worker/src
RUN pnpm --filter @todolist/worker exec tsc

FROM node:24-alpine
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate
WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY packages/worker/package.json ./packages/worker/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder /app/packages/worker/dist ./packages/worker/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

COPY packages/shared/prisma.config.ts ./packages/shared/
COPY packages/shared/prisma/schema.prisma ./packages/shared/prisma/
COPY packages/shared/prisma/migrations ./packages/shared/prisma/migrations

WORKDIR /app/packages/worker
CMD ["sh", "-c", "cd /app/packages/shared && /app/node_modules/.pnpm/node_modules/.bin/prisma migrate deploy --config prisma.config.ts && cd /app/packages/worker && graphile-worker --schema-only && exec node dist/worker.js"]
