# Multi-stage Dockerfile for web-andalay (Next.js app) in monorepo
# Following best practices from https://www.bstefanski.com/blog/turborepo-nextjs-dockerfile

# ========================
# Stage 1: Base
# ========================
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    pnpm install turbo --global

# ========================
# Stage 2: Builder (Pruning)
# ========================
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY . .
RUN turbo prune web-andalay --docker

# ========================
# Stage 3: Installer
# ========================
FROM base AS installer
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies first (this layer will be cached across builds)
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source code after dependencies are installed
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Build-time environment variables for Next.js
# NEXT_PUBLIC_* vars are inlined into the JS bundle at build time — must be ARG/ENV here.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_KEY
ARG NEXT_PUBLIC_API_PUBLIC_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_KEY=$NEXT_PUBLIC_API_KEY
ENV NEXT_PUBLIC_API_PUBLIC_KEY=$NEXT_PUBLIC_API_PUBLIC_KEY

# Build the application
RUN turbo run build --filter=web-andalay...

# ========================
# Stage 4: Runner
# ========================
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy built application files from installer stage
COPY --from=installer /app/apps/web-andalay/package.json .

# Copy the built application with correct permissions
COPY --from=installer --chown=nextjs:nodejs /app/apps/web-andalay/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web-andalay/.next/static ./apps/web-andalay/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web-andalay/public ./apps/web-andalay/public

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# NEXT_PUBLIC_* vars are inlined at build time by Next.js.
# Pass them via --build-arg at build time; do not hardcode here.

# Start the application
CMD ["node", "apps/web-andalay/server.js"]