---
name: jixoai-website
description: Build or restyle any jixoai project website (unipty, openspecui, future projects) in the shared jixoai visual identity — terminal/neo-brutalist mono-first design with SvelteKit + Tailwind v4. Use whenever the user asks to create, redesign, restyle, or improve a project website, landing page, docs site, or compatibility/evidence page for any jixoai-labs project, or mentions "jixoai website style", "官网", or asks for a site matching openspecui's look.
---

# jixoai Website Style

All jixoai project websites share ONE identity: a terminal / neo-brutalist,
mono-first design delivered by the `@jixoai` registry (publisher
`jixoai-ui`, canonical site <https://ui.jixoai.com>). **The only per-project
variable is the brand hue.** Everything else — tech stack, token
architecture, layout patterns, motion language — is shared law. For
component API ground truth read the registry's own site source at
`../ui/apps/www/src` (composition-first, current generation). The
openspecui website was the pre-registry hand-written reference; since
2026-09-06 it is itself a registry consumer like every other site, so
prefer `ui/apps/www` (and any site's `jixoai-ui.lock`) over it.

## The One-Hue Law

Colors are defined in **OKLCH**, mirroring the reference configuration's
lightness/chroma exactly; a project's identity is one CSS variable:
`--brand-hue` (an oklch hue in degrees, live inside `oklch()` via
`var()`/`calc()`). Two jixoai sites must never differ in anything except
this hue (and content). An HSL formulation was tried and rejected on
2026-08-20 — sRGB HSL S/L is hue-dependent and distorts perceived weight;
do not reintroduce it.

| Project | Brand hue (oklch) | Dark drift (−4°) | Rendered light primary | Icon hex |
| ------- | ----------------- | ---------------- | ---------------------- | -------- |
| openspecui | `27` | `23` | its red | its own |
| unipty | `165` | `161` | `#007924` 幽绿 (phosphor green) | `#007924` |
| jixoai.com | `0` | `0` (−4 kept at 0 family red) | org red | its own |
| ui (registry site) | `330` wall-clock rotating | — | — | — |
| opentray | `222` | `218` | `#00a6f4` | `#00a6f4` |
| iweb (openiweb) | `253` | `249` | `#008bff` | `#008bff` |
| dweb (opendweb) | `95` | `91` | `#bd8600` | `#bd8600` |

Hues are sourced from the project's OWN logo (sample dominant saturated
colors, convert to oklch hue); `dweb` moved 87→95 on 2026-09-06 when the
Owner pinned a different logo variant — re-derive the hue whenever the
logo changes.

Setting a project's identity means setting one CSS variable; never fork
the palette per project. Functional colors (secondary, accent, chart
colors, diff add/del, neutrals) keep the reference's FIXED oklch values
across projects so the brand hue stays meaningful.

## Workflow

0. **Bootstrap from the official registry** (preferred over hand-copying):
   `npx jixoai-ui init --hue <project hue>` in the site package — registers
   the `@jixoai` namespace in components.json, installs `jixoai-theme` (the
   token sheet of design-tokens.md, published verbatim from this repo) and
   applies the brand hue. ALWAYS also `npx jixoai-ui add scrollbar-measure`
   and `import '@lib/scrollbar-measure';` once in the root layout: it
   publishes the measured per-OS scrollbar widths feeding the scrollbar
   law's padding compensation. Components come the same way:
   `npx jixoai-ui add toc` / `press-button` / `section-card` /
   `terminal-header` / `terminal-footer` / `theme-toggle`. The registry at
   <https://ui.jixoai.com> is the canonical source; this skill's references
   remain the law when the registry lags or a project needs bespoke pieces.
1. Read `references/design-tokens.md` — the full token sheet template and
   the hue derivation rules (what `jixoai-theme` installs).
2. Read `references/tech-stack.md` — the required stack, then adapt the
   deployment target to the project (reference deploys to Cloudflare
   Pages; unipty deploys to GitHub Pages via workflow). Content pipelines
   vary per project (e.g. unipty's site consumes an immutable release
   catalog artifact) — keep those seams, restyle around them.
3. Read `references/layout-patterns.md` — header terminal bar, hero
   SectionCard, press buttons, ghost footer wordmark. Reuse the component
   composition, not the content.
4. Read `references/motion.md` — scroll reveal, press physics, and the
   reduced-motion law. Motion is restrained: two patterns total.
5. Read `references/llms-txt.md` — the AI-facing export layer. Every
   jixoai site ships `llms.txt` / `llms-full.txt` / per-page `.md`
   mirrors: `npx jixoai-ui add llms-txt` (installs
   `vite-plugins/llms-txt.mjs`), then ONE generation point — the vite
   plugin for plain-build sites, or a final-orchestration
   `generateLlmsTxt(distDir, config)` call for orchestrated builds.
6. Implement, then run the verification checklist below.

## Sub-agent feedback protocol

When a sub-agent implements this skill, it MUST end its report with a
friction log: every point where the skill was unclear, incomplete,
contradictory, or impractical for the target project, and how the agent
resolved each one. The orchestrator treats this log as evidence, not
truth — cross-checks it against the actual diff — and feeds real friction
back into this skill before the next sub-agent run.

## Machine + toolchain facts (verified 2026-08-23; extended by the site
## agents of 2026-09-06 and the icon-pipeline round of 2026-09-07)

### The machine (macOS, 16GB, system proxy)

- No GNU `timeout` (a swallowed "command not found" can fake a passing
  check — run commands bare).
- `vite dev` binds IPv6-only localhost and a system proxy intercepts
  plain curl — use `curl --noproxy '*' "http://[::1]:PORT/…"`. Concurrent
  agents MUST pick unique dev ports and must NEVER share `vite build`
  (the orchestrator runs the single integration build).
- The same proxy kills `jixoai-ui`/`shadcn` registry fetches ("other
  side closed", TLS resets). Run EVERY CLI invocation as
  `env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u
  all_proxy -u ALL_PROXY npx jixoai-ui …`. Fake-IP DNS hijack can still
  timeout transiently — retry the single item.

### The registry repo (this repo, as a worktree)

- **`registry/` is a harness, not a runnable app standalone**: its `src/`
  is absent (prepared by verify:all's mirror machinery) — `npm test`
  inside `registry/` fails at startup (missing `src/app.html`, unresolved
  `@jixoai/vite-plugin`) even when everything is healthy. Its suite runs
  INSIDE `npm run verify:all` (registry/test is a local byte-mirror,
  never executed in CI); treat standalone registry runs as unsupported.
- **A fresh worktree needs FOUR installs, and one is pnpm**: root `npm
  install`, `apps/www` npm, `packages/vite-plugin` npm (self-contained
  lock) — and `pnpm install` at the root for `packages/css-laws` (the
  pnpm workspace the npm installs never touch; verify:laws dies on
  `node_modules/.bin/tsx: No such file` without it).
- **Live-wasm specs depend on `/tmp/ghostty-research/ghostty-vt.wasm`**
  (the `JIXOAI_GHOSTTY_WASM_PATH ??` fallback; /tmp gets cleaned). Restore
  from the pin cache: `cp node_modules/.cache/jixoai-ghostty/<pin-sha>.wasm
  /tmp/ghostty-research/ghostty-vt.wasm` — dozens of title/cursor/mouse/
  OSC specs ENOENT-flake without it and it looks like a regression.
- **Full www suite flakes under parallel load on this 16GB machine**:
  heavy page-mount specs (dialog et al.) can blow the 5s timeout when
  other agents/builds run concurrently; they pass isolated. Under load,
  run `npx vitest run --maxWorkers=50%` before diagnosing failures.
- **npm may symlink the file: `@jixoai/vite-plugin` wrong in `registry/`**
  (one level too deep, escaping the worktree) after installs — if vite
  config resolution fails with ERR_MODULE_NOT_FOUND, check
  `registry/node_modules/@jixoai/vite-plugin` points at
  `../../../packages/vite-plugin` and re-link.
- **Registry mirrors under `registry/files/**` follow the registry item's
  TARGET path** (`@ui/x` → `registry/files/ui/x`), not the source-tree
  path — e.g. source `src/lib/toc.css` mirrors to `registry/files/ui/
  toc.css`. Check the item's `files[].path` before syncing.
- **openspec change directories live at the REPO ROOT**
  (`openspec/changes/`), not inside the site package — agents keep
  looking in `packages/www/openspec` first.

### Browser verification from sub-agents

- The browser-use tooling is main-agent-only; subagents CANNOT load it
  ("Browser is not available in subagent"). Two stable local lanes: run
  your own check with `playwright-core` (install in a /tmp dir) against
  the machine-cached Chromium
  `~/Library/Caches/ms-playwright/chromium-*/chrome-mac-arm64/
  Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
  (pass as `executablePath`; version-agnostic), or playwright's cached
  `chrome-headless-shell-*` + CDP `Target.attachToTarget` (flatten).
  Chromium-for-Testing 151 hangs under `--headless=new` on this machine.
- Headless Chromium does NOT render native date-picker popups —
  indicator/picker click tests need `headless: false`.
- **`fullPage` screenshots do NOT capture inner scroll containers** (the
  scaffold scrolls `.jx-shell-body`, not body) — use a tall viewport
  (e.g. 390×5000) for audits, and cross-check long-image findings against
  DOM assertions (vision misreads tiny details).
- jixoai.com redirects `/` by browser language BEFORE first paint — a
  headless run in a zh environment silently measures `/zh/`, not `/`.
  Pin the context locale AND assert `new URL(page.url()).pathname` before
  reading any metric.

## Registry CLI traps (2026-09-06, hit by 3+ agents)

- **Non-interactive `add` can leave items LOCKED BUT NOT INSTALLED**:
  shadcn's overwrite prompt (e.g. on an existing hue-applied
  `jixoai.css`) under piped/EOF stdin cancels the whole write phase while
  the CLI still records the item in `jixoai-ui.lock`. Mitigations: add
  items ONE AT A TIME; move `jixoai.css` aside before adds (the wrapper
  reinstalls + re-applies hue after); after every add verify the files
  actually landed on disk; `printf 'y\n' |` answers a confirm but NOT a
  select-type prompt.
- **Multi-item `add a b c` is unreliable** (namespace prefix only reaches
  the first item in some shells) — one item per command.
- **shadcn ignores the registry item's `target`/aliases**: `@lib/…` and
  `@ui/…` paths land in literal `src/@lib/`, `src/@ui/` directories, and
  `vite-plugins/llms-txt.mjs` lands in `src/vite-plugins/`. Relocate the
  files to the alias-resolved paths the lock records, then re-verify
  lock↔disk (every lock file must exist at its locked path).
- **Lock the dependency closure**: `add` installs dependency files but
  only explicit names enter the lock, and `upgrade` refreshes locked
  items only. Either explicitly `add` each closure item on disk, or use
  the CLI's `adopt` command (built for locking already-installed
  registry-identical files, no prompts). Verify: every `src/lib/**`
  registry file is lock-described, zero orphans.
- **jixoai-theme 0.3.0 already maps popover/destructive/input/ring/
  shadows** into Tailwind (`@theme inline`) — the unipty-era supplement
  pitfall is fixed upstream; only `--radius-*: initial` resets may still
  be site-side. `utils` needs `clsx` + `tailwind-merge` (devDependencies
  for private static sites). Registry docs write `@lib/…`; the SvelteKit
  alias is `$lib/…`.
- **Registry 0.3.0 is a component-API generation break** vs the 0.2.0
  descriptions in `references/layout-patterns.md`: PressButton variants
  are `fill/tonal/outline/ghost/link` (no `primary`); hero-section is
  composition-first (title/badges/terminal arrive as snippets;
  `copyCommand` still required); terminal-header takes NavigationMenu
  parts (the `items` config tree is dead) with `logo`/`switcher`/
  `drawer` snippets; terminal-footer composes `TerminalFooterColumn`;
  reveal is pure-CSS scroll-driven (static `data-reveal=""`, the IO
  action retired — keep the `html.js` bootstrap class, card-grid keys on
  it); SectionCard requires a (possibly empty) children snippet. Read
  `ui/apps/www/src` for live usage.
- **vite 8 artifacts are not byte-reproducible** (chunk-hash filenames
  drift across builds); the byte-identity law applies to the AI export
  layer only. `llms-txt` config key is `siteUrl` (not baseUrl); flat
  `.html` routes (e.g. `docs.html`) are exported as extensionless URLs
  — an upstream gap, record it in NOTES rather than patching locally.

## Site-construction traps (2026-09-06 campaign + 2026-09-07 rounds)

### The bilingual site recipe (validated on six sites)

Default locale at `/` (stable URLs) + mirrors at `/[lang]/`; per-locale
`<html lang>` via a `hooks.server.ts` `transformPageChunk` replaceAll on
a `lang="%lang%"` placeholder — the app.html comment must NEVER spell
the placeholder literally (String.replace eats the first match);
page-level `trailingSlash: 'always'` for locale directories; llms
`locale: {segments:[...], default:"en"}` (default NOT in segments);
browser-language negotiation as a pre-paint inline script in app.html
(persisted `lang` wins, `en` stored = stay; only redirect FROM the
default surface; never redirect back) — the registry language-switcher
persists `lang` itself since consumer-feedback-fixes.

### Platform + build traps

- **`$app/paths` `base` is page-relative under prerender** (`.`/`../..`)
  — never splice it into absolute URLs; bake mode bases through env
  (`%site_base%` placeholder pattern) instead.
- **Registry artifacts are verbatim: exempt them from the repo
  formatter** (`.prettierignore`/oxfmt ignore for every locked path) —
  `disk == lock` is the invariant; a fmt pass silently breaks it and
  the CI fmt gate then fights every `upgrade` (unipty precedent).
- **GHA expressions use loose equality** (`null == '' == false`): never
  derive step env from `inputs.x != false && …`; have the resolve step
  emit the flag to `GITHUB_OUTPUT` and consume that.

### CSS + Svelte traps

- **Svelte prunes runtime-only attribute selectors silently** — dynamic
  `data-*` hooks must be template-bound classes or `:global()`.
- **lightningcss strips initial values** (`text-wrap: normal` vanishes
  from output) and **Blink 145 rejects `text-wrap: normal !important`
  outright** — use the explicit `wrap` form when overriding `balance`.
- **Truncate in an end-aligned grid cell**: a grid item with
  `justify-self:end` + `truncate` (nowrap) overflows its track NO MATTER
  the track's `minmax(0,1fr)` — a non-stretched item sizes itself
  fit-content, and that formula floors at the item's min-content; for
  nowrap text that is the FULL line width. `min-w-0` zeroes only the
  automatic minimum and does NOT lift this floor (verified twice on
  jixoai.com home lists via Playwright geometry). The hard cap is
  `max-w-full`: percentage max-width resolves against the definite grid
  area, so the box caps at the track and the ellipsis finally renders.
  Canonical cell classes: `hidden max-w-full justify-self-end truncate
  text-xs sm:block` (desc hides below sm). Verify with measured rects
  (desc must not intersect sibling boxes), never by eye — short
  descriptions mask the bug entirely.

### The image pipeline (2026-09-07)

- **Raster brand assets ride the `vite-imagetools` + `sharp` pipeline**
  (`imagetools()` FIRST in vite plugins) — imports like
  `?w=48;96;192&format=webp;png&as=picture` from `src/lib/assets/`,
  rendered through ONE shared `responsive-picture.svelte`; static/ keeps
  only favicons + og-images, re-encoded small (favicon 64px, og 1200×630
  q80). No multi-hundred-KB png ships to a page.
- **`as=picture` does NOT return an array of sources.** Its verified
  shape (read from emitted JS after a silent-empty-render bug on
  jixoai.com):

  ```ts
  {
    img: { src: string; w: number; h: number },   // fallback: LARGEST size of the LAST format
    sources: Record<string, string>,              // format → srcset string "a.webp 48w, b.webp 96w, …"
  }
  ```

  Iterating `sources` with `{#each}` as if it were an array renders
  NOTHING silently (Svelte treats the object as empty array-like) — no
  build error, no runtime error, just `<picture><img/></picture>` with
  no webp candidate and no srcset. The canonical renderer lives at
  jixoai.com `src/lib/components/responsive-picture.svelte`: emit one
  `<source type="image/{format}">` per format EXCEPT the img's own
  (extension of `img.src`), which stays on the `<img srcset>`; always
  add intrinsic `width`/`height` from `img.w`/`img.h` (NOT `width`/
  `height` keys — they are `w`/`h`). Verify by grepping built HTML for
  `<source type="image/webp"` — never trust the component compiling.

## Verification checklist

- [ ] `--brand-hue` is the only color difference from the reference; no
      hardcoded per-project colors outside the token sheet and non-CSS
      brand assets (favicon, `theme-color`), which carry the project's
      icon hex.
- [ ] Dark mode: pure black background, inverted borders/shadows, brighter
      primary; no-flash theme bootstrap before first paint.
- [ ] Fonts are locally hosted via `@fontsource` packages (no Google Fonts
      network fetch); JetBrains Mono everywhere, Share Tech Mono for nav
      accents.
- [ ] Every interactive element uses press physics (lift on hover, press
      on active); links in body text get underline/color transitions only.
- [ ] `prefers-reduced-motion: reduce` disables reveal and press motion.
- [ ] Static build output works from a file/preview server; no server
      runtime required (adapter-static or equivalent).
- [ ] Project-specific seams preserved (e.g. byte-identical catalog copy,
      static checks, CNAME production gate) — restyle never breaks them.
- [ ] Scrollbar law: `scrollbar-width: thin` + transparent track +
      currentColor thumbs globally (hover chain intact); every REAL
      scrollport carries `scrollbar-gutter: stable both-edges` with the
      `padding-inline: max(<pad> - var(--jx-scrollbar-thin, 0px), 0px)`
      compensation; `<jx-scrollbar-measure>` is imported once in the root
      layout (no hardcoded widths; overflow:hidden clip surfaces must NOT
      reserve gutters — the gutter rule never goes on `*`).
- [ ] `pnpm build` and the project's site checks pass.
- [ ] AI export (references/llms-txt.md): `llms.txt` + per-page `.md`
      mirrors ship with absolute URLs; ONE generation point (plugin OR
      final orchestration call); byte-identical on re-run; excluded
      pages have no mirror; robots/sitemap untouched.
- [ ] Image pipeline (see Site-construction traps): every raster brand
      asset rides imagetools through the shared responsive-picture
      renderer; no multi-hundred-KB png ships to a page.

## What varies per project

- Brand hue (one variable), site content, copy language(s), deployment
  target, and content pipelines. Nothing else. When a "necessary"
  divergence appears, first check whether the reference solved it (it
  usually did), then — if truly new — keep the divergence minimal and
  document it in the site package NOTES.
