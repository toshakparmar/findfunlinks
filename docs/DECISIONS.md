# FinalLinks — Architectural & Design Decisions Log

This log records the operating decisions, assumptions, and design rationale as specified in Section 14 of the Client Design Implementation Master Prompt.

---

## Decision Log

### 1. Typography & Font Selection

- **Status:** Adopted
- **Decision:** Use **Poppins** (headings, logo wordmark, card titles, nav pills) and **Inter** (list items, site names, body, numbers) via Next.js Font (`display: swap`).
- **Rationale:** Poppins provides the clean, geometric punch seen in the client reference titles ("OTT Platforms", "Movies"), while Inter offers optimal tabular alignment and legibility for the 15 numbered rows.

### 2. Measured Color Sampling & Exact Values

- **Status:** Measured & Adopted
- **Decision:** Sampled pixel values directly from `docs/design-reference/desktop-home.jpg` and `mobile-home.jpg` using .NET bitmap analysis.
- **Reference Values:**
  - Page Background: `#050A18`
  - Header & Sidebar Background: `#070D1E`
  - Card Fill: `#0A1226`
  - Card Hover: `#0E182F`
  - Neutral Line: `#1A2442`
  - Active Blue Pill: `#2563EB`
  - Wordmark Link: `#3B82F6`

### 3. Theme Toggle Placement

- **Status:** Adopted (Feature Flagged)
- **Decision:**
  - On desktop: Small circular icon button positioned adjacent to the search button in the top header.
  - On mobile: Placed inside the hamburger drawer menu.
  - Controlled by feature flag `theme.toggle.enabled` so it can be concealed if the client prefers dark-only deployment.

### 4. Site Row Interaction & Multi-Domain Model

- **Status:** Adopted
- **Decision:**
  - **External Link Icon Click:** Directly opens the site's fastest verified active domain in a new tab (`rel="noopener noreferrer nofollow"`) with async click telemetry (`navigator.sendBeacon`).
  - **Row Name / Item Click:** Opens the **Site Domains Drawer** (desktop side sheet / mobile bottom sheet) revealing all active mirrors, latency metrics, and copy/report tools.
- **Rationale:** Keeps the client's visual design 100% pixel-identical (displaying only number, favicon, name, and external icon) while preserving the platform's multi-mirror business rules.

### 5. Requests Page Architecture (`/requests`)

- **Status:** Adopted
- **Decision:** The `/requests` route hosts two structured tabs:
  1. **"Register Website (Owner)"** — End-to-end applicant verification flow.
  2. **"Suggest a Site (Public)"** — Lightweight visitor suggestion with URL, category, and CAPTCHA/honeypot moderation queue.

### 6. Responsive Breakpoint Rhythm

- **Status:** Adopted
- **Decision:**
  - `< 768px`: Single column card stack with 2-column numbered list (8 left, 7 right), mobile horizontal chips rail, fixed bottom navigation.
  - `768px – 1023px`: 2-column card grid with mobile chrome.
  - `1024px – 1919px`: 2-column card grid with desktop left sidebar and top navigation pills.
  - `≥ 1920px`: 3-column expanded grid rhythm.

### 7. Sidebar Category Pinning

- **Status:** Adopted
- **Decision:** The left sidebar displays only pinned primary categories (`showInSidebar: true`), while the full directory of 18+ categories is reachable at `/categories` and through the home grid.

---

## Iteration 2: Root Cause Analysis for Navigation & State Bugs

### Bug b — "View More → →" Duplicated Arrow & Click Response

- **Root Cause:** In `CategoryCard.tsx`, the prop `label="View More →"` contained a literal text arrow while `ViewMoreButton.tsx` simultaneously appended a Lucide `<ArrowRight />` icon, printing two arrows (`View More → →`). In addition, the button lacked an immediate transition/spinner feedback state, and the destination page `/category/[slug]` was an outdated legacy component without the client design language.
- **Fix:** Remove the literal arrow from `label`, maintain a single Lucide `ArrowRight` icon with hover sweep, and add an inline loading spinner during route transition.

