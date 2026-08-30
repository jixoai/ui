# Proposal: registry-install-integrity — every advertised add command must resolve

## Why

The site walk (2026-08-30, built-in-browser audit) found the install
chain — the registry's ONE product promise — broken in three places:

1. **Dangling `@jixoai/reveal` dependency.** Commit 39eb91d (2026-08-24,
   the scroll-driven reveal era) deleted the `reveal` registry item, but
   `hero-section` still declares `@jixoai/reveal` in its
   `registryDependencies` (registry.json:500). Consequence:
   `npx shadcn add @jixoai/hero-section` fails at dependency resolution.
   The homepage catalog still advertises `npx jixoai-ui add reveal`
   (404) and the Law-03 copy still sells "the reveal action". Nothing in
   `verify:all` resolves `@jixoai/*` references against the index, so
   the breakage shipped silently.
2. **Production custom domain detached.** GitHub Pages reports
   `cname: null`; the deployed artifact ships no `CNAME` file. The site
   lives at `jixoai.github.io/ui/` (subpath — absolute `/r/...` links in
   the docs resolve wrong there), while README/components.json and every
   consumer onboarding point at `https://ui.jixoai.com/r/{name}.json`,
   which 404s. The last successful deploy was 2026-08-28; the domain
   binding is the missing piece.
3. **Stale homepage catalog copy.** "Nine items, one grammar" over a
   twelve-row hand-written table — row drift is exactly what let the
   reveal ghost survive. Counts elsewhere derive from registry.json
   (registry overview: "93 registry items · 78 ui modules · 15 install
   targets"); the homepage must too.

Minor rider: `jixoai.css` comments `--brand-hue: 330; /* default: 0
(jixoai red) */` — value and comment disagree.

## What Changes

- **Remove the ghost**: drop `@jixoai/reveal` from hero-section's
  `registryDependencies` (the reveal CSS ships inside the theme sheet
  since 39eb91d — nothing to install). Purge the homepage `reveal`
  catalog row and reword the Law-03 / hero copy that references a
  reveal ACTION (the law is now `data-reveal` markup + CSS).
- **Generalize the dependency gate** (codex r1 semantics): the existing
  icons-scoped rule becomes the full contract — (a) every declared
  `@jixoai/*` edge SHALL name an existing item; (b) every cross-item
  import, OWNERSHIP-RESOLVED through `registry.json` `files[].target`
  (never raw alias matching), SHALL have a declared edge; (c) a
  declared-but-unimported edge is allowed ONLY as a structured
  install prerequisite (the theme sheet: every registry:ui item
  declares `@jixoai/jixoai-theme` without importing it). New
  `scripts/verify-deps.mjs` enforces all three directions with
  fixtures for: dangling edge, undeclared target-resolved import,
  declared theme prerequisite (PASS), genuinely dead dependency
  (FAIL); wired into `verify:all` next to `verify:mirror`.
- **CNAME rides the artifact**: `build-site.mjs` writes `public/CNAME`
  (`ui.jixoai.com`) as step 2.5 (after the public/ empty, before the
  site dist copy), and `deploy.yml` gains a post-deploy smoke job:
  curl `https://ui.jixoai.com/`, `/r/registry.json`,
  `/r/press-button.json` — non-200 fails the run. Re-attaching the
  domain in Pages settings is an OWNER action (documented in
  tasks.md; the repo cannot set it).
- **Homepage catalog: curated rows, derived truth.** `catalog.ts`
  already derives full inventory truth from registry.json. The
  homepage keeps its editorial voice but consumes a FEATURED
  projection exported from catalog.ts (an explicit item-ID list
  validated against the catalog — every featured ID resolves exactly
  once); the "N items" count renders from the registry total, clearly
  labeled as the registry total, never equated to the featured row
  count. A deleted item can no longer keep a ghost row (projection
  validation fails the gate), and a new item appears only when
  deliberately selected as featured.
- **Comment drift**: fix the `--brand-hue` default comment on BOTH
  mirror sides (`registry/files/theme/jixoai.css` +
  `apps/www/src/lib/jixoai.css` — the mirror-sync fixed mapping) and
  re-record the manifest.

## Sequencing

First change of the batch (B's dev-serving probe and the later
registry edits by other changes depend on a green install chain).
`registry.json` is a shared file: SUBAGENTS REPORT the diffs they
need, the integrator applies them in batch order
(A → F/G/H items) and runs `shadcn build` once per batch.

## Layering

- `registry.json` (hero-section deps) + `shadcn build` re-emit.
- `scripts/verify-deps.mjs` (new) + `verify-all.mjs` wiring.
- `scripts/build-site.mjs` + `.github/workflows/deploy.yml`.
- `apps/www/src/routes/+page.svelte` (catalog derivation) — no
  component/registry-file changes; the docs-site spec (Owner hosting
  intent) is where the derivation law lands.

## Risks

- registry.json edit requires `shadcn build` re-run (mirror check must
  stay green).
- The deploy smoke job depends on DNS/pages settings the repo does not
  control; it must fail loudly with a remediation hint, not block the
  artifact build.
