# Design: button-bar — the free-floating action lane

## 1 · 定位与家族拓扑

```
                    ┌─ joined 集群（成员读作一个控件）
ButtonGroup         │  -1px seam 折叠 · 单 cluster shadow · overflow 机器
                    └─ 成员：edge-to-edge，0 gap

                    ┌─ free-floating lane（成员各自独立）
ButtonBar  ← 本变更 │ gap 分隔 · 无 cluster shadow · 单行/单列 · flex 排布
                    └─ 成员：PressButton / IconButton / ButtonGroup（嵌套）

DialogFooter        └─ dialog 专用 footer 区域（未来可收敛到 ButtonBar，见范围外）
```

三个已沉淀的机制被 ButtonBar 组合消费，不新造任何 context：

1. **PAINT_ZONE_KEY**（lib/paint）—— variant 的 ambient 通道。
   ButtonBar inherit-then-provide：`effectiveVariant = variant ??
   enclosing?.variant ?? 'ghost'`（own ghost，load-bearing —— 与
   ButtonGroup 的无-own 提供不同：bar 的存在理由就是把子树默认拉到
   ghost）。
2. **PRESS_TEXTURE_KEY**（press-button 拥有）—— 物理纹理轴的 zone。
   ButtonBar inherit-then-provide：`raised ?? enclosing?.raised ??
   false`（own flat，ButtonVariantScope 同形，仅 own 不同）。
3. **density**（lib/density）—— provideDensity 给子树，Defaults 契约
   auditable lane（ButtonGroup 同模式）。

## 2 · 与 ButtonGroup 的嵌套协作（本设计的核心场景）

ButtonBar 内放 ButtonGroup 是一等用例（"主要支持单个"的典型形态 =
一个 joined cluster + 若干散按钮，或单个成员）。逐链核对既定法：

```
ButtonBar (zone: ghost, flat)
└─ ButtonGroup (无 variant / 无 raised)
   ├─ effectiveVariant = ?? enclosing('ghost')          → ghost ✓ 继承
   ├─ separator 政策: effectiveVariant==='ghost' → 默认开 ✓（borderless
   │  行的缝，既定法）
   ├─ clusterRaised = raised ?? enclosingTexture.raised(false) → false
   │  → data-jx-btngroup-flat → root 无 cluster shadow ✓（bar 内的
   │  cluster 不再投影 —— "一个 control 一个 shadow"在 bar 语境 =
   │  lane 无 shadow）
   └─ 子树 texture：ButtonGroup 无条件写 flat（既定法）✓ 与 bar 一致
```

- 嵌套 ButtonGroup 显式 `variant="fill"` 仍赢（explicit 法）；
  显式 `raised` 仍赢 —— 全部是既定解析链，ButtonBar 不介入。
- 嵌套 ButtonBar：理论上合法（zone 自然叠加），无专门语义，不记档
  特别支持。

## 3 · Props 契约

```ts
interface Props extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';   // 默认 'horizontal'
  justify?: 'start' | 'center' | 'end' | 'between';  // 默认 'end'
  label?: string;                             // aria-label（role=group 的名字）
  variant?: ZonePaintVariant;                 // zone 默认，own 'ghost'
  raised?: boolean;                           // zone 默认，own false
  density?: Density;                          // inherit-then-provide
  role?: string;                              // 默认 'group'，可覆盖
  class?: string;
  children: Snippet;
}
```

- **justify 默认 'end'**：主要用例是 footer/actions 区域
  （DialogFooter 的 inline-end-actions 法）。'between' 是 footer 的
  左说明右动作布局（ButtonGroup 无此档 —— joined 集群无"两端"概念，
  lane 有）。
- **gap 固定 `gap-2.5`**（0.625rem，dialog footer grid 的
  column-gap 同值）：成员间距是 lane 的身份属性，不做 prop（class 可
  覆盖，utilities 法）。
- **cross 轴**：horizontal → `items-center`；vertical →
  `items-stretch`（单列等宽，ButtonGroup 纵向同律）。
