# design — native-contract-fusion (frozen r1, Codex verdict integrated)

> Law sources: this file + the native-contract spec delta.
> Codex design round: 2026-08-27, `codex-jx-pure-fusion`
> (gpt-5.6-terra xhigh). Confidence: brief-as-written 6/10 →
> with this design's corrections 8.5/10 (Codex's own scoring).

## 1. The management law (Codex verdict: "A-verified")

```
        ┌────────────────────────────────────────────────────┐
        │ LAW SOURCE (single)                                │
        │   openspec native-contract spec  +  jixoai.css     │
        │   (DOM contract / state matrix / token interface)  │
        └──────────────┬─────────────────────┬───────────────┘
                       ▼                     ▼
        ┌──────────────────────┐  ┌──────────────────────────┐
        │ RENDERER 0 — jx-pure │  │ RENDERER 1 — registry    │
        │ pure CSS, zero JS,   │  │ Svelte + slots +         │
        │ zero tailwind dep;   │  │ @apply mirror sheets;    │
        │ hand-written sheet   │  │ consumes the SAME Part A │
        │ (canonical, mirrors  │  │ contract classes         │
        │ + gzip-budget gated) │  │                          │
        └──────────┬───────────┘  └────────────┬─────────────┘
                   └──── computed-style PARITY GATES ────────┘
                     (same DOM fixture, both renderers,
                      state matrix, normalized values)
```

- **Values were never duplicated** — jixoai.css tokens + density
  scopes already feed both sides. What was duplicated is the RULE
  layer; the rule layer is now either (a) shared byte-exact (Part A
  contract) or (b) mirrored rule-by-rule under parity gates.
- `@apply` is an IMPLEMENTATION SYNTAX of renderer 1, never a law
  source. jx-pure.css keeps zero tailwind dependency (usable on
  arbitrary DOM, adoptable into shadow roots).
- daisyUI-style single-source codegen (their build.js compiles
  @apply → literals and emits everything from one plugin source) is
  REJECTED for now. Re-entry conditions (all four required): the
  source format can express unlayered Part A + the per-rule
  `.no-jx-pure` reverse scope; consumer Tailwind version is pinned
  and reproducible; generated jx-pure gzip stays ≤18KB; cross-engine
  parity gates all pass. Current gzip headroom is ~0.85KB
  (17,149B/18KB) — alone that kills B until the sheet shrinks.

## 2. The Part A contract layer

- `registry/files/theme/jx-native-contract.css` is a GENERATED,
  byte-exact extract of jx-pure.css Part A (the class vocabulary
  region + its icon custom properties + its reduced-motion prelude).
- Generation: `scripts/gen-jx-native-contract.mjs` slices between
  BEGIN/END markers planted in jx-pure.css around Part A; the extract
  is never hand-edited; `verify:contract` (folded into the mirror
  gate family) fails on drift either side. **jx-pure.css remains the
  hand-written canonical** — direction is extract-from-face, not
  assemble-face (zero blast radius on the existing byte locks:
  parity spec text probes, mirror manifest hashes, 18KB budget).
- New `registry:lib` item `@jixoai/jx-native-contract`
  (registryDependencies: `@jixoai/jixoai-theme` — Part A consumes its
  tokens and density aliases). The 12 UI items currently depending on
  `@jixoai/jx-pure` switch to it. The jx-pure item keeps shipping the
  full face (A+B+C+D) for the componentless use case.
- Consumers of a native component import: tailwind entry → jixoai
  theme → jx-native-contract.css (lighter) OR jx-pure.css (the full
  face, superset). The docs site keeps its global jx-pure.css import
  (it demos the face; Part A arrives with it).
- **Double-paint safety is a derived property**: where renderer-1 DOM
  sits inside a `.jx-pure` subtree, Part B may paint the same bare
  element the component's mirror rules paint. Identical declarations
  ⇒ identical result regardless of winner; divergence is exactly what
  the parity gate forbids. Component-only extras (slots, tgroup
  geometry) target classes Part B never touches — no competition.

## 3. The @apply mirror law (renderer-1 authoring standard)

Per-component mirror sheets live in the existing folder css
(`<item>.css`, opened by the canonical layer statement):

| Paint kind | Expression |
|---|---|
| static geometry/flex/spacing (context-free core utilities) | `@apply flex items-center box-border …` |
| static token-bound paint | plain CSS declarations (`background: var(--background)`) or arbitrary utilities (`@apply min-h-[var(--jx-hit)] text-[length:var(--jx-text)]`) |
| state machines (`:checked`/`:has()`/`:focus-visible`/`:focus-within`) | unlayered `:where()` bare CSS (the state-machine carve-out, unchanged) |
| UA pseudos (`::-webkit-*`, `::-moz-*`), `@keyframes`, `@property`, `@supports`, forced-colors | bare CSS |
| slot-wrapper / one-off layout in markup | inline utilities allowed, incl. arbitrary variants (`[&::-webkit-scrollbar-thumb]:rounded-full`) |

