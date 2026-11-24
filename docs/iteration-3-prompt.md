<USER_REQUEST>
# FinalLinks — Main Website Enhancement Master Prompt (Iteration 3)
### Categories redesign · Home category tiles · Clean page headers · Expandable rows + Stars · Website detail page · 10-per-card + View All · Larger fonts · Full responsiveness

> Paste into Antigravity / Claude Code inside the existing monorepo. Brand is **FinalLinks** (new logo, `BRAND` config, `<Logo />` with light/dark variants already defined in the earlier rebrand prompt). The reference screenshots below still show the old name "FindFunLinks": **always render the FinalLinks logo**, never copy the old one.
>
> **The approved design language stays** (navy dark theme, accent-bordered cards, blue active pills, light theme support). This iteration changes specific screens and flows. Where this prompt conflicts with older prompts, **this prompt wins** (conflicts are listed in Section 16).

---

## 0. REFERENCE IMAGES (attach them with this prompt; save to `docs/design-reference/v3/`)

| # | Save as | What it is | Used for |
|---|---|---|---|
| 1 | `categories-desktop.png` | Our target **Categories page**, desktop: 5-column grid of neon category tiles, centered title with blue lines either side | Section 3 |
| 2 | `categories-mobile.png` | Same page on mobile: 2-column tile grid | Section 3 |
| 3 | `home-category-tabs-ref.png` | Reference site's compact category tile strip (icon over label, tinted tiles, 6 per row, 2 rows) | Section 4 |
| 4 | `site-detail-ref.png` | Reference site's **website detail page** (breadcrumb, title + rank badge, pros list, domains column, screenshots, user reviews) | Section 8 |
| 5 | `site-detail-reviews-ref.png` | Same page scrolled: reviews list, comments button, back-to-top | Section 8 |
| 6 | `home-expanded-row-ref.png` | Reference home with a **row expanded** (pros list left, domains right, chevrons) | Section 7 |
| 7 | `current-category-page.png` | Our current `/category/[slug]` page: shows the **top section to remove** | Section 5 |

**IP note:** images 3–6 come from a third-party site and are *structure references only*. Recreate the layout/flow using FinalLinks' own tokens, components, icons, copy and colors. Do not copy their code, text, assets or exact styling.

---

## 1. RULES

1. Keep working features working; every change must pass the tests in Section 13.
2. All visuals use existing tokens (`packages/ui`). No hardcoded colors/sizes; new sizes go into the type scale (Section 11).
3. Every new screen supports **dark and light** themes and is **responsive from 320 to 2560px**.
4. Every async surface uses the global loader (top bar, skeletons, button spinners).
5. Log decisions in `docs/DECISIONS.md` (list in Section 16). Stop after each phase (Section 14) with screenshots + test results.
6. Accessibility: keyboard-operable expansion, `aria-expanded`/`aria-controls`, focus management, reduced-motion respected, AA contrast.

---

## 2. CURRENT-STATE FINDINGS (from image 7 and the running app)

| Observation | Action |
|---|---|
| Large banner card on category page (title, "15 Sites" pill, description, "List Website" button) | **Remove** on every page and breakpoint (Section 5) |
| Toolbar has an "All / Has Mirrors" toggle + "Popular Rank" dropdown | Keep **search + one dropdown only**; remove the toggle |
| Helper line "Showing 15 of 15 sites · Click row for mirrors · Click icon to open" | Remove; replace with a quiet count (Section 5) |
| Rows: external-link icon at right; row click opens drawer | Replace with **chevron button (expand)** + name links to detail page (Section 7) |
| Cards list 15 sites with "View More" | **10 sites** + **"View All"** (Section 6) |
| Text is small (13–14px list text, 11–12px meta) | New medium type scale (Section 11) |
| Sidebar categories use stroke icons only | Keep; Home gets a tile section (Section 4) |

---

## 3. CATEGORIES PAGE `/categories` (images 1 and 2)

