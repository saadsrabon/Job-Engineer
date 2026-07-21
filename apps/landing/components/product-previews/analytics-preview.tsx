import { Badge } from '@jobos/ui';
import { FeatureScreenshot } from '@/components/feature-screenshot';

const METRICS = [
  { label: 'Response rate', value: 34, suffix: '%' },
  { label: 'Interviews', value: 12, suffix: '' },
  { label: 'Offers', value: 3, suffix: '' },
];

export function AnalyticsPreview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {METRICS.map((m) => (
          <div key={m.label} className="story-vertical-card p-4 text-center sm:p-6">
            <p
              data-count={m.value}
              data-suffix={m.suffix}
              className="text-3xl font-semibold tabular-nums landing-accent-text sm:text-4xl"
            >
              0{m.suffix}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <FeatureScreenshot
          src="/landing/features/analytics-dashboard.svg"
          alt="JobOS analytics dashboard screenshot"
        />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Badge variant="outline">Pipeline funnel</Badge>
        <Badge variant="outline">Weekly activity</Badge>
        <Badge variant="outline">Conversion rates</Badge>
      </div>
    </div>
  );
}
