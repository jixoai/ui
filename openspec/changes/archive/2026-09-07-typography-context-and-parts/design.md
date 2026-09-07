# design — prose scope + parts R2 (the collision-integrated rulings)

Round 1: two designer subagents (proposals/a, proposals/b). Round 2:
the adversarial reviewer (findings F1–F14, rulings A1–A10/B1–B9 — all
adopted below; the review record lives in review-r1.md). This document
is the integrated design; where it is silent, the proposals' verified
mechanics stand.

## §1 The prose scope (asks 2/3/6)

### 1.1 Shape (rulings A1/A3/F4/F13)

- Item `prose` (registry:ui): the `<Prose>` provider component
  (`prose.svelte` + `prose-defaults.svelte.ts` + `index.ts` +
  `prose.css` — the two-file floor allows, the four-file set ships).
  NOT named `typography` — that word is markdown's live user-facing
  vocabulary (`<Markdown typography="relaxed">`); two concepts under
  one name is documentation debt forever (ruling A1).
- Lib `typography` (registry:lib, `registry/files/lib/typography
  .svelte.ts`): `TypoScope` types, `TYPOGRAPHY_KEY` (module-private
  symbol), `resolveTypoVars(scope)` (the pure knob→declaration/var
  bag), ink/gradient value resolution. **The context pair
  (setContext/getContext + the plugin chain's getContextPlugins)
  lives INLINE in prose.svelte** (ruling A3) — the control-chrome
  double-runtime hazard is recorded as empirically proven twice; an
  implementation-time probe (both vite dev and vitest, both import
  paths) may promote the pair into the lib, but the inline posture is
  the default and ships unless the probe passes BOTH environments.
- Provider mechanics: `ProseDefaults.resolve({…11 knobs…})` (every
  knob an `absentSlot` — absence IS the state, ruling A2: the
  Defaults file becomes the v1 vocabulary's single audit source);
  plugin chain applies at the provider (`scope.apply(TYPOGRAPHY_DEF,
  knobs)` in $derived — the kernel surface verified at
  context-plugin.svelte.ts:444,517); host renders
  `div.jx-pure[data-jx-prose]` with cn()-merged consumer class.

### 1.2 The CSS contract (F3's load-bearing rider + F9 + F12 + F10)

`prose.css` OPENS with the canonical layer statement
(`@layer theme, base, components, utilities;` — without it the whole
specificity ladder inverts; this is spec text, not hygiene). Then:

- **Inheritance lane** (wrapper declarations, only-set): font-size,
  font-family, color, text-align, text-wrap, hyphens, background-color
  (+ the `--jx-ty-*` var mirrors, documented for app-side css reads).
- **Presence lane** (attrs on the host): `data-jx-ty-leading`,
  `-indent`, `-initial`; `data-jx-ty-ink="gradient"`. Presence-gated
  because an ungated `var(--jx-ty-leading, inherit)` rule at (0,2,0)
  would fire always and break the face's p{1.6} for every non-prose
  region (the no-opinion stamp law, CSS edition — verified F13).
- **Residue rules** (`[data-jx-ty-X] :is([data-jx-text='p'])` at
  (0,2,0)): the leading un-short-circuit generalization; indent
  (P-only — headings never inherit a first-line indent);
  initialLetter (P-only, BOTH arms per ruling A6: @supports
  (initial-letter) modern path + the float ::first-letter fallback —
  a browser-class-dependent drop cap reads as a bug; the same P
  suppresses indent — a drop cap plus indent double-counts);
  gradient lane on P AND Heading hooks.
- **The gradient mechanism (ruling A7, amended per F9/F12)**: the
  gradient writes `background-image`, `-webkit-background-clip: text`,
  and `-webkit-text-fill-color: transparent` — **NEVER
  `color: transparent`** (currentcolor on a mark would resolve to the
  inherited transparent — invisible). Marks inside restore via
  `-webkit-text-fill-color: currentcolor` resolving against the
  inherited SOLID color. `--jx-ty-ink` carries ONLY color tokens
  (never a gradient payload — Heading's var-fallback utility must
  never see an invalid-at-computed-value-time var, F12). The solid
  restore token `--jx-ty-ink-solid` ships on the host for plugin and
  print reads.
- **Print (ruling per F10)**: the restore is a `@media print` rule in
  the SAME sheet (the paged.js clone never re-runs the JS provider —
  a plugin cannot reach it): gradient fill/color restore to solid;
  ground optional-strip recorded. The plugin lane flattens
  gradient/ground for the SCREEN medium only. initialLetter on paper:
  drop caps KEEP printing (the manuscript posture) — the recorded
  decision.
- **Heading consumption**: ONE utility edit — `text-foreground` →
  `text-[var(--jx-ty-ink,var(--foreground))]` (dedup-verified F5
  against the repo's cn config: classifies in the text-color group;
  consumer `text-primary` overrides last-wins both orders). Ambient
  `size` scales the em ladder for free (no heading change). Gradient
  reaches Heading via its hook in the residue sheet.

### 1.3 The layering ladder (verified F3)

```
face element rules   (0,1,1)   :where(.jx-pure) p:not(…)
prose residue rules  (0,2,0)   [data-jx-ty-X] :is([data-jx-text='p'])
markdown sheet rules (0,2,1)   [data-jx-markdown] p / trio / rhythm
consumer utilities   utilities layer (always wins)
```
Sovereignty: the trio's root declarations beat inheritance; §2a beats
the residue INSIDE markdown — an outer `<Prose size leading>` can
never fight `<Markdown typography=…>`; ink/flow knobs pass through
(the face declares no p color; links keep primary by the B2 element
rule — the recorded exception). Chrome stays unaffected BY CASCADE
(element-level declarations beat inherited wrapper color) — pinned by
the orthogonality probe (a Chip beside a P in a muted region). Code/
kbd stay mono under family (face B1 element rules). Prose stamps no
data-density (the trio's own naming argument, shared).

### 1.4 The frozen v1 vocabulary

| knob | type | notes |
|---|---|---|
| size | CssLength | inheritance ONLY — markdown sovereignty for free |
| leading | number | P-only lane; headings keep 1.25 |
| family | 'sans'\|'mono'\|'serif'\|raw | words → var(--font-*); serif needs the theme token (documented) |
| ink | InkName\|raw | union 'default'\|'muted'\|'primary'\|'destructive' → the four foreground tokens; raw escape (the hue-law seam shape transferred) |
| gradient | {from,to,angle?}\|raw | fill-only mechanism §1.2 |
| ground | InkToken | the region's ground; Mark's own highlight law untouched |
| align | start\|center\|end\|justify | justify pairs with hyphens (docs guidance) |
| indent | CssLength | P-only; '2em' = 中文稿纸惯例 |
| initialLetter | 2\|3\|4\|5 | both arms; suppresses indent |
| wrap | pretty\|balance\|stable | pretty=prose, balance=heading scopes (guidance) |
| hyphens | auto\|none\|manual | auto needs lang (documented) |

Backlog frozen OUT (proposal's list) — each future knob is an
additive scope field + sheet rule + probe in its own change.

## §2 blockquote rule×ground (ask 1)

- `blockquoteRuleSlot = defineLiteralSlot(['shadow','border'],
  'shadow')`; `blockquoteRuleSizeSlot = defineLiteralSlot([1,4,8],1)`
  (numeric closed domains lawful — defaults.svelte.ts:121). NOT bare
  `size` (vocabulary collision + the family's no-font-size law).
  Literal slots never read zone (the kbd contrast test pattern).
- Rule utilities (probed): `shadow-[inset_{N}px_0_0_{color}]` /
  `border-s{,-4,-8}`; color = the RUNG's border-color declaration
  (outline → `--jx-outline`; tonal → the 45% color-mix — one hue
  source: jx-hue-* retunes ground+box+rule together; a 100% accent
  bar rejected: second ink weight on one edge).
- **The inset standard cited** (the Owner's "我们有相关标准"):
  command-item's `shadow-[inset_2px_0_0_var(--primary)]`, the
  elevation grammar's WELL tier (inset at rest), kbd's
  `--shadow-engrave` lineage (jx-pure.css:938). The literal px ladder
  (1/4/8) is the Owner's explicit enumeration — recorded as the
  ruling over a derived-scale.
- One shadow utility per root (@property --tw-shadow composition,
  probed); ps stays fixed across sizes (border consumes geometry,
  shadow doesn't — paint never moves geometry; ruling B3 honest).
- Forced colors: shadow modes re-materialize as Npx CanvasText
  border (`forced-colors:shadow-none forced-colors:border-s-[Npx]
  forced-colors:border-[CanvasText]`); border modes keep today's
  degradation; tonal keeps Canvas ground. A NEW degradation the spec
  amendment must name (F8).
- Hook: `data-jx-blockquote={variant}` unchanged; adds
  `data-jx-blockquote-rule="{rule}-{size}"` (ruling B7 compound).
- **Tonal+shadow-1 is a deliberate near-no-op** (axis uniformity;
  stated in spec + docs — F8 amendment). **Component-wide blast
  radius**: every quote (standalone AND markdown) flips border→
  shadow-1; the Owner's browser review on dev AND production builds
  is the change-exit criterion (B9 escalated), with a 1-vs-4
  ruleSize side-by-side canvas for the default-width taste call (B1).

## §3 Link suffix-icon (ask 4)

Tri-state `icon?: Snippet | null` (ruling B4 — the input law
verbatim; the only shape expressing "no opinion" ≠ "off"):
- undefined → `<Icon name="externalLink" size="0.8em" />` shown IFF
  external (inline-core, sync getIcon — SSR paints, no flash; F6);
- null → lane off (the 属性开关);
- snippet → custom content in the lane.
Lane: `<span data-jx-link-icon aria-hidden="true" class="ms-[0.2em]
inline-flex flex-none align-[-0.125em]">` INSIDE the anchor (both
fleet precedents). `data-jx-link` unchanged. registry: +@jixoai/icon
(edge ownership rule: import the component). Site-wide delta: every
external markdown/docs link gains the glyph — covered by the same
Owner review. Markdown specs asserting anchor children update.

## §4 List marker + nav (ask 5)

- `marker?: 'disc'|'circle'|'square'|'decimal'|'alpha'|'roman'|
  'none'` — resolution `marker ?? (ordered ? 'decimal' : 'disc')`
  (omitted = today's B8 restoration byte-parity; marker overrides).
  Probed utilities: list-disc/circle/square/decimal/none core;
  `[list-style:lower-alpha]`/`[list-style:lower-roman]` arbitrary.
  Lowercase only (upper = escape hatch). Marker ink stays the B8 law;
  marker size/spacing/density deliberately absent (ambient scale +
  the no-margins recorded law). `none` keeps ps-6 (indent is
  structural; nav drops it).
- `nav?: string` (the aria-label; presence switches): renders
  `<nav aria-label={nav} data-jx-list-nav>` wrapping the ol/ul
  defaulting `list-none ps-0` (explicit marker still overrides).
  **class/rest land on the LIST element** (the spec-pinned contract);
  the wrapper carries ONLY aria-label + data-jx-list-nav (F14 pin).
  Bare `<a>` children inside a face scope get the B2 chrome lane
  free; standalone, B2 is NOT re-implemented — the docs state the
  lane split (plain anchors in-scope vs the Link part as the prose
  lane). `reversed` widened (ol-only; the start-only comment updated).
- Markdown non-regression: the map passes ordered/start only →
  byte-identical stamps; the map never emits nav/marker.

## §5 Registry/docs chain (F11's enumeration, the unpriced cost priced)

- registry.json: prose (ui; deps utils/jixoai-theme/defaults/icon? —
  the Icon default needs @jixoai/icon + icon-set edges declared if
  prose itself renders icons — v1 prose renders NO glyph, so no icon
  edge on prose; link gains @jixoai/icon) + typography (lib; dep
  @jixoai/context-plugin) + markdown's deps unchanged (no new edges —
  blockquote/list/link APIs grow, edges exist).
- Freeze recount (live totals at implementation time; dated comment),
  mirrors + gen-mirror-manifest, root build for public/r payloads,
  llms-txt regen (build does it), the prose docs page (two-file floor
  + canvas/TOC laws + hand-authored props rows), the three upgraded
  pages (rule×size canvas, icon lanes, marker matrix + nav canvas),
  variant-grammar page (blockquote demo line + elevation section
  citing the rule), svelte.config prerender for prose.html.
- Tests: prose scope (unit: shape/plugin/nested/absent/Defaults
  coverage; measured probes: the ladder, the sovereignty probe BOTH
  directions, heading ink var-follow + consumer override, gradient +
  mark restore, chrome orthogonality, initialLetter both arms, print/
  forced-colors restores, indent-not-heading, serif-keeps-code-mono);
  blockquote rule matrix + hooks + forced-colors guard + markdown
  new-default; link tri-state + markdown glyph updates; list marker
  resolution + nav shape + byte-parity. Gates: verify:context (no
  vocabulary bump — verified F1), hook-law (all new hooks
  shadow-clean — verified F2), css-architecture, budgets baselines
  re-record if prose.css moves the needle.

## §6 R3 amendments (the Owner's browser-review rulings, 2026-09-08)

- **blockquote**: `ruleSize` own flips 1→4 (the Owner ruled the 1px
  hairline "只适合 xs2 尺寸" — the 4px manuscript bar is the default);
  the rule color LIGHTENS to a 55% transparent mix of `--jx-outline`
  (the "muted 太深" ruling — full-strength reads as a second ink
  weight); the body rides `text-[0.875em]` of the ambient scale (the
  "字体要变小" ruling — the ONE font-size exception to the
  no-font-size law, em-based so trio/prose rescaling survives; the
  label/cite chrome rows keep their fixed 0.8125rem). Ruling B1's
  "own 1" is superseded by this section.
- **The CodeCanvas same-source refactor** (the Owner's second ask —
  the drawer's code must BE the canvas's real markup, via compile-time
  extraction): designed in R4 lanes; the owner's pseudocode sketch
  (`<CodeCanvas id>` + `resolveRawCode(id)` in CodeFile templates)
  is the requirement statement.

## §7 The canvas same-source design (R3-②, collision-integrated)

Proposal C + the adversarial review (12 findings, all folded). The
mechanism: a per-page virtual module `virtual:jixoai-canvas/<rel>/+page`
served by a new `canvasPlugin()` STANDALONE export in
packages/vite-plugin (F3: the umbrella defaults ghostty on — the
vitest wiring must not drag wasm resolution; a `./canvas` sub-entry
exports the pure extractor for tests). Pages import
**`resolveRawCode`** (F-review ruling 1: the Owner's own word — the
sketch is the requirement statement) + a `$lib/canvas-usage.ts`
`usageFile(imports, body, {script?})` helper (F9: the lib file lands
in BOTH trees per the mirror law).

Amendments folded:
- **F1 (BLOCKER)**: `svelte` = optional peerDep AND devDependency of
  packages/vite-plugin + `'svelte'` in tsdown externals — www links
  the plugin via SYMLINK, so runtime resolution walks the package's
  own node_modules; peer-alone never resolves.
- **F2**: pilots = blockquote, link, list, prose. markdown = STRETCH
  (every demo references page-level identifiers — the streaming
  machine is ~60 lines; migrating it without §6.4 identifier lifting
  re-creates the drift class this change kills). markdown stays
  opted-out (no ids) until the lifting lands.
- **F4**: the extractor validates slice SELF-CONTAINMENT — every
  snippet/render reference in the slice must resolve within the
  slice, else a named build error (never a broken copy-paste sample).
- **F5**: resolveId returns the `\0`-prefixed virtual id (the icons
  precedent), re-derives the page in load(); `?t=` tolerated.
- **F6**: NO root config option — the page derives from resolveId's
  IMPORTER (validation kills cross-page copy-paste; the config twins
  stay trivially byte-identical).
- **F7**: budget honesty: extraction is LONGER than the distilled
  consts it replaces — "≈ neutral, measured per pilot", no ≤0 claim;
  the parser bridge stays out of the entry chunk (the graph-purity
  precedent) and dist/canvas.js gets a budget line if it chunks.
- **F8**: load() wraps parse in the named-error overlay pattern
  (mid-edit syntax errors name the page); HMR probe stays priced.
- **F12**: the aria-id collision fix rides the pilots (blockquote,
  link now; list + component-canvas.html sweep in the follow-up).
- **F7-review**: the svelte.config.js twin drift (registry copy
  missing link/list/prose prerender entries — OUR residue) folds
  into this change as a one-line fix; the gate-3.5-spirit extension
  (svelte.config byte-identity) is a separate follow-up.
- Honest extraction confirmed (ruling 2): byte-honest slice, dedent +
  trim only, comments kept, direct-child canvas-protocol snippets
  stripped, nested snippets kept; NO elide marker (an anti-law drift
  hole). Opt-in per canvas (ruling 3): no id = skip = zero cost; the
  verify-docs lint extension scopes to virtual-id-importing pages
  only (ruling/F10: non-drawer CodeBlock samples stay hand-authored).
