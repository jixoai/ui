# design — design-language-kernel

> AUTHORITATIVE contract, normatively self-contained (review-r1
> blockers 1/2/5/6/7 folded in: gutters-as-tracks rulers with exact
> area templates, the xs leading fix, the exact field-lane css, the
> FULL token block as appendix A, the layer/:where framing). The four
> forces, each with ONE owner:
>
> ```
> logical policy    Svelte getter context      resolveDensity + ruler mode
> CSS injection     data-density scopes        inherited --jx-d-* aliases
> geometry          group grid + subgrid       shared tracks, slot placement
> fallback geometry standalone :has() matrix   collapse only without a ruler
> ```

## 1. The scale (尺规 derivation — every number has an equation)

Ruler: `--jx-ruler-unit: 0.25rem` (U = 4px), `--jx-ruler-text-base:
0.8125rem` (T = 13px). Computed contract at a 16px root:

| density | text T | line L | inline gap G | stack gap S | inset B | row min | hit min | icon | image |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| xs | 11px | 16px | 8px | 4px | 8px | 28px | 44px | 16px | 32px |
| sm | 12px | 18px | 8px | 4px | 8px | 32px | 44px | 18px | 36px |
| default | 13px | 20px | 12px | 8px | 12px | 40px | 44px | 20px | 40px |
| lg | 15px | 24px | 16px | 8px | 16px | 48px | 48px | 24px | 48px |

```text
T_d       = T_base ± k·U            (xs −U/2 · sm −U/4 · lg +U/2; the
                                    fractions stay calc() in the sheet)
L_d       = T_d × leading_d         (xs calc(16/11) · sm 1.5 · default calc(20/13) · lg 1.6)
G_d       = U × inlineFactor_d      (2 · 2 · 3 · 4)
S_d       = U × stackFactor_d       (1 · 1 · 2 · 2)
B_d       = G_d                     (THE balance invariant)
contentGap_d = max(U/2, S_d/2)
rowMin_d  = max(L_d + 2·S_d, U × rowFloor_d)   (floors 7 · 8 · 10 · 12)
hitMin_d  = max(rowMin_d, 11·U)     (the platform target; lg resolves 48)
mediaIcon_d   = L_d                 (an icon sits IN one line)
mediaImage_d  = 2·L_d               (two lines; the seam is NEVER in the object)
secondaryText_d = max(0.625rem, T_d − U/4)     (a role, not a literal)
secondaryLeading = 1.5; secondaryLine_d = secondaryText_d × 1.5
```

The COMPLETE token-sheet block (all four derived sets + all four
scope mappings + the optical token) is **appendix A** — normative;
P2 implements it verbatim. Density scopes exist ONLY in the canonical
theme sheet AND its byte-identical generated mirror — never in
component css. Adoption law: `xs` is for dense non-touch metadata
surfaces only; `lg` ships in the API + one blueprint proof row; broad
adoption is the follow-up change. Color/terminal/bevel/press/
scrollbar tokens UNTOUCHED.

## 2. The context channel (`density.svelte.ts`)

Canonical `registry/files/lib/density.svelte.ts` + byte-identical
mirror; a real `registry:lib` item (`name: density`, no deps);
`list-item.registryDependencies` gains `@jixoai/density` (P0 applies).

```ts
export type Density = 'lg' | 'default' | 'sm' | 'xs';
export const DEFAULT_DENSITY: Density = 'default';
export interface DensityContext { readonly density: Density; }
export const DENSITY_KEY = Symbol('jx-density');
export function resolveDensity(explicit: Density | undefined,
  inherited: DensityContext | undefined): Density;   // explicit ?? inherited?.density ?? 'default'
export function getDensityContext(): DensityContext | undefined;
export function provideDensity(density: () => Density): DensityContext; // getter-backed, one stable object
```

Policy ONLY — no pixels, no style writes, no cn(). Component law:

