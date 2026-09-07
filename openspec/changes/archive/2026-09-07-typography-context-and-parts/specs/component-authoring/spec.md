# MODIFIED Requirement: the blockquote face (quote and admonition)

The `blockquote` item is the reading-content quote surface: a native
`<blockquote>` root carrying a frozen two-rung prominence ladder
(`outline | tonal`, own `outline` — quote readability excludes fill
AND ghost) with hue by injection, an optional uppercase `label` row,
an optional `icon` snippet, and an optional `cite` attribution
(`footer > cite`).

**The RULE channel** (2026-09-08, the Owner's R2+R3 rulings): the
left rule is its OWN literal axis pair — `rule` (`shadow | border`,
own `shadow`) × `ruleSize` (`1 | 4 | 8`, own **4** — the Owner ruled
the 1px hairline fits xs2-scale contexts only) — NEVER a paint rung
(the separator ink-geometry precedent). The rule draws at a
LIGHTENED 55% transparent mix of the outline token (the "muted 太深"
ruling); the color rides the rung's own border-color source (one hue
source: a `jx-hue-*` retune moves ground, box, and rule together).
The inset standard: command-item's inset rule, the elevation
grammar's WELL tier, kbd's `--shadow-engrave` lineage. Tonal keeps
its box border plus the shadow rule (shadow-1 there is a stated
near-no-op for axis uniformity). ps stays FIXED across channels and
sizes (border consumes geometry, shadow doesn't). Forced colors:
shadow modes re-materialize as an Npx CanvasText border. The body
rides **0.875em** of the ambient scale (the "字体要变小" ruling —
em-based, so the typography trio and prose scopes still rescale it;
label/cite rows keep their fixed chrome size). The root is a
**centered flex column** (`flex flex-col justify-center`): an
externally stretched root centers its content vertically; at auto
height this is pixel-identical to block flow, and a flex container
IS a BFC so the markdown rhythm's containment intent survives.
Hooks: `data-jx-blockquote={variant}` and the compound
`data-jx-blockquote-rule="{rule}-{size}"`.

#### Scenario: the tuned default

- WHEN a plain quote renders (standalone or through markdown)
- THEN the rule is the 4px inset shadow at the 55% lightened mix, the
  body sits at 0.875em muted, and stretched roots center their
  content vertically

#### Scenario: the rule ladder

- WHEN ruleSize sweeps 1|4|8 in either channel
- THEN the rule's weight grows while paddings never move, and the
  two channels share the rung's single color source

# MODIFIED Requirement: the typographic link face

The `link` item is the text link: a native `<a>` with the face's
non-nav paint as its own utilities, absolute `http(s)` hrefs getting
`target="_blank" rel="noreferrer"`, relative hrefs navigating in
place. **The external suffix-icon lane** (2026-09-08): `icon` is
TRI-STATE (the input semantic-glyph law) — `undefined` renders the
default `externalLink` Icon part (inline-core, sync — SSR paints)
inside an aria-hidden span after the children, shown IFF external;
`null` disables the lane; a snippet customizes it. The marker is
em-sized (rides any ambient scale) and lives INSIDE the anchor. The
component declares the `@jixoai/icon` edge. Hook:
`data-jx-link={external ? 'external' : 'internal'}` plus the lane's
`data-jx-link-icon` presence.

#### Scenario: the lane's three states

- WHEN an external link renders bare, with `icon={null}`, and with a
  custom snippet
- THEN the default glyph, nothing, and the custom content appear
  respectively — internal links never show the lane

# MODIFIED Requirement: the prose list face

The `list` item renders the native `<ol|ul>` by `ordered` (with
`start`/`reversed` ol-only passthrough) owning the B8 channels.
**The marker vocabulary** (2026-09-08): `marker` —
`disc|circle|square|decimal|alpha|roman|none` — resolves as
`marker ?? (nav ? 'none' : ordered ? 'decimal' : 'disc')`: omitted
reproduces today's platform-per-element restoration; the value
overrides. Lowercase only (upper = the arbitrary escape hatch).
Marker ink keeps the B8 muted law; marker size/spacing deliberately
absent (ambient scale + the no-margins recorded law). `none` keeps
the structural indent. **The nav container mode**: `nav?: string`
(aria-label; presence switches) renders `<nav aria-label
data-jx-list-nav>` wrapping the list defaulted `list-none ps-0`
(explicit marker overrides the style, not the indent); class/rest
stay on the LIST element. Inside face scopes, plain anchors are the
lawful nav-mode children (the B2 chrome lane); standalone, B2 is not
re-implemented — the Link part is the prose lane. Hook:
`data-jx-list={ol|ul}` on the list element.

#### Scenario: the marker matrix

- WHEN each of the seven markers renders
- THEN the stamp matches the value (arbitrary-form utilities where
  the core utility silently no-ops — probe-pinned) and omitted
  markers reproduce the byte-identical platform defaults

# MODIFIED Requirement: the markdown face (streaming AST → registry parts)

[The streaming laws L1–L4, the parse adapter, the GitHub alert
detection, the typography trio, and the components seam are
UNCHANGED from the merged 2026-09-07 text.] Two map amendments ride
this change: (1) **task-item checkboxes mount the BARE Checkbox**
(the 2026-09-08 Owner ruling 用真组件): `<Checkbox bare checked
disabled>` — the presentation-only single input carrying the
component's `jx-html-checkbox` paint class, staying the DIRECT child
(or the parser's one wrapping paragraph) the container-level
DOM-shape laws key on (`li:has(> input)` suppression, the
vertical-align alignment) which the interactive wrapper's
div>span>input shape defeats; the source text owns the state. The
markdown item declares the `@jixoai/checkbox` edge. (2) **the quote
default**: plain quotes render the tuned shadow-4 rule (the
blockquote face's modified contract).

#### Scenario: task items are the real component

- WHEN `- [x] done` renders
- THEN the marker is a disabled input carrying `jx-html-checkbox`
  (the component's paint), checked per the source, with NO wrapper
  chrome between it and the li — the no-disc and alignment laws hold

# ADDED Requirement: the prose scope (the typography context)

The `prose` item + `typography` lib deliver the Owner's prose-scope
ask: app code sets typographic styling on a region; every P /
text-mark / Heading inside picks it up — by CONTEXT, never
per-element props. The shape: a composite `TypoScope` (ELEVEN frozen
knobs: size, leading, family, ink, gradient, ground, align, indent,
initialLetter, wrap, hyphens) on a typed context key OUTSIDE the
axis economy (the physics-key precedent — prose ink/flow touches
none of the four hue slots; no vocabulary version bump). Two
channels (the density contract): the JS context (types + key + pure
resolution in the lib; the context pair rides the empirically-proven
lib posture) with the plugin chain applying AT THE PROVIDER; and the
CSS channel — the `<Prose>` host emits only-set inherited
declarations + `--jx-ty-*` vars + PRESENCE-gated `data-jx-ty-*`
hooks, consumed by a scope-owned residue sheet (`prose.css`, layer
statement first) keyed on the families' existing hooks: P and the
marks take ZERO component edits; Heading takes ONE ink utility
(`text-[var(--jx-ty-ink,var(--foreground))]`). **The gradient
mechanism**: fill-only (`-webkit-text-fill-color: transparent`,
NEVER `color: transparent` — currentcolor on marks resolves against
the inherited solid); marks restore solid ink; print/forced-colors
restore in the SHEET (the paged clone never re-runs JS providers).
**Sovereignty by cascade** (verified): the markdown trio's root
declarations beat inheritance and its §2a (0,2,1) beats the residue
(0,2,0) inside `[data-jx-markdown]` — an outer Prose can never
fight a Markdown preset; ink/flow knobs pass through; chrome stays
unaffected by cascade (element declarations beat inherited color —
probed); density lane untouched. The knobs: size (inheritance-only),
leading (P-only lane; headings keep 1.25), family (words → font
tokens; code/kbd stay mono by face law), ink (curated four-word
union → foreground tokens + raw escape), gradient
(structured+raw), ground, align, indent (P-only; the 中文稿纸 2em
convention), initialLetter (BOTH arms: @supports modern + float
fallback; suppresses indent), wrap, hyphens. The vocabulary backlog
is frozen OUT; additions are additive knobs in their own changes.

#### Scenario: the scope styles the region

- WHEN `<Prose size leading ink indent initialLetter>` wraps P,
  Strong, and Heading
- THEN every member picks the knobs up through inheritance and the
  presence-lane sheet rules — no member carries a style prop

#### Scenario: markdown sovereignty holds

- WHEN a `<Prose size>` wraps a `<Markdown typography="relaxed">`
- THEN the markdown body keeps the preset's 16px scale — the trio's
  root declaration beats the outer scope's inheritance for free
