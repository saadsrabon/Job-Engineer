import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">JobOS Documentation</h1>
      <p className="mt-4 text-muted-foreground">
        Architecture overview and API reference for JobOS — The Operating System for Your Career.
      </p>

      <nav className="mt-12 space-y-6">
        <section>
          <h2 className="text-xl font-semibold">Architecture</h2>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li>Monorepo: Turborepo + pnpm</li>
            <li>Web: Next.js 15 App Router</li>
            <li>API: NestJS modular architecture</li>
            <li>Worker: BullMQ + Redis</li>
            <li>Database: PostgreSQL + Prisma (Docker locally)</li>
            <li>Queue: Redis + BullMQ (Docker locally)</li>
            <li>Auth: Clerk</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">API Reference</h2>
          <p className="mt-2 text-muted-foreground">
            Full Swagger docs available at{' '}
            <Link href="http://localhost:3001/api/docs" className="text-primary hover:underline">
              http://localhost:3001/api/docs
            </Link>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Phase Roadmap</h2>
          <p className="mt-2 text-muted-foreground">
            Full product plan: see{' '}
            <Link href="https://github.com/saadsrabon/Job-Engineer/blob/main/ROADMAP.md" className="text-primary hover:underline">
              ROADMAP.md
            </Link>
          </p>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li>Phase 1: Foundation — Career Library, Resume Parser, Job CRM ✅</li>
            <li>
              Phase 2: Intelligence — AI agents, ATS, cover letters, email,{' '}
              <strong className="font-medium text-foreground">top company interview questions</strong>{' '}
              (from{' '}
              <Link
                href="https://github.com/saadsrabon/interview-questions-bangladesh"
                className="text-primary hover:underline"
              >
                Interview BD
              </Link>
              )
            </li>
            <li>Phase 3: Automation — Browser extension, analytics, interview workspace</li>
          </ul>
        </section>
      </nav>
    </div>
  );
}
