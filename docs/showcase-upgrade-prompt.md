# FinalLinks — Website Showcase Upgrade

### Expandable rows (dropdown with details) · Star system (+1 per person) · Website detail page

### Master prompt for Antigravity (execute phase by phase)

> **Reference images (everythingmoe.com), save to `docs/design-reference/showcase/`:**
>
> 1. `detail-top.png` — site detail page: breadcrumb, title with rank badge, highlights list, mirrors list, note, screenshots row, start of "User Reviews".
> 2. `detail-reviews.png` — reviews list, sentiment tabs, "337 Comments" button, back-to-top button.
> 3. `home-expanded.png` — home page with one row expanded inline (highlights on the left, mirror buttons on the right, comments button, note), other rows collapsed with chevrons, small badges (NEW, DDL, USENET).
>
> **Use the references for structure and behavior only.** Implement everything in **FinalLinks' own design and color theme** (dark navy + accent-bordered cards, blue active states, light theme support). Do **not** copy their text, reviews, screenshots, icons or code. Seed demo content with original sample text.
>
> **Brand:** the product is **FinalLinks**. Use `BRAND` config and the `<Logo />` component; no hardcoded names.
>
> **Precedence:** this document **replaces the earlier "row name click opens a domains drawer" behavior**. Now: **chevron → inline dropdown**, **website name → detail page**. Reuse the existing infinite-scroll **DomainList** component and API for the "all domains" section.
>
> **Compatibility with the latest client requests (apply if already implemented or requested):** Home category cards show **10 sites** each with a **View All** button (the number comes from `category.homeLimit`; set it to 10, do not hardcode 15); the **Popular** page is ranked by **stars** (default sort = most starred, with 7d/30d/all-time range); the Home banner/top section and the "All / Has Mirrors" toggle stay removed (title + search + one filter dropdown only); fonts stay at the larger medium sizes already specified. Nothing in this document should reintroduce those removed elements.

---

## 0. RULES

1. Keep the approved layout (header, sidebar, 2-column category cards, mobile chips and bottom nav). Only the row behavior and the new detail page change.
2. Use existing tokens, `SiteRow`, `Button`, `Badge`, `CountPill`, `Favicon`, global loader, `<Logo />`. No hardcoded colors.
3. Every new surface works in **dark and light** themes and from **320px to 2560px**.
4. Accessible by keyboard and screen reader; respects `prefers-reduced-motion`.
5. The home page must stay fast: no extra data for the ~270 collapsed rows; details load **lazily** on first expand (prefetched on hover/focus).
6. Backend validates everything (DTOs), rate-limits public write endpoints, sanitizes all user/owner content.
7. Log decisions in `docs/DECISIONS.md` (list in Section 14). Stop after each phase (Section 13) with screenshots and test output.

---

## 1. ANALYSIS OF THE REFERENCE (what to reproduce conceptually)

**Expanded row (image 3):** each list row ends with a chevron button. Opening it reveals, inside the same list, a panel with: (left) a bulleted list of positives marked with a "+" symbol, (below) a short note, (right, separated by a thin vertical divider) a stack of **mirror/domain buttons** each with a link icon (labels like the site name, a TLD, "mirrors"), and a **comments count button**. Row badges (NEW, DDL, USENET…) sit beside the name. Only the opened row grows; others stay compact.

**Detail page (images 1–2):** breadcrumb `home / category / site`; one bordered card with centered title (favicon + name + rank badge like "#1 Anime"); two-column body (highlights list left, mirror buttons right, divider between); a note; a horizontally scrollable **screenshots strip**; below, a **User Reviews** card (count, "Write review" button, Positive/Mixed/Negative tabs with a proportional colored bar, sort control, review cards with author, relative time, sentiment label, text, up/down vote, reply icon, "edited" marker, expand chevron); a **"N Comments"** button; **back-to-top** button.

