# Design: floating-flesh-sweep

## 1 · 两个浮层的不同裁决

**sheet = 全屏面板 → 全方言**。它和 Dialog 同型（showModal 的侧滑
变体），三区皮肉与结构内核一一对应：贴纸宿主 + 三带 + Separator
骑边 + CardBody + head/foot zone。保留 sheet 自己的：侧滑几何/动画
机制（sheet.css）、18px drawer 节奏（CardBody 的 rhythm 逃生口
`class` 覆盖——同属性 utilities 需 `!`，class-append 法则）、
popover 墨色、foot 散排（joined 簇是 ButtonGroup 的法，散排归
utilities）。

**alert-dialog = 锚定 popover → 不贴纸，聚焦按钮**。它是贴着触发
器的小面板：无 head 带（Title 在流内）、Actions 用负 margin 逃出
body padding 的全出血条——这是**形态差异**（popover 尺寸的面板没有
可租的 banded ruler），不是 ruler 债。强套三带是教条。本轮消灭的是
真正的债：**Action/Cancel 的配方复刻**（fill/tonal/outline 三档 +
forced-colors + press pose customs，与 PressButton 逐字重复的
2026-08-26 双源）——改为渲染 PressButton（explicit variant +
density sm），家族唯一的 hue 添加保留：fill 档默认挂
jx-pair-destructive（confirmTone 法）。Actions 条挂 zone(ghost,
flat)：Cancel 零 props 安静，Action 的 explicit fill 照赢。

**section-card = 豁免**（proposal 记档）：文档节卡与紧凑控制面不同
型，46 行模式共享不构成克隆，118 消费者风险不成比例。

## 2 · PressButton/IconButton rest 透传

第三次撞到的缺口（canvas reset wrapper hack、本轮 adlg stamp、未来
任何 data-*/aria-* 落根需求）。实现：Props extends
`Omit<HTMLAttributes<HTMLElement>, 'onclick'|'class'|'style'|'type'
[|'aria-label']> `（button/anchor 双形态的交集；aria-label 的 Omit：
PressButton 的 ariaLabel prop / IconButton 的 text 是唯一 aria 通道，
防止 rest 的 undefined 覆盖语义）；`{...rest}` 在 markup 最前展开，
component-owned stamps 在后（stamped-attribute law 的替换语义）。
IconButton 的 rest 转发进 wrapped PressButton。

canvas reset 的 wrapper span 退役（stamp 直传 IconButton）。

## 3 · 视觉基准

- sheet：四向侧滑几何不变（机制未动）、head/foot 分隔线由 border
  变 Separator（1px 等宽）、× 变 ghost 方钮（安静化，法则行为）、
  body 节奏 18px 不变（class 覆盖）、foot 按钮安静化。
- adlg：确认按钮尺寸从 px-4/py-2 变密度驱动（sm 档 28px hit），
  fill-destructive 视觉等价（同配方），Cancel 变 ghost（原为白底
  描边——安静化，法则行为）；actions 条几何不变。
- 回归面：dialog/card/code-card/canvas 页不受影响（本轮只加
  rest——无行为变化）。

## 4 · 验证

vitest 全量 + svelte-check + build + blueprints + verify:all
（print 项为 a0a512e9 上游遗留）；vision 验收 sheet 四向 +
alert-dialog + 回归抽查；general-purpose 复核。