```ts
const inherited = getDensityContext();
const resolved = $derived(resolveDensity(size, inherited));
// providers: provideDensity(() => resolved); every density-aware
// component stamps data-density={resolved}; a caller-supplied
// data-density key is component-owned and stripped from rest.
```

No forced app-root provider this wave (`:root` publishes the default
CSS scope; unresolved = 'default'). `size` keeps its call-site NAME,
type becomes `Density` (breaking: `data-size` authority REMOVED, no
alias). `controlSize` (sm|md|lg) stays a control footprint, never
changes row density.

## 3. The shared ruler (grouped geometry)

```ts
type ItemRuler = 'content-end' | 'media-content-end';
interface ItemGroupPolicy extends DensityContext { readonly ruler: ItemRuler; }
```

Default `content-end` — a DELIBERATELY media-less ruler. Media rows
opt the group into `media-content-end`; a missing media child RETAINS
the shared first track (alignment is the point). Misuse enforcement is
deterministic and observable: under content-end there is no `media`
named area, so a stray ItemMedia auto-places and visibly breaks — and
verify-item-ruler carries the negative DOM assertion (its fixtures
never place media under content-end; the assertion fails if one
appears).
`layout="media"` stays a local posture, never a silent ruler change.

The authoritative grouped css — appendix B (normative). Shape:
gutters are EXPLICIT gap tracks (`column-gap: 0` — no second rhythm);
`content-end` = 3 tracks `[1fr, G, max-content]`, `media-content-end`
= 5 tracks `[mediaImage, G, 1fr, G, max-content]`; the li wrapper AND
the .jx-item root are BOTH subgrids (inheritance stops at the
immediate parent); one fixed area template per ruler per wrap mode
(`content . end` / `media . content . end`; narrow auto re-areas to
full-width end rows, narrow never keeps the shared line — MIXED rows
coexist); header/footer/divider span `1 / -1`; every selector
`:where()`-wrapped inside the EXISTING `item.css` `@layer components`
block (no new global import — the living placement law). Rows carry
`min-block-size: var(--jx-d-row-min)`, `padding-block:
var(--jx-d-stack-gap)`, `padding-inline: var(--jx-d-inline-inset)`;
slots consume `--jx-d-*` aliases only (title = text/line;
description/after/field-label = secondary; media boxes per §1).

Topology split (NOT a half-migration):

| topology | geometry contract |
|---|---|
| grouped + subgrid | ONE ruler + fixed area templates; missing slots RETAIN shared tracks; spans span the ruler |
| grouped, no subgrid | the existing flex + matrix path (alignment lost, behavior kept) |
| standalone | the 16+8 exhaustive `:has()` matrix REMAINS (see the css-architecture MODIFIED delta) |

## 4. The balance law

```text
B = --jx-d-inline-inset;  G = --jx-d-inline-gap;  M = media box;  V = glyph box
row inline-start breathing = B          (row padding-inline-start)
media host width            = M          (icon = L, image = 2L; the seam is a GAP TRACK, never inside M)
media-to-content seam       = G
content inline start        = B + M + G
O = max(0, (M − V) / 2)                 (measured remainder, not a margin)
Q = clamp(var(--jx-d-icon-optical-inline, 0px), calc(var(--jx-ruler-unit) / -2), calc(var(--jx-ruler-unit) / 2))   (the ONLY nudge, default 0px)
```

Invariant: **B = G at every density**. Glyphs center via
`place-items: center`; one named bounded optical token; no
component-local pixel nudges, ever.

## 5. The field lane (the Owner's defect — exact css)

