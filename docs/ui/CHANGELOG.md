# UI Redesign Changelog — FindFunLinks Main Website

## Overview

Presentation-layer refactor of `apps/web` elevating the design from generic "AI-generated" dark theme to a handcrafted, tactile, and responsive directory experience inspired by EverythingMoe and modern developer craft.

## Baseline

- Captured before-state screenshot: `docs/ui/before/home-dark-desktop.png`
- Core layout structure preserved (Sidebar, TopNav, Info Banner, Quick Category Tiles, 2-Column Section Cards, Simple Index).

## Components Touched

1. `apps/web/src/app/globals.css` — Warm ink & warm paper design tokens (CSS variables), typography rules, noise texture, and custom animations.
2. `apps/web/src/app/layout.tsx` — Next.js Google Fonts (`Bricolage_Grotesque`, `JetBrains_Mono`), top scroll progress bar, and Command Palette provider.
3. `apps/web/tailwind.config.ts` — Design token mapping (colors, surfaces, fonts, radii, section accents).
4. `apps/web/src/components/reactbits/` — Modular ReactBits components (`SpotlightCard`, `ShinyText`, `CountUp`, `SplitText`, `Magnet`, `ClickSpark`).
5. `apps/web/src/components/Sidebar.tsx` — Real SVG brand logo, collapsible 72px icon rail with tooltips, scroll-spy active indicators, live count badges, mini circular fleet health meter.
6. `apps/web/src/components/TopNav.tsx` — Command palette trigger (`Ctrl+K`), magnetic Submit CTA, animated theme toggle, trust shield popover.
7. `apps/web/src/components/DirectoryView.tsx` — Info banner with CountUp stats, Quick Category Spotlight tiles, Discovery Rails (Trending, Editor's Picks, Recently Verified), View mode switcher.
8. `apps/web/src/components/CategoryRankCard.tsx` — 2px section accent bar, real favicons, quiet sentence-case tags, smart mirror picker ("Open fastest mirror"), Framer Motion accordion.
9. `apps/web/src/components/SimpleIndexView.tsx` — Enhanced alphabetical table index with search and letter bar.
10. `apps/web/src/components/CommandPalette.tsx` — Quick jump command palette with keyboard navigation (`⌘K`).
11. `apps/web/src/components/BackToTop.tsx` — Circular SVG scroll-progress ring button.
12. `apps/web/src/components/ShortcutsModal.tsx` — Keyboard shortcuts cheat sheet (`?`).
13. `apps/web/src/lib/favorites-context.tsx` — LocalStorage favorites & recently visited tracking.
