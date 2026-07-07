# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# 1. deps — install dependencies with Bun (matches local dev)
# ─────────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ─────────────────────────────────────────────────────────────
# 2. builder — compile the Next.js app
#
# NEXT_PUBLIC_* variables are compiled directly into the client
# JS bundle at BUILD time, so the real values must be passed as
# --build-arg (see README). The server-only vars just need to be
# non-empty here so Supabase/Resend clients don't throw while
# Next statically analyzes routes; the REAL server-only secrets
# are supplied at `docker run` time instead (see docker-compose.yml).
# ─────────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG SUPABASE_SERVICE_ROLE_KEY=build-time-placeholder
ARG RESEND_API_KEY=build-time-placeholder
ARG EMAIL_FROM=noreply@example.com

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
    RESEND_API_KEY=$RESEND_API_KEY \
    EMAIL_FROM=$EMAIL_FROM \
    NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# ─────────────────────────────────────────────────────────────
# 3. runner — production image that runs `next start`, exactly
# like your local `bun run start` — no standalone-mode surprises.
# ─────────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public          ./public
COPY --from=builder /app/.next           ./.next
COPY --from=builder /app/node_modules    ./node_modules
COPY --from=builder /app/package.json    ./package.json
COPY --from=builder /app/next.config.js  ./next.config.js

RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["bun", "run", "start"]