**FinalLinks adaptation:** same information architecture, our visuals; plus **stars** (the user's requirement), unlimited domains list, uptime/status data, related sites. Reviews and comments are specified as an **optional, feature-flagged phase** (Section 11) because they need identity and moderation.

---

## 2. INFORMATION MODEL

### 2.1 Website content fields (new/changed)

| Field                       | Rules                                                                                                                                                 | Where shown                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `shortDescription`          | ≤ 160 chars, plain text                                                                                                                               | Expanded panel, meta description, cards                       |
| `description`               | Markdown, ≤ 5,000 chars, sanitized                                                                                                                    | Detail page "About"                                           |
| `highlights`                | `string[]`, max 8, each ≤ 80 chars                                                                                                                    | Expanded panel (first 6) and detail page (all) as "+" bullets |
| `note`                      | ≤ 300 chars, plain text                                                                                                                               | Panel and detail page callout                                 |
| `screenshots`               | table `WebsiteScreenshot` (max 8), alt text required                                                                                                  | Detail page gallery                                           |
| `starCount`                 | denormalized int                                                                                                                                      | Panel, detail, Popular/Category sorting                       |
| `language`, `contentRating` | existing                                                                                                                                              | Detail stats                                                  |
| Computed                    | `rankInCategory` (position by `rankKey` within category), `isNew` (published < 14 days), `onlineCount`, `domainsCount`, `lastVerifiedAt`, `uptime30d` | Badges and stats                                              |

Owners and admins edit these in the panel (Section 10). Tags (existing M:N) render as small badges (e.g. DDL); `NEW` badge is computed, not a tag.

### 2.2 Stars

```
WebsiteStar { id, websiteId, voterHash, ipHash, createdAt, status ('VALID'|'SUSPECT'|'REMOVED') }
UNIQUE (websiteId, voterHash)          -- one star per person per website
Website.starCount                       -- counts VALID only, updated transactionally
```

`voterHash` = HMAC of the visitor identity (Section 6.1); raw identifiers are never stored. `ipHash` = salted hash for abuse detection only (retention 30 days).

### 2.3 Slug safety

Detail URLs are `/site/[slug]`. Keep a `SlugRedirect(oldSlug → websiteId)` table so renamed sites 301-redirect.

---

## 3. API (public, NestJS) — add and document in Swagger

| Endpoint                                | Purpose                                                                                                                                                                                                                                                                                                                                      | Caching                          |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `GET /public/websites/:slug/preview`    | Data for the inline dropdown: `{ id, slug, name, faviconUrl, shortDescription, highlights[0..6], note, category{slug,name,accentKey}, rankInCategory, starCount, domainsCount, onlineCount, fastestMirror{url,ms}, mirrors:[{id,label,url,type,status,responseMs}] (top 8: Primary first then owner order), lastVerifiedAt, tags[], isNew }` | Redis 60s, ETag, tag-invalidated |
| `GET /public/websites/:slug`            | Full detail: everything above + `description`, all `highlights`, `screenshots[]`, stats (`clicks30d`, `uptime30d`, `addedAt`, `language`, `contentRating`), `related[]`                                                                                                                                                                      | Redis 60s, ISR tag               |
| `GET /public/websites/:slug/domains`    | Existing infinite list (cursor, filters, search) used on the detail page                                                                                                                                                                                                                                                                     | 30s                              |
| `GET /public/websites/:slug/engagement` | `{ starCount, starred }` for **this visitor**                                                                                                                                                                                                                                                                                                | `no-store`                       |
| `PUT /public/websites/:slug/star`       | Idempotently give a star                                                                                                                                                                                                                                                                                                                     | rate-limited                     |
| `DELETE /public/websites/:slug/star`    | Remove own star                                                                                                                                                                                                                                                                                                                              | rate-limited                     |

Rules:

- Preview/detail responses are **visitor-independent** (cacheable). Visitor-specific state (`starred`) only comes from `/engagement`.
- `PUT star` when already starred returns `200 { starred: true }` (never double counts). Count can never exceed one per person.
- Errors use the standard envelope (`VALIDATION_ERROR`, `RATE_LIMITED`, `NOT_FOUND`, `CAPTCHA_REQUIRED`).
- Browser calls go through **Next.js route handlers (BFF)** under `/api/public/*` so the visitor cookie is first-party and CORS is not required; the BFF forwards `X-Forwarded-For` and the visitor token to the API.

---

## 4. UI: EXPANDABLE ROW (home cards, category page, New, Popular)

### 4.1 Row anatomy (collapsed)

`[number] [favicon] [Site name (link)] [badges…] ········· [external-link icon] [chevron button]`

- **Site name and favicon** are a single `<Link href="/site/[slug]">` → detail page (prefetched on hover).
- **External-link icon** keeps the approved behavior: opens the fastest online mirror in a new tab (`rel="noopener noreferrer nofollow"`), counts the click via `sendBeacon`.
- **Chevron button** (`ChevronDown`, 36×36 visual, 44×44 hit area): toggles the dropdown. `aria-expanded`, `aria-controls`, accessible name "Show details for {name}".
- Mouse users can also click an empty area of the row to toggle (progressive enhancement; the chevron remains the accessible control).
- Badges: tag pills (max 2 visible + "+N"), `NEW` pill (accent gold), mirror-count chip when domains > 1. On narrow rows badges collapse to the `NEW` pill only.
- **Mobile (≤ 479px, two-column list inside cards):** show name + chevron only (hide the external icon; "Open" lives inside the panel). Tapping the name navigates; tapping the chevron or empty area toggles.

### 4.2 Expanded panel (the dropdown)

Container: inside the same `<li>`, below the row header; background `--card-hover`, 1px `--line` border-top with a short accent-colored top rule, radius 12 on the bottom, padding 16–20.

Desktop/laptop (panel width ≥ 520px) — **two columns with a thin vertical divider** (like the reference):

**Left column**

1. Short description (2–3 lines, "Read more" → detail page).
2. **Highlights** list: each item prefixed with a **"+" icon in the category accent color**, up to 6, then "+N more" → detail page.
3. **Note** (muted callout with `Info` icon), if present.

**Right column**

1. Header line: `{domainsCount} domains · {onlineCount} online` with status dot; "Checked 12m ago".
2. **Mirror buttons** (chips stacked vertically): each is a full-width dark pill with label + link icon at the right, status dot at the left, response time on hover tooltip; Primary first. Click opens the link in a new tab; a small copy icon appears on hover/focus. Max 8 shown; if more: "View all {N} domains →" (goes to `/site/[slug]#domains`).
3. **"Open fastest mirror"** primary button.

**Footer strip (full width)**
`★ Star button + count` · category chip · tag badges · rank chip `#3 in Anime Streaming` · **Share** (copy link, native share) · **Report broken link** · **"View details →"** (to the detail page).

Mobile (panel width < 520px): single column in this order — description, highlights, note, fastest-mirror button, mirror chips, footer strip (wraps). In a two-column inner list the expanded row spans both columns (`grid-column: 1 / -1`).

### 4.3 Behavior

- **One open row per card** (opening another closes the previous) to keep cards tidy; configurable constant `ROW_EXPAND_MODE = 'single' | 'multiple'`.
- State in the URL? Optional deep link `?open=slug` (on load, scroll into view and open). Not stored globally; closes on route change.
- **Lazy data:** panel mounts only when first opened. Data from `useQuery(['preview', slug])` (stale 60s). Prefetch on `pointerenter`/`focus` of the row (desktop) after 120ms, and on touch start for chevron.
- While loading: panel skeleton (same geometry: lines + chips) using the global loader components; on error: inline message + Retry. The height animation starts immediately with the skeleton so the UI feels instant.
- Star state: after the panel opens, call `/engagement` (no-store) and merge.
- Keyboard: Enter/Space on chevron toggles; `Esc` inside the panel closes it and returns focus to the chevron; Tab order flows into the panel content while open and skips it when closed (`inert`/`hidden`).

### 4.4 Animation (Framer Motion + subtle GSAP)

- Panel: `AnimatePresence initial={false}`; `motion.div` animating `height: 0 → 'auto'` and `opacity: 0 → 1`, duration 260ms, ease `[0.2, 0.8, 0.2, 1]`; `overflow: hidden` during animation, then `visible`.
- Inner content **stagger**: description, highlights (each 25ms), chips (each 25ms) fade/translate 6px.
- Chevron rotates 180° (180ms). Row header gets a soft background while open.
- Mirror chip hover: border becomes accent, link icon nudges 2px. Press `scale(.98)`.
- Reduced motion: no height animation or stagger (instant toggle), only opacity.
- No layout animation on sibling rows (keeps 15+ rows smooth). Verify no CLS and INP < 200ms.

---

## 5. UI: DETAIL PAGE `/site/[slug]`

Lives in the persistent shell (header + sidebar). **The sidebar highlights the website's category** (update `getActive`: `/site/[slug]` → sidebar = category slug, header = Home). Back/Forward and refresh work. The same page is the target of "View details" and the website name link.

### 5.1 Layout (desktop; mobile stacks)

1. **Breadcrumbs:** `Home / {Category} / {Website}` (Home icon, links, current page not linked, `BreadcrumbList` JSON-LD).
2. **Hero card** (category-accent border and glow like category cards):
   - Left/top: favicon 56px, **website name (H1)**, rank badge `#1 in {Category}`, `NEW` badge if applicable, tag badges, content-rating badge if mature.
   - Right/top actions: **Star button + count**, Share, Report, "Open fastest mirror" (primary).
   - Meta line: `{domainsCount} domains · {onlineCount} online · uptime {uptime30d}% · last verified {time}`.
3. **Body grid (two columns with divider, as in the reference):**
   - Left: **Highlights** ("+" bullets in accent color, all of them), **About** (sanitized markdown, readable measure), **Note** callout.
   - Right: **Mirrors panel** (card): top 8 mirror chips (Primary first, status dots, response time), "Open fastest mirror", link "View all domains ↓" (anchor `#domains`).
4. **Screenshots gallery:** horizontal scroll strip (scroll-snap), 3 visible on desktop, 1.2 on mobile (peek of next), 16:9 thumbnails with blurred placeholders, lazy loading, **lightbox** on click (prev/next, keyboard arrows, swipe, `Esc`, alt text caption, focus trap, preload neighbor). Hidden when there are no screenshots.
5. **Domains & Mirrors (`#domains`)**: the full list using the existing infinite/virtualized `DomainList` (search, status/type filters, sort, copy/open, report) — supports **unlimited domains**.
6. **Stats strip:** stars, clicks (30 days), uptime, added date, language, category (link), tags.
7. **Related websites:** a card of 5–8 `SiteRow`s from the same category (compact), plus "More in {Category} →".
8. **(Feature-flagged)** Reviews and Comments blocks (Section 11).
9. **Back-to-top** floating button (bottom-right, appears after 600px scroll, respects bottom nav on mobile).

### 5.2 States and SEO

- Skeleton for the whole page via `loading.tsx`; 404 (branded) for unknown slug; archived/suspended sites show a notice and `noindex`.
- SSR/ISR with on-demand revalidation (`revalidateTag('site:'+slug)`) when the owner/admin edits content or domains change.
- Metadata: title `{Name} — Mirrors & Links | FinalLinks`, description from `shortDescription`, canonical `/site/[slug]`, OG/Twitter with dynamic OG image (logo, name, rank, star count). JSON-LD: `WebPage` + `BreadcrumbList`. **Do not output `AggregateRating`/`Review` markup unless real ratings/reviews exist.**
- Outbound links `rel="noopener noreferrer nofollow"`; `sitemap.ts` includes site pages with `lastmod`.

### 5.3 Styling rules (our theme, not the reference)

- Cards: `--card` fill, accent border (category `--accent`), 16px radius; inner dividers `--line`.
- "+" bullets: Lucide `Plus` in `--accent`, text `--text`; notes use `--text-2` with an info icon.
- Mirror chips: `--bg` fill, 1px `--line` border, 10px radius, hover border `--accent`; link icon in `--text-2`.
- Typography from tokens (Poppins/Inter or the current approved fonts); H1 28–36px responsive.
- Light theme equivalents verified for contrast (accent shifts to 600 shade).

---

## 6. STARS: +1 PER PERSON

### 6.1 Identity (who is "a person")

The public site has no visitor accounts today, so implement a **`VisitorIdentity` abstraction** with two strategies:

**Strategy A — anonymous (ship first):**

- On first visit the server issues a signed, `httpOnly`, `Secure`, `SameSite=Lax`, 1-year cookie `fl_voter` (random 128-bit id + HMAC signature).
- `voterHash = HMAC(secret, voterId)`; unique per `(websiteId, voterHash)`.
- Abuse controls (below) make clearing cookies expensive: per-IP and per-subnet caps, CAPTCHA, anomaly detection.

**Strategy B — signed-in visitors (optional, behind `STAR_REQUIRE_LOGIN=false` by default):**

- Lightweight visitor accounts (email magic link and/or Google sign-in), table `Visitor`; `voterHash = HMAC(secret, visitorId)`; stars follow the account across devices. Required for reviews/comments in Section 11.

Document the trade-off in `DECISIONS.md`: anonymous is frictionless but not tamper-proof; signed-in is stronger.

### 6.2 Rules

- Maximum **one star per person per website**; `PUT` is idempotent; the DB unique constraint enforces it even under races.
- A person may **remove** their star (`DELETE`); they can never add more than one.
- Counts update in the same transaction (`starCount` ±1, VALID stars only). A nightly job reconciles `starCount` against `COUNT(*)`.
- The website owner cannot star their own site (reject when the request carries the owner's authenticated session).
- Count display: abbreviated (1.2K), exact value in tooltip/`aria-label`.

### 6.3 Anti-abuse

- Rate limits: `PUT/DELETE star` 10/min and 60/hour per IP, 100/day per voter; global safety cap per website per hour (spike triggers quarantine).
- **Bot check:** invisible CAPTCHA (Cloudflare Turnstile) required on the visitor's **first** star of a session; token verified server-side.
- **Anomaly detection:** many new stars on one site from the same /24 subnet or within seconds, or voter ids created < 1 minute earlier in bulk → mark stars `SUSPECT` (not counted publicly) and surface them to admins.
- Privacy: never store raw IP; salted `ipHash` with 30-day retention; mention the functional cookie in the Privacy Policy page and `/privacy` copy.

### 6.4 Star button UI

- Component `<StarButton slug count starred size="sm|md" />`: outline star when not starred, **filled gold** (`--accent-gold`) when starred; count next to it (tabular numbers).
- Click: optimistic toggle (count ±1), small pop animation (scale 1 → 1.3 → 1, fill color transition, subtle sparkle optional via a light "click spark"), then reconcile with the server response; on error revert and toast ("Couldn't save your star. Try again.").
- States: loading spinner on first-star CAPTCHA/verification, disabled for the owner, tooltip "Star this website" / "Remove your star". `aria-pressed` reflects state; announces "Starred" via live region.
- Shown in the expanded panel, hero of the detail page, and (read-only count) on Popular/Category rows when sorting by stars.

### 6.5 Ranking integration

`popularScore` includes stars (e.g. `0.5·clicks7d + 1.0·stars_recent + decay`); add sort **"Most starred"** to Category view and Popular page.

---

## 7. FRONTEND IMPLEMENTATION STEPS (apps/web)

1. **Types and API client** in `packages/contracts` / `packages/api-client`: `WebsitePreview`, `WebsiteDetail`, `Engagement`, `MirrorItem`, hooks `useWebsitePreview(slug)`, `useEngagement(slug)`, `useToggleStar(slug)`, `useWebsiteDetail(slug)`.
2. **BFF route handlers:** `app/api/public/websites/[slug]/{preview,engagement,star}/route.ts` forwarding to the API with cookie handling, IP forwarding, and no-store for engagement/star.
3. **`SiteRow` refactor:** split into `SiteRowHeader` (number, favicon, name link, badges, external icon, chevron) and lazy `SiteRowPanel` (dynamic import). Add `expanded`, `onToggle`, `panelId` props; list containers manage the single-open state.
4. **`SiteRowPanel`:** skeleton, error state, two-column layout, mirror chips, fastest-mirror button, footer strip, animations from 4.4.
5. **`MirrorChip`**, **`HighlightList`**, **`StarButton`**, **`RankBadge`**, **`NewBadge`**, **`Gallery` + `Lightbox`**, **`StatsStrip`**, **`RelatedSites`**, **`BackToTop`** in `packages/ui` (shared with panel previews).
6. **Detail route** `app/(site)/site/[slug]/page.tsx` with `generateMetadata`, `generateStaticParams` (top sites) + ISR, `loading.tsx`, `not-found.tsx`; update `getActive` for the sidebar and header.
7. **Prefetch** strategy (hover/focus) and caching keys; invalidate `preview`/`engagement` after star changes and after edits.
8. **Update Category/New/Popular pages** to use the new expandable rows and the "Most starred" sort.
9. **Responsive/A11y pass** (Section 12), then visual QA against the three reference images for structure (not pixels).

---

## 8. BACKEND IMPLEMENTATION STEPS (apps/api)

1. Prisma migration: new Website fields, `WebsiteScreenshot`, `WebsiteStar`, `SlugRedirect`, indexes `(websiteId, status)` on stars and `(categoryId, rankKey)` on websites; backfill `starCount = 0`.
2. Modules: `StarsModule` (service, controller, `VoterIdentityService`, `StarAbuseService`), extend `WebsitesPublicService` with `preview()` and `detail()` using single queries (no N+1) and a window function for `rankInCategory`.
3. DTOs/validation: slug param, content field limits, markdown sanitizer, highlights array limits.
4. Caching + invalidation: Redis tags `site:{slug}`, `category:{slug}`, `home`; revalidate Next.js tags via a signed webhook.
5. Throttling profiles for star endpoints; Turnstile verification service.
6. Jobs: star reconciliation (nightly), anomaly sweep (every 10 minutes), screenshot processing (resize 1280px WebP + 480px thumb, strip EXIF).
7. Seed: demo sites with realistic highlights/notes/screenshots and varied domain counts (including one site with 150 domains) using original sample text.
8. Swagger docs, unit tests (star idempotency, race conditions, owner block), e2e tests.

---

## 9. OWNER AND ADMIN PANEL CHANGES (single panel app)

**Owner → My Website** gains a "Showcase" section:

- Short description (counter 160), full description (markdown editor + preview), **Highlights editor** (add/remove/reorder with drag handle, max 8, 80 chars each), **Note**, **Screenshots uploader** (drag-and-drop, up to 8, JPG/PNG/WebP ≤ 3MB, per-image alt text required, reorder by drag, delete), tags.
- **Live preview** tabs using the real components: "Row dropdown" and "Detail page header" so owners see exactly what visitors will see.
- Moderation setting (admin-controlled): edits go live instantly or enter `PENDING_REVIEW`.

**Owner → Dashboard/Analytics:** show star count, stars over time, clicks per domain.

**Admin:** same fields editable on behalf of owners; **Stars module** under Websites: per-site star count, suspect stars list, actions (mark valid/remove, recompute count, block voter), audit logs; admin can set `highlights/note` for any site.

All panel screens follow the panel's dark-grey UI, pagination and loader rules.

---

## 10. RESPONSIVENESS

- ≥1280: two-column panel/detail layouts, three-column category lists with expanded rows spanning the full row.
- 1024–1279: same with tighter padding.
- 768–1023: panel two columns only if width ≥ 520px else stacked; gallery shows 2.2 thumbnails.
- ≤767: stacked panel, full-width chips (min height 44px), star button in the footer strip, sticky bottom nav unaffected, back-to-top above the nav.
- ≤359: chips and buttons full width, bullets wrap, type scale −1px.
- No horizontal scroll at any width; `100dvh`/safe-area handled; lightbox full-screen with swipe.
- Test widths: 320, 360, 390, 430, 600, 768, 820, 1024, 1280, 1440, 1920, 2560.

---

## 11. OPTIONAL PHASE (feature flags): REVIEWS AND COMMENTS (as in the reference)

Enable with `FEATURE_REVIEWS` and `FEATURE_COMMENTS` (default off). **Requires visitor accounts (Strategy B)** and moderation tools; do not ship anonymous reviews.

- **Reviews card** on the detail page: title "User Reviews {count}", **Write review** button (dialog: sentiment Positive/Mixed/Negative, text 20–2,000 chars), sentiment tabs with a **proportional bar** (blue/grey/red from tokens), sort (Top, New), review cards (author handle, relative time, sentiment pill, "edited" marker, expandable long text, up/down vote, reply icon). One review per visitor per site; editable for 24h; owners cannot review their own site.
- **Comments**: "N Comments" button opens a threaded panel (depth 2), vote, report, soft delete.
- Moderation: profanity/link filter, rate limits, CAPTCHA, report button, **admin module "Reviews & Comments"** (queue, approve/remove, ban visitor), audit log, owner can view but not delete.
- Do not emit review structured data without real ratings.

---

## 12. SECURITY, PRIVACY, PERFORMANCE, ACCESSIBILITY

- Sanitize markdown (`rehype-sanitize`) and strip scripts/iframes; links in descriptions get `rel="nofollow noopener noreferrer"`; image uploads: MIME sniffing, magic-byte check, re-encode, random filenames, size and count limits, EXIF stripping, SSRF-safe (no remote fetch by URL).
- Rate limits on all new public endpoints; CAPTCHA on first star; Redis-backed throttling with `Retry-After`.
- Privacy: no raw IPs, functional cookie documented, data retention noted in `/privacy`.
- Performance: Home HTML size unchanged (no panel data); panel JS dynamically imported (< 12KB gz); preview responses < 6KB; detail page LCP < 2.5s, CLS < 0.1, INP < 200ms; images AVIF/WebP with explicit sizes.
- Accessibility: WCAG AA both themes; `aria-expanded/controls`, focus management, live regions for star changes, lightbox focus trap, visible focus rings, 44px targets, color never sole indicator (status dots have text/aria labels).

---

## 13. EXECUTION PHASES (stop after each; show screenshots + test results)

**Phase 1 — Data and API:** migrations, content fields, preview/detail/engagement endpoints, seed data. _Accept:_ API tests green; preview < 6KB; `EXPLAIN` shows indexed queries.
**Phase 2 — Expandable row + panel:** BFF handlers, `SiteRow` split, lazy panel, animations, prefetch, mobile layout. _Accept:_ E2E for expand/collapse, single-open behavior, keyboard, reduced-motion; no CLS.
**Phase 3 — Stars:** identity, endpoints, anti-abuse, `StarButton`, optimistic UI, admin star tools. _Accept:_ race-condition and rate-limit tests; one star per person proven; owner block works.
**Phase 4 — Detail page:** layout, gallery + lightbox, domains section, related, SEO/OG, sidebar active state. _Accept:_ E2E navigation (name → detail, back works), SEO checks, Lighthouse ≥ 90 mobile.
**Phase 5 — Panel editing:** owner/admin showcase editor, uploader, previews, moderation setting. _Accept:_ edits reflect on row panel and detail page after revalidation.
**Phase 6 — Responsive, themes, a11y, polish:** device matrix, light theme, axe, perf budgets.
**Phase 7 (flagged) — Reviews and comments + visitor accounts + moderation.** Ship only after approval.
**Phase 8 — Hardening:** security review, load test (k6 on preview/star endpoints), docs, final report.

---

## 14. TESTS (Playwright E2E + API tests)

1. Home: click chevron → panel animates open, shows description, highlights with "+" bullets, mirrors, stars, footer actions; second chevron click closes; opening another row closes the first; keyboard (Enter/Space/Esc) works; `aria-expanded` correct.
2. Click the website name → `/site/[slug]`, sidebar shows the category active, breadcrumbs correct; Back returns to the home state.
3. External-link icon opens the fastest online mirror in a new tab and increments clicks once.
4. Star: first click stars (+1), second click on the same visitor unstars (−1), repeated rapid clicks never exceed +1; two parallel requests don't double count; a different browser context can star (+1) independently; rate-limit returns 429 with `Retry-After`; owner cannot star own site.
5. Panel with 150-domain site: "View all domains" scrolls to `#domains`, search/filter work, list virtualizes.
6. Gallery: lightbox open/close, arrows, swipe on mobile, focus trap.
7. Mobile (390): two-column list expands full width, chips ≥ 44px, no horizontal scroll; tablet and desktop checks.
8. Light/dark visual snapshots for row panel and detail page.
9. SEO: unique title/description/canonical, JSON-LD present, no `AggregateRating`; renamed site redirects 301.
10. Owner edits highlights/note/screenshots → public row panel and detail page update; admin star moderation reduces public count.
11. (Flagged phase) reviews/comments flows and moderation.

---

## 15. ASSUMPTIONS TO LOG IN `docs/DECISIONS.md` (confirm with the client)

1. Name → detail page; chevron (and empty row area) → dropdown; external icon → fastest mirror (hidden on very narrow rows, available in the panel).
2. Anonymous cookie-based star identity first; signed-in visitors optional later. Stars are removable but never exceed +1 per person.
3. One open row per card by default (constant to change).
4. Reviews/comments are an optional feature-flagged phase because they require accounts and moderation.
5. `/site/[slug]` is the detail route; the previous domains drawer on row click is removed (its list component is reused on the detail page).
6. Rank badge uses the website's position within its category (`rankKey`).
7. Demo content is original; nothing is copied from everythingmoe.

---

## START NOW

Begin with **Phase 1**: save the three reference images, add the migration (content fields, `WebsiteScreenshot`, `WebsiteStar`, `SlugRedirect`), implement `GET /public/websites/:slug/preview`, `GET /public/websites/:slug` and `/engagement`, seed 20 demo sites with highlights, notes and varied domain counts, and write the API tests. Stop and report before starting Phase 2.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-11-24T02:33:36+05:30.

The user's current state is as follows:
Active Document: d:\Freelancing Projects\FindFunLinks\scripts\test-phase1-direct.ts (LANGUAGE_UNSPECIFIED)
Cursor is on line: 1

The user has uploaded 3 image(s):

- C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/.user_uploaded/media_1795467633142_3de9e70d.jpg
- C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/.user_uploaded/media_1795467635494_61ec97bc.jpg
- C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/.user_uploaded/media_1795467637916_3cfb64b9.jpg
  You can embed these images in an artifact if you need the USER to review them.
  </ADDITIONAL_METADATA>
