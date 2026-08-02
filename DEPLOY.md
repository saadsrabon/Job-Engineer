# Deploy landing + web to Vercel

Frontend-only deployment from this Turborepo. The NestJS API and worker are deployed separately later.

## Overview

| Vercel project   | Root Directory | URL example                    |
| ---------------- | -------------- | ------------------------------ |
| `jobos-landing`  | `apps/landing` | `https://jobos-landing.vercel.app` |
| `jobos-web`      | `apps/web`     | `https://jobos-web.vercel.app`     |

Each app has a [`vercel.json`](apps/landing/vercel.json) with monorepo install/build commands. Enable **Include source files outside of the Root Directory** in each project’s Vercel settings.

## 1. Push to GitHub

Vercel deploys from Git. Push this repo to GitHub if it is not there already.

## 2. Landing project

1. [vercel.com/new](https://vercel.com/new) → Import the repo.
2. **Project name:** e.g. `jobos-landing`
3. **Framework:** Next.js
4. **Root Directory:** `apps/landing`
5. **Environment variables** (Production and Preview):

   | Name                                | Value                                      |
   | ----------------------------------- | ------------------------------------------ |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys                 |
   | `CLERK_SECRET_KEY`                  | Clerk Dashboard → API Keys                 |
   | `NEXT_PUBLIC_WEB_URL`               | Web Vercel URL (step 3); redeploy after    |

6. Deploy and copy the production URL.

## 3. Web project

1. Import the **same** repo again as a **new** project.
2. **Project name:** e.g. `jobos-web`
3. **Root Directory:** `apps/web`
4. **Environment variables** (Production and Preview):

   | Name                                  | Value                                      |
   | ------------------------------------- | ------------------------------------------ |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`   | Same Clerk application as landing          |
   | `CLERK_SECRET_KEY`                    | Same Clerk application as landing          |
   | `NEXT_PUBLIC_CLERK_SIGN_IN_URL`       | `/sign-in`                                 |
   | `NEXT_PUBLIC_CLERK_SIGN_UP_URL`       | `/sign-up`                                 |
   | `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard`                               |
   | `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/onboarding`                              |
   | `NEXT_PUBLIC_LANDING_URL`             | Landing production URL from step 2         |
   | `NEXT_PUBLIC_API_URL`                 | Placeholder until API is live (see below)  |

   For frontend-only testing, `NEXT_PUBLIC_API_URL` can stay unset or use a placeholder; dashboard API calls will fail until the API is deployed.

5. Deploy and copy the production URL.

6. In the **landing** project, set `NEXT_PUBLIC_WEB_URL` to the web production URL and **Redeploy**.

## 4. Clerk production domains

In [Clerk Dashboard](https://dashboard.clerk.com) → your application:

1. Add both production URLs under **Domains** / **Allowed origins** (exact hosts, including `https://`).
2. Sign-in and sign-up paths stay on the **web** app (`/sign-in`, `/sign-up` on the web Vercel URL).

## 5. Smoke test

1. Landing loads (marketing page, animations).
2. Sign in / Get Started → web app sign-in or sign-up (not `localhost`).
3. After auth → `/dashboard` or `/onboarding` on the web URL.
4. Visiting web `/` redirects to `NEXT_PUBLIC_LANDING_URL`.

## Later: API

When the API is hosted, set `NEXT_PUBLIC_API_URL` on the web project to the public API base URL, redeploy web, and configure API CORS with `NEXT_PUBLIC_WEB_URL` and `NEXT_PUBLIC_LANDING_URL`.