### 3.1 Layout
- Heading block, **centered**: H1 "Categories" (32–40px/700), to its left and right a **thin horizontal gradient line** (brand blue → transparent, 2px, ~120px desktop / ~48px mobile, vertically centered on the H1), subtitle below: "Browse all categories and find your favorite links" (16–18px, `--text-2`).
- Tile grid below the heading, full width of the content area: `grid-template-columns: repeat(auto-fill, minmax(190px, 1fr))`, gap 16px desktop / 12px mobile. Result ≈ 5 columns on desktop (as image 1), 3–4 on tablet, **2 columns on mobile** (as image 2; force `repeat(2, 1fr)` below 560px).
- **First tile = "All Links"** (grid icon, blue accent) → `/`. Then all active categories in `homeOrder`.
- No banner card, no extra buttons. (No search on this page; the full grid fits on screen.)

### 3.2 Tile design (neon, like the images, built from our tokens)
- Size: min-height 120px desktop, 108px mobile; radius 18px; padding 16px; content centered in a column: **icon (40–44px)** above **label (16–18px/600, white, wraps to 2 lines max, e.g. "Stand-Up Comedy")**; a small muted count line under the label (13–14px, "86 sites") — can be disabled by a flag `categories.showCount` (default on).
- Style via the accent system: `--accent` from `category.accentKey`.
  - background: `linear-gradient(145deg, color-mix(in srgb, var(--accent) 28%, var(--card)) 0%, color-mix(in srgb, var(--accent) 6%, var(--bg)) 100%)`
  - border: `2px solid color-mix(in srgb, var(--accent) 90%, transparent)`
  - glow: `0 0 22px -8px color-mix(in srgb, var(--accent) 55%, transparent)`
  - icon: Lucide, stroke 2, color `--accent`, soft fill `color-mix(accent 22%)` to approximate the glossy glyphs in the images.
- Hover (desktop): lift `translateY(-3px)`, glow +20%, border brightens (160ms). Active/pressed: `scale(.98)`. Focus-visible: 2px ring.
- Whole tile is one `<Link href="/category/{slug}">`; `aria-label="{name}, {n} sites"`.
- **Light theme:** white tile, 2px accent border (600 shade), tinted background 8–10%, soft colored shadow instead of glow, icon in accent 600.

### 3.3 Data: categories to support
The reference shows 29 categories + All Links. Categories are **data-driven**; keep the existing 18 and **seed the extra ones** (name → suggested `iconKey` → accent):

All Links `layout-grid` blue · Movies `clapperboard` purple · TV Shows `tv` gold · OTT Platforms `monitor-play` red · Anime `smile` pink · Sports `trophy` cyan · Cartoons `rabbit` orange · Documentary `video` green · Web Series `layers` violet · K-Drama `film` magenta · C-Drama `landmark` red · Anime Movies `clapperboard`/`disc-3` violet · Hollywood `film` gold · Bollywood `film` pink · South Indian `circle-dot`/`popcorn` blue · Regional Movies `map-pin` purple · Short Films `play-square` teal · Stand-Up Comedy `mic` orange · Reality Shows `crown` gold · Kids `baby` green · Live TV `radio` red · News `newspaper` blue · Music `music` magenta · Gaming `gamepad-2` violet · Esports `trophy` teal · Fitness `dumbbell` green · Cooking `chef-hat` orange · Travel `plane` blue · Technology `cpu` purple · Education `graduation-cap` blue.

Rules: existing categories (Software, Tools, Ebooks, Comics, Podcasts, Theatre, Kids & Family, Others, etc.) stay. New categories seed as `isActive=false` until the admin activates them or they receive a first website, **or** show with "0 sites" if the client prefers a full-looking page (flag `categories.showEmpty`, default off). Merge near-duplicates sensibly (e.g. Documentary/Documentaries, Kids/Kids & Family, Gaming/Games, Education/Educational): keep one slug, list alias in `DECISIONS.md`, and keep old slugs redirecting (301).

Admin keeps controlling name, icon, accent, order, visibility in the existing Categories module.

---

## 4. HOME: CATEGORY TILE SECTION ON TOP (image 3)

Add a compact **category quick-access section** at the very top of Home, above the category cards. No banner/hero above it.

