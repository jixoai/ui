# Proposal A — the typography context (prose scope)

Designer: subagent round 1. Attacked in review round; see review-r1.md.

## Architecture ruling

A **typed context key + composite scope object** (`TypoScope`), NOT new
axis vocabulary (would version-bump the context-coverage enumeration
for 11 words — vocabulary inflation), NOT per-family style props (the
sugars are deliberately prop-thin; the Owner excluded per-element
props). Lawful per the HIGHLIGHT_KEY / CONTROL_CHROME_KEY / physics-
axis (PRESS_TEXTURE_KEY) precedents: non-axis context lanes are
sanctioned when the domain is not variant paint. Prose ink/flow
touches none of the four hue slots.

**Two channels** (the density contract verbatim):
- **JS**: `registry/files/lib/typography.svelte.ts` (a registry:lib
  item, density's mirror posture): `TYPOGRAPHY_DEF` (defineContextDef,
  defaults → undefined — the no-opinion fleet law), module-private
  `TYPOGRAPHY_KEY`, `provideTypography(() => scope)` getter-endorsed,
  `getTypographyScope()`. The plugin chain applies AT THE PROVIDER
  (`scope.apply(TYPOGRAPHY_DEF, knobs)` in $derived) — a print plugin
  can strip gradient/ground before CSS sees them.
- **CSS**: the `<Prose>` provider component writes on its host only:
  direct inherited declarations for inheritance-lane knobs + `--jx-ty-*`
  custom properties + PRESENCE data hooks (`data-jx-ty-leading`,
  `-indent`, `-initial`, `data-jx-ty-ink="gradient"`) — presence-gated
  because an ungated `var(--jx-ty-leading, inherit)` rule would fire
  always and break the face's p{1.6} everywhere (the no-opinion stamp
  law, CSS edition).

**Consumption is almost pure CSS** via a scope-owned residue sheet
(`prose.css`, the markdown.css precedent): P and marks take ZERO file
edits; Heading takes ONE utility edit (`text-foreground` →
`text-[var(--jx-ty-ink,var(--foreground))]` — layer law: a components
sheet rule can never beat heading's own utilities class). text/heading
gain NO registry dependency on the typography item — hook carriers,
reached by hook.

**Color ruling**: the context IS a value-domain carrier (code-card
`code` precedent) whose CANONICAL form is the token reference;
`ink`'s curated union = 'default'|'muted'|'primary'|'destructive' →
the four foreground tokens, with `(string & {})` as the raw escape
hatch (the hue-law's two-layer seam shape transferred). Chrome stays
unaffected BY CASCADE: element-level declarations (face B3 buttons,
chip/badge ink utilities) always beat an inherited wrapper color —
pinned by a probe. Links keep primary (face B2 element rule) — the
recorded exception.

## The frozen v1 vocabulary (11 knobs)

| knob | CSS | lane | type |
|---|---|---|---|
| size | font-size | inheritance ONLY (never element stamps — this is markdown sovereignty: the trio's root declaration beats inheritance for free) | CssLength |
| leading | line-height | wrapper decl + presence-gated sheet rule on P (the un-short-circuit generalization; headings keep 1.25) | number |
| family | font-family | inheritance; 'sans'|'mono'|'serif' words → var(--font-*); code/kbd stay mono (face B1 element rules) | word or raw |
| ink | color + --jx-ty-ink | inheritance; Heading consumes via var-fallback utility | InkName or raw |
| gradient | background-image + clip:text + fill:transparent | ELEMENT lane, gated `data-jx-ty-ink="gradient"` on P/Heading hooks; marks inside restore solid ink (currentcolor); forced-colors+print restore (sheet+plugin) | {from,to,angle?} or raw |
| ground | background-color | wrapper decl | InkToken |
| align | text-align | inheritance | start\|center\|end\|justify |
| indent | text-indent | P-ONLY element lane (headings must never inherit a first-line indent) | CssLength ('2em' = 中文稿纸惯例) |
| initialLetter | initial-letter + ::first-letter float fallback | P-ONLY, @supports-gated modern path + float fallback; suppresses indent on the same P | 2\|3\|4\|5 |
| wrap | text-wrap | inheritance; pretty for prose, balance for heading scopes (docs guidance) | pretty\|balance\|stable |
| hyphens | hyphens | inheritance; auto needs lang (documented) | auto\|none\|manual |

Backlog (frozen OUT): tracking/word-spacing, weight, style, transform,
decoration family, text-shadow, line-clamp, writing-mode, white-space,
word-break, tab-size, columns, hanging-punctuation, font-variant,
per-mark tinting, gradient-riding marks, measure.

## The layering ladder (the sovereignty contract)

```
face element rules   (0,1,1)  :where(.jx-pure) p:not(…)
prose residue rules  (0,2,0)  [data-jx-ty-X] :is([data-jx-text='p'])
markdown sheet rules (0,2,1)  [data-jx-markdown] p / rhythm / trio
consumer utilities   utilities layer (always wins)
```
markdown's §2a (0,2,1) always beats the prose rule inside
[data-jx-markdown] → a P inside markdown keeps `line-height: inherit`
→ the trio's root value: an outer `<Prose leading>` can NEVER fight
the preset; for `size` the trio's root declaration beats inheritance
— the prose scale paints ONLY through inheritance precisely so this
cascade fact does the masking. NO JS masking, NO markdown changes.
Ink/flow knobs pass through (the trio owns scale only). Density lane
untouched (prose stamps no data-density). `<Prose>` mounts jx-pure on
its root (face by class, consumed never redefined).

## API

`<Prose size leading family ink gradient ground align indent
initialLetter wrap hyphens>` renders a `div.jx-pure[data-jx-prose]`
host, resolves knobs via ProseDefaults (every knob an absentSlot —
absence IS the state; only `size` collides with the gate vocabulary
and absentSlot satisfies the Defaults law without any version bump),
applies the plugin chain in $derived, provides the context, emits
only-set vars/decls + presence attrs, `cn()` consumer class last.
`provideTypography()` zero-DOM form documented v1 as host-owns-element
(the ButtonVariantScope pattern).

## Tests
Unit: scope shape, plugin intervention (print flattening gradient),
nested nearest-wins, absent → zero vars/attrs, Defaults coverage.
Measured probes: the specificity ladder; the SOVEREIGNTY probe
(Prose size+leading wrapping Markdown typography=relaxed leaves inner
P at 16px/1.75); heading ink var-follow + consumer override; gradient
P + inner Strong restores; chrome-orthogonality (Chip next to P);
initialLetter both @supports arms; forced-colors/print; indent P-not-
heading; serif region keeps code mono. Gates: verify:context, hook-law
(data-jx-ty-*, data-jx-prose css-defined), css-architecture layers,
zero-npm on the lib item.

## Open questions (for the reviewer)
1. Naming: Prose vs TypeScope; ink/ground vs fg/bg; --jx-ty-* prefix.
2. The size absentSlot price (a Defaults file of degenerate-absent slots).
3. .svelte.ts double-runtime (control-chrome's B5 claim vs density's
   working practice) — resolve empirically.
4. Gradient structured vs raw-only.
5. leading scope P-only vs li/blockquote interiors.
6. initialLetter float fallback in v1 or @supports-only.
7. Marks under gradient: solid restore (v1 default) confirmed?
8. Heading var-fallback utility vs tailwind-merge classification.
9. Zero-DOM helper in v1?
10. Markdown posture: trio owns scale, ink passes by inheritance, no
    markdown change — confirm.
