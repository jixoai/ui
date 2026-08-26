# design — variant-grammar (FROZEN r1, 2026-08-26)

> Phase 0 converged: Codex r1 verdict "amend, then freeze" (score 6/10
> for the draft; the amendments below are its prescribed 9/10 path —
> see `.agents/documents/2026-08-26-variant-grammar/codex-r1-response.md`).
> Two points override Codex's suggestion by Owner authority, marked
> OWNER-OVERRIDE. This file is the implementation contract.

## 1. The grammar

Variant = prominence ladder; semantic color = hue injection through
four global tokens. No semantic-name variants remain anywhere.

| Variant | Paint (normative) | Availability |
|---|---|---|
| `fill` | `background: var(--jx-fill); border: 1px solid var(--jx-fill); color: var(--jx-fill-ink)` | Badge, Chip, PressButton |
| `tonal` | `background: color-mix(in oklab, var(--jx-tonal) 12%, transparent); border: 1px solid color-mix(in oklab, var(--jx-tonal) 45%, transparent); color: var(--jx-tonal)` | Badge, InlineCode, Chip, PressButton, Alert |
| `outline` | `background: transparent; border: 1px solid var(--jx-outline); color: var(--foreground)`; interactive hover adds `color-mix(in oklab, var(--jx-tonal) 8%, transparent)` overlay, border unchanged | all |
| `ghost` | rest: `background/border transparent, color var(--foreground)`; hover: `background: color-mix(in oklab, var(--jx-tonal) 8%, transparent); color: var(--jx-tonal)`; geometry preserved via transparent border | Chip, PressButton only |

`link` stays a PressButton interaction affordance exception (no frame,
no press shadow, primary text, hover underline) — deliberately absent
from the ladder. `copied` is removed from the variant union: transient
state = `tonal` + `[--jx-tonal:var(--success)]`. Press physics
(`.jx-press`) never change with paint.

## 2. Tokens (global, inheritable, theme-owned)

| Token | Default | Role |
|---|---|---|
| `--jx-fill` | `var(--primary)` | fill ground + same-hue border |
| `--jx-fill-ink` | `var(--primary-foreground)` | ink on fill — ALWAYS injected together with `--jx-fill` |
| `--jx-tonal` | `var(--primary)` | tonal ground/border/text hue source |
| `--jx-outline` | `var(--border)` | outline border source |

No `--jx-ghost` (ghost derives hover from `--jx-tonal`); no
`--jx-tonal-ink` (tonal text = the hue itself); no per-component
duplicates. Defined once in `registry/files/theme/jixoai.css` +
byte-identical `apps/www/src/lib/jixoai.css` (light `:root`; dark
adapts automatically through the semantic references). Canonical
injection seam = arbitrary-property `class` utilities (works on every
module today): `class="[--jx-tonal:var(--error)]"`. `style=`
injection may only be documented after PressButton/Alert forward
native rest attributes — not in this change.

## 3. Semantic injection recipes (action vs status is MANDATORY)

| Intent | Fill pair | Tonal slot | Notes |
|---|---|---|---|
| Brand | `primary / primary-foreground` | `--primary` | default emphasis |
| Neutral/meta | `muted / muted-foreground` | `--muted-foreground` | old secondary, metadata |
| Destructive ACTION | `--jx-fill: var(--destructive)` + `--jx-fill-ink: var(--destructive-foreground)` | `--destructive` | delete/cancel actions only (PressButton) |
| Error STATUS | `error / error-foreground` | `--error` | failed/invalid STATUSES (Badge, Alert) |
| Success status | `success / success-foreground` | `--success` | copied/passing |
| Warning/info | matching pairs | `--warning` / `--info` | only when the intent needs it |

## 4. Component contracts

