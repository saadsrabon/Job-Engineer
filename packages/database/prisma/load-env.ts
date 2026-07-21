import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

const root = resolve(__dirname, '../../..');
const examplePath = resolve(root, '.env.example');
const envPath = resolve(root, '.env');
const localPath = resolve(root, '.env.local');

if (existsSync(envPath)) {
  config({ path: envPath });
} else if (existsSync(examplePath)) {
  config({ path: examplePath });
}

if (existsSync(localPath)) {
  config({ path: localPath, override: true });
}

if (!process.env.DATABASE_URL) {
  console.warn(
    'DATABASE_URL is not set. Copy .env.example to .env at the repo root, then run pnpm env:setup.',
  );
}
