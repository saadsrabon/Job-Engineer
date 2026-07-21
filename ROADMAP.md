# JobOS Product Roadmap

Living plan for JobOS — The Operating System for Your Career.

---

## Phase 1 — Foundation ✅ Complete

| Area | Status |
|------|--------|
| Monorepo + Docker (Postgres, Redis) | Done |
| Clerk auth (web + landing) | Done |
| Career Library (8 entity types, full CRUD) | Done |
| Resume upload → BullMQ → OpenRouter parse | Done |
| Job CRM (13-stage kanban, notes, tags, stage history) | Done |
| Dashboard (stats + activity feed) | Done |
| Onboarding gate | Done |
| Design system (`@jobos/ui`) | Done |
| Landing GSAP (sections 1–2) | Done |

---

## Phase 2 — Intelligence ✅ Complete

Focus: AI agents, resume intelligence, email, and **company interview prep**.

### Shipped

| Feature | Status |
|---------|--------|
| Resume PDF export (Career Library → PDFKit) | Done |
| ATS scoring agent | Done |
| Cover letter agent | Done |
| Job analyzer agent | Done (API + job detail UI) |
| Interview Coach agent | Done |
| Interview BD sync + DB schema + commit SHA tracking | Done |
| Interviews API (companies, search, topics, progress, sync-meta) | Done |
| `/dashboard/interviews` UI (browse, topics, progress stats) | Done |
| Job detail: ATS + analyze + cover letter + company questions | Done |
| `/dashboard/email` + email writer agent | Done |
| Landing: AI, email, interview workspace sections + screenshots | Done |

### Interview Prep — Top Company Questions

