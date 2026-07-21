import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rootEnvPath = resolve(root, '.env');

if (!existsSync(rootEnvPath)) {
  console.error('Missing root .env — copy .env.example to .env and fill in Clerk keys first.');
  process.exit(1);
}

const env = readFileSync(rootEnvPath, 'utf8');
const get = (key) => env.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.trim() ?? '';

const clerkKeys = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
];

const webEnv = [
  '# Auto-generated from root .env — run: pnpm env:setup',
  ...clerkKeys.map((k) => `${k}=${get(k)}`),
  '',
  `NEXT_PUBLIC_API_URL=${get('NEXT_PUBLIC_API_URL') || 'http://localhost:3001'}`,
  '',
].join('\n');

const landingEnv = [
  '# Auto-generated from root .env — run: pnpm env:setup',
  ...clerkKeys.map((k) => {
    if (k === 'NEXT_PUBLIC_CLERK_SIGN_IN_URL') {
      return `${k}=http://localhost:3000/sign-in`;
    }
    if (k === 'NEXT_PUBLIC_CLERK_SIGN_UP_URL') {
      return `${k}=http://localhost:3000/sign-up`;
    }
    if (k === 'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL') {
      return `${k}=http://localhost:3000/dashboard`;
    }
    if (k === 'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL') {
      return `${k}=http://localhost:3000/onboarding`;
    }
    return `${k}=${get(k)}`;
  }),
  '',
].join('\n');

writeFileSync(resolve(root, 'apps/web/.env.local'), webEnv);
writeFileSync(resolve(root, 'apps/landing/.env.local'), landingEnv);

console.log('Synced apps/web/.env.local and apps/landing/.env.local from root .env');