- Grid of small tiles, **icon above label**, tinted by accent (like image 3's tinted tiles, but with our accent system and a 1px accent border at ~40% opacity — calmer than the Categories page tiles).
- Columns by container width: **6** (desktop), 4 (tablet), 3 (mobile); 8 on ≥1920.
- Rows: 2. Show the first 12 (desktop), 8 (tablet), 6 (mobile) categories by `homeOrder`; the **last slot is always "All Categories"** (grid icon) → `/categories`.
- Tile: height 80–92px, radius 14px, icon 24px, label 15px/500, hover brightens + lifts 2px.
- Each tile links to `/category/{slug}`.
- Replaces the mobile "chips row" from the earlier design (Section 16). On Home only; other pages keep the standard header.
- Below it the **category cards grid** continues exactly as approved (10 sites each, Section 6).

---

## 5. SIMPLE PAGE HEADER ON ALL PAGES (image 7 = what to remove)

Create one shared component `PageHeader` and use it on **every listing page**: `/category/[slug]`, `/new`, `/popular`, and any other list page. It replaces all banner/hero sections at all sizes.

### 5.1 What to remove everywhere (desktop, laptop, tablet, mobile)
- The banner card (accent-bordered box with icon chip, title, count pill, description, "List Website" button).
- The visible breadcrumb on list pages (keep `BreadcrumbList` JSON-LD; the detail page keeps a visible breadcrumb, Section 8).
- The **"All / Has Mirrors" toggle**.
- The helper text "Click row for mirrors · Click icon to open" and any "Showing X of Y" line above the list.
- Duplicate calls to action inside the page body (the header CTA and sidebar promo remain).

### 5.2 New structure

```
[ Title (H1) · muted count ]                                  (row 1)
[ Search input ................................ ][ Filter ▾ ]  (row 2)
```
- **Title**: page/category name only (e.g. "OTT Platforms"), 28–32px/700 desktop, 24–26px mobile; muted inline count "· 86 websites" (14–16px, `--text-2`). Optional one-line subtitle (16px) only on pages that need it (e.g. New: "Recently added websites"); category pages have none.
- **Search**: full-width flexible input (max 640px on ≥1280, then flex), height 44–48px, icon left, clear button, placeholder "Search in {title}…", 16px text.
- **One filter dropdown** at the right (min-width 180px). Content = grouped options (single control):
  - *Sort by*: Featured order (default on categories), Most starred, Newest, A–Z
  - *Show*: All sites, Online only, Has mirrors
  The button shows the current summary ("Most starred"). On mobile it opens a bottom sheet; on desktop a popover with radio groups. Keyboard accessible.
- **Spacing/alignment:** page padding 24–32px desktop, 16px mobile; 20px between row 1 and 2; 20–24px before the list; toolbar and list share the same left/right edges. No borders/cards around the toolbar.
- **Responsive:** ≥768 one row (search grows, filter right); <768 title row, then search full width, filter full width under it (or beside it as an icon-labelled button if width ≥ 420, collapse label under 420).
- Applies identically on `/new` (filter: date range + sort) and `/popular` (filter: range All time/30d/7d + category). `/requests` and static pages: title only (+ tabs on Requests).
- URL-synced state (`?q=&sort=&show=`); filtered URLs `noindex`, canonical to the base URL.

### 5.3 List body (unchanged style)
Below the header keep the existing accent-bordered list card with numbered rows, using the new row design (Section 7). Pagination: infinite scroll + "Load more" fallback + crawlable `?page=` links; a quiet result summary at the bottom ("Showing 1–30 of 86").

---

## 6. HOME CARDS: 10 SITES + "VIEW ALL" (Item 4)

- `homeLimit` default becomes **10** (migration updates existing categories; admin can still override per category in the Categories module).
- Card header: icon chip, title, **count pill = total websites in the category** (e.g. "86 Sites", not "10").
- Rows 1–10 ordered by the admin's display sequence (`rankKey`), fallback by star count (Section 9).
- Footer button label **"View All"** (single arrow icon, no text arrow) → `/category/{slug}`. Keep the improved hover/loading animation from the previous iteration. If a category has ≤ 10 sites, still show the button only when `total > 10`; otherwise hide it (card ends cleanly).
- **Mobile:** the list inside each card becomes **a single column** (10 rows). Reason: larger fonts + inline expansion need full width (log in `DECISIONS.md`). Grid for cards: `repeat(auto-fit, minmax(min(100%, 420px), 1fr))` so columns adapt to available width (1 on mobile/tablet portrait, 2 laptop/desktop, 3 on ≥1920).
- Category page (`/category/[slug]`) shows **all** websites (paginated 30 per page), default sort "Featured order", 1–3 list columns by container width (see responsive rules).
- **Popular page** (`/popular`): **ranked by stars** (Section 9) — same UI as today (top-3 highlight + numbered list), only the data/flow changes; each row shows the star count; tie-breaker: recent star velocity, then name.

---

## 7. WEBSITE ROW: ARROW BUTTON + ANIMATED DROPDOWN (images 4–6 flow)

### 7.1 Row anatomy (Home cards, category pages, New, Popular, search results)
`[rank] [favicon 24px] [name (link)] [tags: NEW / DOWN badges] ……… [★ 1.2K] [chevron ▾]`

- **Name** → `<Link href="/site/{slug}">` (detail page, Section 8). Hover underline, focus ring.
- **Chevron button** (44×44 hit area, icon 20px) toggles the inline panel. `aria-expanded`, `aria-controls`, label "Show details for {name}".
- **Star count** (star icon + abbreviated number, 14–15px) is visible on ≥480px; below that it moves inside the panel to keep names readable.
- The old external-link icon is removed from rows (opening happens inside the panel and detail page). Row click on empty space does nothing (avoid accidental actions); the chevron is the toggle. (Optionally the whole row toggles on tap for mobile: flag `rows.tapToToggle`, default off.)
- Row height: 44px desktop, 48px mobile.

### 7.2 Expanded panel (animated)
Opens **under the row, inside the card**, pushing rows down. Single-open per card (opening another closes the previous; configurable).

Layout (desktop/laptop ≥ 768): two columns
- **Left (≈60%)**
  - **Description** (3–4 lines, clamp with "Read more" → detail page).
  - **Highlights list**: up to 5 pros as `+` lines in green (`--ok`), up to 3 cons as `−` lines in red (`--bad`) (from `pros[]`/`cons[]`).
  - **Note** line (muted) if present.
- **Right (≈40%) — Domains & Mirrors**: vertical list of domain buttons (label like `.bz`, `.wtf`, `mirrors`, or hostname; status dot + response ms; link icon). Click opens that domain (new tab, `rel="noopener noreferrer nofollow"`, click counted). Show **first 6** (fastest/primary first); if more: "View all {N} domains →" → `/site/{slug}#domains`. If unlimited domains, never render more than 6 here.
- **Footer row** of the panel: **Star button** (★ count, toggles +1/remove), **Visit website** (primary, opens fastest online domain), **View details →** (link), **Share** (copy link), **Report** (opens report dialog).
Mobile (<768): single column in this order: description, highlights, domains, actions (buttons full-width stacked or 2-up).

### 7.3 Behavior and data
- **Lazy load**: on first expand call `GET /public/websites/:slug/preview` (cached 60s) returning `{ description, pros, cons, note, domains: first 6 + total, starCount, viewer: { starred }, fastestDomain }`. Prefetch on hover/focus (desktop) and on touchstart. Chevron shows a small spinner while loading; skeleton lines in the panel; error state with Retry.
- Home payload stays light (rank, name, favicon, starCount, flags only).
- **Animation (Framer Motion):** `AnimatePresence` + height auto (`initial {height:0, opacity:0}` → `animate {height:'auto', opacity:1}`, 240ms ease-out; exit 180ms), chevron rotates 180° (200ms), content fades/slides up 6px with 40ms stagger between left/right columns. Reduced motion: instant toggle, no rotation. No layout shift for rows below beyond the expected push (use `layout` carefully, avoid jank).
- Deep link: `?open={slug}` expands that row on load (used by share links).
- Keyboard: `Enter/Space` toggles, `Esc` closes and returns focus to the chevron, `Tab` flows into the panel content.

---

## 8. WEBSITE DETAIL PAGE `/site/[slug]` (images 4 and 5, in our design)

Replaces the earlier domains drawer (the drawer and `?site=` param are removed; "View all domains" goes here).

### 8.1 Structure (top to bottom)
1. **Breadcrumb**: `Home / {Category} / {Website}` (visible here; JSON-LD too).
2. **Main card** (accent border of the category, same card language):
   - **Header row**: favicon (36–40px), **H1 website name**, rank badge **"#3 in OTT Platforms"** (pill; position in the category's display order), right side: **★ Star button with count**, Share, **Visit website** (primary).
   - **Two-column body** (desktop; stacked on mobile):
     - **Left:** description (full), **Highlights** (green `+` pros, red `−` cons), **Note**.
     - **Right: "Domains & Mirrors"**: list of domain buttons (label, status dot, ms, link icon, copy button), primary pinned first then owner-defined order; **search box** + status filter appears when > 8; scroll area max 420px; **"Load more"/infinite** for unlimited domains (reuse paged API); "Open fastest mirror" button on top; last checked time.
   - **Screenshots** strip (up to 6, horizontal scroll/carousel, click → lightbox with keyboard navigation, lazy loaded, alt text) if the owner uploaded any.
   - **Details grid**: Category, Tags, Language, Content rating, Added, Last updated, Last verified, Domains (N, M online).
3. **User Reviews card**: header "User Reviews {count}" + **Write review** button; **sentiment tabs** Positive / Mixed / Negative with a proportional segmented bar (green/grey/red from tokens) and counts; **sort** (Newest, Oldest); review items: generated or chosen nickname (e.g. `guest.7f3a`), relative time, sentiment badge, text, "edited" marker; "Load more". Empty state: "Be the first to review". (Comments threads are **not** included.)
4. **More in {Category}**: 6 related website rows/cards.
5. **Actions**: Report broken link / Report this website (opens existing dialog), "Own this website? Claim/Get listed" link to contact.

### 8.2 Write review (dialog)
Fields: sentiment (3 radio pills), text (20–1000 chars, live counter), optional nickname (default auto-generated), honeypot + invisible Turnstile, submit. One review per person per website (editable afterwards). Rules and moderation in Section 9.4.

### 8.3 SEO
Unique title/description, canonical, OG image (logo + site name + category), `WebPage` + `BreadcrumbList` JSON-LD (no fake `aggregateRating`), outbound links `nofollow`, server-rendered, ISR with revalidation on edits/stars (stars debounced: revalidate at most every 5 min).

### 8.4 Responsive
Desktop two columns inside a centered max-width container (≤1100px); tablet same with narrower columns; mobile single column, sticky bottom action bar (Star + Visit website) appears after scrolling past the header.

---

## 9. STARS (one per person) AND REVIEWS

### 9.1 Rules
- Every visitor can give a **star to a website once**: +1 only; pressing again **removes** their star (toggle). Never more than one per person per website.
- Star count is shown on rows (abbreviated, e.g. 1.2K), in panels and on the detail page.
- Anyone can star without an account (low friction), protected by the identity and abuse controls below. Architecture supports an optional **account mode** later (`STAR_IDENTITY_MODE=cookie|account`).

### 9.2 Voter identity (be honest about limits)
- On first need the API sets a **signed, httpOnly, Secure, SameSite=Lax cookie** `fl_vid` (random UUID, 400-day expiry) and creates a `Voter` row. One star per `(websiteId, voterId)` enforced by a **unique DB constraint**; the endpoint is idempotent.
- Secondary signals (anti-abuse, not for identification): `ipHash` and `uaHash` (HMAC with a rotating secret, retained 90 days), request timing. Do **not** hard-block by IP (shared mobile networks are common); use them for rate limits and anomaly flags.
- Clearing cookies can create a new identity, so mitigate: **rate limits** (e.g. ≤ 40 star changes/hour per voter, ≤ 120/hour per IP hash), invisible **Cloudflare Turnstile** token required after N actions or when risk score is high, burst/anomaly detection (many stars to one site in a short time from new voters → flag), CORS/Origin checks, honeypot.
- Admin tools (panel): per-site star log summary, flag/remove suspicious stars, freeze star counts for a site, bulk purge by voter/IP-hash. Document the residual risk in `DECISIONS.md` and the option to switch to account mode.

### 9.3 API and data
- Tables: `Voter(id, createdAt, lastSeenAt, riskScore, flagged)`, `Star(id, websiteId, voterId, createdAt, ipHash, uaHash)` with `UNIQUE(websiteId, voterId)`, `WebsiteStarDaily(websiteId, day, delta)` for range ranking, `Website.starCount` (denormalized, indexed `(categoryId, starCount DESC)` and `(starCount DESC)`), `Review` (below).
- `PUT /public/websites/:id/star` → set starred (idempotent) → `{ starCount, starred: true }`; `DELETE` → `{ starCount, starred: false }`. Both in one DB transaction updating `Star`, `starCount`, `WebsiteStarDaily`. Responses `Cache-Control: no-store`.
- `GET /public/websites/:slug/preview` and `GET /public/websites/:slug` include `viewer.starred` (from the cookie) — never in list endpoints (performance).
- Nightly reconcile job recomputes `starCount` from `Star` and alerts on drift. Cache invalidation via tags; ISR revalidation debounced.
- **Popular ranking:** `GET /public/popular?range=all|30d|7d&category=&page=&limit=` orders by star count (for 30d/7d: sum of `WebsiteStarDaily`), tie-break by recent velocity then name; cached 5 min.

### 9.4 Reviews
- `Review(id, websiteId, voterId, sentiment POSITIVE|MIXED|NEGATIVE, body, displayName, status APPROVED|PENDING|REJECTED|SPAM, createdAt, editedAt)` with `UNIQUE(websiteId, voterId)`; website keeps cached sentiment counts.
- Endpoints: `GET /public/websites/:slug/reviews?sentiment=&sort=&cursor=`, `POST /public/websites/:slug/reviews`, `PATCH` (own review). Rate limits (≤ 5 new reviews/day per voter), Turnstile, honeypot, length checks, **plain text only** (escape on render), link/profanity/duplicate filters; suspicious reviews go to `PENDING`; setting `reviews.autoApprove` (default on with filters).
- **Admin panel:** new **Reviews** module (list with filters, approve/reject/spam/delete, bulk actions, permission `review.view|moderate`), plus owner-visible read-only reviews list.
- Feature flag `reviews.enabled` (default on) so the client can switch the section off without code changes.

### 9.5 Content fields for the panel (owner/admin edit)
Add to **My Website**/Website edit: `description` (markdown, sanitized), `pros[]` (max 8 items, 100 chars each), `cons[]` (max 5), `note` (200 chars), `screenshots[]` (max 6; upload → re-encode WebP ≤ 1600px, strip EXIF, alt text, drag to reorder), with a live preview of the expanded panel.

---

## 10. FLOW MAP (what the user experiences)

1. **Home**: category tile section → category cards (10 sites + View All).
2. Tap **chevron** on a row → animated panel: description, highlights, 6 domains, ★, Visit, View details.
3. Tap **website name** → `/site/{slug}` full detail (domains, screenshots, reviews).
4. Tap **View All** / a **tile** / a **sidebar item** → `/category/{slug}` (clean header + search + dropdown, full list).
5. **Categories** tab → neon tile grid. **Popular** tab → stars ranking.
6. **★** anywhere → +1 (toggle), counts update instantly with optimistic UI.

---

## 11. TYPOGRAPHY: MEDIUM, READABLE SIZES EVERYWHERE

Problem: current text is too small. Introduce a **type scale in tokens** and replace all ad-hoc sizes.

| Token | Size | Use |
|---|---|---|
| `--fs-xs` | 13px (0.8125rem) | Minimum allowed: tags, badges, helper text |
| `--fs-sm` | 14–15px | Secondary text, pills, table-like meta |
| `--fs-base` | **16px** | Body, row names, sidebar items, inputs, buttons |
| `--fs-md` | 17–18px | Card subtitles, tile labels, nav pills |
| `--fs-lg` | 20–22px | Card titles |
| `--fs-xl` | 24–28px | Section/page titles (mobile) |
| `--fs-2xl` | clamp(28px, 3vw, 36px) | H1 desktop |
| `--fs-3xl` | clamp(32px, 4vw, 44px) | Categories page title |

Specifics: sidebar items 15–16px; header nav 15–16px/600; row name **16px/500**, rank number 14–15px; tags 13px; count pill 14px; View All button 16px/600; inputs 16px (also prevents iOS zoom); footer 15px; panel text 15–16px; line-height 1.5 (body) / 1.2 (headings). Row height 44px desktop / 48px mobile; favicon 24px; icons 18–20px (22–24px in tiles); tap targets ≥ 44px.

Implementation: root `font-size: 100%` (respect user settings), all sizes in `rem`, Tailwind theme extended with these tokens, **ban** arbitrary `text-[10px|11px|12px]` and `font-size` < 13px through an ESLint rule/Stylelint check, and add `scripts/font-audit.ts` (Playwright): load every page at 390, 768, 1280, 1920 and fail if any visible text node has computed font-size < 13px or body text < 16px. Re-check layouts so nothing truncates badly (ellipsis with `title` tooltips), cards still fit, and header nav fits at 1024 (collapse labels to icons only below 900px if needed).

---

## 12. RESPONSIVENESS (all screens)

| Range | Behavior |
|---|---|
| ≥1920 | Container max 1800px; Home cards 3 columns; tiles 8/row; category list 3 columns |
| 1280–1919 | Sidebar 240px; Home cards 2 columns; tiles 6/row; category list 2–3 columns (container query) |
| 1024–1279 | Sidebar 220px; cards 2 columns where each ≥ 420px else 1; tiles 4–6 |
| 768–1023 | Sidebar becomes icon rail/drawer; cards 1–2 columns; tiles 4; header nav compact; filter popover |
| 480–767 | Mobile chrome: compact header, **bottom nav** (Home, Categories, Popular, Requests), cards 1 column, list 1 column, tiles 3/row, Categories page 2 columns, filter as bottom sheet |
| 320–479 | Same, type stays ≥ 13px (do not shrink body below 16px), star count moves into panel, bottom bar labels 11–12px **only** for bottom nav (allowed exception documented), Categories tiles 2 columns with 2-line labels |

Techniques: container queries, `dvh`, safe-area insets, no horizontal scroll (CI check), `clamp()` type only within the scale, images/favicons with fixed dimensions, text zoom to 200% without breakage. Verification matrix: widths 320, 360, 375, 390, 414, 430, 540, 600, 768, 820, 912, 1024, 1180, 1280, 1366, 1440, 1536, 1920, 2560; portrait and landscape; both themes. Attach screenshots in `docs/ui/v3/`.

---

## 13. TESTS (Playwright E2E + API tests)

1. **Home:** tile section on top (counts per breakpoint), no hero/banner; each card shows exactly 10 rows and count pill = total; "View All" visible only if total > 10; View All → `/category/{slug}` with sidebar item active.
2. **Categories page:** 5 columns at 1440, 2 at 390; "All Links" first tile; tile click navigation; light theme variant renders.
3. **Headers:** on `/category/*`, `/new`, `/popular` at 390/768/1280/1920 assert **absence** of banner, toggle, helper line, visible breadcrumb; presence of H1, search, one dropdown; alignment (toolbar edges equal list edges); dropdown options work and sync to the URL.
4. **Row expand:** chevron toggles panel with animation (height transition observed), `aria-expanded` correct, single-open per card, lazy preview fetch once (cached), description + pros/cons + ≤ 6 domains + actions visible; "View all N domains" → detail `#domains`; name click → detail page; keyboard (Enter/Esc/Tab).
5. **Stars:** first click +1 (optimistic) then persisted after reload; second click removes; repeated PUT does not exceed 1; two tabs same voter stay consistent; cleared cookie scenario hits rate limits/Turnstile paths; cache/ISR updates; Popular page order matches star counts (and range filter); unique constraint tested at DB level.
6. **Detail page:** all sections render; domains list pages/searches for 120 seeded domains; screenshots lightbox; rank badge; related sites; metadata/JSON-LD valid.
7. **Reviews:** write (validation, one per person, edit), sentiment tabs/counts, moderation path (PENDING → approved in admin), flag off hides section.
8. **Typography:** `font-audit` passes at all viewports; computed body size 16px.
9. **Responsive:** matrix screenshots, no horizontal scroll, bottom nav on mobile, touch targets ≥ 44px.
10. **A11y/perf:** axe no critical/serious; Lighthouse mobile ≥ 90 Performance, ≥ 95 Accessibility on Home, Category, Site detail; INP < 200ms on expand; CLS < 0.1.
11. **Link audit** (from previous iteration) still passes; brand audit passes.

---

## 14. EXECUTION PHASES (stop after each for approval)

**Phase 1 — Type scale + PageHeader (Sections 11, 5):** tokens, lint/font audit, replace sizes across the site, build `PageHeader`, remove banners/toggle/helper/breadcrumb from list pages. *Accept:* tests 3, 8 green; before/after screenshots.

**Phase 2 — Categories page + Home tile section (Sections 3, 4):** seed/merge categories, tile components, Categories page, Home top section. *Accept:* tests 1 (tile part), 2.

**Phase 3 — Home 10 + View All + listing flow (Section 6):** `homeLimit` migration, mobile single-column lists, View All button, category page sorting/default order, API updates. *Accept:* test 1 complete.

**Phase 4 — Backend for stars, preview, detail, reviews, popular (Section 9 + endpoints):** migrations, services, rate limits, Turnstile, jobs, admin moderation endpoints. *Accept:* API-level parts of tests 5–7.

**Phase 5 — Row chevron + animated panel + star UI (Section 7):** component, lazy preview, animation, optimistic stars. *Accept:* tests 4–5.

**Phase 6 — Detail page + reviews UI + screenshots (Section 8):** page, domains list, lightbox, reviews dialog, SEO. Panel: owner/admin fields for pros/cons/note/screenshots, admin Reviews module and star tools. *Accept:* tests 6–7.

**Phase 7 — Popular by stars + final responsive/a11y/perf pass (Sections 6, 12):** *Accept:* tests 9–11, full matrix.

---

## 15. DELIVERABLES

Updated web app and API; migrations and seeds (new categories, `homeLimit=10`, star/review tables, backfilled `starCount`); updated panel screens for new content fields and moderation; new shared components (`PageHeader`, `CategoryTile`, `CategoryTileStrip`, `SiteRow`, `SiteExpandPanel`, `StarButton`, `ReviewList`, `ReviewDialog`, `DomainList`); `font-audit` script; test reports and screenshots; updated docs (`docs/ui/v3/`, `DECISIONS.md`, `API.md`).

---

## 16. CONFLICTS WITH EARLIER PROMPTS AND DECISIONS TO LOG

1. Banner/hero blocks and the All/Has-Mirrors toggle are removed on all list pages (overrides earlier "category view header" spec).
2. Row external-link icon replaced by chevron + name link; the **domains drawer is removed** (inline panel + detail page replace it; `?site=` param dropped).
3. Home cards show **10** sites (was 15) and the button is "View All" (was "View More").
4. Mobile cards use a **single-column** list (was two columns) and the mobile category chip row is replaced by the Home tile section + Categories page + bottom nav.
5. Popular ranks by **stars** (was click/popularity score).
6. Star identity uses a signed cookie + abuse controls (no visitor accounts); account mode is a future option.
7. Reviews included behind a feature flag; comment threads excluded.
8. Rank badge = position in the category's current display order.
9. New categories from the reference seeded inactive; near-duplicates merged with 301 redirects.
10. Bottom-nav labels may use 11–12px (only exception to the 13px minimum) — confirm with client.

---

## START NOW

Begin with **Phase 1**: add the type-scale tokens and the font-audit script, run the audit to list every violation, convert the codebase to the new scale, create `PageHeader` and remove the banner, toggle, helper text and visible breadcrumb from `/category/[slug]`, `/new` and `/popular`. Capture before/after screenshots at 390, 768, 1280 and 1920 in both themes, run tests 3 and 8, then stop and report before starting Phase 2.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-11-23T17:08:15+05:30.

The user has uploaded 7 image(s):
- C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/.user_uploaded/media_1795432510108_24527a28.png
- C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/.user_uploaded/media_1795432516230_7dad564f.jpg
- C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/.user_uploaded/media_1795432528817_b0ff56cc.jpg
- C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/.user_uploaded/media_1795432549259_f5f163e2.jpg
- C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/.user_uploaded/media_1795432553366_00ebf363.jpg
- C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/.user_uploaded/media_1795432570821_3d7c07ab.jpg
- C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/.user_uploaded/media_1795432580023_798e4b41.jpg
You can embed these images in an artifact if you need the USER to review them.
</ADDITIONAL_METADATA>