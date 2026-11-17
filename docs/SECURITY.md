# FindFunLinks — Security & Threat Modeling (STRIDE & ASVS L2)

## 1. Overview & Threat Model (STRIDE-lite)

| Threat Category            | Potential Attack Vector                                             | Countermeasure in FindFunLinks                                                                                                           |
| -------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Spoofing**               | Credential guessing, session replay, email spoofing                 | Argon2id, strict lockout (progressive delay), rotating refresh tokens with family revocation, SPF/DKIM/DMARC alignment.                  |
| **Tampering**              | Parameter tampering, IDOR on websites/domains, request modification | `OwnerScopeGuard` verifying owner relationship in DB, strict DTO whitelisting (`forbidNonWhitelisted: true`), HMAC/signed cookies.       |
| **Repudiation**            | Denying an administrative action (e.g. domain blocking or approval) | Append-only `AuditLog` table capturing actor, action, timestamp, IP, and state diffs.                                                    |
| **Information Disclosure** | Stack trace leakage, user enumeration, database credentials leakage | Global NestJS Exception Filter stripping traces, constant-time comparison in auth, zero credentials in client bundles, httpOnly cookies. |
| **Denial of Service**      | Volumetric HTTP floods, login brute forcing, registration spam      | Redis-backed `@nestjs/throttler` (tiered rate limits per route/IP/account), Nginx connection/rate caps, Turnstile CAPTCHA on forms.      |
| **Elevation of Privilege** | Normal owner attempting to execute Super Admin endpoints            | Strict `@Permissions` decorators evaluated by `PermissionsGuard` in NestJS; frontend hides UI, but backend is the sole authority.        |

---

## 2. OWASP Top 10 & ASVS Level 2 Verification Checklist

- [x] **A01: Broken Access Control:** Enforce role and ownership guards on all `/admin/*` and `/owner/*` routes. Enforce one-website-per-owner constraint.
- [x] **A02: Cryptographic Failures:** Argon2id for password hashes; SHA-256 for refresh tokens and invite tokens; TLS 1.3 in reverse proxy.
- [x] **A03: Injection:** Prisma parameterized queries (zero raw unsanitized SQL); strict URL validation; DOMPurify sanitization for markdown/HTML.
- [x] **A04: Insecure Design:** 24h expiring invite links for password setup; rate limiting at edge and application layers; SSRF-safe outbound health checks.
- [x] **A05: Security Misconfiguration:** Helmet headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors none for panels); strict CORS per origin.
- [x] **A06: Vulnerable and Outdated Components:** CI pipeline checks (`pnpm audit`), pinned direct dependencies.
- [x] **A07: Identification and Authentication Failures:** Generic auth failure messages; progressive lockout; 2FA (TOTP) support; session revocation.
- [x] **A08: Software and Data Integrity Failures:** Commitlint, signed commits, strict dependency lockfiles, Zod contract runtime checks.
- [x] **A09: Security Logging and Monitoring Failures:** Structured logging via `nestjs-pino` with automatic redaction of cookies, auth headers, and tokens.
- [x] **A10: Server-Side Request Forgery (SSRF):** DNS-resolved outbound validation preventing requests to internal IPs (`10.0.0.0/8`, `127.0.0.0/8`, `192.168.0.0/16`, `169.254.169.254`, etc.).
