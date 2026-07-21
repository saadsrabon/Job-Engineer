interface SectionEyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionEyebrow({ children, className = '' }: SectionEyebrowProps) {
  return (
    <p
      data-cinematic-fade
      className={`text-sm font-medium uppercase tracking-widest text-muted-foreground ${className}`.trim()}
    >
      {children}
    </p>
  );
}
