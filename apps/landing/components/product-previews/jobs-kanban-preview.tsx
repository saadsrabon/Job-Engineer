import { Badge } from '@jobos/ui';

const DEMO_JOBS = [
  { title: 'Senior Engineer', company: 'Stripe', stage: 'Interview' },
  { title: 'Full Stack Dev', company: 'Linear', stage: 'Applied' },
  { title: 'Frontend Lead', company: 'Vercel', stage: 'Offer' },
];

const STAGES = ['Saved', 'Applied', 'Interview', 'Offer'];

export function JobsKanbanPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="flex h-9 items-center border-b border-border bg-muted/40 px-4 text-xs text-muted-foreground">
        Jobs — Kanban pipeline
      </div>
      <div className="overflow-hidden p-4">
        <div data-crm-track className="flex w-max gap-2 will-change-transform">
        {STAGES.map((stage) => (
          <div key={stage} className="w-40 shrink-0">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-medium">{stage}</span>
              <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                {DEMO_JOBS.filter((j) => j.stage === stage).length}
              </Badge>
            </div>
            <div className="min-h-[120px] space-y-2 rounded-lg border border-border bg-muted/20 p-2">
              {DEMO_JOBS.filter((j) => j.stage === stage).map((job) => (
                <div key={job.title} className="rounded-lg border border-border bg-card p-2 shadow-sm">
                  <p className="text-[11px] font-medium">{job.title}</p>
                  <p className="text-[10px] text-muted-foreground">{job.company}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
