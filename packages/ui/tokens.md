# FindFunLinks — Design Tokens Reference (Sampled & Measured)

This document records the exact measured token values sampled from the approved client reference images (`docs/design-reference/desktop-home.png` and `docs/design-reference/mobile-home.png`).

---

## 1. Core Surfaces & Base Theme (Dark - Default)

| Token Name | CSS Variable | Sampled Hex | Purpose |
|---|---|---|---|
| Background Canvas | `--bg` | `#050A18` | Deep flat navy page canvas |
| Header Surface | `--header` | `#070D1E` | Full-width sticky top navigation bar |
| Sidebar Surface | `--sidebar` | `#070D1E` | Vertical category navigation rail |
| Card Surface | `--card` | `#0A1226` | Category cards, modals, table surfaces |
| Card Hover | `--card-hover` | `#0E182F` | Hover state for interactive list rows |
| Neutral Border | `--line` | `#1A2442` | Header separator, sidebar border, subtle dividers |
| Primary Text | `--text` | `#F1F5F9` | Card headings, site titles, primary labels |
| Secondary Text | `--text-2` | `#A8B3C7` | Form labels, table headers, descriptions |
| Muted/Faint Text | `--text-3` | `#6B7893` | Number markers (1–15), count pills, icons |

---

## 2. Brand & State Colors

| Token Name | CSS Variable | Sampled Hex | Purpose |
|---|---|---|---|
| Primary Brand | `--primary` | `#2563EB` | Active nav pill fill, primary CTA buttons |
| Primary Hover | `--primary-hover` | `#1D4ED8` | Hover state for primary buttons |
| Brand Link | `--brand-link` | `#3B82F6` | "Links" in FindFunLinks wordmark |
| Focus Ring | `--focus-ring` | `rgba(59, 130, 246, 0.6)` | Keyboard accessibility focus indicator |
| Status OK | `--ok` | `#22C55E` | Active mirrors, healthy response times |
| Status Warn | `--warn` | `#F59E0B` | Degraded latency, pending items |
| Status Bad | `--bad` | `#EF4444` | Inactive mirrors, rejected items, errors |

---

## 3. Category Accent Palette (Card Borders, Chips & Glows)

Sampled from reference images with peak saturation and hue analysis:

| Category Card | Token Name | Accent Hex | Glow Box-Shadow |
|---|---|---|---|
| **OTT Platforms** | `--accent-purple` | `#8B5CF6` | `0 0 28px -8px rgba(139, 92, 246, 0.45)` |
| **Movies** | `--accent-blue` | `#3B82F6` | `0 0 28px -8px rgba(59, 130, 246, 0.45)` |
| **TV Shows** | `--accent-gold` | `#EAB308` | `0 0 28px -8px rgba(234, 179, 8, 0.45)` |
| **Anime Streaming** | `--accent-red` | `#EF4444` | `0 0 28px -8px rgba(239, 68, 68, 0.45)` |
| **Sports** | `--accent-sports` | `#2563EB` | `0 0 28px -8px rgba(37, 99, 235, 0.45)` |
| **Live TV** | `--accent-livetv` | `#7C3AED` | `0 0 28px -8px rgba(124, 58, 237, 0.45)` |
| **Music** | `--accent-music` | `#9333EA` | `0 0 28px -8px rgba(147, 51, 234, 0.45)` |
| **Games** | `--accent-green` | `#14B8A6` | `0 0 28px -8px rgba(20, 184, 166, 0.45)` |
| **Software** | `--accent-cyan` | `#06B6D4` | `0 0 28px -8px rgba(6, 182, 212, 0.45)` |
| **Tools** | `--accent-tools` | `#F59E0B` | `0 0 28px -8px rgba(245, 158, 11, 0.45)` |
| **Documentaries** | `--accent-docs` | `#6366F1` | `0 0 28px -8px rgba(99, 102, 241, 0.45)` |
| **Educational** | `--accent-edu` | `#22C55E` | `0 0 28px -8px rgba(34, 197, 94, 0.45)` |
| **Ebooks** | `--accent-ebooks` | `#10B981` | `0 0 28px -8px rgba(16, 185, 129, 0.45)` |
| **Comics** | `--accent-comics` | `#0EA5E9` | `0 0 28px -8px rgba(14, 165, 233, 0.45)` |
| **Podcasts** | `--accent-orange` | `#F97316` | `0 0 28px -8px rgba(249, 115, 22, 0.45)` |
| **Theatre** | `--accent-theatre` | `#A855F7` | `0 0 28px -8px rgba(168, 85, 247, 0.45)` |
| **Kids & Family** | `--accent-kids` | `#FACC15` | `0 0 28px -8px rgba(250, 204, 21, 0.45)` |
| **Others** | `--accent-others` | `#64748B` | `0 0 28px -8px rgba(100, 116, 139, 0.45)` |

---

## 4. Typography Hierarchy

- **Headings & Brand:** `Poppins`, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
  - Card Titles: `18px` – `20px`, weight `700` (Bold)
  - Navigation Pills: `14px`, weight `600` (SemiBold)
  - Footer Tagline: `13px` – `14px`, weight `500`
- **List Text & Interface:** `Inter`, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
  - Site Names: `13px` – `14px`, weight `500` (Medium)
  - Item Numbers (`1.` – `15.`): `12px` – `13px`, weight `400`, color `--text-3`
  - Pill Tags / Badges: `11px` – `12px`, weight `600`

---

## 5. Geometry & Sizing Rhythm

- **Radii:**
  - Card Radius: `16px` (`rounded-2xl` / `rounded-[16px]`)
  - Nav Pills & Category Chips: `12px` (`rounded-xl` / `rounded-[12px]`)
  - Buttons ("View More →"): `10px` (`rounded-[10px]`)
  - Badges & Search Button: `9999px` (`rounded-full`)
- **Spacing:**
  - Card internal padding: `16px`
  - Row height: `30px` – `32px` (desktop), `32px` – `34px` (mobile touch target)
  - Grid gutters: `16px` – `20px`
  - Favicon dimensions: `20px × 20px`, rounded `4px`
