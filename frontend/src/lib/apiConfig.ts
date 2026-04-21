/**
 * API base for axios/fetch paths like `/admin/...`, `/public/...`.
 * - Set `VITE_API_URL` when the API is on another host.
 * - Otherwise production uses same-origin `/api` (reverse proxy → Node).
 */
function trimTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (raw !== undefined && String(raw).trim() !== '') {
    return trimTrailingSlashes(String(raw));
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:5001/api';
  }
  return '/api';
}

/** Origin for `/uploads/...` served by the backend; empty = same origin as the SPA. */
export function getBackendOrigin(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (raw !== undefined && String(raw).trim() !== '') {
    return trimTrailingSlashes(String(raw)).replace(/\/api\/?$/, '');
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:5001';
  }
  return '';
}
