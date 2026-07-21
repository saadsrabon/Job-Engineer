import { cn } from '@jobos/ui';

type SectionVariant = 'default' | 'glow' | 'muted' | 'contrast';

const variantClass: Record<SectionVariant, string> = {
  default: '',
  glow: 'landing-section-glow',
  muted: 'landing-section-muted',
  contrast: 'landing-section-contrast',
};

interface SectionShellProps {
  chapter: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
  variant?: SectionVariant;
  id?: string;
}

export function SectionShell({
  chapter,
  eyebrow,
  children,
  className,
  variant = 'default',
  id,
}: SectionShellProps) {
  return (
    <section id={id} className={cn('relative px-6 py-24', variantClass[variant], className)}>
      <div className="mx-auto max-w-6xl">
        <p className="landing-chapter text-xs font-medium uppercase text-muted-foreground">
          {chapter}
        </p>
        {eyebrow ? (
          <p className="mt-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