```css
:where([data-slot='item-end']) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--jx-d-end-gap);
  flex-wrap: wrap;
  min-width: 0;
  min-block-size: var(--jx-d-hit-min);   /* the INHERITED density value — never a literal 44px */
}
:where([data-slot='item-end'][data-wrap='never']) {
  flex-wrap: nowrap;
}
:where([data-slot='item-content']) {
  min-width: 0;                           /* labels may wrap */
}
:where([data-slot='item-content'][data-content-wrap='truncate'] > *) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

`ItemField` SHALL render `<ItemEnd wrap="never">` (a field invariant,
not a convention). Truncation is an explicit opt-in stamp. Plain
metadata/action rows (incl. text-only settings rows) REMAIN
wrap=auto. The known checkbox-group / registry-card stacking defect
dies here and stays dead via the ruler probe's fixture assertion.

## 6. List-item migration contract

- Props: `size?: Density` (name kept, widened, 'lg' added); ItemGroup
  gains `ruler?: ItemRuler` and becomes the first density PROVIDER
  (frame + list stamp data-density; provideDensity composition);
  Items/leaves stamp their resolved density; caller `data-density`
  keys stripped from rest.
- `data-size` dies everywhere (stamp authority = `data-density` only).
- item.css: the grouped rules become appendix B's block; the
  standalone matrix + narrow 8-combo block survive for
  standalone/no-subgrid; density-owned declarations reference
  `--jx-d-*` only (§7). PlayRow: no call-site changes.

## 7. The greppable no-literal-branch law

After comment-strip, in list-item css: (1) NO `[data-density=...]` /
`[data-size=...]` selectors (scopes live only in the theme sheet and
its mirror); (2) density-owned declarations (padding/-inline/-block,
gap/row-gap/column-gap, font-size, line-height, media width/height,
min-height/min-block-size, ruler track sizes) reference `--jx-d-*` or
family vars whose declaration references them; (3) dimension literals
rejected there EXCEPT named structural paint (`border/outline: 1px`,
`outline-offset: -1px`, the selected `inset 2px 0` edge, line indices
like `grid-column: 1 / -1`). Colors/weights/100%/auto/zero exempt.
Failures name file, selector, property, value.

## 8. Verification contract

`scripts/verify-density-kernel.mjs` (real Chromium): U computes 4px;
the FULL four-row table computes exactly per scope (incl. secondary
and content-gap rows); mediaImage == 2·line, seam excluded;
mediaIcon == line; provider→child inheritance + explicit-wins;
variables inherit through nested DOM; the §7 grep pass over
list-item css.

`scripts/verify-item-ruler.mjs` (real Chromium): three/five EXPLICIT
tracks and ZERO implicit tracks on both rulers; grouped media rows
share media/content/end x-coordinates; a no-media row KEEPS the shared
track; header/footer/divider span the ruler; at ≤30rem an auto end
takes its own full row while a never end stays on the shared line
(MIXED rows in one list); the exact checkbox-group fixture renders
content BESIDE the control (overlapping y-ranges, control right of
content — never stacked); the no-subgrid path still passes the
existing 33/33 matrix assertions.

jsdom suite (`apps/www/test/density-context.spec.ts`, P3-owned):
context stamps, nested shadowing, explicit override, SSR-visible
attributes, no-any. ItemField's wrap=never asserted in the existing
field spec. Owner visual walkthrough (blueprint at four densities,
mixed rulers, the two defect scenes) is the FINAL acceptance —
browser evidence never substitutes for it.

## 9. Multi-agent orchestration (executable sequence)

Sole-file ownership; shared files P0-owned. Sequence (review r1-4):

```
P0  manifest + contract hash + registry item/dep edge applied
P5a BOTH verify scripts scaffolded + named fixtures committed
      (assertions run red against the unmigrated tree where applicable)
P2  theme pair (appendix A)          → gate: verify-density-kernel + mirror parity
P3  context module + ITS spec file   → gate: density-context.spec + no-any + svelte-check
P4  the WHOLE list-item pair (ONE packet: kernel adoption §6 + ruler §3/§5)
      → gates: verify-item-ruler ALL GREEN + existing 33/33 matrix
        (standalone/fallback) + focused vitest + §7 grep
