# Design: card-surface-kernel

## 1 · 四层地图（本 change 的宪法）

```
第 4 层  浮层机制   Dialog/Sheet/Popover…：top layer、焦点、Escape、
                    scrim、开合动画、材质（solid/acrylic）。永远不长皮肉。
第 3 层  结构件     CardHeader/CardBody/CardFooter：三段式结构 + 分区
                    zone + footer 动作组装。唯一实现，平面与浮层共用。
第 2 层  排布原语   ButtonGroup（连体——唯一排布组件）；散排 = utilities
第 1 层  皮         平面 = <Card> 根（border/bg/shadow）；浮层 = jx-surface 材质
```

承载方式的裁定（Owner 讨论，2026-09-09）：

- **结构 = 属性贴纸**。`data-jx-card` 属性族 + card.css 规则集就是
  ruler 本体——贴上即得，SSR 即生效，任意元素可用。不是组件包裹，
  更不是 `{@attach}`（attach 运行在 effect 期：SSR 缺席、时序晚于
  context 读取窗口；纯 CSS 能力搬进 JS 再搬回来是负收益）。
- **attach 判据**（落 spec）：这东西需要"等元素真的上屏"才能做吗？
  要等（量尺寸/绑事件/外部库）→ attach；不用等（贴属性/给样式/声明
  语义）→ 直接写属性和 class。

## 2 · ButtonBar 退役的教训（记档）

ButtonBar（2026-09-08，已推 main）被本 change 删除。判定依据：

1. **组件存在的理由是法则，不是便利**。ButtonGroup 配当组件因为它
   拥有真复杂度（-1px 缝折叠、单一簇阴影、溢出三模式机器、ghost seam
   注入）。ButtonBar 没有任何自己的法则——它是"带 zone 的 flex div"。
2. zone 职务被"分区骨架自带 zone"吸收（Card 的 head/foot 分区、
   Dialog 的同名分区、code-card/canvas 的动作区）。
3. flex 排布职务归 utilities（tw4 utility-first 法则的本来裁定）：
   ButtonBar 把 justify/orientation 参数化为 props，是与"布局用
   utilities 写"打架的第五种做法。
4. 保留它需要维护"三入口决策表"教消费者避开它——一个需要决策表
   才能正确使用的组件，本身就是设计错误的证据。

正面遗产：code-card 试点证明了"动作区按钮默认 ghost+flat"的需求真实
存在——只是答案不是新组件，而是分区 zone 法则 + 直 props。

## 3 · Card 结构内核

### 3.1 贴纸 API（现状即就绪，只改定位）

card.css 全部规则锚定 `[data-jx-card]` 属性族与 `.jx-card-*` 类，零
特异性、零元素类型选择器、零组件结构依赖。五命名列
（card-inline-start / card-content-start / card-fill /
card-content-end / card-inline-end）+ 三行（auto / minmax(0,1fr) /
auto，body 行唯一吸收器）+ `container: jx-card / inline-size`（反转
容器在根，绝不在租户）。`<dialog>` 根（或其 scroll 宿主）贴上
`data-jx-card` 即得全部。

容器名 `jx-card` 与命名线五件套自此为**公共 API**（改名是破坏性操
作，本 change 不改）。

### 3.2 CardBody（新建）

从 card.svelte 内联抽出（card.svelte:130-143）：

```
<div data-jx-card-body data-jx-scroll={off}>
  <div class="jx-card-cell …px-[max(0.875rem-var(--jx-scrollbar-thin,0px),0px)] py-3.5 …">
    children
  </div>
</div>
```

- cell 滚动法则照搬（max-height:100% + overflow-y:auto +
  scrollbar-gutter:stable both-edges；scroll=false 一起退役权限与
  沟槽）。
- 沟槽补偿公式单源化：dialog.svelte:279 的逐字重复消失。
- 分区不写 min-height:0（card.css:102-117 的实测法则，随 CSS 走）。

### 3.3 CardHeader standalone

现状 `.jx-card-head-content` 的命名线只在租来的 ruler 里解析，脱离
Card 退化为 auto 放置。补 standalone fallback：无
`[data-jx-card-head]` 祖先时自带 inline 几何（对齐 CardFooter 的
"one geometry, two carriers" 模式——租赁是真理，镜像是 standalone
的侍从）。

### 3.4 CardFooter 吸收 DialogFooter

CardFooter 已是超集（start 文字座 / carved-cell cluster 包裹 /
dissolution 进租借网格 / 原生 @container 反转）。合并决策：

- `label` 默认文案改中性（'Actions'——组件语境不再内嵌品牌）。
- Dialog 的 end edge-flush 语义让位：合并后 end 是 content-axis 文字
  座；Dialog 消费者的 footer 场景（ButtonGroup 簇）走 children。
