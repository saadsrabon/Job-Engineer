# Job-Engineer

> JobOS — The Operating System for Your Career

Monorepo for JobOS SaaS platform.

## Stack

- **Monorepo**: Turborepo + pnpm
- **Web**: Next.js 15 (App Router)
- **API**: NestJS
- **Worker**: BullMQ + Redis
- **Database**: Neon Postgres + Prisma
- **Auth**: Clerk
- **UI**: shadcn/ui + Tailwind

## Getting Started

```bash
pnpm install
cp .env.example .env
# Fill in Clerk, Neon, Redis credentials

pnpm db:push
pnpm dev
```

## Apps

| App | Port | Description |
|-----|------|-------------|
| `@jobos/web` | 3000 | Main dashboard |
| `@jobos/api` | 3001 | REST API |
| `@jobos/landing` | 3002 | Marketing site |
| `@jobos/docs` | 3003 | Documentation |
| `@jobos/worker` | — | Background jobs |
| `@jobos/browser-extension` | — | Chrome extension (Phase 3) |

## Packages

- `@jobos/ui` — Design system
- `@jobos/database` — Prisma client
- `@jobos/types` — Shared types
- `@jobos/shared` — API client, constants
- `@jobos/config` — ESLint/TS configs
- `@jobos/utils` — Pure helpers
- `@jobos/prompts` — AI prompts
- `@jobos/email` — Email templates
