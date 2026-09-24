# Report 17 — empty, REVIEW (2nd, marginalia)

agent: marginalia · 2026-09-22 · route
`apps/www/src/routes/docs/components/empty.html/` (+page.ts; curation
`src/lib/ui/props-table/docs/empty.docs.ts`; generated meta
`src/lib/meta/empty.meta.ts`) · coder quill (integrated 89106bb6) · law:
mdn-doc-style §5+§6, emission-form law (co-authored), THEME-SPLIT frozen
pole, declaring-element, composed-consumer negative · reviewer #1: vellum
(PASS — read only AFTER my findings were filed; consolidation appended).
Every verdict re-derived from source, raw SSR bytes, served-CSS inspection,
or live probes on :5244.

## Verdict: PASS

**0 BLOCKER · 0 MAJOR · 1 MINOR (co-signed fleet debt) · 2 NIT.** The
frozen-pole claim reproduces at all three levels the dispatch demanded —
grep, mechanism, probe — and the density consumption, the supply-only
receipts, the composed-consumer negative, the EXTRA arithmetic and the
query() case are all exact. **empty CLOSES as page #12.**

## The frozen pole — re-derived at all three levels

1. **The grep**: zero literal raw-var reads in ui/empty/ — `var(--border)`,
   `var(--muted)`, `var(--card)`, `var(--foreground)`,
   `var(--muted-foreground)`, `var(--primary)` = **0 each** (the raw NAMES
   never even appear in the family's files). The paint's voices are (a)
   typed intermediates via `tokens[...]`: --jx-border ×2, --jx-muted,
   --jx-card, --jx-foreground, --jx-muted-foreground ×2, --jx-primary,
   --jx-shadow-2xs — and (b) theme-free kernel channels consumed unwrapped:
   var(--jx-stack) ×4, var(--jx-inset) ×2, var(--jx-text) ×3, var(--jx-line)
   ×2, var(--jx-gap), var(--jx-unit).
2. **The mechanism (emission-form law, verified in the SERVED runtime
   CSS)**: a live stylesheet scan finds
   `@layer components.stylex.priority1 { :root, .xbpgcew { --jx-brand-hue:
   var(--brand-hue); --jx-background: var(--background); … --jx-border:
   var(--border); … } }` — the typed intermediates are emitted at **:root**
   with var(--raw) values, so substitution happens ONCE at the root scope;
   a scoped .dark re-declaring `--border` (jixoai.css :269's block does
   re-declare all six raw voices: --border/--muted/--card/--foreground/
   --muted-foreground/--primary — verified present) can never re-open the
   already-resolved intermediate. The family's paint reads the
   intermediates; the pole holds by construction.
3. **The probe**: the axes canvas's light figure vs `theme="dark"` figure
   (real `.dark` class stamped, verified `classList.contains('dark')`) —
   **all painted voices byte-identical**: border oklch(0 0 0), ground
   oklch(0.9551 0 0), art card oklch(1 0 0), art shadow
   `rgba(0, 0, 0, 0.5) 1px 1px 0px 0px`, title ink oklch(0 0 0), term ink
   oklch(0.3211 0 0), zero ink oklch(0.6489 0.237 227). The desc voice
   (same --jx-muted-foreground intermediate as term) is structurally
   covered; the demos render no description.

## Verified-TRUE receipts

- **Density consumed — the dispatch's exact numbers.** Named rung re-bases
  the named channels (all real reads in the atoms): sm → figure padding
  **16px** (inset×2), title **12px**, art stack gap **4px**; lg → **32px /
  15px / 8px**. The number lane is INERT, measured on the ambient figure:
  `--jx-density-coefficient: 2` stamped → pad 24 / title 13 / h 151
  **byte-identical before and after** (the channels compose at :root and
  the rung scopes — substitution at the declaring element). The ambient
  profile's own rung (pad 24 / title 13) sits coherently between sm and lg.
- **Elevation nuance**: the art box's one shadow is `--jx-shadow-2xs`
  (tokens['--jx-shadow-2xs'] ×1, empty.stylex.ts:53) — a fixed recipe
  token; **zero --jx-elevation reads** in the family (grep ×3 files = 0).
- **Composed-consumer negative — twice over.** The ONLY production import
  of the family is `lib/blueprints/scenes/empty.svelte:3` — a blueprint
  demo scene (the "pages own their no-data regions" pattern itself), no
  component composes it. The false friends are real: command's
  `command-empty.svelte` is the command palette's own no-results element
  (zero ui/empty imports); popover's "Empty" hit is not the component.
- **EXTRA arithmetic 13−8+0=5.** Meta = **13** props (8 axis + 5 family:
  title, description, illustration, actions, class); curation has no
  extra lane and overrides exactly those 5; served family table = **5
  rows** (title*, description, illustration, actions, class) ✓.
- **query() two-generic — the dispatch's exact numbers.** Served usage
  bytes: `density={query&lt;{ sm: DensityLane }, DensityLane>({ sm:
  'small' }, 'large')}`. Live viewport moves: 1440px (≥40rem, sm wins) →
  figure **h 114px** / pad 16 / gap 4; 600px (<40rem, large base) →
  **h 185px** / pad 32 / gap 8; back → 114. Both directions ✓.
- **Size-lane inertness (post-avatar-lesson check)**: the §11 carrier echo
  DOES land on empty's figure root, but the paint ignores it — title/desc/
  art set their own font-size atoms and term/zero inherit the art's
  `var(--jx-text)`. Stamped `--jx-size-effective: 18px` + the font-size
  echo → pad/title/art/h byte-identical. SUPPLY-ONLY stays true in effect.
- **toc 6/6** ×1 each (overview, usage, demo, api, axes, accessibility),
  order matches DOM; DocsSeeAlso renders (`data-doc-see-also` ×1,
  aria-label "see also") OUT of the toc per the ruling; install marker
  `add empty` ×4.
- **8 figures ×1 .dark stamp**: served SSR carries exactly 8
  `data-jx-empty` roots and exactly **one** figure with the .dark class
  (the theme demo) ✓.
- **Tier 2 justified**: old page (89106bb6~1) = 138 lines, 0
  DocsInstall/DocsSeeAlso, dead ids (#types, #theming, #universal-props);
  new page = full archetype (hero → install → overview → usage → canvas →
  composition → props → axes → accessibility → see-also) with the demo
  canvas, composition demo and a11y table preserved.
- **test/ pins**: docs-structure (12/12 solo at task 16 covers the
  skeleton lint incl. this page); batch1/batch4b/batch5 component specs;
  no same-source PILOTS blocks (none claimed — see NIT below).

## Findings (all co-signs of vellum's 1st review; none blocking)

1. **MINOR (co-signed) — the cx predicate is fleet debt.** The local `cx`
   implementations (+page.svelte:97-109, empty.svelte:107-119) carry the
   fleet-wide `Object.entries` idiom svelte-check flags. Pre-existing,
   page-independent, tracked at fleet level; non-gating.
2. **NIT (co-signed) — the axes canvas omits its hand-file disclosure.**
   The section comment says "the eight axes demos: code shown = code
   running" (:60) while `axesFiles` rides the hand-authored `axesUsage`
   string, not resolveRawCode — the composition demo makes exactly this
   disclosure (:46-47 "hand-authored to match the stage markup — the
   same-source migration is the recorded follow-up") but the axes canvas
   does not. One clause aligns it.
3. **NIT (co-signed) — the axesUsage mechanism comment under-lists the
   channels.** It names "--jx-stack/--jx-inset/--jx-text/--jx-line" but
   omits `--jx-gap` (the actions row's wrap gap), which the density row
   itself names as a re-based channel.

## Consolidation (vellum's 1st = PASS, read after filing)

Full agreement: vellum's frozen-pole treatment (emission-form mechanism +
live pair) and my three-level re-derivation reach the same verdict with
independent probes; its MINOR/NITs are co-signed above and none gate. The
page closes on both reviews.

## Process evidence

- Port :5244 empty before (lsof exit 1); dev server as a background task
  (log /tmp/marginalia-17-dev.log), killed by PID at the end with the
  lsof-empty receipt in the final message.
- Probes: /tmp/marginalia-17-probe.mjs (voices pair + density rung + query
  flip), -probe2.mjs (emission scan + stack gap + heights), -probe3.mjs
  (the flawed number-lane attempt — removed-rung clone, kept as the
  lesson), -probe4.mjs (corrected ambient-figure coefficient stamp). SSR:
  /tmp/marginalia-17-ssr.html (1,033,910 bytes + served stylesheet scan).
  Old page: /tmp/marginalia-17-old.svelte.
- Independence: vellum's review read only after the findings above were
  written.
- Working tree carries sibling in-flight work (unchecked, untouched). NO
  commits, NO push.