- **role=group 法**：与 ButtonGroup 同 —— 动作分组的命名，不是
  toolbar；label / aria-labelledby 提供名字。

## 4 · 根元素与 utilities（零 css 文件）

```
<div role="group" data-jx-btnbar={orientation} data-density={d.density}
     aria-label={label} class={cn('flex gap-2.5',
       orientation==='vertical'
         ? 'flex-col items-stretch'
         : 'flex-row items-center',
       justifyClass,   // justify-start|center|end|between
       className)}>
```

- `data-jx-btnbar={orientation}`：css-less 语义锚点（valued hook，
  hook 法 —— 测试/docs 查询用；无 css 消费者，无碰撞）。
- 全部布局 utilities 表达 → **无 button-bar.css**（tw4 utility-first
  法；"component needs non-utility css"场景不触发）。
- `...rest` 透传（props discipline 法）；component-owned stamps 在
  rest 之后展开（ stamped-attribute 法）。

## 5 · Defaults 与门禁链

`button-bar-defaults.svelte.ts`（ButtonGroup 模板同构）：

```ts
export const buttonBarVariantSlot = definePaintSlot(
  ['fill', 'tonal', 'outline', 'ghost'],   // fused 排除：按钮家族无 fused rung
  'ghost',                                  // own —— bar 的存在理由
);
export const ButtonBarDefaults = defineComponentDefaults({
  variant: buttonBarVariantSlot,
  density: densitySlot(),
});
```

- **fused 排除的依据**：fused（2026-09-08 新 rung）在 PressButton 的
  值域外；zone 若写 fused，子按钮 B4 门回落 own（outline）—— 等于静默
  失效。四值域与 button-group 的 proxy 先例一致。
- **config 链**：`scripts/context-coverage.config.json` 的
  frozenAvailability 增加
  `button-bar: { variants: [fill,tonal,outline,ghost], own: ghost }`
  （proxy family，button-group/icon-button 先例）；vocabulary 里
  `variant`/`density` 两词已覆盖，无版本 bump。
- **值域双源问题**：组件的 `effectiveVariant` 硬编码 own 'ghost'，
  Defaults 的 slot own 也是 'ghost' —— 与 ButtonGroup 的
  declaration-first 模式一致（zone 提供者的 variant 不走 Defaults
  resolve，slot 是 auditable face；注释双向指认，防漂移）。

## 6 · 验证策略

- **单元**（apps/www/test/button-bar.spec.ts + fixtures host 模式）：
  - Defaults 契约面（{variant, density} frozen）+ 惰性律
    （unit-resolve-host：own ghost、density no-opinion）
  - bare 子按钮 → `data-jx-press-button="ghost"` +
    `data-jx-press-flat`
  - explicit 子级 variant/raised 赢；bar 级 variant/raised 改默认；
    inherit-then-provide（外层 zone 传递）
  - 嵌套 ButtonGroup → root `data-jx-btngroup-flat` + 子按钮 ghost +
    separator 开
  - orientation/justify class、label/role、rest 透传
- **门禁**：vitest 定向 → `verify:context`（新家族 coverage）→
  `verify:mirror`（manifest 再生成后）→ `verify:meta` →
  `test:types`（svelte-check）→ `verify:docs`（构建后）→
  docs-structure 快照（general:14→15）。
- **视觉**：dev server + vision 子代理按 docs 页 canvas 截图验收
  （ghost 无边框、无阴影、gap 节奏、纵向 stretch、between 布局、
  嵌套 cluster 无 shadow）。

## 7 · 风险与对策

- **ghost-only 视觉同质化**：bar 内按钮全部 ghost 后视觉权重趋同。
  对策：这是特性不是缺陷（footer actions 的既定审美 —— DialogFooter
  已如此运行）；主按钮用 explicit variant（docs 演示）。
- **fast-follow 漂移**：ButtonGroup 未来若改 cluster-shadow 解析链，
  bar 内嵌行为跟随 context 自然演进 —— 无拷贝，无漂移面。
- **`between` 与 ButtonGroup 的 justify 集**：不同集是有意的（两组件
  的结构语义不同）；PropsTable 各自记档。