P5b final Chromium acceptance rerun of both scripts
P6  blueprint/docs (four densities, mixed rulers, defect scenes) → screenshots
P0  payload/manifest regen + combined suite + Codex impl review + archive
      (Owner visual acceptance precedes archive)
```

| packet | sole ownership |
|---|---|
| P0 ZCode | openspec change, registry.json, mirror-manifest, public/r, shared-file application |
| P2 | registry/files/theme/jixoai.css + apps/www/src/lib/jixoai.css |
| P3 | registry/files/lib/density.svelte.ts + mirror + apps/www/test/density-context.spec.ts |
| P4 | ui/list-item/** (both trees) — one packet, both halves — PLUS the existing list-item test surface: apps/www/test/list-item.spec.ts, test/list-item-field.spec.ts, test/playground-bridge.spec.ts, and the fixtures item-group-host.svelte / item-field-host.svelte / item-policy-host.svelte (updated for data-density stamps, ruler, and the field lane) |
| P5 | scripts/verify-density-kernel.mjs + verify-item-ruler.mjs + their fixtures |
| P6 | blueprints/scenes/list-item.svelte + list-item docs route |

Subagents NEVER commit; shared-file desires are reported, P0 applies
after review. The concurrent composition-first agent's files are
DISJOINT and untouchable.

## Appendix A — the normative token block

```css
:root {
  --jx-ruler-unit: 0.25rem;        /* U = 4px at the 16px root */
  --jx-ruler-text-base: 0.8125rem; /* T_base = 13px */

  --jx-density-text-xs: calc(var(--jx-ruler-text-base) - calc(var(--jx-ruler-unit) / 2));
  --jx-density-text-sm: calc(var(--jx-ruler-text-base) - calc(var(--jx-ruler-unit) / 4));
  --jx-density-text-default: var(--jx-ruler-text-base);
  --jx-density-text-lg: calc(var(--jx-ruler-text-base) + calc(var(--jx-ruler-unit) / 2));

  --jx-density-leading-xs: calc(16 / 11);
  --jx-density-leading-sm: 1.5;
  --jx-density-leading-default: calc(20 / 13);
  --jx-density-leading-lg: 1.6;

  --jx-density-inline-factor-xs: 2;
  --jx-density-inline-factor-sm: 2;
  --jx-density-inline-factor-default: 3;
  --jx-density-inline-factor-lg: 4;
  --jx-density-stack-factor-xs: 1;
  --jx-density-stack-factor-sm: 1;
  --jx-density-stack-factor-default: 2;
  --jx-density-stack-factor-lg: 2;
  --jx-density-row-floor-xs: 7;
  --jx-density-row-floor-sm: 8;
  --jx-density-row-floor-default: 10;
  --jx-density-row-floor-lg: 12;

  --jx-density-line-xs: calc(var(--jx-density-text-xs) * var(--jx-density-leading-xs));
  --jx-density-line-sm: calc(var(--jx-density-text-sm) * var(--jx-density-leading-sm));
  --jx-density-line-default: calc(var(--jx-density-text-default) * var(--jx-density-leading-default));
  --jx-density-line-lg: calc(var(--jx-density-text-lg) * var(--jx-density-leading-lg));

  --jx-density-inline-gap-xs: calc(var(--jx-ruler-unit) * var(--jx-density-inline-factor-xs));
  --jx-density-inline-gap-sm: calc(var(--jx-ruler-unit) * var(--jx-density-inline-factor-sm));
  --jx-density-inline-gap-default: calc(var(--jx-ruler-unit) * var(--jx-density-inline-factor-default));
  --jx-density-inline-gap-lg: calc(var(--jx-ruler-unit) * var(--jx-density-inline-factor-lg));
  --jx-density-media-gutter-xs: var(--jx-density-inline-gap-xs);
  --jx-density-media-gutter-sm: var(--jx-density-inline-gap-sm);
  --jx-density-media-gutter-default: var(--jx-density-inline-gap-default);
  --jx-density-media-gutter-lg: var(--jx-density-inline-gap-lg);
  --jx-density-end-gap-xs: var(--jx-density-inline-gap-xs);
  --jx-density-end-gap-sm: var(--jx-density-inline-gap-sm);
  --jx-density-end-gap-default: var(--jx-density-inline-gap-default);
  --jx-density-end-gap-lg: var(--jx-density-inline-gap-lg);
  --jx-density-stack-gap-xs: calc(var(--jx-ruler-unit) * var(--jx-density-stack-factor-xs));
  --jx-density-stack-gap-sm: calc(var(--jx-ruler-unit) * var(--jx-density-stack-factor-sm));
  --jx-density-stack-gap-default: calc(var(--jx-ruler-unit) * var(--jx-density-stack-factor-default));
  --jx-density-stack-gap-lg: calc(var(--jx-ruler-unit) * var(--jx-density-stack-factor-lg));

  --jx-density-inline-inset-xs: var(--jx-density-inline-gap-xs);
  --jx-density-inline-inset-sm: var(--jx-density-inline-gap-sm);
  --jx-density-inline-inset-default: var(--jx-density-inline-gap-default);
  --jx-density-inline-inset-lg: var(--jx-density-inline-gap-lg);

  --jx-density-content-gap-xs: max(calc(var(--jx-ruler-unit) / 2), calc(var(--jx-density-stack-gap-xs) / 2));
  --jx-density-content-gap-sm: max(calc(var(--jx-ruler-unit) / 2), calc(var(--jx-density-stack-gap-sm) / 2));
  --jx-density-content-gap-default: max(calc(var(--jx-ruler-unit) / 2), calc(var(--jx-density-stack-gap-default) / 2));
  --jx-density-content-gap-lg: max(calc(var(--jx-ruler-unit) / 2), calc(var(--jx-density-stack-gap-lg) / 2));

  --jx-density-row-min-xs: max(
    calc(var(--jx-density-line-xs) + var(--jx-density-stack-gap-xs) + var(--jx-density-stack-gap-xs)),
    calc(var(--jx-ruler-unit) * var(--jx-density-row-floor-xs))
  );
  --jx-density-row-min-sm: max(
    calc(var(--jx-density-line-sm) + var(--jx-density-stack-gap-sm) + var(--jx-density-stack-gap-sm)),
    calc(var(--jx-ruler-unit) * var(--jx-density-row-floor-sm))
  );
  --jx-density-row-min-default: max(
    calc(var(--jx-density-line-default) + var(--jx-density-stack-gap-default) + var(--jx-density-stack-gap-default)),
    calc(var(--jx-ruler-unit) * var(--jx-density-row-floor-default))
  );
  --jx-density-row-min-lg: max(
    calc(var(--jx-density-line-lg) + var(--jx-density-stack-gap-lg) + var(--jx-density-stack-gap-lg)),
    calc(var(--jx-ruler-unit) * var(--jx-density-row-floor-lg))
  );

  --jx-density-hit-min-xs: max(var(--jx-density-row-min-xs), calc(var(--jx-ruler-unit) * 11));
  --jx-density-hit-min-sm: max(var(--jx-density-row-min-sm), calc(var(--jx-ruler-unit) * 11));
  --jx-density-hit-min-default: max(var(--jx-density-row-min-default), calc(var(--jx-ruler-unit) * 11));
  --jx-density-hit-min-lg: max(var(--jx-density-row-min-lg), calc(var(--jx-ruler-unit) * 11));

  --jx-density-media-icon-xs: var(--jx-density-line-xs);
  --jx-density-media-icon-sm: var(--jx-density-line-sm);
  --jx-density-media-icon-default: var(--jx-density-line-default);
  --jx-density-media-icon-lg: var(--jx-density-line-lg);
  --jx-density-media-image-xs: calc(var(--jx-density-line-xs) * 2);
  --jx-density-media-image-sm: calc(var(--jx-density-line-sm) * 2);
  --jx-density-media-image-default: calc(var(--jx-density-line-default) * 2);
  --jx-density-media-image-lg: calc(var(--jx-density-line-lg) * 2);

  /* Secondary text stays a role, not a component literal. */
  --jx-density-secondary-text-xs: max(0.625rem, calc(var(--jx-density-text-xs) - calc(var(--jx-ruler-unit) / 4)));
  --jx-density-secondary-text-sm: max(0.625rem, calc(var(--jx-density-text-sm) - calc(var(--jx-ruler-unit) / 4)));
  --jx-density-secondary-text-default: max(0.625rem, calc(var(--jx-density-text-default) - calc(var(--jx-ruler-unit) / 4)));
  --jx-density-secondary-text-lg: max(0.625rem, calc(var(--jx-density-text-lg) - calc(var(--jx-ruler-unit) / 4)));
  --jx-density-secondary-leading: 1.5;
  --jx-density-secondary-line-xs: calc(var(--jx-density-secondary-text-xs) * var(--jx-density-secondary-leading));
  --jx-density-secondary-line-sm: calc(var(--jx-density-secondary-text-sm) * var(--jx-density-secondary-leading));
  --jx-density-secondary-line-default: calc(var(--jx-density-secondary-text-default) * var(--jx-density-secondary-leading));
  --jx-density-secondary-line-lg: calc(var(--jx-density-secondary-text-lg) * var(--jx-density-secondary-leading));
  --jx-d-icon-optical-inline: 0px;
}

