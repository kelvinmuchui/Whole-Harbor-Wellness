# Whole Harbor Wellness — Security Architecture & Baseline
**Module 1 — System Analysis & Architecture**

---

## 1. Core Security Principles

Whole Harbor Wellness handles sensitive clinical peptide distribution, patient records, and partner financial transactions. Security is integrated at the architectural foundation, adhering to Defense-in-Depth principles.

---

## 2. Cryptographic Standards

### Password Storage
- **Algorithm:** PBKDF2 with HMAC-SHA256, 100,000 iterations, and a unique 128-bit cryptographically random salt per user.
- **Verification:** Verification uses constant-time byte comparison (`diff |= a ^ b`) to eliminate timing-attack side-channels.
- **Rules:** Plaintext passwords are never stored, logged, or exposed across any API response or telemetry stream.

### Session Management
- **Token Generation:** 192-bit cryptographically secure pseudorandom numbers generated via `crypto.getRandomValues`.
- **Transmission:** Transported via `HttpOnly`, `Secure`, and `SameSite=Lax` cookies to mitigate Cross-Site Scripting (XSS) token theft.
- **Expiration:** Configurable TTL with automatic rotation upon role elevation.

---

## 3. Defense Against Common Vulnerabilities

| Attack Vector | Defense Mechanism in Whole Harbor Architecture |
| :--- | :--- |
| **SQL Injection** | PostgreSQL queries use parameterized prepared statements via Prisma ORM. Raw string concatenation is strictly banned. |
| **Cross-Site Scripting (XSS)** | React automatic JSX escaping, `sanitizeString` utility, and Content Security Policy (CSP) headers. |
| **Cross-Site Request Forgery (CSRF)** | SameSite cookie policy, origin header validation, and dedicated anti-CSRF request tokens for state-altering actions. |
| **IDOR (Insecure Direct Object Reference)** | Ownership enforcement in `server/rbac.ts`: users can only query orders matching their UID; partners can only query orders attributed to their partner ID. |
| **Parameter Tampering** | Strict schema validation with Zod on all inbound payloads. Unrecognized keys are stripped. |
| **Timing Attacks** | Constant-time string comparison (`timingSafeEqual`) for all secret token and password comparisons. |

---

## 4. Immutable Audit Logging

All high-impact state transitions generate append-only audit records containing:
- Authenticated `userId` and `userRole`
- Action type (e.g., `PARTNER_APPROVED`, `ORDER_STATUS_CHANGED`, `EARNING_PAID`)
- Target resource name and primary key UUID
- Previous and new state metadata
- Client IP address and User-Agent
- UTC timestamp
