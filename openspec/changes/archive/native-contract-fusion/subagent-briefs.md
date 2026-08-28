# subagent brief — Phase 4 @apply mirror pilots (native-contract-fusion)

> You are migrating ONE component folder to the @apply mirror law.
> Read this brief fully, then openspec/changes/native-contract-fusion/design.md
> §3 (the @apply mirror law) and the native-contract spec delta before editing.

## The law you implement

For your assigned component folder(s) under
`registry/files/ui/<name>/`, move the component's OWN static paint
from inline utility strings in the .svelte markup into the folder's
`.css` file as **mirror rules** — so the css mirrors, rule by rule,
the corresponding Tier-0 law in jx-pure.css (Part A/B — read the
twin law's actual rules and mirror its declarations).

### Mirror-sheet format (per folder)

```css
@layer theme, base, components, utilities;

/* <item>.css — intents header (timestamped, house law) */

@layer components {
  /* static mirror rules: geometry/flex/spacing/typography */
  :where(.jx-<x>) {
    @apply inline-flex items-center box-border;      /* core utilities OK */
    min-block-size: var(--jx-hit);                    /* token paint = plain CSS */
    font-size: var(--jx-text);                        /* or @apply text-[length:var(--jx-text)] */
    border: 1px solid var(--border);
  }
}

/* state machines (unchanged law): unlayered :where() bare CSS */
:where(.jx-<x>:hover) { box-shadow: var(--shadow-2xs); }
```

### Hard rules (probe-locked, apps/www/test/tw-context-probe.spec.ts)

1. `@apply` ONLY with context-free core utilities (flex,
   items-center, box-border, appearance-none, cursor-pointer,
   sr-only, …) and arbitrary-value utilities
   (`min-h-[var(--jx-hit)]`, `text-[length:var(--jx-text)]`,
   `leading-[var(--jx-line)]`). Variant-bearing @apply
   (`last:border-r-0`) also compiles — but PREFER plain CSS in state
   machines (they are unlayered anyway).
2. `@apply` of NAMED theme utilities (`bg-background`,
   `border-border`, `text-muted-foreground`) is BANNED in folder css
   — a standalone sheet has no Tailwind context; the build FAILS.
   Token-bound paint = plain CSS declarations
   (`background: var(--background)`) or arbitrary utilities.
3. Part A classes (.jx-control/.jx-control-shell/.jx-control-lane/
   .jx-slider/.jx-color-shell/.jx-field/.jx-label/.jx-error/
   .jx-tgroup) are CONSUMED from the shared contract — NEVER
   redefined, never duplicated into your css.
4. State machines (`:checked`/`:hover`/`:focus-visible`/`:has()`/
   `:focus-within` repaints, disabled, aria-invalid) stay unlayered
   `:where()` bare CSS — the carve-out law, exactly as the existing
   residue files already do. UA pseudos (`::-webkit-*`, `::-moz-*`),
   `@keyframes`, `@property` stay bare CSS.
5. What stays INLINE in markup: Part A classes, semantic hooks
   (`data-jx-*`), slot-wrapper / one-off layout utilities (e.g.
   clear-button positioning, chevron positioning, gap wrappers),
   consumer-facing `class` merge points.
6. Do not change DOM structure, props API, ARIA, hooks, or behavior —
   this is a PAINT RELOCATION only. Existing tests must pass
   unchanged unless they assert class STRINGS (then update the
   assertion to the new shape, minimally).
7. The jx-* class names you mint in the css must be css-defined
   (hook law: css-less hooks are data-jx-* attrs).

## Files you may touch (STRICTLY your assigned folders)

- `registry/files/ui/<name>/<name>.svelte` (+ siblings)
- `registry/files/ui/<name>/<name>.css` (+ new sheet files if the
  folder lacked one — same basename as the component)
- mirrors: `apps/www/src/lib/ui/<name>/**` (cp after editing —
  byte-identical)
- tests that assert your folders' markup strings
  (`apps/www/test/*.spec.ts` — only the failing assertions)

## Files you MUST NOT touch (report needs instead)

registry.json, apps/www/mirror-manifest.json,
registry/files/theme/*, apps/www/src/app.css, package.json,
scripts/*, any other component folder. No `git commit`/`git push`.
Do not run `npm run build` (payload/manifest regen is the
orchestrator's).

## Verification you run (in apps/www)

```
./node_modules/.bin/vitest run test/<your-component-specs>   # targeted
npx svelte-check --output human | tail -2                     # 253/61/19 baseline must not grow
```

If svelte-check prints MORE than `253 errors and 19 warnings in 61
files`, your change introduced errors — fix them.

## Feedback protocol (mandatory in your report)

Report: (1) the exact diff summary per file; (2) difficulties —
anything in this brief or the specs that was unclear, wrong,
impossible, or fought the codebase; (3) how you resolved each; (4)
verification output tails. The orchestrator cross-checks your diff
against this report — do not self-grade beyond the facts.

## Worktree

All paths are under the worktree
/Users/kzf/.herdr/worktrees/ui/feat-jx-pure-register-fusion
(branch feat/jx-pure-register-fusion). Never touch the main
checkout at /Users/kzf/Dev/GitHub/jixoai-labs/ui.

## Pilot resolutions (native-select, Phase 4a — binding for all
later pilots)

1. State-machine declarations MIRROR the Tier-0 law exactly. Where
   the old component residue drifted from Part B (missing
   `:not(:disabled)` on the hover lift, missing `box-shadow: none`
   on disabled, `[size]`-without-multiple not treated as listbox),
   the drift is FIXED toward Tier-0 — that is the point of this
   change, not a behavior rewrite.
2. `scheme-light dark:scheme-dark` (the color-scheme strategy pair)
   stays INLINE in markup — the dark discriminator belongs to the
   consumer's context (class-based dark here; a media-strategy
   consumer would break if hardcoded in css).
3. Law-twin positioning paint (e.g. the select chevron) moves INTO
   the css mirror rules — it is the law's twin, not a one-off.
   Slot-wrapper layout utilities stay inline.
4. Mirror the B-law declarations EXACTLY, including computed-inert
   additions (e.g. `max-w-full` when B declares max-width: 100%) —
   the future parity gate compares law properties, so mirror
   completely, not just what the old markup carried.
5. Prove your sheet compiles through the REAL pipeline: write a
   one-off fixture importing YOUR actual `<item>.css` through
   `test/fixtures/tw-context-probe-runner.mjs` (child-process vite
   build; vitest's jsdom env does NOT compile css), verify the
   compiled output rule-by-rule, then delete the fixture.
