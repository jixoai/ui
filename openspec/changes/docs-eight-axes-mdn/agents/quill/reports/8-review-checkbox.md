# Report 8 — quill REVIEW of scribe's checkbox (task 8, review 1 of 2)

- agent: quill · date: 2026-09-22 · reviewed: commit `f1e6bb4a` —
  `apps/www/src/routes/docs/components/checkbox.html/+page.svelte` (+page.ts);
  working tree byte-identical to the integration (`git diff f1e6bb4a -- <route
  dir>` empty)
- inputs: scribe's own report read (`agents/scribe/reports/8-checkbox.md`) but
  every check below re-derived from source and the served page (independence
  law); family source read in full (checkbox.svelte/css/stylex/defaults +
  the .jx-html-checkbox law in jixoai.css + the rung scopes)
- serving: my own dev server on :5241 (SSR 200 / 1,162,935 B; universal
  marker ×1), killed by PID after the probes, `lsof` empty

## Verdict: NEEDS-WORK — one MAJOR (the bare section's own contrast evidence
is false as rendered); everything else I probed holds, including both
centerpiece claims (bare byte-identity, number-lane inertness).

## Findings

### MAJOR-1 — the wrapped-contrast cell carries NO stamps; the prose says it carries both

Bare section, second paragraph: "The wrapped contrast cell shows where the
stamps live: its root carries `data-density` and the carrier style." The demo
cell is `<Checkbox checked label="wrapped" name="wrapped-contrast" />` — no
lane passed — and at ambient auto the family stamps neither half (rungOf(auto)
= undefined, carriers = ''):

```
SSR: <div class="jx-field"><span data-jx-check="" class="jx-check-lane">…
```

No `data-density`, no `style` attr — the exact stamps the sentence promises
are absent, so the section's only wrapped evidence demonstrates nothing. Fix
(either): give the cell an explicit lane — `density="lg"` renders
`data-density="lg"` + `style="--jx-density-coefficient: 1"` (the same
greppable pair the axes lg panel shows) and the contrast becomes real — or
reword to the conditional ("pass a lane and ITS root carries the stamps; at
auto neither half stamps").

### MINOR-1 — `--corner-shape` is not "the site's token"; it is declared nowhere

Axes summary / supply-only paragraph: "its corner-shape reads the site's
`--corner-shape` token". Grep across `apps/www/src` and `packages/`: the only
occurrences of `--corner-shape` are the READS (`var(--corner-shape, bevel)`,
jixoai.css:1874/1892 et al.) and this page's own prose — no declaration
exists, so the bevel fallback always wins today. The mechanism claim (the
shape axis never bridges it) is true; the "site token" wording states a
declaration that isn't there. Reword: "reads `var(--corner-shape, bevel)` —
an undeclared customization seam whose bevel fallback wins today; the shape
axis never bridges it" (declaring the token would be family-side work, not
docs).

### NIT-1 — the bare canvas's drawer names silently differ from the stage

The bare demo's hand file shows `name="task-alpha"` / `name="task-beta"`;
the stage renders `bare-plain` / `bare-inert`. The page's other hand file
(query) documents its teaching difference in a source comment; the bare file
neither matches nor documents. Compose it from the stage (an id + the
same-source lane, like the axes canvas) or carry the same note.

## Verified-TRUE receipts (every check re-derived)

