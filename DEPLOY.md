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
5. **Environment variables** (Production **and** Preview — check both boxes when saving):

   | Name                                | Value                                      |
   | ----------------------------------- | ------------------------------------------ |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → **API Keys** → Publishable key (`pk_test_…` or `pk_live_…`) |
   | `CLERK_SECRET_KEY`                  | Clerk Dashboard → **API Keys** → Secret key (`sk_test_…` or `sk_live_…`) |
   | `NEXT_PUBLIC_WEB_URL`               | **Required for auth links.** Full web app URL, e.g. `https://job-engineer-web.vercel.app` (no trailing slash). Landing CTAs and Clerk redirects send users here for sign-in, sign-up, dashboard, and onboarding. Redeploy landing after web exists. |

   Copy the names **exactly** (including `NEXT_PUBLIC_`). Values must not be wrapped in quotes in the Vercel UI.

6. **Deploy**, then open the production URL.

7. If you add or change any variable later: **Deployments → ⋮ on latest → Redeploy**. Next.js bakes `NEXT_PUBLIC_*` into the build; saving env vars alone does not update a deployment that already built without them.

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
   | `NEXT_PUBLIC_API_URL`                 | Optional — defaults to same-origin `/jobos-api` in production |
   | `API_PROXY_TARGET`                    | `http://2.25.76.201:3011` (Vercel server-side proxy to VPS) |

   The web app proxies API calls through `/jobos-api` so HTTPS Vercel can reach the HTTP VPS backend. Do **not** set `NEXT_PUBLIC_API_URL` to `http://2.25.76.201:3011` (browsers block mixed content).

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

## Troubleshooting

### `Missing publishableKey` (runtime logs)

Clerk is not seeing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` on **job-engineer-landing** (or whichever landing project serves the URL in the log).

1. Vercel → **job-engineer-landing** project (not the web project) → **Settings → Environment Variables**.
2. Add or fix:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = your `pk_…` key from [Clerk API Keys](https://dashboard.clerk.com/last-active?path=api-keys)
   - `CLERK_SECRET_KEY` = your `sk_…` key (same Clerk application)
3. Enable for **Production** and **Preview**.
4. **Redeploy** (required). A deploy that ran before these vars existed will keep failing until you redeploy.

Common mistakes: vars only on the web project; typo (`CLERK_PUBLISHABLE_KEY` without `NEXT_PUBLIC_`); empty value; redeploy skipped after adding keys.

### `500` / `MIDDLEWARE_INVOCATION_FAILED`

Clerk middleware runs on every non-static request. This error almost always means middleware threw before your page rendered.

1. **Clerk env vars on Vercel** (both landing and web projects, **Production** and **Preview**):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — must start with `pk_`
   - `CLERK_SECRET_KEY` — must start with `sk_` (required for middleware; publishable key alone is not enough)
2. **Redeploy** after adding or changing env vars (Deployments → ⋮ → Redeploy).
3. **Clerk Dashboard** → your app → **Domains**: add each Vercel host (`https://….vercel.app`). Use **Production** keys from Clerk for production deployments, not Development-only keys if your instance requires it.
4. **Which project failed?** Open Vercel → Project → **Logs** / **Functions** and filter around the error ID. Landing only needs the three vars in step 2; web needs the full set from section 3 above.
5. After pushing middleware matcher fixes, trigger a new deploy from Git.

### pnpm “Ignored build scripts” warning

pnpm 10 does not run dependency `postinstall` scripts unless they are listed in `pnpm.onlyBuiltDependencies` (see root [`package.json`](package.json)). If Vercel logs show that warning, commit the repo’s `onlyBuiltDependencies` list and redeploy so **sharp** and **@clerk/shared** can install correctly.

If logs show `Clerk: auth() was called but Clerk can't detect usage of clerkMiddleware()`, a request hit a route the matcher skipped (often a bad static asset path). The updated matcher in `middleware.ts` reduces that case.