### Bug c — Sidebar Selection Trapped in Local State (Half-Width Card, URL Stays `/`)

- **Root Cause:** In `MainLayout.tsx` and `Sidebar.tsx`, category clicks were intercepted with `onClick={() => setSelectedCategory(slug)}` instead of standard Next.js `<Link href="/category/[slug]">`. This kept the URL at `/` while client state filtered the homepage's 2-column grid to only 1 category, leaving the right half of the grid empty.
- **Fix:** Eliminate local/context `selectedCategory` state. The URL is the single source of truth. Sidebar items and mobile chips are `<Link href="/category/[slug]">` and "All Links" is `<Link href="/">`. Navigating to `/category/[slug]` renders a dedicated full-width category view with 3 columns of sites on desktop.

### Bug e — Home / All Links Fails to Restore Grid

- **Root Cause:** Because the user was already at path `/` when filtering categories via client state, clicking `<Link href="/">` (Home or All Links) was a no-op in Next.js router. Because state was decoupled from the URL, `selectedCategory` was never reset.
- **Fix:** Deriving active navigation state purely from `usePathname()` via `getActive(pathname)` guarantees that `/` always renders the complete 18-category grid, and Back/Forward navigation functions naturally.

---

## Iteration 2: Phase 2 Architecture Decisions

### 8. Header Tab /new (Hot/New) Label & Alias

- **Status:** Adopted
- **Decision:** Keep the header nav label as 'New' (constant `NAV_NEW_LABEL = 'New'`) matching the approved design layout, with a permanent 301 redirect from `/hot` to `/new` in `next.config.mjs`.
- **Rationale:** Preserves pixel-exact fidelity with the client's approved reference image while supporting users who remember or bookmark `/hot`.

### 9. Persistent Shell & Route Enter Animations

- **Status:** Adopted
- **Decision:** The global `MainLayout` shell (Header, Sidebar, Footer, Mobile Navigation) persists across route changes without unmounting or flashing. A dedicated `apps/web/src/app/template.tsx` animates incoming route children with a subtle fade and 8px rise (`opacity: 0 -> 1`, `translateY: 8px -> 0`).
- **Rationale:** Ensures seamless single-page application feel, instant tab switches, and preserved sidebar scroll position.

---

## FinalLinks Rebrand & Unified Panel Architecture Decisions

### 10. Unified Panel App & Directory Naming
- **Status:** Adopted
- **Decision:** Merge the Owner portal into `apps/admin` creating a single panel application with unified login and role-based access control (RBAC). The codebase folder remains `apps/admin` as requested, while the UI is simply branded "Panel".
- **Rationale:** Simplifies maintenance, reduces duplicate dependencies and configurations, while strictly separating privileges at the server and API layer.

### 11. Temporary Password Delivery
- **Status:** Adopted with Security Mitigations
- **Decision:** Implement temporary password generation upon admin approval of registration requests, delivered via email. Mitigations: cryptographically random 14+ characters, stored strictly as argon2id hash, expires in 72 hours, mandatory forced password change on first login, and redacted from email logs and application logs.
- **Note:** A secure set-password link remains available as a feature-flagged alternative.

### 12. Panel Theme vs. Public Website Theme
- **Status:** Adopted
- **Decision:** The unified panel (`apps/admin`) is strictly single dark-grey theme (`#16181B` page, `#1E2024` surface, `#33373D` border, professional sans/mono typography). The public directory website (`apps/web`) retains its approved design supporting both light and dark themes with dynamic SVG logo switching.

### 13. Domain and Email Configuration
- **Status:** Adopted
- **Decision:** Domain and support email addresses are centrally driven by `packages/config/src/brand.ts` via environment variables (`NEXT_PUBLIC_SITE_DOMAIN`, `NEXT_PUBLIC_SITE_URL`, `SUPPORT_EMAIL`), with localhost fallbacks for development.

