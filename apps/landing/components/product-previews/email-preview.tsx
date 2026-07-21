import { Button } from '@jobos/ui';

export function EmailPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        Email Writer
      </div>
      <div className="space-y-3 p-4 text-xs">
        <p className="text-muted-foreground">To: recruiter@company.com</p>
        <p className="font-medium">Following up on Backend Engineer application</p>
        <p className="text-muted-foreground">
          Hi Sarah, I wanted to follow up on my application. I remain very interested in the
          role and would welcome the chance to discuss how my experience maps to your team.
        </p>
        <Button size="sm" className="h-7 text-xs">
          Send email
        </Button>
      </div>
    </div>
  );
}
