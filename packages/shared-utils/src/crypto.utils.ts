/**
 * Crypto Utilities
 * ID generation and simple hashing.
 */

/** Generate a UUID v4 */
export function generateId(): string {
  return crypto.randomUUID();
}

/** Generate a short ID (8 chars) for display purposes */
export function generateShortId(): string {
  return crypto.randomUUID().split('-')[0]!;
}