### 14. Logo System & Vector Assets
- **Status:** Adopted & Implemented
- **Decision:** A multi-variant SVG logo system (`logo-on-dark.svg`, `logo-on-light.svg`, `mark-blue.svg`) is produced and maintained in `packages/ui/assets/logo/` and consumed via the shared `<Logo />` component. The public website dynamically switches between dark and light variants based on the active theme (`stroke-[#0A8FE0] dark:stroke-[#0B9DF7]`, `fill-[#0F172A] dark:fill-white`, and `fill-[#0A8FE0] dark:fill-[#0B9DF7]`), while panels remain exclusively on the dark variant (`logo-on-dark.svg`).

### 15. Panel Typography
- **Status:** Adopted
- **Decision:** IBM Plex Sans (headings, UI, body) and IBM Plex Mono (URLs, domain names, IDs) are adopted for the unified panel with control heights ≥ 44px for a professional, legible enterprise feel.

### 16. Fractional Drag-and-Drop Sequencing
- **Status:** Adopted
- **Decision:** Web site ordering within categories and mirror ordering within websites use fractional indexing strings (`rankKey`), preventing massive database renumbering during drag-and-drop operations.

### 17. Owner Support Tickets & Inbound Mail Scope
- **Status:** Adopted
- **Decision:** Owner support tickets are initiated from the panel Support module and admin replies are delivered by email and displayed in the thread view. Inbound email-to-ticket parsing is out of scope.

### 18. Session Invalidation on Rebrand
- **Status:** Adopted
- **Decision:** Storage keys and cookies are renamed from `fl_*` to `fl_*`. Existing active sessions are invalidated once upon deployment as part of the brand migration.

### 19. Phase 8 Hardening, Verification & Audit
- **Status:** Completed & Verified
- **Decision:** The monorepo has completed full architectural hardening:
  1. Complete removal of obsolete `apps/owner` codebase and consolidation into `apps/admin`.
  2. Workspace-wide TypeScript strict verification (0 compilation errors across 8 packages).
  3. Production builds passing cleanly for both Next.js applications (`@finallinks/admin` with 24/24 static routes, `@finallinks/web` with 17/17 routes).
  4. Brand audit automated script confirms zero occurrences of legacy brand strings across code, metadata, routes, packages, and assets.
  5. Security posture verified: temporary passwords hashed with Argon2id, 72h expiration, mandatory first-login password change, sanitized email replies, server-side RBAC on every endpoint.

---

## Iteration 3: Main Website Enhancement Decisions

### 20. Clean PageHeader Across All Listing Pages
- **Status:** Adopted & Implemented (Phase 1)
- **Decision:** Remove the legacy banner card (box with icon chip, title, count pill, description, "List Website" button), visible breadcrumb navigation (retained in JSON-LD `BreadcrumbList`), legacy "All / Has Mirrors" toggle, and helper lines ("Showing X of Y sites · Click row for mirrors · Click icon to open") from all listing pages (`/category/[slug]`, `/new`, `/popular`).
- **New Structure:** Unified `PageHeader` component with Title (H1 28–32px desktop / 24–26px mobile) + inline muted count ("· 86 websites"), optional one-line subtitle, flexible full-width search input (up to 640px, 44–48px height, 16px text), and single unified Filter dropdown popover/bottom-sheet syncing state with URL params (`?q=&sort=&show=`).

### 21. Typography Scale & Legibility Standard
- **Status:** Adopted & Implemented (Phase 1)
- **Decision:** Introduce a formal type scale in design tokens (`--fs-xs` 13px, `--fs-sm` 14–15px, `--fs-base` 16px, `--fs-md` 17–18px, `--fs-lg` 20–22px, `--fs-xl` 24–28px, `--fs-2xl` clamp 28–36px, `--fs-3xl` clamp 32–44px).
- **Rules:**
  1. Root font-size set to `100%`, all scale sizes expressed in `rem`.
  2. Strict minimum visible font size threshold: **13px** (`--fs-xs`) for all tags, badges, and helper text.
  3. Default body, row names, inputs, and buttons set to **16px** (`--fs-base`).
  4. Complete ban on arbitrary sub-13px classes (`text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-[12px]`) verified by automated `scripts/font-audit.ts`.
  5. **Exception:** Mobile bottom navigation labels are permitted 11–12px (`text-[11px]`) to maintain balanced 4-item mobile tab bar layout.

