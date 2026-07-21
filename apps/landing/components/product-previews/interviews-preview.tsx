import { Badge } from '@jobos/ui';

const QUESTIONS = [
  { company: 'bKash', q: 'Explain concurrency control in databases.', verified: true },
  { company: 'Chaldal', q: 'Reverse a linked list in O(n) time.', verified: true },
  { company: 'Brain Station 23', q: 'What is the time complexity of BST search?', verified: false },
];

export function InterviewsPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        Interview Prep — company questions
      </div>
      <div className="space-y-2 p-4">
        {QUESTIONS.map((item) => (
          <div key={item.q} className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[9px]">
                {item.company}
              </Badge>
              {item.verified && (
                <Badge className="text-[9px]">Verified</Badge>
              )}
            </div>
            <p className="mt-2 text-xs">{item.q}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
