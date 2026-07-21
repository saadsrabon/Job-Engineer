# Job-Engineer

> JobOS — The Operating System for Your Career

Monorepo for JobOS SaaS platform.

## Stack

- **Monorepo**: Turborepo + pnpm
- **Web**: Next.js 15 (App Router)
- **API**: NestJS
- **Worker**: BullMQ + Redis
- **Database**: PostgreSQL + Prisma (Docker for local dev)
- **Auth**: Clerk
- **UI**: shadcn/ui + Tailwind

## Getting Started

### 1. Configure environment & start infrastructure

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine.

```bash
cp .env.example .env          # add Clerk keys if empty
pnpm env:setup                # syncs keys to apps/web & apps/landing
pnpm docker:up                # Postgres + Redis
pnpm install
pnpm db:push
pnpm db:seed                  # optional demo data
pnpm dev
```

## Docker commands

| Command | Description |
|---------|-------------|
| `pnpm docker:up` | Start Postgres + Redis |
| `pnpm docker:down` | Stop containers |
| `pnpm docker:reset` | Wipe volumes and restart (fresh DB) |
| `pnpm docker:logs` | Tail container logs |

## Apps

| App | Port | Description |
|-----|------|-------------|
| `@jobos/web` | 3000 | Main dashboard |
| `@jobos/api` | 3001 | REST API |
| `@jobos/landing` | 3002 | Marketing site |
| `@jobos/docs` | 3003 | Documentation |
| `@jobos/worker` | — | Background jobs |
| `@jobos/browser-extension` | — | Chrome extension (Phase 3) |

Run individual services:

```bash
pnpm dev:web
pnpm dev:api
pnpm dev:worker
pnpm dev:landing
```

## Production

For production, use managed Postgres (Neon, RDS, etc.) and Redis (Upstash, ElastiCache, etc.) by setting `DATABASE_URL` and `REDIS_URL` in your deployment environment. The Docker Compose file is intended for **local development only**.

## Packages

- `@jobos/ui` — Design system
- `@jobos/database` — Prisma client
- `@jobos/types` — Shared types
- `@jobos/shared` — API client, constants
- `@jobos/config` — ESLint/TS configs
- `@jobos/utils` — Pure helpers
- `@jobos/prompts` — AI prompts
- `@jobos/email` — Email templates
