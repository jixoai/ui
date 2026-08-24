# jx-pure Owner round 2 — range thumb, no-jx-pure, semantic palette, InputGroup, switch/number/time repairs

> Orthogonal intents (8, Owner message 2026-08-24): workflow
> normalization (openspec-only); range geometry correction; opt-out
> scope law; number stepper visibility; time demo coverage; switch
> redesign; semantic validation palette; label-based InputGroup.
>
> Original request (2026-08-24, Owner): eight numbered findings after
> reviewing the r7 output — quoted verbatim in each section below.
> Ruling: "和 codex 好好再讨论一下方案，这个工作并不复杂，但是绝对
> 不能偷工减料" (discuss thoroughly with Codex; simple work, zero
> corner-cutting).

## Why

The r7 round delivered the mechanism set but several Owner-visible
surfaces are wrong or missing: the range thumb became invisible, the
switch reads as nothing, number steppers vanished, time inputs were
never demoed, validation colors lack semantic meaning, the InputGroup
ask (original 2026-08-20 era) never landed in the pure face, and the
opt-in law for select contradicts the "everything jx inside .jx-pure"
premise. The workflow also moves to openspec-only from this change on.

## What Changes

### 1. Workflow (this change's vehicle, not a spec delta)

openspec/ initialized and adopted; `.scratch/` removed (history in
git). All future work runs through changes/.

### 2. Range — thin rail, BIG thumb (Owner: "我只是让你缩小导轨的体积，不是让你缩小拖动柄的体积。现在thumb埋在track里面，无法被看到")

The rail returns to 8px thin; the thumb returns to VISUAL prominence
(20px square). POC-verified technique (2026-08-24): the thumb's
border-box rides at rail height (8px — so the cqw fill shadow rect
stays thin), and the VISIBLE 20px square is painted by `outline`
(6px ring), which `overflow: hidden` does NOT clip. Firefox keeps
native pseudos: -moz-range-progress (true thin fill) + a real 20px
-moz-range-thumb. Draft design decisions (D1 in design.md).

### 3. Scope law inversion — `no-jx-pure` (Owner: "既然在 jx-pure 下，那么所有的原生组件就应该被修饰成 jx 的风格…另外开一个 no-jx-pure 的 className，用 :not 选择器来做排除（包括子级）")

- Inside `.jx-pure`, EVERY surface is jx-styled by default — select
  gets the jx chevron repaint unconditionally (D7 ruling overturned).
- New opt-OUT class `no-jx-pure`: a subtree (including descendants)
  reverts to UA paint. Implementation posture (per-element `:not()`
  exclusion lists vs the existing all:revert hatch renamed/generalized)
  is design decision D2 — behavior contract is fixed either way.

### 4. Number — visible steppers (Owner: "input-number 没做好，右侧的那些控制按钮都不见了，参考 daisyui")

The bare element currently hides spin pseudos (appearance: textfield —
the old "engines reject spin paint" law). The Owner wants visible
stepper controls, daisyUI-referenced. Bare-input reality vs wrapper
vocabulary is decision D3 (native spinner restoration vs a
label-based group with real buttons — see also item 8's group work).

### 5. Time (and indicator-bearing) demos (Owner: "input-time 我还没看到你的效果展示")

The docs page's forms section gains time / datetime-local / week /
month lanes with the ink-indicator law visible.

### 6. Switch redesign (Owner: "switch 这套完全没做好")

Diagnosis (2026-08-24): the mechanism works (36×20 track, 16px knob
slides, checked=primary — computed-verified) but the VISUAL reads as
nothing — a flat strip glued to text, no toggle affordance. Redesign
for instant switch readability under the square law (proportions,
state contrast, knob treatment — D4).

### 7. Semantic palette + validation remap (Owner: "配色系统除了 primary 之外还需要语义化配色：错误/警告/成功/信息，或积极/消极/中性")

jixoai.css gains semantic tokens (success / warning / info / error
naming vs 积极/消极/中性 naming — D5), with light+dark values in the
oklch discipline and -foreground pairs. Validation matrix remaps:
valid→success, invalid→error (destructive stays the monochrome
inversion pair, untouched). Chart/secondary harmony checked. This is
a token-sheet change (jixoai.css) rippling into @theme mappings and
jx-pure's B14.

### 8. Label-based InputGroup (Owner: "我要的基于 label 的 InputGroup 你还没做到")

The pure-face companion vocabulary for composed fields: a label-based
group law (prefix / control / suffix inside one shell — the 2026-08-20
Tier-2 slot system's pure-CSS sibling). Exact shape (class name, slot
anatomy, which companions) — D6.

## Impact

- registry/files/theme/jx-pure.css + apps/www mirror + payloads
- registry/files/theme/jixoai.css (semantic tokens) + @theme mappings
- apps/www docs (jx-pure.html sections; form.html wording)
- scripts/verify-jx-pure.mjs probes; parity suite locks
- possibly registry/files/ui/number-input.svelte alignment (D3)
