# Proposal: button-bar — the free-floating action lane (ghost + flat by default)

## Why

Owner 2026-09-08 原始需求："新一种 buttonBar 的组件，它的特性是可以包含
button 或者 buttonGroup。这些 button、ButtonGroup 不会出现冗余的 border
样式，全部默认都是 raised=false+ghost 的样式。最终的效果和 DialogFooter
这种组件类似。它支持横向也支持纵向，但目前主要支持单个。和 ButtonGroup
的主要差别是，它是单行/单列。本身是一个 flex 布局，因此可以自由排布左右
居中。"

现状的缺口：把一排动作按钮放进一个区域（卡片底部、面板头部、表单尾、
设置行 trailing）时，只有两个极端可选 ——

- **ButtonGroup**：joined 集群（-1px 折叠缝、单一 cluster shadow、
  overflow 机器）。它解决的是"多个按钮读作一个控件"的合并语义，不是
  "一排独立动作的自由排布"。
- **DialogFooter**：dialog 专用，不可复用；而且它的 end-packed 布局与
  ghost zone 是写死在 footer 语义里的。

缺的是一个**通用的 action lane**：成员是自由浮动的（gap 分隔，彼此不
合并），默认把子树归一为 ghost + flat（无冗余 border、无 per-button
凸面阴影），支持横/纵单行/单列，flex 自由排布（start/center/end/
between）。这正是 DialogFooter 效果的一般化，但独立于 dialog。

## What Changes

- **新 registry item `button-bar`**（registry:ui，general 组）：
  `ButtonBar` —— 单行/单列 flex 的 action lane 容器。
  - **成员关系：free-floating**。成员之间 gap 分隔（与 dialog footer
    grid 的 0.625rem 同节奏），永不 joined、永不折叠边框 —— 与
    ButtonGroup（edge-to-edge、-1px seam）的结构性分界。可包含
    PressButton / IconButton / ButtonGroup（joined cluster 作为一个
    成员）。
  - **paint zone：own ghost**。ButtonBar 通过 PAINT_ZONE_KEY 提供
    `variant ?? enclosing ?? 'ghost'` 的 zone 默认 —— 子按钮无显式
    variant 时全部落 ghost（ghost 无边框色 + 无阴影，"不会出现冗余
    border"由 variant 本身保证）；显式 prop 永远赢；inherit-then-
    provide（无自己的 variant 时传递外层 zone，同 ButtonGroup 法）。
    嵌套 ButtonGroup 无自己的 variant 时继承 ghost（其 seam 政策随
    ghost 默认开启）。
  - **physics zone：own flat**。ButtonBar 通过 PRESS_TEXTURE_KEY 提供
    `raised ?? enclosing ?? false` 的纹理默认 —— 子按钮默认
    raised=false（engrave 内凹按压、无 rest/hover 阴影）；嵌套
    ButtonGroup 的 root cluster shadow 因此熄灭（一个 control 一个
    shadow 的既定法在 bar 语境下 = 无 shadow）。显式 raised=true 恢复
    凸面（bar 级或子级皆可）。
  - **单行/单列 flex**：`orientation: 'horizontal' | 'vertical'`（默认
    horizontal）、`justify: 'start' | 'center' | 'end' | 'between'`
    （默认 end —— DialogFooter 的 inline-end-actions 语义是其主要
    用例）。不 wrap、不 collapse、无测量机 —— 溢出归滚动容器/消费者
    事务（ButtonGroup 的 overflow 机器是 joined 集群的契约，不是
    lane 的）。
  - **零 css 文件**：flex/justify/gap 全部 utilities 表达（tw4
    utility-first 法）；`data-jx-btnbar={orientation}` 是 css-less
    语义锚点（hook 法）。
- **Defaults 契约**：`button-bar-defaults.svelte.ts` —— 
  `buttonBarVariantSlot = definePaintSlot(['fill','tonal','outline',
  'ghost'], 'ghost')` + `densitySlot()`（inherit-then-provide，同
  ButtonGroup）。proxy family（structural zone provider）加入
  context-coverage config 的 frozenAvailability（button-group 先例）。
- **registry.json + catalog**：新 item（meta.group=general → taxonomy
  快照 14→15）、依赖边（press-button/paint/density/defaults/utils/
  jixoai-theme）。
- **docs**：`/docs/components/button-bar.html`（STAGED skeleton +
  ComponentCanvas playground 切 orientation/justify + 与
  ButtonGroup/DialogFooter 的边界记档）。
- **镜像与生成物**：apps/www 双树镜像、mirror manifest 再生成、
  `button-bar.meta.ts` 生成。

## Impact

- 新增 `registry/files/ui/button-bar/`（3 文件）+ 
  `registry/files/routes/docs/components/button-bar.html/`；apps/www
  侧镜像。
- `registry.json`、`scripts/context-coverage.config.json`
  （frozenAvailability + button-bar）、
  `apps/www/test/docs-structure.spec.ts`（快照 general:14→15）。
- component-authoring spec：ADDED Requirement（the button-bar action
  lane）。
- 零行为变化：ButtonGroup / DialogFooter / PressButton 不动一字节。

## 范围外（记档不做）

- DialogFooter 重构为 ButtonBar 消费者（footer 的 leadingSeam +
  end-slot 语义是 dialog 的；等第二个 footer 用例出现再收敛）。
- ButtonBar 的 overflow 策略（wrap/collapse/scroll 均是 joined 集群
  机器；free-floating lane 的溢出是滚动容器事务）。
- 成员间的语义分隔线（ButtonGroupDivider 是 joined 集群的边界法；
  free-floating 成员间天然由 gap 分隔，需要强分隔时消费者直接放
  Separator）。
