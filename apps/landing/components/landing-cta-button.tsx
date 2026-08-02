'use client';

import { buttonVariants, cn, type ButtonProps } from '@jobos/ui';
import { webAppPaths } from '@/lib/web-app';

type LandingCtaButtonProps = ButtonProps & {
  /** Sends users to the web app sign-up flow. */
  href?: string;
};

export function LandingCtaButton({
  className,
  size = 'lg',
  href = webAppPaths.signUp,
  children,
  ...props
}: LandingCtaButtonProps) {
  const classes = cn(
    buttonVariants({ size }),
    'landing-cta inline-flex items-center justify-center rounded-full border-0 shadow-none no-underline',
    className,
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