### 22. Categories Page Redesign (`/categories`)
- **Status:** Adopted & Implemented (Phase 2)
- **Decision:** Redesign `/categories` with a centered heading block featuring H1 "Categories" (32–40px / 700), flanked by thin horizontal gradient lines (`linear-gradient(90deg, transparent, #2563EB)` on left, `#2563EB` to transparent on right, 2px height), and subtitle "Browse all categories and find your favorite links".
- **Grid Layout:** 5 columns on desktop (`grid-cols-5` at ≥1024px), 3–4 columns on tablet, and strictly 2 columns on mobile (`grid-cols-2` at <640px). First tile is "All Links" (grid icon, brand blue `#2563EB`) linking to `/`, followed by the full directory of categories.
- **Tile Styling:** Neon cards with min-height 120px desktop / 108px mobile, 18px radius, 40–44px Lucide glyph with soft fill, 16–18px/600 white label (wrapping up to 2 lines), and muted site count line.

### 23. Home Category Quick-Access Tile Strip (`/`)
- **Status:** Adopted & Implemented (Phase 2)
- **Decision:** Replace the legacy mobile chips row with a compact 2-row category tile strip at the top of the Home page above the category cards.
- **Grid Density:** Responsive 2-row grid displaying 6 slots on mobile (3 cols), 8 slots on tablet (4 cols), 12 slots on desktop (6 cols), and 16 slots on ultrawide (8 cols).
- **Tile Anatomy:** Calmer accent styling (1px border at ~40% opacity, subtle accent gradient fill, height 80–88px, 14px radius, 24px icon, 14–15px/500 label).
- **Final Slot:** The last slot across all viewports is consistently pinned to "All Categories" (LayoutGrid icon) linking directly to `/categories`.

### 24. 29-Category Seed Catalog & Alias Resolution
- **Status:** Adopted & Implemented (Phase 2)
- **Decision:** Seed the full 29 categories from the client design reference into `apps/web/src/lib/categories-data.ts`.
- **Slug Aliases:** Map near-duplicates (`anime-streaming` -> `anime`, `documentaries` -> `documentary`, `educational` -> `education`, `games` -> `gaming`, `kids-family` -> `kids`) via `resolveCategorySlug()` to ensure backward compatibility and prevent broken bookmarks.

### 25. Home Category Cards: 10 Sites, Single-Column Mobile Lists, and "View All" Threshold Rule
- **Status:** Adopted & Implemented (Phase 3)
- **Decision:**
  1. Default `homeLimit` to **10** across all categories (both frontend catalog fallback and backend database default).
  2. Card Header count pill strictly reflects **total category websites** (e.g., "15 Sites" or "86 Sites", not "10").
  3. **Single-Column Mobile Lists:** Card body list transitions from the legacy 2-column mobile split to a unified **single-column vertical list** (10 rows) across both mobile and desktop. This grants full horizontal width for larger typography (16px row names), status badges, and upcoming inline expansion panels without cramped text truncation.
  4. **"View All" Button:** Label updated to "View All" with single arrow icon (no duplicate text arrows) and 16px/600 font size. The button is rendered **only when `totalWebsites > homeLimit` (i.e. > 10)**. If a category has ≤ 10 websites, the button is hidden and the card ends cleanly.
  5. **Responsive Card Grid:** Home card container uses CSS grid `repeat(auto-fit, minmax(min(100%, 420px), 1fr))` adapting smoothly to 1 column on mobile/tablet portrait, 2 columns on desktop/laptop, and 3 columns on ultrawide (≥1920px).

---

## Iteration 4: Website Showcase Upgrade Decisions (Phase 1)

### 26. Row Interaction Architecture: Chevron vs Name Click
- **Status:** Adopted & Implemented (Phase 1)
- **Decision:** Replace the previous drawer on row click with distinct interaction zones:
  1. **Website Name & Favicon Click:** Navigates directly to the comprehensive website detail page at `/site/[slug]` (prefetched on hover).
  2. **Row Chevron (and empty row area):** Toggles the inline expandable dropdown panel directly underneath the row within the card.
  3. **External Link Icon:** Directly launches the fastest verified online mirror in a new tab with async beacon click tracking.