| Module | Variants | Default | Notes |
|---|---|---|---|
| Badge | `fill \| tonal \| outline` | `tonal`, NO local hue override → primary tint (OWNER-OVERRIDE of Codex's neutral suggestion: Owner explicitly chose the primary-tinted default; old gray callers inject neutral) | kbd-law geometry (height from `--jx-line-secondary`, inline insets only), `slotStart`/`slotEnd` snippets with adaptive padding, `shape: square \| pill` (square default, radius via `--radius`), `data-jx-badge={variant}`, density + cn() composition unchanged |
| InlineCode | `tonal \| outline` | `tonal` + local `[--jx-tonal:var(--muted-foreground)]` (parity with jx-pure's bare `code` law; consumer injection still wins) | native `<code>`, mono, normal case; Shiki tokens as ASYNC enhancement — frame + SSR output never depend on detection; inside `<pre>` the pre/code reset strips the frame |
| Chip | all four | `tonal` | root carries `min-block-size: var(--jx-hit)` (hit-lane law; Codex rejected pseudo-element expansion — badge NATURE lives in paint/typography, not sub-lane height; OWNER NOTE: chips are control-scale, ~44px at default density, not 20px badges), `data-jx-chip={variant}`, default effect `ripple()`, button/a duality, slotStart/slotEnd, press law |
| PressButton | `fill \| tonal \| outline \| ghost \| link` | `outline` (unchanged) | `data-jx-press-button={variant}` new valued hook; copied→tonal+success |
| Alert | `outline \| tonal` | `outline` | ladder surface replaces card bg (visual change → Owner browser review); title/body consume variant tokens; `role`/`assertive` axis untouched; `data-jx-alert={variant}` |
| AlertDialogAction | migrates INTO the grammar | — | its `tone: destructive \| primary` prop is replaced by the variant+injection interface (Codex scope ruling: include, do not defer) |

## 5. Migration mappings (authoritative; see migration-inventory.md for sites)

**PressButton**: primary→`fill`; secondary→`tonal` + `[--jx-tonal:var(--muted-foreground)]`
(deliberate softening of the yellow secondary — Owner review);
destructive→`fill` + destructive pair; outline/ghost/link unchanged;
copied→`tonal` + success injection (union removal). Both demo AND
template-literal copies in docs pages. IconButton forwards the new
union (not a separate color decision).

**Alert**: default→`outline`; primary→`tonal`; destructive→`tonal` +
`[--jx-tonal:var(--error)]` (STATUS, not destructive). AlertDialogAction
same interface.

**Badge**: bare/`default`→bare (`tonal`, primary tint per §4);
`primary`→drop the prop (same default) — where the call site means
neutral metadata, add `[--jx-tonal:var(--muted-foreground)]`;
`outline`→`variant="outline"`; `destructive`→`variant="tonal"` +
`[--jx-tonal:var(--error)]`. Tone-law prose in alert.html/badge.html
rewritten to the grammar's terms.

## 6. Forced-colors law (explicit degradation; forced-color-adjust: auto)

| Surface | Result |
|---|---|
| fill control | `ButtonFace` bg + `ButtonText` ink/border |
| tonal/outline | `Canvas` (or transparent) bg + `CanvasText` ink/border; color-mix tints dropped |
| ghost control | transparent rest; hover `ButtonFace`/`ButtonText` |
| Badge/InlineCode | `Canvas` + `CanvasText`, 1px border survives on tonal/outline |
| Alert | `Canvas` + `CanvasText`, 1px border, role/text intact |
| Focus | `2px solid Highlight`, offset 2, never removed |

## 7. Contrast & verification gates

- Browser contrast probe: used fg/bg pairs for every shipped semantic
  injection, light + dark, representative hues — REPORTS failures
  (never recomputes `--primary`).
- Forced-colors browser probe for all five modules.
- Physical hit probe for Chip (root rectangle ≥ `var(--jx-hit)`).
- Hook-law updates: `data-jx-badge`/`data-jx-alert` values become
  variants; add `data-jx-press-button`; update verify-hook-law.mjs,
  batch1-components.spec.ts, press-button.spec.ts, verify-press.mjs,
  docs probes.
- Spec delta (this change): component-authoring `--jx-d-ctl-hit` stale
  alias → `--jx-hit` + a variant-grammar requirement section.
- Mirror parity: new tokens + new components regenerate the manifest;
  byte identity is the gate.
- Owner browser review before release: Badge height/anatomy, secondary
  softening, Alert surface change, Chip control-scale silhouette.

## 8. Deferred / out of scope

- `style=` attribute injection docs (needs rest-forwarding on
  PressButton/Alert first).
- Promoting the grammar to a standalone design-tokens spec section
  (candidate follow-up change).
- Shiki auto-detection heuristics tuning beyond the zero-download
  fingerprint scorer (InlineCode's frame never depends on it).
