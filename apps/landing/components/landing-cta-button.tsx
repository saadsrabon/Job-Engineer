'use client';

import { buttonVariants, cn, type ButtonProps } from '@jobos/ui';

export function LandingCtaButton({ className, size = 'lg', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        buttonVariants({ size }),
        'landing-cta rounded-full border-0 shadow-none',
        className,
      )}
      {...props}
    />
  );
}
