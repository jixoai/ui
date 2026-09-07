# typography-context-and-parts — the prose scope + the reading-content parts' R2

> Original asks (Owner, 2026-09-07, the R2 visual-acceptance round):
> (1) blockquote 默认 box-shadow inset（仓库有相关标准），与背景不冲突；
> border-inline-start 做成变体，支持 1px 4px 8px；两种变体一种
> shadow 一种 border，背景色正交但共享颜色。(2) Text-P 的 Context
> 支持常见文本样式属性（首字母大小/段落缩进/字体大小/字体/前景色/
> 渐变色/背景色等，按 CSS 常见标准展开，含新排版属性）。(3) 其它
> Text-mark 标签也要类似基础样式，目的都是通过 Context 修改文本
> 样式。(4) Link 外部链接默认 suffix-icon 标识外部打开，属性开关，
> slot 自定义。(5) List 变体不够，分严谨 ol/ul 场景；nav 也可以和
> li 配合，不止 ol/ul。(6) Heading 也要修饰能力，text-P 的特性可
> 延续。流程：无 codex 的 remix——lead 与子代理碰撞。

## What Changes

1. **The prose scope** (asks 2/3/6): a new `prose` registry:ui item —
   the `<Prose>` provider component — plus a `typography` registry:lib
   (`typography.svelte.ts`: types + module-private key + pure helpers;
   the context pair inline in prose.svelte per the double-runtime
   ruling). A composite `TypoScope` (11 frozen knobs: size, leading,
   family, ink, gradient, ground, align, indent, initialLetter, wrap,
   hyphens) consumed almost entirely through CSS: inherited
   declarations + `--jx-ty-*` vars + presence-gated `data-jx-ty-*`
   hooks + a scope-owned residue sheet (`prose.css`) keyed on the
   families' existing hooks. P and the marks take ZERO component
   edits; Heading takes ONE ink-utility edit
   (`text-[var(--jx-ty-ink,var(--foreground))]` — dedup-verified).
   markdown sovereignty holds BY CASCADE (verified: trio root
   declarations beat inheritance; §2a (0,2,1) beats the residue
   (0,2,0); ink/flow pass through) — zero markdown changes.
2. **blockquote rule×ground** (ask 1): `rule: 'shadow'|'border'`
   (own 'shadow', the inset standard — command-item's inset rule, the
   elevation WELL tier, kbd's --shadow-engrave lineage) × `ruleSize:
   1|4|8` (own 1) as LITERAL slots (the separator ink-geometry
   precedent — geometry never joins the paint table, so ZERO
   frozenAvailability amendments); the rule color rides the rung's own
   border-color declaration (shared color source, sole-source law);
   forced-colors re-materializes shadow as Npx CanvasText border.
   Tonal+shadow-1 is a deliberate near-no-op kept for axis
   uniformity. Component-wide visual delta (every quote flips border
   → shadow-1) — Owner browser review is the exit criterion.
3. **Link suffix-icon** (ask 4): tri-state `icon` (undefined = the
   default `externalLink` Icon part shown IFF external — inline-core,
   SSR-sync; null = off; snippet = custom) — the input semantic-glyph
   law verbatim. `+@jixoai/icon` edge priced. aria-hidden decorative
   span, em-sized, inside the anchor.
4. **List marker + nav** (ask 5): the frozen marker vocabulary
   (disc/circle/square/decimal/alpha/roman/none; default = the
   platform's per-element law, marker overrides) + the nav container
   mode (`nav?: string` aria-label presence → `<nav
   data-jx-list-nav>` wrapping the list with list-none ps-0 defaults;
   class/rest stay on the LIST element). `reversed` widened.
   markdown map byte-parity (the map passes ordered/start only).
5. **Registry/docs chain** (the reviewer's F11 enumeration): registry
   entries (prose ui + typography lib), freeze recount (live totals),
   mirrors + manifest, payloads, the prose docs page (the two-file
   floor), three upgraded pages, variant-grammar page amendments,
   llms-txt regen.

## Non-goals (recorded)
The typography vocabulary backlog (tracking/weight/style/decorations/
shadow/clamp/writing-mode/white-space/word-break/tab-size/columns/
hanging-punctuation/font-variant/per-mark tinting/gradient-riding
marks/measure), the zero-DOM provider helper, leading beyond P,
li/blockquote interiors, Link's visually-hidden label, nav row gap
ownership, and the `@ui/` docs-dialect scanner fix (separate lane,
config-layer).
