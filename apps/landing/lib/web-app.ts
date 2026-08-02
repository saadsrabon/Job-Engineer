/** Web dashboard origin — set NEXT_PUBLIC_WEB_URL on Vercel (landing project). */
export const webAppUrl =
  process.env.NEXT_PUBLIC_WEB_URL?.replace(/\/$/, '') || 'http://localhost:3000';

export const webAppPaths = {
  signIn: `${webAppUrl}/sign-in`,
  signUp: `${webAppUrl}/sign-up`,
  dashboard: `${webAppUrl}/dashboard`,
  onboarding: `${webAppUrl}/onboarding`,
} as const;
