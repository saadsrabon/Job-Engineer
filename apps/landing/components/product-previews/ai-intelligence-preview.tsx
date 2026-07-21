import { Badge } from '@jobos/ui';

export function AiIntelligencePreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        Job detail — AI Intelligence
      </div>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge>ATS 82/100</Badge>
          <Badge variant="outline">Senior Backend</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Strong match on Node.js and PostgreSQL. Consider highlighting distributed systems
          experience.
        </p>
        <div className="rounded-lg border border-border p-3 text-xs">
          Dear hiring team, I am excited to apply for the Backend Engineer role...
        </div>
      </div>
    </div>
  );
}