### 27. Anonymous Cookie-Based Star Identity (+1 Per Person)
- **Status:** Adopted & Implemented (Phase 1)
- **Decision:** Implement Strategy A (anonymous first) via `VoterIdentityService`.
- **Identity Model:** The server issues an `httpOnly`, `Secure`, `SameSite=Lax`, 1-year cookie named `fl_voter` (128-bit random hex). A cryptographic HMAC digest of the voter ID (`voterHash`) is stored alongside an HMAC of the visitor IP (`ipHash`).
- **Enforcement:** Enforced at the PostgreSQL database level via unique constraint `UNIQUE(websiteId, voterHash)` on table `WebsiteStar`. A person can star (+1) or remove their star (-1); idempotent `PUT` calls never double count. Website owners are strictly blocked from starring their own website.

### 28. Website Detail Route & Component Reuse
- **Status:** Adopted (Phase 1)
- **Decision:** Host the website detail page under `/site/[slug]`. The legacy `SiteDomainsDrawer` component is deprecated in favor of embedding the infinite-scrolling `DomainList` directly on the detail page (`#domains`), supporting unlimited domains with virtualization.

### 29. Rank Badge Calculation & Slug Redirection
- **Status:** Adopted & Implemented (Phase 1)
- **Decision:** `rankInCategory` is computed dynamically based on the website's `sortOrder` / `rankKey` position among active websites in the same category (e.g. `#1 Anime & Manga`). Renamed websites maintain backwards compatibility via the `SlugRedirect` table, returning 301 redirects to the updated canonical slug.

### 30. Original Demo Content & Data Model
- **Status:** Adopted & Implemented (Phase 1)
- **Decision:** All demo highlights, notes, and descriptions are 100% original FinalLinks content (no scraped text or assets from everythingmoe). Seed data includes 20 representative sites across categories, including `stream-matrix` configured with 150 mirrors to benchmark virtualization performance.

---

## Iteration 4: Website Showcase Upgrade Decisions (Phase 2)

### 31. Dynamic Import of Expandable Panel (Zero Initial Load Cost)
- **Status:** Adopted & Implemented (Phase 2)
- **Decision:** To keep the initial page HTML and script payload fast for the ~270 collapsed rows across Home and category views, `SiteRowPanel` is loaded dynamically via `next/dynamic` with `ssr: false`. The dropdown JavaScript bundle is only executed on demand when a user expands a row.

### 32. 120ms Prefetch Throttle on Hover & Focus
- **Status:** Adopted & Implemented (Phase 2)
- **Decision:** Hovering or focusing a `SiteRowHeader` arms a 120ms timer that issues a low-priority background fetch to `/api/public/websites/[slug]/preview`. Moving the cursor away before 120ms cancels the timer, protecting bandwidth while delivering zero-latency panel expansion for intentional clicks.

### 33. Single-Open Expansion Mode (`ROW_EXPAND_MODE = 'single'`)
- **Status:** Adopted & Implemented (Phase 2)
- **Decision:** Within any container (`CategoryCard`, `PopularView`, `CategoryDetailView`, `NewView`), only one row can be expanded at any given time. Expanding a new row smoothly collapses any currently expanded row, preventing visual clutter and excessive vertical expansion.

### 34. Two-Column Responsive Dropdown & A11y Standard
- **Status:** Adopted & Implemented (Phase 2)
- **Decision:** The inline panel displays a 2-column structure (Desktop: Left highlights + note + reviews button; Right: mirror chips + fastest mirror CTA; Footer: star button + rank badge + share + report + detail link) on viewports ≥520px and stacks vertically on narrow mobile (<520px). Full WAI-ARIA compliance is enforced with `aria-expanded`, `aria-controls`, `aria-labelledby`, and an `Escape` key listener that cleanly collapses the panel.