**Primary data source:** [interview-questions-bangladesh](https://github.com/saadsrabon/interview-questions-bangladesh) (Interview BD)

Crowd-sourced interview questions from Bangladeshi tech companies — maintained by you, forked from the original community project.

| Stat | Value |
|------|-------|
| Companies | 25+ (bkash, pathao, chaldal, brainstation-23, enosis, etc.) |
| Questions | 425+ |
| Verified solutions | 150+ |
| Format | VitePress markdown in `docs/companies/*.md` |
| Topics | Also in `docs/notes/`, `docs/resource/` |
| License | GPL-3.0 — attribution required |

**Live reference site:** [Interview BD](https://tamimehsan.github.io/interview-questions-bangladesh)

#### Integration plan

```
interview-questions-bangladesh (GitHub)
        │
        ▼  sync script / git submodule
packages/interview-data/          ← parsed markdown → JSON
        │
        ▼  seed / incremental import
PostgreSQL
  InterviewCompany   (slug, name, stages, topics)
  InterviewQuestion  (companyId, question, answer, tags, difficulty)
  InterviewTopic     (general CS, OOP, system design, etc.)
        │
        ▼
apps/api/modules/interviews/      ← REST API (replace stub)
apps/web/dashboard/interviews/    ← browse + practice UI
apps/web/dashboard/jobs/[id]/     ← "Company Questions" panel (auto-match company name)
        │
        ▼
AI Interview Coach agent            ← RAG over questions + user's career library
```

#### Implementation steps (Phase 2)

1. **Data pipeline**
   - Add `scripts/sync-interview-data.mjs` — pull from `saadsrabon/interview-questions-bangladesh`
   - Parse frontmatter + `## Questions` blocks into structured records
   - Extract: question text, optional answer, code snippets, external links (LeetCode), topics

2. **Database schema** (`packages/database`)
   - `InterviewCompany` — slug, display name, interview stages, tech stack
   - `InterviewQuestion` — question, answer (markdown), sourceUrl, verified flag
   - `InterviewQuestionTopic` — many-to-many tags (algorithms, OOP, system-design, …)
   - `UserQuestionProgress` — saved, practiced, confidence score (per user)

3. **API** (`apps/api/src/modules/interviews/`)
   - `GET /interviews/companies` — list all companies
   - `GET /interviews/companies/:slug/questions` — company question bank
   - `GET /interviews/questions/search?q=` — full-text search
   - `GET /interviews/jobs/:jobId/suggested` — match job.company → company slug
   - `POST /interviews/practice/:questionId` — log practice session

4. **Dashboard UI**
   - `/dashboard/interviews` — browse by company or topic
   - Job detail sidebar — "Questions for {company}" when match found
   - Practice mode — reveal answer, mark as studied
   - Link back to source repo for community updates

5. **Company name matching**
   - Fuzzy match `Job.company` → `InterviewCompany.slug`
   - Alias map: `"Brain Station 23"` → `bs23`, `"bKash"` → `bkash`, etc.
   - Fallback to general questions (`docs/companies/general.md`)

6. **AI Interview Coach** (`interview-coach` agent)
   - Context: matched company questions + user's experience/skills from Career Library
   - Generate personalized answer drafts for behavioral + technical questions
   - Mock interview mode (Phase 3 extension)

7. **License compliance**
   - Attribute Interview BD in UI footer and `packages/interview-data/README.md`
   - Keep imported content in a clearly separated package
   - Honor GPL-3.0 if distributing derived question content

#### Sync cadence

- Run `pnpm interview:sync` on deploy or weekly cron
- Track last-synced commit SHA in DB to detect upstream changes
- Your fork can accept community PRs independently of JobOS releases

---

## Phase 3 — Automation ✅ MVP Complete

| Feature | Module | Status |
|---------|--------|--------|
| Browser extension job capture | `browser-extension` | Done |
| Interview workspace (rounds, prep notes) | `interviews` | Done |
| Analytics dashboard | `analytics` | Done |
| Workflow reminders | `automation` | Done (`/dashboard/reminders`, delete) |
| Mock interview mode | `interviews` | Done (5-question session on `/dashboard/interviews`) |
| Admin overview | `admin` | Done (`/dashboard/admin`, `ADMIN_EMAILS` guard) |
| Landing extension + analytics screenshots | `landing` | Done |
| Job discovery scraper | `automation` | Planned |
| Reminder notifications worker | `automation` | Planned |
| Extension Clerk OAuth | `browser-extension` | Planned |
| Job attachments API/UI | `jobs` | Planned |
| AI generation history UI | `ai` | Planned |
| Resume version restore UI | `resume` | Planned |

### Interview workspace (shipped)

- Schedule interview rounds linked to CRM jobs
- Prep notes per round
- Mark rounds complete + status tracking
- Company question bank + progress stats (Phase 2 foundation)

### Landing sections (Phase 2 + 3 features)

Screenshots in `apps/landing/public/landing/features/`:

- `ai-intelligence.svg` — ATS, job analysis, cover letter
- `email-writer.svg` — recruiter follow-ups
- `analytics-dashboard.svg` — funnel metrics
- `browser-extension.svg` — one-click job capture
- `interview-workspace.svg` — interview rounds timeline

---

## External Resources

| Resource | URL | Used for |
|----------|-----|----------|
| Interview BD (your fork) | https://github.com/saadsrabon/interview-questions-bangladesh | Top company interview questions |
| Interview BD (live site) | https://tamimehsan.github.io/interview-questions-bangladesh | Reference UX + content preview |
| Original upstream | https://github.com/TamimEhsan/interview-questions-bangladesh | Community contributions |

---

## Suggested build order (Phase 2)

```
Week 1
├── Resume PDF export
├── ATS scoring agent
└── interview-data sync script + schema

Week 2
├── Interviews API + seed from Interview BD
├── /dashboard/interviews browse UI
└── Job detail "Company Questions" panel

Week 3
├── Cover letter + job analyzer agents
├── Interview Coach AI (RAG)
└── Landing GSAP sections 3–7 (Stryds + Opacity patterns)

Week 4
├── Email module MVP
└── Polish + tests
```

---

## Landing Page Animation System (GSAP)

Visual references: [Stryds](https://www.stryds.com/) (bold split narrative, minimal close) and [Opacity](https://opacity.com/) (scroll-pinned canvas, timeline flows, counters, convergence moments).

All animations live in `apps/landing/components/` with shared helpers in `apps/landing/lib/motion.ts`. Every section respects `prefers-reduced-motion`.

| # | Section | Story beat | Reference | GSAP technique | Component |
|---|---------|------------|-----------|----------------|-----------|
| 0 | Hero | Hook | Stryds | SplitType char stagger + translate | `app/page.tsx` |
| 1–2 | Convergence | Chaos → unified dashboard | Opacity pin + Stryds contrast | Pinned scrub: tab scatter morphs into nav targets, clip-path dashboard reveal | `convergence-section.tsx` |
| 3 | Resume | AI pipeline | Opacity install flow | SplitType headline + step stagger + preview | `resume-pipeline-section.tsx` |
| 4 | AI | Job intelligence | Stryds contrast | SplitType + `AiIntelligencePreview` + screenshot | `ai-intelligence-section.tsx` |
| 5 | CRM | Pipeline motion | Opacity canvas cards | SplitType headline + pinned horizontal scrub + `JobsKanbanPreview` | `crm-kanban-section.tsx` |
| 6 | Interview | Prep workspace | Stryds social rhythm | SplitType headline + Q-card reveal + workspace screenshot | `interview-section.tsx` |
| 7 | Email | Outreach | Stryds minimal | SplitType + `EmailPreview` + screenshot | `email-section.tsx` |
| 8 | Analytics | Metrics | Opacity counters | SplitType headline + counters + funnel screenshot | `analytics-section.tsx` |
| 9 | Extension | Capture | Product shot | SplitType + browser extension screenshot | `extension-section.tsx` |
| 10 | Offer | Close | Stryds minimal | SplitType headline + simple fade stagger | `offer-section.tsx` |

Product UI blocks use live `@jobos/ui` previews in `components/product-previews/` plus SVG screenshots in `public/landing/features/`.

### Principles (from `.cursor/rules/animations.mdc`)

- Allowed: opacity, translate, scale, clip-path, scroll pin, stagger, SVG line draw, counters
- Avoid: bounce, spin, excessive parallax, neon/glass effects
- Feel: Apple / Linear / Stripe — not template #458

---

## Out of scope (for now)

- Clerk webhook local testing (needs ngrok + `CLERK_WEBHOOK_SECRET`)
- Production Neon/Upstash migration (Docker is local-dev only)
- Mobile apps
