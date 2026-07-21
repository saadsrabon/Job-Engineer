import { cn } from '@jobos/ui';

interface FeatureScreenshotProps {
  src: string;
  alt: string;
  className?: string;
}

export function FeatureScreenshot({ src, alt, className }: FeatureScreenshotProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn('h-auto w-full', className)}
    />
  );
}