:where(:root:not([data-density]), [data-density='default']) {
  --jx-d-text: var(--jx-density-text-default);
  --jx-d-leading: var(--jx-density-leading-default);
  --jx-d-line: var(--jx-density-line-default);
  --jx-d-inline-gap: var(--jx-density-inline-gap-default);
  --jx-d-media-gutter: var(--jx-density-media-gutter-default);
  --jx-d-end-gap: var(--jx-density-end-gap-default);
  --jx-d-stack-gap: var(--jx-density-stack-gap-default);
  --jx-d-inline-inset: var(--jx-density-inline-inset-default);
  --jx-d-content-gap: var(--jx-density-content-gap-default);
  --jx-d-row-min: var(--jx-density-row-min-default);
  --jx-d-hit-min: var(--jx-density-hit-min-default);
  --jx-d-media-icon: var(--jx-density-media-icon-default);
  --jx-d-media-image: var(--jx-density-media-image-default);
  --jx-d-secondary-text: var(--jx-density-secondary-text-default);
  --jx-d-secondary-leading: var(--jx-density-secondary-leading);
  --jx-d-secondary-line: var(--jx-density-secondary-line-default);
}

:where([data-density='xs']) {
  --jx-d-text: var(--jx-density-text-xs);
  --jx-d-leading: var(--jx-density-leading-xs);
  --jx-d-line: var(--jx-density-line-xs);
  --jx-d-inline-gap: var(--jx-density-inline-gap-xs);
  --jx-d-media-gutter: var(--jx-density-media-gutter-xs);
  --jx-d-end-gap: var(--jx-density-end-gap-xs);
  --jx-d-stack-gap: var(--jx-density-stack-gap-xs);
  --jx-d-inline-inset: var(--jx-density-inline-inset-xs);
  --jx-d-content-gap: var(--jx-density-content-gap-xs);
  --jx-d-row-min: var(--jx-density-row-min-xs);
  --jx-d-hit-min: var(--jx-density-hit-min-xs);
  --jx-d-media-icon: var(--jx-density-media-icon-xs);
  --jx-d-media-image: var(--jx-density-media-image-xs);
  --jx-d-secondary-text: var(--jx-density-secondary-text-xs);
  --jx-d-secondary-leading: var(--jx-density-secondary-leading);
  --jx-d-secondary-line: var(--jx-density-secondary-line-xs);
}

