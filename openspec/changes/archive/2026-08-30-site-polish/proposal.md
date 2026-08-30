# Proposal: site-polish — the docs-site defects from the 2026-08-30 walkthrough

## Why

The built-in-browser walkthrough (2026-08-30, findings in
`.agents/audit/2026-08-30-site-walkthrough/walk-findings.md`) plus the
whole-site page audit (`audit-pages.md`) surfaced a set of site-level
defects that are individually small but collectively break the
"dogfooded by this site" promise (Law 03). Install-chain issues live in
the registry-install-integrity change; this change owns the site
surface.

## What Changes

- **F4 · date-picker demo prints a literal `undefined`**: the
  "review (locale display)" demo renders `display locale · value:
  undefined` before a value is picked. Empty value displays the em
  dash (the library's own empty-cell semantics), never a JS literal.
  Applies to EVERY docs demo that interpolates a `$bindable` value into
  text (sweep, not spot-fix).
- **F5 · the dev server cannot serve `/r/*.json`**: dev (apps/www vite)
  404s every registry JSON, so the footer "Registry JSON" link, the
  Docs-dropdown "registry.json" link, and the registry-overview table
  links are all dead in development. `dev-site.mjs` gains a static
  fallback that maps `/r/` onto the repo-root `public/r/` when the
  file is missing from the www asset space (and `/registry.json`
  alias included).
- **F6 · toast burst demo copy is self-contradictory**: the demo pushes
  toasts TITLED "queued N / older ones wait their turn" while four of
  them are the VISIBLE ones. The burst demo gets honest titles
  ("Deployed #N"), and the viewport gains a `+N queued` tail indicator
  (the market-standard stack-count affordance) so queueing is visible
  without lying about which toast is queued.
- **F7 · parity page has no attribution**: `/parity.html` renders a
  bare component grid with no docs nav, no title context, and no
  noindex — a published orphan. It gets the standard chrome plus a
  `noindex` meta (internal verification surface, same class as
  `/probe-folder-css` and `/blueprints.html`).
- **F8 · blueprints satori tiles overlap text**: the toc-engine tile
  draws "→ the line" over "#below weight 0"; the list-item tile clips
  at the right edge. Satori scene canvas/typography params fixed
  (measure-then-fit), and `verify:trygrid`/blueprint checks extended to
  fail on text overflow in the scenes.
- **F10 · audit-derived page-structure drift** (from audit-pages.md,
  2026-08-30, 41 pages flagged of 79):
  - `dialog` and `sheet` pages are STRUCTURALLY GUTTED — no component
    H2, no PLAYGROUND/Usage/Accessibility sections (density + API
    only). Full rebuild of both pages to the standard skeleton.
  - 18 pages duplicate the `Usage` H2 (systemic — template or
    copy-paste generation); one Usage section each.
  - 8 pages (checkbox, radio, toggle, range, native-select, textarea,
    color-picker, scroll-area) lack the standard "component-name H2 +
    PLAYGROUND" opening.
  - Demo-state heading LEAKAGE: `result` (10 H2s like DEPLOYED / BUILD
    FAILED), `section-card` ("Acquire a Backend." ×4), `alert-dialog`
    ("delete the pipeline?" ×4), `component-canvas` ("canvas" ×4),
    `popconfirm`/`tour` (status-suffixed first H2) — demo content must
    never emit real headings (see docs-demo-standard's lint).
  - `<title>` case drift on 5 pages (code-card, table, tree-view,
    ghostty-term, component-canvas); toc mixes "usage"/"Usage".
- **F12 · the avatar demo ships dead image srcs**: `/favicon.png`
  404s (serving 418KB of SPA-fallback HTML) because the avatar page's
  demos USE it as a demo image src (avatar `+page.svelte:63,119,122,
  218`). The site icon itself is fine — `app.html` references
  `%sveltekit.assets%/icon.svg` and `static/icon.svg` exists. The four
  demo srcs switch to real images (or `/icon.svg`), and the avatar
  page's fallback demo keeps its deliberately-missing src (that one is
  the error-state demo).

## Layering

- `apps/www/src/routes/**` (demo pages), `apps/www/src/lib/**`
  (demo snippets), `scripts/dev-site.mjs`.
- `registry/files/ui/toast/toast-viewport.svelte` (queued-count
  indicator — the ONE registry-file touch, mirrored per mirror-sync).
- `scripts/build-blueprints.mjs` scenes + its verify hook.
- New `scripts/verify-docs-structure.mjs` wired into `verify:all`.

## Risks

- The toast viewport change touches a registry file — the mirror
  manifest re-record must ride the same commit (`verify:mirror`).
- The dev-server `/r/` fallback must never shadow the production
  pipeline (build-site.mjs remains the only writer of `public/r/`).
