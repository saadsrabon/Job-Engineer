const SECTIONS = [
  { title: 'Resume Intelligence', desc: 'AI analyzes your resume and builds your Career Library.' },
  { title: 'Job CRM', desc: 'Kanban pipeline from Saved to Offer.' },
  { title: 'Interview Prep', desc: 'Questions, answers, and notes in one workspace.' },
  { title: 'Analytics', desc: 'Track response rates and interview conversion.' },
  { title: 'Offer Accepted', desc: 'Simple. Minimal. Done.' },
];

export function PlaceholderSections() {
  return (
    <div className="space-y-24 px-6 py-24">
      {SECTIONS.map((s) => (
        <section
          key={s.title}
          data-animate
          className="mx-auto max-w-2xl rounded-xl border border-dashed border-border p-12 text-center"
        >
          <h3 className="text-xl font-semibold">{s.title}</h3>
          <p className="mt-2 text-muted-foreground">{s.desc}</p>
          <p className="mt-4 text-xs text-muted-foreground">Animated in Phase 2</p>
        </section>
      ))}
    </div>
  );
}
