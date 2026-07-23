import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { findMonorepoRoot } from '@jobos/shared/paths';

function loadEnvFile(path: string, override = false) {
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (override || !process.env[key]) {
      process.env[key] = value;
    }
  }
}

const rootFromFile = resolve(__dirname, '../../..');
const rootFromCwd = findMonorepoRoot();
const root = existsSync(join(rootFromFile, '.env')) ? rootFromFile : rootFromCwd;

loadEnvFile(join(root, '.env'));
loadEnvFile(join(root, '.env.local'), true);
