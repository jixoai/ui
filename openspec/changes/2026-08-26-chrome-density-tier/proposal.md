# chrome-density-tier — the pointer-modality scope for bar chrome

> Origin (2026-08-26): Owner reported the TerminalHeader nav pills and
> the HuePopover entry button rendering at mismatched sizes with a
> crushed icon. Root cause (ZCode + Codex co-review, 7.5/10 brief):
> the density-adoption sweep (e2f55e0/476167d/c31fe6a) left a
> **partial-adoption chimera** — two geometry authorities effective on
> one element (min-h utility 44px over local `height:32px`, inset
> padding eating a fixed 32px border-box width, a 16px icon owned by
> neither vocabulary), plus bar chrome (hamburger/logo squares) that
> never had a density home. The density-adoption change explicitly
> deferred this ("Non-goals: no change to terminal/bezel"). This
> change takes up that deferred scope.

## What Changes

1. **Kernel — the chrome scope** (`jixoai.css`, both byte-identical
   mirrors): a fifth named scope `:where([data-jx-chrome])` pinned
   AFTER the four density scopes. It is the **pointer-modality
   contract**: one 32px chrome band (`--jx-hit: unit×8`), 16px action
   glyphs (`--jx-icon: unit×4`), sm-tier text (12px/18px line) and
   sm-tier gaps/insets/stack. Orthogonal to the density axis — it
   pins its alias set absolutely; unpinned aliases fall through to
   the ambient density scope by inheritance. Control rows OUTSIDE
   chrome keep the 44px touch floor untouched.
2. **TerminalHeader** (registry + mirror): stamps `data-jx-chrome` on
   the header root — the bezel DECLARES its modality; the hamburger
   and its bars migrate from `h-8 w-8`/`w-4` literals to
   `min-h/min-w-[var(--jx-hit)]`/`w-[var(--jx-icon)]`; the pill box
   drops its `text-xs` (the composed entries own typography through
   the token; no second authority).
3. **HuePopover trigger** (site-local consumer): the square law from
   press-button's iconOnly pose — `min-h/min-w-[var(--jx-hit)]`, NO
   inset padding (icon-only), icons `h/w-[var(--jx-icon)]`; the local
   css `height:32px; width:32px` is DELETED (single geometry
   authority: the tokens). Inside the bezel this renders the 32×32
   square with a centered 16px icon.
4. **Tailwind var-type sweep** (silent-adoption defect family):
   `text-[var(--jx-text)]` is ambiguous — Tailwind emits it as
   `color`, so the font-size adoption silently no-ops (computed pill
   text stayed 12px inherited, not the ruler's 13px). Every
   font-size consumption gets the explicit `length:` type:
   navigation-menu-link/trigger, popconfirm (×2), command-input/
   -empty/-item, command-group (`--jx-text-secondary`). Both www and
   registry mirrors.
5. **Kernel gate** (`verify-density-kernel.mjs`): a `probe-chrome`
   row with its OWN invariant set (`hit == 2×icon`, `image == hit`,
   pinned values) — deliberately NOT in the density TABLE, whose
   `icon == line` / `image == 2×line` laws describe density rows, not
   the chrome band.

## Impact

No public API change; no control-row geometry change (44px floor
intact outside chrome). The site bar renders one 32px band again:
pills 32px (box 38px), hamburger 32, trigger 32×32 with a 16px icon,
header ≈63px (was 75 broken / 57 pre-density). The untyped-var sweep
changes rendered font sizes ONLY where inheritance differed from the
ruler value (nav pills: 12px inherited → 12px chrome token, no drift;
command/popconfirm rows consume their ambient density correctly for
the first time).

## Non-goals

No new density values; no ruler-equation or 44px-floor changes; no
ThemeToggle/date-picker/combobox/transfer/tree-view adoption (known
follow-ups, tracked in the walkthrough checklist); no mega-panel or
drawer content restyle; no screenshot-baseline recapture (Owner
visual authority); no variant-grammar interference (parallel change,
color-only).

## Verification

Kernel gate chrome row · vitest suite · mirror manifest check ·
live-page probe (pill 32 / trigger 32×32 / icon 16×16 / no crushed
svg) · Codex review round with score.
