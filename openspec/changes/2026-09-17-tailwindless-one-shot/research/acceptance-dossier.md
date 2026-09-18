# The Tailwindless One-Shot — Acceptance Dossier (大验收)

Change: `2026-09-17-tailwindless-one-shot` · Branch: `tailwindless-site` (worktree
`ui-tailwindless`) · Program: W1 → W1b → W2 → W3 → W4 (+W4-r2, the Codex-gate
round) · The Owner's one-shot ruling, 2026-09-17: delete the engine entirely,
then prove the 1:1 — and let quality leap where the engine had been
hard-coding.

> The Owner's words: 「你只有彻底把它删了，然后才能真正意义上确保 1:1 的复刻了。
> 当然不一定是 1:1 复刻，因为删掉 tailwindcss 之后，代码质量可能会有个质的飞跃。」

## 0. The Codex gate round (the review loop that hardened this dossier)

The final Codex gate (gpt-5.6-terra, xhigh, 2h27m independent verification:
re-ran the gates, re-derived the counts, byte-checked the twins, planted its
own probes) returned **4.5/10 NO-GO** on five blockers — every one verified
real against the change's own PFINAL spec text, every one closed in W4-r2
(`4c6d5246`):

1. **the registry workspace still ran the engine** (its vite config,
   manifest, app css) → retired;
2. **the utilities tier outlived the engine** — PFINAL freezes the shortened
   canonical statement (`@layer properties, theme, base, components;` — the
   tier dies with it) → plugin layer-law flipped (single source), 181 repo
   preludes shortened, the hue intent layer became unlayered `:where()`
   hooks, a stale-prelude negative tooth armed in verify:tailwindless
   (teeth planted and pulled);
3. **90 pre-canonical cx joiners survived** (their missing string branch
   shredded string args per character — real class strings were feeding it in
   transfer/mermaid/button-group/card-grid/website-scaffold; the toast
   groundPopover atom died in flight) → all migrated, rg-audited to zero;
