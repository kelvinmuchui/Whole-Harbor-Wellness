/**
 * WHOLE HARBOR WELLNESS — SECURITY ENGINE
 * Server-side cryptographic operations, password hashing, and token verification
 */

/**
 * Generates a cryptographically secure random salt hex string
 */
export function generateSalt(length = 16): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hashes a plaintext password using PBKDF2 with SHA-256 and unique salt
 * Complies with OWASP password storage guidelines
 */
export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const activeSalt = salt || generateSalt(16);
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(activeSalt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return {
    hash: hashHex,
    salt: activeSalt
  };
}

/**
 * Verifies a candidate password against an existing hash and salt in constant time
 */
export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  const { hash: computedHash } = await hashPassword(password, salt);
  return timingSafeEqual(computedHash, storedHash);
}

/**
 * Constant-time string comparison to prevent side-channel timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Generates an opaque, high-entropy session or referral token
 */
export function generateSecureToken(prefix = 'wh_tok_'): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const randomStr = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}${randomStr}`;
}

/**
 * Sanitizes input to prevent stored XSS and injection
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim();
}
