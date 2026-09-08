# Proposal: floating-flesh-sweep — sheet 与 alert-dialog 的皮肉清扫，PressButton rest 补全

## Why

card-surface-kernel（2026-09-09 第一轮）立了法：浮层不长皮肉、
结构是贴纸、动作区自带 zone。Dialog 已切，但两个浮层组件还留着
自己的皮肉：

- **sheet**：flex 三区 + `border-b/border-t` 手工分隔线 + 手写 ×
  按钮（border/bg/hover 九条 utilities）+ 自持滚动 body。
- **alert-dialog**：Action/Cancel 是**配方复刻**（fill/tonal/outline
  三档 + forced-colors 降级 + jx-pair-destructive 注入，与
  PressButton 逐字重复——2026-08-26 variant-grammar 迁移的产物，
  规范但双源）；actions 区用负 margin 逃出 body padding 的全出血
  工艺，与结构内核的 Separator 行带是两种手艺。

同时撞到**第三次同一个 API 缺口**：PressButton/IconButton 不透传
rest 属性（canvas reset 被迫 wrapper hack，本轮 alert-dialog 的
data-jx stamp 还会再撞）——props discipline 法则本来要求
"`...rest`（HTMLAttributes）flows through verbatim"。

**section-card 豁免记档（本轮裁决）**：它是文档节卡（hero 排版头/
编号链/密度 token 自持 inset），与 Card 的紧凑控制面不同型；46 行
"骑边线模式共享"不构成 ruler 克隆；118 个页面消费者的风险不成比
例。不切。

## What Changes

- **T1 PressButton/IconButton rest 透传**：`...rest`
  （HTMLAttributes）落根元素（button/anchor 双形态），stamps 在
  rest 之后展开；canvas reset 的 wrapper hack 回退为直传。
- **T2 sheet 方言化**（对外 API 不变）：surface-body 内贴纸宿主
  `data-jx-card`（+ import card.css——第一轮的教训）；head 带 +
  ghost zone（CardHeader children 模式承载 sheet 特有 title 排版；
  × 换 IconButton 坐 `.jx-card-end-action-slot`）；CardBody
  （**新增 class prop**，sheet 保持 18px 紧凑节奏）；foot 带 +
  ghost/flat zone + 散排 utilities；Separator 骑边替换手工边线；
  sheet.css 只留浮层机制。
- **T3 alert-dialog 方言化**（对外 API 不变）：Action/Cancel 内部
  换 PressButton（ladder + 注入 class + family Defaults/回调/焦点
  语义保留；data stamp 经 rest 直落根）；Content 贴纸三带
  （Title 进 CardHeader children、Description 进 CardBody、actions
  进 foot 带 zone + Separator 骑边替代负 margin 全出血）。
- **T4 收尾**：镜像/meta/manifest、全量门禁、vision 验收 +
  general-purpose 复核、双 commit 推送。

## Impact

- 重写：sheet.svelte 内部、alert-dialog-content/action/cancel 内部。
- 新增：CardBody class prop、PressButton/IconButton rest。
- 删除：sheet.css 的 × 缩放与皮肉残留、adlg 手绘按钮配方。
- 破坏性：`data-jx-sheet-*` 内部锚点更名（docs 页穿刺若有）；
  adlg actions 的全出血工艺视觉变化（Separator 行带替代）。

## 范围外（记档不做）

- section-card（豁免裁决如上）。
- sheet 关闭动画/侧滑几何（sheet.css 浮层机制，不动）。
- alert-dialog 的 anchor 定位/回退（机制，不动）。