- 窄屏反转唯一机制：card-footer.css 的 @container jx-card（Dialog
  贴属性免费获得；DialogFooter 的 Tailwind @max 版随组件退役）。

## 4 · Dialog 瘦身（B' 形态：对外 API 不变，内部 Card 方言）

**取舍记录**：彻底空面板（消费者全组装）被否——× 无条件 head 契约
（dialog.svelte:229-266）与 search-palette 的组合用法会失去承载。
B' 形态：Dialog 保留默认分区骨架，但骨架全部说 Card 方言。

```
<dialog class="jx-dialog jx-surface …">
├─ shadow 层（机制，不动）
├─ surface-body（机制，不动）
│  └─ <div data-jx-card data-sep-head data-sep-foot?>   ← 贴纸（原 data-jx-dialog-scroll）
│     ├─ <div data-jx-card-head>                        ← Card 方言分区
│     │  └─ ButtonVariantScope variant="ghost"
│     │     └─ <div class="jx-card-head-grid">
│     │        ├─ head snippet / CardHeader
│     │        └─ <div class="jx-card-end-action-slot"> ← × 的座位（宿愿）
│     ├─ <Separator data-jx-card-sep="head">            ← 骑行行边（card 方言，无独立 1px 轨）
│     ├─ <CardBody {scroll}>                            ← 结构件
│     └─ {#if foot}
│        ├─ <Separator data-jx-card-sep="foot">
│        └─ <div data-jx-card-foot>
│           └─ ButtonVariantScope variant="ghost" raised={false}
│              └─ footer snippet（CardFooter 方言或 RAW）
```

删：dialog-header.svelte、dialog-footer.svelte、dialog-footer.css、
dialog.css B 列（row ruler 42-57 / head 58-60 / body 滚动 68-82 /
foot 83-85 / sep 88-93 / head-grid 100-115 / foot 传导 157-159）。

留（A 列）：::backdrop scrim、× 字形缩放、`[open]` flex 高度传导块
（147-156）——grid 化后实测：平台元素→surface 的 flex column 传导不
变，surface 的子项（grid 宿主）吃 min-height:0 即可，行为待 T7 视觉
+ 探针验证。

head 无条件渲染（× 契约）保留；`data-jx-dialog-*` 内部锚点全灭
（`data-jx-dialog-scroll` → `data-jx-card`；docs 页的
`[&_[data-jx-dialog-scroll]]` 穿刺改 `[&_[data-jx-card]]`）。

Separator 行为差异（迁移风险，T7 重点验证）：dialog 的 sep 占独立
1px 行轨，card 的 sep 骑行分区行边（无独立轨）。视觉等价（1px 线），
几何实现不同。

## 5 · 分区 zone 法则（T5 落地首批）

> 凡组件动作区（head/foot/dock 的按钮区），分区骨架自带
> ButtonVariantScope：head ghost；foot ghost+flat。消费者与 raw
> snippet 里的裸 PressButton/IconButton 自动安静；显式 prop 永远赢。

- Card：现状已合规（card.svelte:112/157）。
- Dialog：分区骨架延续（如上）。
- code-card foot：`<div data-jx-code-card-foot>` 内包
  ButtonVariantScope(ghost, flat)；copy 直用 PressButton（density sm +
  copied 的 jx-hue-success + tonal 12% 配方——2026-09-08 试点裁定）。
- canvas dock foot（canvas-playground.svelte:510-528）：手绘 reset
  （border/bg + 三条 shadow 灭火变量）→ Scope(ghost, flat) +
  IconButton（iconOnly rotate-ccw）。

## 6 · 验证策略

- 单元：card.spec（分区锚点/data-jx-card-body 滚动法则——现状断言
  命中后更新）、dialog 相关 spec 锚点迁移、code-card.spec（ghost+
  flat stamp）、删除 button-bar.spec。
- 门禁：vitest 全量 + svelte-check + verify:all（CHROME_PATH）+
  build + blueprints（整套再渲染，lock law）+ mirror manifest/meta
  再生成 + 快照（general:15→14、carriers、search-corpus）。
- 视觉（vision 子代理）：dialog/card/code-card 页 before/after——
  几何（inset 对齐、sep 线位）、footer 窄屏反转、ghost/flat、暗色、
  acrylic 材质下结构正常。
- 复核（general-purpose 子代理）：对照四层地图逐层审。

## 7 · 风险登记

1. flex→grid 高度传导（dialog.css A 列改造）——实测验证，失败则该块
   重述为 grid 等价。
2. search-palette 的 head FLUSH 组合（DialogHeader 内嵌 Input）——
   CardHeader children 优先路径等价。
3. sep 行为差异（1px 独立轨 → 骑边）——视觉等价验证。
4. card-grid 内的 dialog（贴纸 + 外部租赁叠加）——无已知消费者，
   记录防御性说明。
