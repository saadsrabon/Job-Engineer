import { existsSync } from 'fs';
import { isAbsolute, resolve } from 'path';

/** Walk up from cwd until monorepo root (turbo.json or pnpm-workspace.yaml). */
export function findMonorepoRoot(): string {
  let dir = process.cwd();
  while (dir !== resolve(dir, '..')) {
    if (
      existsSync(resolve(dir, 'turbo.json')) ||
      existsSync(resolve(dir, 'pnpm-workspace.yaml'))
    ) {
      return dir;
    }
    dir = resolve(dir, '..');
  }
  return process.cwd();
}

/** Resolve UPLOAD_DIR (or similar) to an absolute path anchored at monorepo root. */
export function resolveStorageDir(envKey: string, defaultRelative: string): string {
  const raw = process.env[envKey] || defaultRelative;
  if (isAbsolute(raw)) return raw;
  return resolve(findMonorepoRoot(), raw);
}

/**
 * Resolve a stored upload path to an absolute file path.
 * Handles legacy relative paths written when API cwd was apps/api.
 */
export function resolveUploadFilePath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');

  if (isAbsolute(normalized)) {
    if (existsSync(normalized)) return normalized;
    throw new Error(`Upload file not found: ${filePath}`);
  }

  const root = findMonorepoRoot();
  const candidates = [
    resolve(root, normalized),
    resolve(root, 'apps/api', normalized),
    resolve(process.cwd(), normalized),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error(`Upload file not found: ${filePath}`);
}
