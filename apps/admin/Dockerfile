# syntax=docker/dockerfile:1

# Stage 1: Base with PNPM
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.17.0 --activate
RUN apk add --no-cache libc6-compat dumb-init

# Stage 2: Builder
FROM base AS builder
WORKDIR /app

# Build arguments for Next.js public client-side variables
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_PUBLIC_WEB_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_PUBLIC_WEB_URL=$NEXT_PUBLIC_PUBLIC_WEB_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILD_STANDALONE=true

# Copy workspace configurations and dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/admin/ ./apps/admin/

# Install workspace dependencies
RUN pnpm install --frozen-lockfile

# Build shared contracts, api-client, ui, and admin app
RUN pnpm --filter @findfunlinks/contracts build
RUN pnpm --filter @findfunlinks/api-client build
RUN pnpm --filter @findfunlinks/admin build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache dumb-init

# Create unprivileged system user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output and static assets
COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static

USER nextjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/login || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "apps/admin/server.js"]

