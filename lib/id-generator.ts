/**
 * Short Reference ID Generator
 * Produces human-friendly IDs like AE-2K7X9B4M
 * Uses 32 unambiguous characters (excludes 0/O, 1/I/L)
 */

// Unambiguous character set: A-Z + 2-9 minus O, I, L
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const ID_LENGTH = 8;
const PREFIX = "AE";

export function generateShortId(): string {
  const bytes = new Uint8Array(ID_LENGTH);
  crypto.getRandomValues(bytes);
  let id = "";
  for (let i = 0; i < ID_LENGTH; i++) {
    id += CHARS[bytes[i] % CHARS.length];
  }
  return `${PREFIX}-${id}`;
}
