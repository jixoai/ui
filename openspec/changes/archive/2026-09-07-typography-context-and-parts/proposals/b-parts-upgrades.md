# Proposal B — blockquote rule×ground, Link suffix-icon, List vocabulary

Designer: subagent round 1. Attacked in review round; see review-r1.md.

## 1. blockquote — RULE × GROUND × hue

**Ruling: RULE is a literal geometry axis (the separator precedent —
"ink geometry can never join the paint ladder's frozen table, the
slot stays a defineLiteralSlot forever"); GROUND stays the frozen
paint slot (outline|tonal untouched → ZERO frozenAvailability
amendments).**

- `rule: 'shadow' | 'border'` (own 'shadow' — the Owner's default
  ruling), `ruleSize: 1 | 4 | 8` (own 1 — visual continuity with
  today's 1px face rule; 4/8 deliberate emphasis steps).
  `blockquoteRuleSlot = defineLiteralSlot(['shadow','border'],
  'shadow')`; `blockquoteRuleSizeSlot = defineLiteralSlot([1,4,8],1)`.
  Naming: NOT bare `size` (would enter the detection vocabulary AND
  collide with the typography size the family refuses — ruleSize is
  the honest compound).
- Rule channel (probed utilities): `shadow-[inset_{N}px_0_0_…]` /
  `border-s{,-4,-8}`; **the rule color rides the RUNG's own
  border-color declaration** (outline → `--jx-outline`; tonal → the
  45% tonal mix — "one hue source" — jx-hue-* retunes ground+box+rule
  together; a 100% tonal rule rejected: a second ink weight on one
  edge, sole-source discipline).
- One shadow utility per root (the @property --tw-shadow composition
  note); padding honesty: ps stays fixed across sizes (border
  consumes geometry, shadow doesn't — paint never moves geometry).
- Forced colors: shadow modes re-materialize as Npx CanvasText border
  (`forced-colors:shadow-none forced-colors:border-s-[Npx]
  forced-colors:border-[CanvasText]`) — the entity law's "edge is
  structure" generalized; border modes keep today's degradation.
- Hook: `data-jx-blockquote={variant}` UNCHANGED; the new axis
  publishes `data-jx-blockquote-rule="{rule}-{size}"` (e.g.
  "shadow-4") — the data-orientation form extended.
- Markdown map: plain quotes flip border→shadow-1, alerts gain
  shadow-1 inside the tonal box — deliberate Owner-mandated delta,
  called out in docs/changelog. Element/escape/keyed laws untouched.

## 2. Link — the external suffix-icon

- **Default glyph = the `externalLink` Icon part** (inline-core,
  sync getIcon — SSR paints, no flash; the fleet precedents:
  +layout.svelte's ext() snippet, component-canvas — the doc-link ↗
  text glyph is a pre-pipeline demo shim). Cost: link gains
  `@jixoai/icon` (+icon-set transitively) — priced registry edit.
- **Tri-state `icon`** (the input semantic-glyph law, verbatim):
  `undefined` = the default glyph shown IFF external; `null` =
  explicitly OFF (the 属性开关); a snippet = custom (the slot). One
  prop governs toggle AND custom.
- Lane: renders iff `external && icon !== null`:
  `<span data-jx-link-icon aria-hidden="true" class="ms-[0.2em]
  inline-flex flex-none align-[-0.125em]"><Icon name="externalLink"
  size="0.8em" /></span>` — INSIDE the anchor (both precedents), em-
  sized (rides any ambient scale, the no-font-size kinship).
- `data-jx-link` unchanged. Markdown map gains the glyph on every
  external link site-wide (deliberate; specs updated in-change).

## 3. List — marker vocabulary + nav mode

- **marker axis** (element-agnostic, frozen small set; probed):
  disc `list-disc` | circle `list-circle` | square `list-square` |
  decimal `list-decimal` | alpha `[list-style:lower-alpha]` | roman
  `[list-style:lower-roman]` | none `list-none`.
  Default = the platform's per-element law: `marker ?? (ordered ?
  decimal : disc)` (omitted keeps today's B8 restoration; marker
  OVERRIDES). Lowercase only (prose norm; upper = escape hatch).
  Marker ink stays the B8 law; marker SIZE deliberately absent (rides
  ambient font-size); spacing/density deliberately absent (the
  no-margins recorded law — a spacing axis would fight the container
  rhythm). `none` keeps ps-6 (indent is structural); NAV drops it.
- **nav mode**: `nav?: string` (the aria-label; presence switches the
  container): renders `<nav aria-label data-jx-list-nav>` wrapping
  the ul/ol with `list-none ps-0` defaults (explicit marker still
  overrides). `data-jx-list` stays on the list element (spec-pinned);
  the wrapper stamps `data-jx-list-nav`. Bare `<a>` children inside
  face scopes get the B2 chrome lane free; standalone, the component
  does NOT re-implement B2 — the docs state the lane split (plain
  anchors in-scope vs the Link part as the prose lane). `reversed`
  ol-only passthrough widened while touching.
- **Markdown non-regression**: the map passes ordered/start only →
  byte-identical stamps for every existing document; the map never
  emits nav/marker.

## Tests + docs (per item)
blockquote: rule axis resolution + 2×2×3 matrix + hook + forced-colors
source guard + markdown new-default non-regression + consumer-last.
link: default glyph iff external; null off; snippet custom; internal
never; markdown spec updates. list: marker resolution per ordered;
7 stamps; nav shape (nav[aria-label] > ul[data-jx-list], list-none
ps-0, data-jx-list-nav); explicit overrides nav default; reversed;
default-map byte-parity. Docs: three pages gain canvases + rows
(rule/ruleSize/marker/nav/icon — none are AXIS_PROPS, no batch-route
impact); variant-grammar page's blockquote demo line + elevation
section cite the rule; living spec §blockquote face text amended
(names the border recipe today); frozen table rows untouched.

## Open questions (for the reviewer)
1. ruleSize default 1 (continuity) vs 4 (the GitHub/Notion bar norm;
   a 1px shadow reads lighter than a 1px border).
2. Tonal rule at 45% (integrated) vs 100% tonal (accent bar).
3. ps compensation for border-4/8 — honest geometry (chosen) vs
   calc() optical parity.
4. Link tri-state vs first-class boolean + slot pair (the Owner's
   literal "通过属性来进行开关").
5. a11y ceiling: aria-hidden glyph only (fleet convention) vs
   visually-hidden "(opens in a new tab)".
6. nav prop shape: label-as-presence string (chosen) vs boolean +
   rest-passed aria-label; nav row gap ownership (no — no-margins).
7. Hook compound "shadow-4" vs two attributes.
8. rule/ruleSize/marker/nav deliberately OUTSIDE the gate vocabulary
   ("outside = ungated" as the recorded consequence) — confirm.
9. Site-wide visual deltas need the Owner's browser review in-change
   (every markdown quote flips to shadow; every external link gains
   the glyph).
