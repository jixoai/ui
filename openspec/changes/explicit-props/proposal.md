# The explicit props — one grammar, eight axes, every component (Owner 2026-09-21)

> Owner rulings quoted from the 2026-09-21 design session (two rounds, all
> decisions below are SETTLED unless marked 未裁决):

- 「我打算设计一套全部组件都能享有的显式属性」
- 「载体必须是 CSS 变量」→ refined: 「准确来说，是 CSS 表达式，这个概念会更广，
  因为它涵盖了 calc 或者一些高级的表达式」
- elevation: 「跟随官方走」(M3 Expressive — surface tint DEPRECATED, level
  tokens 0–5)
- size: 「先五值」(`small|medium|large|auto|${number}`)；plugin alias 表可
  改写命名档，`auto`/`${number}` 是保留字面量
- 响应式: `xs|sm|md|lg` 客观留给响应式；组合走查询函数
  `size={query({sm:"small","@md":"medium"})}` —「你觉得用 query 还是 bp？你定吧」
  → **`query` 定案**（编排者裁决 2026-09-21）；「`@md`理论上还可以搭配
  container-name。这个语法你自己参考 Tailwindcss 的设计就好」
- compact → 「改名 density，同意」
- color number: 「是 hue 的值……我们整个 primary 体系是一个非常稳固的 oklab 颜色」
- theme: 「system 值仍然要保留，我刻意这样设计的……这个值其实是可以被 js
  修改的」（system = 可 JS 改写的全局源，默认跟随 OS）
- elevation number: 「不能删除吧，levelN 是语义化的方案，但是 number 是一种
  确切指定值的方案」
- motion: 「同意 motion 的设计」(`reduced|subtle|normal|expressive|auto`)
- query 壳: 「编译期脱糖，这不是绝对的……还是要留一个 js 调用的壳，因为有时候
  需要垫片」
- 推进方式: 「走 remix 工作流去推进。然后开发落地，并用 vision 子代理走查验收。
  我们的 componentCanvas 要适配，所有的组件页面也都要改。相关的文档也要更新…
  多轮迭代，直到新版本可以就绪发布（先不发）…不用新开 worktree，就在主目录工作」

## Why

Today every family invents its own visual vocabulary (or borrows the density
kernel's): `avatar size: 'sm'|'md'|'lg'`, `icon size: 16`, `sheet size: <css
width>`, `Density: '2xs'|'xs'|'sm'|'default'|'lg'` — near-universal but
single-axis. There is no way to say 「这个组件在页面构图中的位置」once and have
every nested component follow. The explicit-props system gives every component
the SAME eight axes with the SAME three-lane grammar, so:

- **默认和谐靠继承** (the `auto` lane — style context flows down the tree),
- **显式偏离靠统一语法** (named steps resolve through the plugin alias table;
  numbers are exact-value escapes),
- **扩展靠 plugin** (design-side remaps values, never touches components).

It is the anti-thesis of utility-first: the cascade is given back to the
design system. 显式的不是值，而是「我要偏离上下文」这个意图。

## The landscape (the pinned baseline, census 2026-09-21)

- **115 component families** under `apps/www/src/lib/ui/`; **110 hand-written
  doc pages** under `apps/www/src/routes/docs/components/*.html/`.
- **Near-universal today**: `density?: Density` via `densitySlot`
  (`explicit ?? ambient ?? own`, the 「无意见不盖章」fleet law) — ~60
  `*-defaults.svelte.ts` consumers; density channels consumed in **112
  files**. THE INHERITANCE MECHANISM ALREADY EXISTS at fleet scale (ambient
  slots) — this change GENERALIZES it, it does not invent it.
- **No `size` vocabulary to retire at scale** — the feared `lg|default|xs|xss`
  migration is actually the DENSITY rung names (`Density = 'lg'|'default'|'sm'|
  'xs'|'2xs'`), which survive as plugin aliases. Only `avatar` (literal
  sm|md|lg), `icon`/`spin` (number), and a few CSS-width props need mapping.
- **Native collision surface**: 16 families spread native attrs through
  `{...rest}` onto `<input>/<select>/<textarea>` — the component prop MUST
  win over the native `size`/`color` attributes (rule below).
- **No surface ladder** in the theme (background < card/popover is the whole
  implicit 3-step) — elevation-follows-M3 REQUIRES adding it.
- **Canvas/props pipeline**: `component-metadata-gen.mjs` (AST → two-zone
  `meta/*.meta.ts`, CI drift gate) → `schema/ir.ts` → `schema2form` →
  playground controls. Universal props ride THIS pipeline (one shared IR
  block injected per family), NOT per-page edits.

## What the eight axes are (spec of record: design.md §1–§9)

`size · shape · radius · density · color · theme · elevation · motion` — one
grammar: `named | auto | ${number}` + the orthogonal `query({...})` wrapper.
Full contract, migration mapping, degrade rules and gate plan in
[design.md](./design.md).

## Waves (serial integration, the tailwindless protocol)

- **W0 — this change + Codex alignment** (remix: the change docs ARE the
  contract; implementation starts when Codex is satisfied).
- **W1 — token core**: theme surface ladder + elevation level table (light &
  dark), the eight axes' expression carriers, the generalized slot helpers
  (`sizeSlot`/`densitySlot`/… — the ambient fleet law extended), density
  rename landed.
- **W2 — plugin layer**: alias schema (per-axis `[$alias]: value`, `auto`/
  `${number}` reserved), the `@supports` global degrade verdicts
  (corner-shape is Chromium-only TODAY — the degrade path is the MAIN path),
  the `query()` compile-time desugar + JS shim shell, container-name syntax
  (Tailwind v4 reference).
- **W3 — component migration** in batches: every family gains the eight-axis
  surface; native families carry the collision rule; the four one-off props
  map over; old vocabularies become aliases.
- **W4 — canvas + docs**: componentCanvas/meta pipeline universal block;
  110 doc pages gain the universal props section (one source, PropsTable);
  registry.json docs strings; llms mirror.
- **W5 — gates**: the universal-props contract lint (axis surface + carrier
  law + broadcast duty), existing gates adapted, verify-all green.
- **W6 — acceptance rounds**: vision walkthrough (multi-round, pinned-phase
  captures) + Codex review loop. TERMINAL STATE: release-ready, NOT released
  (Owner walks it, then says publish).

## Acceptance

1. Every one of the 115 families exposes the eight axes with the unified
   grammar; PropsTable shows them from ONE shared source.
2. `auto` demonstrably inherits on every axis (probe receipts); the broadcast
   protocol holds at container boundaries (concentric radius receipt:
   parent→child arc centers coincide).
3. Degrade receipts: corner-shape off → scoop/bevel/notch→square,
   squircle→round (radius ×2 law documented where it applies).
4. New gates green + the full verify chain green; mirrors byte-identical;
   tailwindless ratchet UNMOVED (vars carrier adds zero class identities).
5. Vision walkthrough of the dogfooded pages (light+dark, pinned phases);
   Codex composite score ≥ 8 with no blocking findings.
6. 「就绪未发」: everything committed on a branch in the MAIN dir, nothing
   pushed beyond it; the Owner's walkthrough is the publish gate.
