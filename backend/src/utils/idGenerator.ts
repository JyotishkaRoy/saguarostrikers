import crypto from 'crypto';

/**
 * Generate a 12-digit alphanumeric ID
 * Format: [A-Za-z0-9]{12}
 * Examples: "aB3x9Km2Pq7w", "Zx4K8mN1vR2y"
 */
export function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const randomBytes = crypto.randomBytes(12);
  
  for (let i = 0; i < 12; i++) {
    id += chars[randomBytes[i] % chars.length];
  }
  
  return id;
}

/**
 * Validate if a string is a valid 12-digit alphanumeric ID
 */
export function isValidId(id: string): boolean {
  return /^[A-Za-z0-9]{12}$/.test(id);
}

/**
 * Generate multiple unique IDs
 */
export function generateIds(count: number): string[] {
  const ids = new Set<string>();
  
  while (ids.size < count) {
    ids.add(generateId());
  }
  
  return Array.from(ids);
}