:where([data-density='sm']) {
  --jx-d-text: var(--jx-density-text-sm);
  --jx-d-leading: var(--jx-density-leading-sm);
  --jx-d-line: var(--jx-density-line-sm);
  --jx-d-inline-gap: var(--jx-density-inline-gap-sm);
  --jx-d-media-gutter: var(--jx-density-media-gutter-sm);
  --jx-d-end-gap: var(--jx-density-end-gap-sm);
  --jx-d-stack-gap: var(--jx-density-stack-gap-sm);
  --jx-d-inline-inset: var(--jx-density-inline-inset-sm);
  --jx-d-content-gap: var(--jx-density-content-gap-sm);
  --jx-d-row-min: var(--jx-density-row-min-sm);
  --jx-d-hit-min: var(--jx-density-hit-min-sm);
  --jx-d-media-icon: var(--jx-density-media-icon-sm);
  --jx-d-media-image: var(--jx-density-media-image-sm);
  --jx-d-secondary-text: var(--jx-density-secondary-text-sm);
  --jx-d-secondary-leading: var(--jx-density-secondary-leading);
  --jx-d-secondary-line: var(--jx-density-secondary-line-sm);
}

:where([data-density='lg']) {
  --jx-d-text: var(--jx-density-text-lg);
  --jx-d-leading: var(--jx-density-leading-lg);
  --jx-d-line: var(--jx-density-line-lg);
  --jx-d-inline-gap: var(--jx-density-inline-gap-lg);
  --jx-d-media-gutter: var(--jx-density-media-gutter-lg);
  --jx-d-end-gap: var(--jx-density-end-gap-lg);
  --jx-d-stack-gap: var(--jx-density-stack-gap-lg);
  --jx-d-inline-inset: var(--jx-density-inline-inset-lg);
  --jx-d-content-gap: var(--jx-density-content-gap-lg);
  --jx-d-row-min: var(--jx-density-row-min-lg);
  --jx-d-hit-min: var(--jx-density-hit-min-lg);
  --jx-d-media-icon: var(--jx-density-media-icon-lg);
  --jx-d-media-image: var(--jx-density-media-image-lg);
  --jx-d-secondary-text: var(--jx-density-secondary-text-lg);
  --jx-d-secondary-leading: var(--jx-density-secondary-leading);
  --jx-d-secondary-line: var(--jx-density-secondary-line-lg);
}
```

## Appendix B — the normative grouped ruler css

Inserted into the existing `item.css` under `@layer components`;
every selector `:where()`-wrapped; no new global import (the living
placement law). Track gate: three/five EXPLICIT tracks, zero implicit.

```css
@supports (grid-template-columns: subgrid) {
  :where([data-slot='item-list']) {
    display: grid;
    column-gap: 0;
    container: jx-items / inline-size;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* content-end: media is not a legal child of this ruler. */
  :where([data-slot='item-list'][data-ruler='content-end']) {
    grid-template-columns: minmax(0, 1fr) var(--jx-d-inline-gap) max-content;
  }

  :where([data-slot='item-list'][data-ruler='media-content-end']) {
    grid-template-columns:
      var(--jx-d-media-image)
      var(--jx-d-inline-gap)
      minmax(0, 1fr)
      var(--jx-d-inline-gap)
      max-content;
  }

  :where([data-slot='item-row']) {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    column-gap: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  :where([data-slot='item-list'][data-ruler='content-end'] [data-slot='item-row'] > .jx-item) {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    column-gap: 0;
    grid-template-areas:
      'header header header'
      'content . end'
      'footer footer footer';
  }

  :where([data-slot='item-list'][data-ruler='media-content-end'] [data-slot='item-row'] > .jx-item) {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    column-gap: 0;
    grid-template-areas:
      'header header header header header'
      'media . content . end'
      'footer footer footer footer footer';
  }

  :where([data-slot='item-list'] [data-slot='item-row'] > .jx-item) {
    box-sizing: border-box;
    min-block-size: var(--jx-d-row-min);
    min-width: 0;
    padding-block: var(--jx-d-stack-gap);
    padding-inline: var(--jx-d-inline-inset);
    row-gap: var(--jx-d-stack-gap);
  }

  :where([data-slot='item-header']),
  :where([data-slot='item-footer']) {
    grid-column: 1 / -1;
    gap: var(--jx-d-inline-gap);
  }
  :where([data-slot='item-content']) {
    grid-area: content;
    display: flex;
    flex-direction: column;
    gap: var(--jx-d-content-gap);
    min-width: 0;
  }
  :where([data-slot='item-media']) {
    grid-area: media;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--jx-d-media-gutter);
    min-width: 0;
  }
  :where([data-slot='item-media'][data-variant='icon']) {
    width: var(--jx-d-media-icon);
    min-block-size: var(--jx-d-media-icon);
  }
  :where([data-slot='item-media'][data-variant='default']),
  :where([data-slot='item-media'][data-variant='image']) {
    width: var(--jx-d-media-image);
    min-block-size: var(--jx-d-media-image);
  }
  :where([data-slot='item-end']) {
    grid-area: end;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--jx-d-end-gap);
    flex-wrap: wrap;
    min-width: 0;
    min-block-size: var(--jx-d-hit-min);
  }
  :where([data-slot='item-end'][data-wrap='never']) {
    flex-wrap: nowrap;
  }
  :where([data-slot='item-title']) {
    font-size: var(--jx-d-text);
    line-height: var(--jx-d-line);
  }
  :where([data-slot='item-description']),
  :where([data-slot='item-after']),
  :where(.jx-item-field-label) {
    font-size: var(--jx-d-secondary-text);
    line-height: var(--jx-d-secondary-line);
  }
  :where([data-slot='item-divider']) {
    grid-column: 1 / -1;
  }

  /* content-end narrow auto: content and end become full-width rows. */
  @container jx-items (max-width: 30rem) {
    :where([data-slot='item-list'][data-ruler='content-end'] [data-slot='item-row'] > .jx-item:has(> [data-slot='item-end'][data-wrap='auto'])) {
      grid-template-areas:
        'header header header'
        'content . .'
        'end end end'
        'footer footer footer';
    }

    /* content-end narrow never keeps the shared end line. */
    :where([data-slot='item-list'][data-ruler='content-end'] [data-slot='item-row'] > .jx-item:has(> [data-slot='item-end'][data-wrap='never'])) {
      grid-template-areas:
        'header header header'
        'content . end'
        'footer footer footer';
    }

    /* media-content-end narrow auto: the media host remains on the
       ruler, while content and end occupy explicit full-width rows. */
    :where([data-slot='item-list'][data-ruler='media-content-end'] [data-slot='item-row'] > .jx-item:has(> [data-slot='item-end'][data-wrap='auto'])) {
      grid-template-areas:
        'header header header header header'
        'media . content . .'
        'end end end end end'
        'footer footer footer footer footer';
    }

    /* media-content-end narrow never keeps media, content, both gaps, end. */
    :where([data-slot='item-list'][data-ruler='media-content-end'] [data-slot='item-row'] > .jx-item:has(> [data-slot='item-end'][data-wrap='never'])) {
      grid-template-areas:
        'header header header header header'
        'media . content . end'
        'footer footer footer footer footer';
    }

    :where([data-slot='item-end'][data-wrap='auto']) {
      justify-content: flex-start;
    }
  }
}
```

When subgrid is unavailable, the existing `ul` flex layout, `li`
block wrapper, and standalone presence matrix remain active — no
browser receives an implicit auto-created column.
