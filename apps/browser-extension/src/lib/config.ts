export const CONFIG = {
  clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string,
  syncHost: (import.meta.env.VITE_CLERK_SYNC_HOST as string) || 'http://localhost:3000',
  apiUrl: (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001',
};

export function assertConfig() {
  if (!CONFIG.clerkPublishableKey) {
    throw new Error(
      'Missing VITE_CLERK_PUBLISHABLE_KEY. Run pnpm env:setup and rebuild the extension.',
    );
  }
}
