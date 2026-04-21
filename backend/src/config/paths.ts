import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Repository root (parent of backend/). */
export const REPO_ROOT = path.resolve(__dirname, '../..');

/**
 * Directory for JSON data files (users.json, missions.json, etc.).
 * Override with DATA_DIR: absolute path, or relative to repo root (e.g. `data` or `data-dev`).
 */
export function getDataDir(): string {
  const env = process.env.DATA_DIR?.trim();
  if (env) {
    return path.isAbsolute(env) ? env : path.join(REPO_ROOT, env);
  }
  return path.join(REPO_ROOT, 'data');
}