**Hard ban**: `@apply` of NAMED theme utilities (`bg-background`,
`border-border`, `text-muted-foreground`) in folder css. A standalone
folder sheet has no Tailwind context; verified empirically (TW 4.2/4.3
via @tailwindcss/vite): `@apply border-border` → "unknown utility",
while arbitrary utilities compile. Named utilities may only appear in
markup (which has context) — this extends the existing `@utility` ban
in css-architecture with the same rationale.

Mirror-sheet rules sit in `@layer components` behind `:where()`:
consumer utilities keep winning (the layer law), and Part B ties are
harmless by §2's parity argument.

Migration posture: the native family's INLINE static utility strings
move into mirror-sheet rules; markup keeps Part A classes, semantic
hooks (`data-jx-*`), and slot one-offs. Composites (select,
combobox, date-picker, …) keep utility-in-markup for their own
surfaces — they are renderer-1-only law, no Tier-0 twin.

## 4. The native vocabulary (1:1 granularity)

| jx-pure law (Tier-0) | registry component (Tier-1) | Notes |
|---|---|---|
| text-like input lane (13-type allowlist, `.jx-control` family) | `input` | keeps multi-type branches (range/color consume Part A `.jx-slider`/`.jx-color-shell`) |
| textarea lane | `textarea` | |
| select chevron/listbox law | `native-select` | the worst drift offender today — first pilot |
| checkbox repaint + indeterminate | `checkbox` | |
| radio repaint | `radio` | |
| slider law (`.jx-slider`, Part A) | `range` | consumes the Part A class; its own css mirrors the B5-adjacent geometry |
| switch (`[role=switch]`, B13) | `toggle` | |
| toggle-group (NEW `.jx-tgroup` Part A law) | `toggle-group` | name kept; no native- alias |
| table/details/progress/figure/fieldset laws | — (Tier-0 only) | no component mirror; the face serves them |

Color does not get a separate component (the `input` color branch
consumes `.jx-color-shell`; `color-picker` is a composite).
`number-input`, `select`, `date-picker`, `combobox`, `tags-input` are
composites — they keep their `@jixoai/jx-native-contract` dependency
for internal lanes but are out of the mirror-pilot scope.

SCOPE RULING (Phase 4b, 2026-08-27): `range` is a fully custom
slider (div + Pointer Events, deliberately NOT input[type=range],
form participation via the bridge) — it is NOT a native wrapper and
stays out of the @apply mirror migration. Its `.jx-slider` stem
class remains the shared-vocabulary link to Tier-0; whether a
native-range wrapper beside it is warranted is a future change's
question (input.svelte's range branch already renders the native
control).

## 5. toggle-group native contract

DOM (identical contract both renderers):

```html
<div class="jx-tgroup" role="radiogroup" aria-label="…">   <!-- role=group when multiple -->
  <label class="jx-tgroup-item">
    <input type="radio" name="density" value="sm">          <!-- visually hidden, focusable -->
    <span class="jx-tgroup-content">…children/snippets…</span>
  </label>
</div>
```

Decisions (Codex table + additions, all binding):

1. **single = radio, multiple = checkbox**; `select[multiple]`
   rejected (listbox posture, wrong interaction model).
2. **No re-press clear** in single mode (native radio semantics;
   an explicit `none` item is the pattern for optional-empty).
3. **Keyboard**: native — radio arrow-walk + ONE tab stop;
   checkbox Space/Tab per item. The old "arrows are tabs' job"
   comment is retired with the button implementation.
4. **FormData**: native name-based; single submits one value,
   multiple submits repeated entries in DOM order (server reads
   `getAll`). The jx-form-field bridge is DELETED from this
   component. Documented consequence: multi-entry replaces the
   bridge's newline-join (values containing newlines are now
   unambiguous).
5. **name**: REQUIRED for single (radio grouping/exclusivity is
   name-scoped — without it the control is broken); optional for
   multiple (form participation opt-in).
6. **State**: DOM `checked` is the uncontrolled truth; `value`
   ($bindable) is a projection — DOM `change` updates it; external
   `value` writes back to the DOM; never blind two-way loops.
7. **form reset**: `form.reset()` restores initial `checked`;
   the root listens for the reset event and re-syncs `value` in a
   microtask (browser-tested).
