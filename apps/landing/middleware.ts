import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

/** Clerk-recommended matcher: skip static files to avoid auth errors on missing assets. */
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