| # | claim (page) | re-derivation | verdict |
|---|---|---|---|
| 1 | bare vs bare+density render byte-identical inputs; "no data-density scope, no carrier style attr, no .dark class bridge, no query anchor" | SSR bytes: `<input type="checkbox" checked="" class="jx-html-checkbox" name="bare-plain"/>` vs `…name="bare-inert"/>` — identical modulo the name attr; neither carries any stamp; bind:this/uniRoot only exists in the wrapped branch (checkbox.svelte:188-198) | **TRUE** |
| 2 | markdown suppression rationale | `markdown.css:154` — `[data-jx-markdown] li:has(> input[type='checkbox'])` (+ the `> p >` variant) sets `list-style: none` | **TRUE** |
| 3 | number-lane inertness: "coefficient 1.5 leaves the 20px box, the lane, and the label byte-unmoved" | probe: stamped the wrapper with the component's exact declaration (`style="--jx-density-coefficient: 1.5"`) → box 20×20, laneMin 40px, gap 12px, label 13px ALL unmoved | **TRUE** |
| 3b | the declaring-element mechanism | grep: `--jx-icon: calc(var(--jx-icon-base) * var(--jx-density-coefficient, 1))` declared ONLY at :root + the five rung scopes (jixoai.css:489/2630/2683/2736/2805) — the coefficient multiplies at the declaring scope, never at the wrapper stamp; positive control: the lg panel's wrapper (`data-density="lg"`, `style="--jx-density-coefficient: 1"`) DOES move the box to 24px | **TRUE** (and the test could have caught movement) |
| 4 | hit/icon ladders "24/28/32/40/48" and "14/16/18/20/24" (2xs → lg) | measured 2xs: box 14 / lane 24 / gap 8 / label 10; sm: 18 / 32 / 8 / 12; default: 20 / 40 / 12 / 13; lg: 24 / 48 / 16 / 15 — four of five rungs, every measured position matches its ladder slot | **TRUE** |
| 5 | a11y: "default floor 28px, 2xs scope deliberately LOWERS it to 24px (WCAG 2.5.8 AA)" | `--jx-hit-floor: calc(var(--jx-unit) * 7)` at :root (28px), re-declared `calc(var(--jx-unit) * 6)` in the 2xs scope with the literal comment "scoped: 24px = WCAG 2.5.8 AA" | **TRUE** |
| 6 | theme row: FULL re-theme, every painted voice on the raw token layer | grep of `.jx-html-checkbox` law: reads `--background/--border/--primary/--primary-foreground/--ring` — ALL raw, zero `--jx-*` semantic inks; probe: `theme="dark"` wrapper gets `.dark`, input background + border flip (oklab 0.6489… → 0.7044…, the −4° primary) while the light cell stays | **TRUE** (the theme-split lens: checkbox is the full-flip pole, cascader the ring-only pole — both now measured) |
| 7 | query() case: base large below 40rem, sm wins at ≥40rem | probe: 600px → `data-density="lg"`, box 24 / lane 48; 1440px → `data-density="sm"`, box 18 / lane 32 — the caption's numbers verbatim | **TRUE** |
| 8 | query() §6 typing law | `query<{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large')` — both generics, in source AND served code | **TRUE** |
| 9 | §1 collision story | Props `extends Omit<HTMLInputAttributes, 'size' | 'color'>`; destructured lanes; `{...rest}` forwards the remainder — census batch A row in action | **TRUE** |
| 10 | grep receipts in the rows | `--jx-size-effective`/`--jx-color-effective`/all six carriers: ZERO readers in ui/checkbox/ + the checkbox law block | **TRUE** |
| 11 | ToC vs DOM | 9 ToC ids, each exactly once in the served DOM; zero inbound `checkbox.html#` links to break | **TRUE** |
| 12 | archetype §2 order | H1 → Overview → Install → Usage (live canvas) → Examples (states, form) → Props (generated meta + CHECKBOX_DOCS) → the eight axes → bare → Accessibility → See also; universal marker ×1 | **TRUE** |
| 13 | canvas same-source | `id="axes"` + `resolveRawCode('axes')` + usageFile composition; spec pins committed; solo run 58/58 GREEN | **TRUE** |
| 14 | page type hygiene | repo svelte-check 1648 (sibling drift +4 since 1644); checkbox.html carries exactly ONE error — the standing cx-idiom overload at 281:28 (same idiom every page carries) | **TRUE** |

## Tier judgment

Tier 2 accepted. The diff is rewrite-scale in line count, but the rubric's
substance holds: the old page's real information survived (the states matrix,
the form demo, the bare branch, the a11y facts all present and upgraded), and
the work was repair-and-fill (per-axis table, generated props, install/
see-also, archetype order) rather than re-derivation. No veto.

## Notes for scribe (the fix list, in order)

1. MAJOR-1: make the wrapped-contrast stamps real (`density="lg"` on the
   cell — then the sentence is true AND SSR-greppable) or reword.
2. MINOR-1: reword the `--corner-shape` sentence to the undeclared-seam
   truth.
3. NIT-1: bare drawer file — compose from the stage or document the teaching
   difference like the query file does.

## Process receipt

Dev server wrapper PID 16811 / vite PID 16841, killed by PID after the
probes; `ps` → gone; `lsof -i :5241 -sTCP:LISTEN` → empty (exit 1). Probe
script `/tmp/quill-8-axis-probe.mjs` + SSR capture `/tmp/quill-8-ssr.html` +
gate logs in /tmp only. canvas-same-source solo: exit 0, 58/58. No commits,
no push. Measurement-only review — no visual judgment entered any verdict.
