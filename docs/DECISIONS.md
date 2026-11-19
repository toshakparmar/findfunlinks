# FindFunLinks — Architectural & Design Decisions Log

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