8. **required**: single mode forwards `required` to the inputs
   (native group-required). "At least one of many" (multiple) is NOT
   natively expressible — documented as out of scope (validation
   layer's job), no fake semantics.
9. **Value uniqueness**: duplicate `value`s inside one group are a
   contract violation (breaks radio identity and projection);
   documented, dev-mode no cheaper than docs.
10. **Event API**: native event forwarding (`onchange` etc.) is
    SEPARATE from the value callback `onValueChange`; internal
    handlers are bound AFTER `{...rest}` so consumer spreads cannot
    sever the value law (reverses today's footgun Codex flagged).
11. **Slots**: children render inside `.jx-tgroup-content`;
    `slotStart`/`slotEnd` snippets optional. Interactive descendants
    are banned inside the label content (a label owns exactly one
    labelable — the input).
12. **CSS discriminator**: `.jx-tgroup` is the single CSS-owned
    opt-in class (Part A family — structure by opt-in class, the
    `.jx-control-shell` precedent). `data-jx-tgroup` stays as the
    semantic/test hook. Roles are NEVER css discriminators; no
    structural `:has()` detection of plain radio fieldsets.

Tier-0 paint (jx-pure.css Part A, NEW law): `.jx-tgroup` joined-edge
row (labels as segments, `label:not(:last-child)` right border),
active segment via `label:has(input:checked)`, focus ring via
`:has(:focus-visible)`, disabled dim via `:has(input:disabled)`,
geometry from the density aliases (`--jx-hit/--jx-line/--jx-inset/
--jx-text`). Renderer-1's mirror sheet carries the same declarations
(consumes the same Part A class — the tgroup law IS Part A, so both
renderers share it byte-exact; renderer-1 adds only the Svelte law).

## 6. Part B density adoption (spec-drift resolution)

Direction: the FILE moves to the token interface the spec already
mandates (never the spec back to literals).

- B3/B4/textarea/select/summary rows: `min-height/min-block-size:
  var(--jx-hit, 2.5rem)` etc. — the alias interface with today's
  values as fallbacks where Part B may load without the theme.
- B0 scope root gains `font-size: var(--jx-text, 0.8125rem)` +
  `line-height: var(--jx-leading, 1.6)` (the spec's claim, currently
  false in the file).
- switch already carries `--jx-toggle-*`; color uses
  `--jx-color-lane`/`--jx-icon`; the typography ladder keeps
  hard-coded steps until a typography token law exists (declared
  gap, not silently faked).
- `scripts/verify-jx-pure.mjs` + `verify-jx-pure-engines.mjs`
  assert DERIVED numbers under each `data-density` scope instead of
  the `40px` literals.

## 7. Gates & migration order

Codex's landing order, binding:

1. OpenSpec authoring (this change) — DONE at freeze.
2. **Clean-consumer probe** (`scripts/probe-tw-context.mjs`, or a
   vitest): compile a fixture folder css with @apply of (a) a named
   theme utility, (b) an arbitrary utility, (c) a context-free core
   utility against a clean consumer entry; assert (a) fails, (b)(c)
   pass — locking the §3 ban to evidence, not lore.
3. Part A extraction: markers + generator + `@jixoai/jx-native-contract`
   item + the 12 dependency switches + registry.json description
   fix (jx-pure's stale `.jx-input/.jx-range` wording).
4. toggle-group native rewrite (both renderers; the parity fixture
   IS its acceptance).
5. Pilots: native-select → input → textarea → checkbox → radio →
   toggle (worst-drift first, then by blast radius).
6. `verify-native-parity.mjs`: for each vocabulary row, one shared
   DOM fixture rendered (i) bare under `.jx-pure` and (ii) as the
   component; computed styles compared over each probe's
   posture-agnostic property whitelist, across the DECLARED matrix —
   and the declaration is VALIDATED (sections, environment markers,
   state actions; no silent under-coverage), states isolated per
   fresh page. The full {hover, aria-invalid} × per-row-density
   cross-product is the declared GROWTH PATH, not this change's
   claim (r3 ruling: spec and design carry one matrix contract).
   Values normalized (color-component tolerance). Screenshot oracle
   (tolerant pixel comparator) supplements pseudo builds — never
   replaces computed-style assertions; the documented
   rasterization-path artifact stays warn-only.
7. verify:mirror (now covering the contract extract), gzip budget,
   jx-pure parity spec, svelte-check, vitest suite — green at every
   batch commit.

## 8. Risks & honest gaps

- **Batch test churn**: batch4-components.spec.ts locks today's
  bridge payload + aria-pressed markup — rewritten with the
  component, deliberately (the contract change is the point).
- **`:has()` baseline**: the tgroup law rides `:has()` (already
  load-bearing in Part A/checkbox `:has()` laws — same baseline).
  No old-engine fallback is invented; degradation = the face's
  forced-colors/reduced-motion laws only.
- **1.25KB gzip headroom** on jx-pure.css: the Part A tgroup law +
  Part B density sweep must mind the budget; if exceeded, the sweep
  wins spec-compliance and a follow-up minification change is filed
  (the 13-type allowlist repetition is the known fat — a separate
  change, not smuggled into this one).
- Codex flagged `density-adoption-form-text.spec.ts` scanning stale
  `--jx-d-*` (may pass on comments): the parity/native gates here
  make that scan irrelevant for the native family; the stale scan
  itself belongs to the stale-standards follow-up, not this change.
- Composites are explicitly OUT of scope for mirror sheets this
  change (they may adopt later, per-family, through their own
  changes).

## 9. Verification evidence index

Maintained in `verification.md` as batches land (probe output,
gate runs, parity matrices, Codex review rounds).
