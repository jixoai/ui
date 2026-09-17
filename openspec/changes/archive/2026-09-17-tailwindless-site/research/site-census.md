# The site census — Tailwind utility usage (2026-09-17, main @ eb0c9aed)

Scan: `class="…"` attribute contents only (prose/CSS false positives
excluded); a token counts when it is a Tailwind utility (known prefixes,
arbitrary values `[…]`, or variant-chained `hover:`/`sm:`/… forms).

METHODOLOGY CAVEAT (Gate-1): this regex pass is an INTERIM ESTIMATE on
three axes — (1) it misses `cn()`/`class:`/template-expression
compositions and TS dynamic producers (`resolveTextStyle` emits
`leading-[…]`/`font-[…]`), so the dynamic side is UNDER-counted;
(2) doc-string SAMPLE CODE (CodeBlock usage strings inside page
sources) is OVER-counted as if it were runtime markup; (3) per-file
identity sets are not yet pinned. The P0 gate ships the AST extractor
(Svelte `class=`/`class:` + TS string literals + the registered
producers; code-fence content excluded) and recalibrates this table —
the budgets are pinned to THAT count, not to this one.

## Totals

| zone | files | occurrences |
|---|---|---|
| routes pages | 200 | 15,099 |
| lib site-libs | 96 | 3,682 |
| lib/ui components (registry-mirrored) | 101 | 2,315 |
| **total** | **397** | **21,096** |

The lib/ui number is the critical one: those files are byte-mirrored
into `registry/files/ui/**` — the shipped components themselves emit
Tailwind-only classes (border-border, px-4, inline-flex…), so a
consumer without Tailwind gets unstyled output. The hard binding is
not just the site's; it is in the distribution.

## Top utilities (occurrences)

flex ×2193 · text-[…] ×1807 (arbitrary sizes: 11px/13px/12.5px/15px…) ·
flex-col ×1302 · text-muted-foreground ×1191 · border ×701 ·
w-full ×695 · border-border ×686 · font-nav ×621 · text-accent ×605 ·
gap-3 ×589 · items-center ×573 · uppercase ×555 · tracking-[…] ×554
(0.24em/0.08em/0.01em…) · gap-2 ×483 · text-primary ×424 ·
flex-wrap ×348 · leading-6 ×335 · max-w-[…] ×323 (90rem/62ch…) ·
gap-4 ×299 · grid ×283 · font-mono ×259 · gap-8 ×245 · gap-5 ×227 ·
justify-center ×219 · min-w-0 ×188 · h-full ×158 · text-xs ×150 ·
gap-6 ×143 · inline-flex ×125 · px-[…] ×114

Reading: ~60% of the volume maps to THREE families — (1) layout atoms
(flex/col/wrap/center/w-full/grid/min-w-0), (2) arbitrary VALUES
(text/tracking/max-w/px brackets — the 收纳 surface: each distinct
value becomes a token step), (3) color-role text/border utilities that
ALREADY ride our tokens through the @theme bridge (text-muted-
foreground → var(--muted-foreground)) — these translate 1:1 to jx-
atoms with zero visual change.

## Top files

routes/docs/icons.html (695) · tabs.html (539) · timeline.html (390) ·
code-card.html (371) · press-button.html (353) · variant-grammar.html
(331) · skeleton.html (330) · separator.html (284) · dialog.html (284)
· tour.html (274)

## Wiring today

`apps/www/src/app.css` (110 lines) holds the sole `@import
'tailwindcss'`, the `@theme inline` bridge (`--radius-*: initial`,
`--radius: var(--radius)`), and `@layer base` rules that @apply
utilities onto elements (`* { @apply border-border; corner-shape:
bevel; … }`, `body { @apply bg-background text-foreground
antialiased; … }`). The registry sheet (`lib/jixoai.css`) supplies all
tokens; jx-pure.css carries the Tier-2 face laws (generated from
css-laws). Removing the engine means re-expressing app.css's base
layer as plain CSS over tokens (trivial: three @apply rules) and
replacing the @theme bridge's color namespace with our own atoms.

## AST recalibration (2026-09-17, the pinned truth)

The P0 gate's extractor (`scripts/verify-tailwindless.mjs --pin`,
svelte/compiler + typescript ASTs, mirrors sharing one entry under
the registry-side path, CodeBlock/sample-code channels excluded)
replaces the interim regex estimate above. THE BUDGETS ARE PINNED TO
THESE NUMBERS (the allowlist instance is the machine truth):

| zone | files (canonical entries) | occurrences |
|---|---|---|
| routes pages | 141 | 16,325 |
| lib site-libs | 156 | 4,171 |
| lib/ui components (registry-mirrored) | 174 | 5,408 |
| **total** | **471** | **25,904** |

1,750 distinct identities site-wide (11,625 per-file identity slots).
The +22% occurrence delta vs the regex pass (21,096 → 25,904) is the
under-counted dynamic side arriving: cn()/clsx() literal arguments,
`class:` directives, and variant-table values (`variantUtilities`,
`ink`, `VARIANT_CLASS` …) that a `class="…"` scan never saw; the
over-counted doc-string side left (CodeBlock usage samples no longer
count as runtime markup). Mirror-pair merging shrinks the file count
per zone (the ui zone's 174 entries cover both trees). Top identities
now: flex ×2084 · flex-col ×1223 · text-muted-foreground ×1111 ·
border ×630 · w-full ×621 · border-border ×614 · text-accent ×603 ·
items-center ×598 · pill ×592 (a site custom chip class, not a
utility) · font-nav ×568. Top files: icons.html (731) ·
code-card.html (461) · effects.html (453) · variant-grammar.html
(391) · press-button.html (329). Alongside the identity pin the gate
freezes the 7-name `@utility` set of jixoai.css (hash-pinned) and the
tier-2 literal slots in the 6 corpus `.stylex.ts` files (51
`prop:value` slots) — both ratchets, removal-only.
