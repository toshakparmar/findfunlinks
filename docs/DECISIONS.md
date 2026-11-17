# Architecture & Engineering Decision Records (ADR)

## DEC-0001: Monorepo Architecture & Package Management

- **Status:** Accepted
- **Context:** FindFunLinks requires three frontend applications (`apps/web`, `apps/admin`, `apps/owner`) and a backend API (`apps/api`), sharing schemas, types, UI tokens, and an API client.
- **Decision:** Use **pnpm workspaces** with **Turborepo** for caching, orchestrating parallel builds, and sharing dependencies.
- **Consequences:** Isolated deployable applications with zero duplication of validation schemas, contracts, and design tokens.

## DEC-0002: Secure Credential Delivery via Expiring Invitation Tokens

- **Status:** Accepted
- **Context:** When a Super Admin approves a website owner registration, sending plaintext passwords via email presents a severe credential exposure vulnerability.
- **Decision:**
  1. Default: Generate a cryptographically secure, single-use, expiring (24-hour) "Set your password" token (`InviteToken`) sent to the applicant's verified email. First-time login forces the user to establish their own strong password (min 12 characters, Argon2id).
  2. Fallback: Configurable flag `ALLOW_TEMP_PASSWORD_EMAIL=false` (default off). If explicitly enabled for operational override, a randomized temporary password can be generated, requiring immediate mandatory password rotation on first authentication (`mustChangePassword: true`).
- **Consequences:** Mitigates email snooping and credential logging; aligns with OWASP ASVS Level 2 guidelines.

## DEC-0003: Relationship Constraints (One Owner = One Website)

- **Status:** Accepted
- **Context:** Business logic specifies that a verified owner account manages exactly one website entity.
- **Decision:** Enforce `ownerId` as a `UNIQUE` foreign key in the `Website` table at the database schema level (PostgreSQL) and enforce verification at the application service level. The Website Owner panel hides all "create new website" buttons, and the backend returns `409 Conflict` if an owner attempts to create a secondary website.
- **Consequences:** Eliminates multi-tenant sprawl per owner account and simplifies permission and scoping logic (`OwnerScopeGuard`).

## DEC-0004: Global Domain and Hostname Uniqueness

- **Status:** Accepted
- **Context:** Multiple websites may attempt to claim popular, vanity, or duplicate mirror domains (intentionally or maliciously).
- **Decision:** Every domain registered is parsed into its canonical, lowercase, punycode-normalized hostname. The database enforces a `UNIQUE` constraint on `hostname`.
- **Consequences:** No two websites can claim or hijack the same mirror domain.

## DEC-0005: Authentication, Session Management, and Storage

- **Status:** Accepted
- **Context:** Panel authentication must be hardened against XSS and CSRF token theft.
- **Decision:**
  - Password hashing with **Argon2id**.
  - Short-lived Access Tokens (JWT, 15m) + Rotating Refresh Tokens (7–30 days) stored hashed in PostgreSQL.
  - Cookies configured with `httpOnly: true`, `secure: true`, `SameSite: Lax` (or `Strict` for mutations), and isolated across subdomains. Tokens are never stored in client `localStorage`.
  - Refresh token reuse detection automatically revokes the entire compromised token family.
- **Consequences:** High security resilience against script injection and session hijacking.

## DEC-0006: Background Task Processing & SSRF-Protected Health Checking

- **Status:** Accepted
- **Context:** The system must check domain health and uptime without blocking user requests or exposing internal networks to SSRF attacks.
- **Decision:**
  - Utilize **Redis + BullMQ** for background queues (email dispatch, periodic domain health checks).
  - Implement SSRF-safe HTTP probes: resolve DNS, verify against private/link-local/loopback IP blocks (127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, ::1, fc00::/7), enforce 5-second timeouts, and limit redirects to 3.
- **Consequences:** Protects internal infrastructure from attacker-controlled domain scanning.

## DEC-0007: Original Design Identity & Token Derivation

- **Status:** Accepted
- **Context:** The brand logo is provided by the owner (blue magnifying glass with sun and flame mark, wordmark "FindFunLinks").
- **Decision:**
  - Primary Blue: `#0B57D9`
  - Accent Sunny Orange: `#F59E0B`
  - Hot Flame Accent: `#EA580C`
  - Derived neutral scales for light and dark modes with WCAG AA compliance.
  - Standardized Tailwind CSS preset and CSS variables in `packages/ui` and `@findfunlinks/config`.
- **Consequences:** Consistent, original, and accessible aesthetic across all apps.
