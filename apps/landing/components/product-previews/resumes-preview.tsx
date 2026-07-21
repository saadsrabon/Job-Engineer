import { Badge } from '@jobos/ui';
import { CheckCircle, FileText } from 'lucide-react';

export function ResumesPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        Resumes — parse & export
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium">resume.pdf</p>
              <p className="text-[10px] text-muted-foreground">Parsed 2 min ago</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3.5 w-3.5" />
            <Badge variant="outline" className="text-[9px]">
              Completed
            </Badge>
          </div>
        </div>
        <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 text-center">
          <p className="text-xs font-medium text-primary">Career Library updated</p>
          <p className="text-[10px] text-muted-foreground">8 experiences · 24 skills imported</p>
        </div>
      </div>
    </div>
  );
}