4. **the parity spec was not a closed set** + the swap's silent carrier
   fallback → bidirectional closure with the owner-ladder rule
   (stem → own-dir → single-entry; measured: list-item's module is
   `item.stylex.ts`, tokens' is `lib/tokens.stylex.ts`), the swap fails
   loud;
5. **receipts bound to a dirty pre-commit tree** → all receipts re-bound to
   the clean `4c6d5246` tree (this dossier's §4).

The gate's independent reds were program debt surfaced honestly:
verify:context (scroll-area's W1b radius prop owed a Defaults contract —
paid, `absentSlot<number | 'full'>`, absence IS the square-cut state),
verify:deps (99 dead edges the cx localization killed; the shared-file
phantom-owner bug — last-writer fs ownership crowned mermaid owner of
tokens.stylex for all 84 items — fixed by source-path-space resolution +
self-containment; 8 items gained the spec-mandated theme edge; 112 declare
it as the structured prerequisite), verify:budgets (B-source 37636→41682
re-recorded WITH the receipt: the preflight minus the @theme block).

---

## 1. The wave train (per-wave receipts)

| Wave | Scope | Budget arc | Commit |
|---|---|---|---|
| W1 | 52 top families → stylex atoms + lane-2 css | ui zone 5,408 → 1,275 | `8f50adc1` |
| W1b | 48 real tail families + 5 verified zero-work | ui zone → 478 | `010c73db` |
| W2 | blueprints (138 scenes) + site libs (18 files) + the 530-hook mass registration | ui + site-libs → 0 | `b5e02b2a` |
| W3 | pattern-first routes (shared surface atoms + 3 batches + sweep) | routes → 0 · **PIN 0/0/0 · RATCHET zeroed** | `415eae08` |
| W4 | engine death + the two structural handovers + acceptance | **ZERO everywhere** | (this commit) |

Terminal budget proof (`verify:tailwindless`, run 2026-09-19):
`✓ GREEN — 0 class-bearing files against the pin (pinned 0 files · 0
identities · 0 occurrences); no growth, no new identities, no unregistered
producers, contract intact, @utility freeze 7, tier-2 literals 7 file(s)`

The ratchet constants (AST census / per-file budgets / single-writer pin) all
read ZERO — there is no Tailwind utility left to find, and no path back that
the gate would not catch.

## 2. The engine is gone (W4 core)

- `@import 'tailwindcss'`, `@theme`, `@custom-variant`, `@apply` — retired
  from `apps/www/src/app.css` (plain declarations own the base now).
- `@tailwindcss/vite` plugin — gone from `vite.config.ts` (www builds
  engine-free).
- `tailwindcss` + `@tailwindcss/vite` + `tailwind-merge` — dropped from every
  package.json; `check-tw4-prereq.mjs` + its script entry deleted; the cn()
  seam rewritten dependency-free (clsx + the closed-set last-wins reducer,
  hue-injection spec 13/13).
- The lockfile's only remaining `tailwind-merge` reference is shadcn CLI's
  own internal dependency (frozen by decision — the CLI is a build tool, not
  a styling engine).

## 3. The two structural finds (deleting it is how you *really* verify)

The Owner predicted invisible dependencies would surface only on complete
deletion. Two did, both in W4, both now owned laws:

### 3.1 The preflight handover — the engine's invisible base layer

**Symptom:** the pilot probe could not CLICK the site chrome's hue trigger at
the 1099px seam (playwright: `<html> intercepts pointer events`). Root cause
chain: the chrome shell's `width: 100%` + `paddingInline` computed
**content-box** (engine preflight had provided universal `border-box`) → the
over-constrained `margin-inline: auto` resolved right-margin to **−64px** →
the trigger rendered outside the viewport. Sitewide, every heading/paragraph
had silently regained UA margins (h1: 18.78px, p: 11px) and every box had
reverted to content-box — the blank canvas the whole design language was
authored on was engine output nobody owned.

**Fix:** the served-before receipt (the Owner's :5199 build) yielded the
preflight bytes verbatim — **148 lines** (universal border-box + zero slate,
typography normalization, form-control inheritance, replaced-element
blocking) — landed in the **theme sheet's** `@layer base`
(`registry/files/theme/jixoai.css` ⇄ `apps/www/src/lib/jixoai.css`,
byte-identical twins; banner comment names the receipt).

**Proof:** computed-style parity restored (h1/p margin 0, border-box; the hue
trigger's right edge **1064px = 1064px** on both sides at the 1099 seam); the
pilot matrix went 86/86 (below). This also fixed the consumer contract: the
registry spec says the theme sheet is the whole styling prerequisite — now it
actually carries the canvas.

### 3.2 The phase-1 consumer-contract flip — compiled payload delivery

**Symptom:** `verify:shadcn-add` red 13/24 — every consumer fixture whose
items carried `.stylex.ts` modules failed `vite build` on
`Rolldown failed to resolve import "@stylexjs/stylex"`. The registry items
had gained stylex sources through W1/W1b, but consumers owe ZERO
`@stylexjs/*` (the F11 law, asserted on their lockfiles). The compiled
payload machinery (111 items) existed but only the phase-0 manual-install
case exercised it.

**Fix:** `scripts/lib/registry-stylex-swap.mjs` — a delivery-time rewrite
wired into BOTH pipelines (verify-shadcn-add §0.6 and build-site §5.6, one
implementation so they cannot diverge). Every built payload's `.stylex.ts`
entries deliver as:
- `x.stylex.js` — the item's compiled classModule (plain-string class
  constants; extensionless `./x.stylex` imports resolve unchanged; the
  module embeds every table the item delivers, tokens included — the
  same-build law);
- `x.stylex.css` — the item's compiled css (F9 statement at byte zero,
  self-contained token block), wired by a leading relative import in the
  carrier module — the sole styling wiring the spec names.

97 payloads swapped; the swap is idempotent and fails loudly if the payload
manifest is stale. Harness assertions updated to the flipped contract
(canonicalTargets translation; the stylex-tokens case now asserts the
compiled module + zero engine imports + the css carrier). **24/24
clean-install cases green** (final run receipt below).

## 4. Fresh probe receipts (staggered clean-tree binding — each probe binds
the commit BEFORE its own artifacts land)

- **Pilot parity matrix — 86/86 GREEN** (`pilot-matrix-receipt.json`,
  meta.change=this change, meta.commit=e2a71056, meta.dirty=false;
  `--verify-receipt` PASS: 10/10 artifacts sha256+bytes, commit ≤ HEAD,
  tree clean outside research/): viewports 375/768/1099/1100/1440 ×
  screenshots + computed-style reads (grid tracks across the 1100px seam,
  eyebrow voice, hairline frame, body voice, no `[object Object]`),
  dark-scope parity, keyboard focus, forced-colors, print emulation —
  after ≡ before on every row.
- **Precedence placement law — 25/25 GREEN** (`precedence-receipt.json`,
  meta.commit=aae9e59f, meta.dirty=false; `--verify-receipt` PASS): every `.tl-*` family in-layer under components in
  `:where()`, media seams intact, ZERO unlayered regressions, injected
  consumer utilities FLIP both probe values, native :hover seam alive —
  the cascade proof holds WITHOUT our utilities tier (PFINAL's
  dual-order condition: the injected consumer layer wins by nesting +
  first-mention, not by our reservation).
- **folder-css contract — 8/8 GREEN** (dev-server bound): item 6 proves
  **a stylex atom beats a `:where()` folder rule** (8px→32px padding;
  lane recolors gray→primary oklch).

## 5. The quality leap (beyond 1:1)

- **Context-managed tokens** — the voice-scale ladders (text/track/weight/
  leading/motion/space) live in the theme sheet as CSS custom properties,
  typed three-copy-gated in `tokens.stylex.ts` (115 members); TW's magic
  numbers became named, themeable slots.
- **The joiner law** — one canonical cx (component-local, string-passthrough
  superset) across every module (24 modules / 61 import sites unified);
  no dependency, no engine, strings pass whole.
- **Lane-2 discipline** — every sheet opens with the canonical
  post-engine statement (`@layer properties, theme, base, components;`
  — PFINAL killed the utilities tier with the engine; stylex tiers
  nest under `components`); state paints sit in `:where()` at zero
  specificity or unlayered; the precedence probe pins
  consumer-utilities-over-semantics forever (by nesting +
  first-mention, not by our reservation).
- **The registry grew teeth** — 144 items; +184 file entries through the
  waves; consumers receive compiled, zero-engine payloads with the canvas
  included (§3.1/3.2) — the "1:1 for consumers" the TW era never had.
- **The seam retired honestly** — tailwind-merge's closed set reduced to
  clsx + a last-wins reducer over the hue/pair closed set (13/13 spec).

## 6. Known deltas & receipts

- Blueprints: 108 thumbnails regenerated on the oklab channel shift; glass
  annotations 9→10px (W2 receipts, deliberate, documented per-scene).
- Nearest-step token mapping (TW value → nearest ladder step) is recorded
  per-wave in `wave1-integration.md` / `wave1b-roster.md` (e.g.
  `tracking-tight → --track-tight −0.02`, `text-[13px] → --jx-text-base`).
- `retireDarkUtilities` in `freeze.svelte.ts` kept as a documented no-op
  guard (scope-native handling = the print pipeline's own root stamping).
- verify:parity browser-probe reds are pre-existing on main (the probe
  targets the Owner's live :5199 where the grindstone trio landed tier-1
  has-* utilities without re-pin) — out of scope for this change, receipts
  in the wave notes.

## 7. Gate receipts (final chain — the W4-r4 code freeze; receipts bind last)

- verify:tailwindless — **GREEN, pin 0/0/0, + the PFINAL negative tooth**
  (a stale utilities-tier prelude anywhere in repo css is red; teeth
  planted and pulled in the same stroke)
- verify:mirror — **GREEN** (144 items · 735 file pairs)
- verify:laws · verify:stylex-payload · verify:stylex-authoring ·
  verify:standards · verify:context · verify:deps · verify:budgets ·
  verify:docs · verify:meta · verify:icons · verify:spins — **ALL GREEN**
  (deps: zero dangling/dead/undeclared, 112 items declare the theme
  prerequisite; budgets: B-source re-recorded 41682 with the preflight
  receipt)
- verify:shadcn-add — **24/24 clean-install cases GREEN** (the phase-1
  flip; the swap count's fine print: 97 = 96 stylex-carrying registry
  item payloads + the registry index — NOT 97 registry items)
- verify:folder-css — **8/8 GREEN** · pilot 86/86 · precedence 25/25 (§4)
- www battery — **2,831+ passed; 6 failed tests + 1 file-level collection
  error, ALL pre-existing on main** (blueprints ×2, docs-structure ×2,
  tree-view ×2 tests; the docs-ambient file error) — every W4/W4-r2-causal
  red repaired at its root: toast ×1 (canonical cx), text-modifiers ×1
  (cn-retirement contract), payload-parity ×1→closed-set (flip-aware
  derivation + the bidirectional closure test), markdown-ssr/search-corpus
  ×2 (explicit 30s timeouts on the heavyweight SSR integrations — 3.9s
  measured isolated vs the 5s default under battery load),
  glass/math-block/mermaid ×3 (re-pinned to the shortened canonical
  statement)
- www build — **GREEN, engine-free** (and the registry workspace's own
  build likewise post engine-out)
