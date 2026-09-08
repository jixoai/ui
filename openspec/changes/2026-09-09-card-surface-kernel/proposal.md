# Proposal: card-surface-kernel — the structural kernel law, Dialog 瘦身，ButtonBar 退役

## Why

Owner 2026-09-08/09 三轮架构收敛的结论。"底部动作区"这个需求在仓库里
有三种层次的解法并存：

- **成品派**：DialogFooter / CardFooter —— 互为克隆的双胞胎（CardFooter
  注释自认抄了 DialogFooter），各自内嵌 ButtonGroup + 各自的窄屏反转
  机制（Tailwind @max vs 原生 @container，同一个 15rem 魔数两套实现）。
- **野生派**：code-card foot、canvas dock foot —— 手绘按钮 + shadow
  灭火变量，零 zone。
- **新组件派**：button-bar（2026-09-08 刚落地）——"带 zone 的 flex div"。

同时 card.css / dialog.css / section-card.css 是**三套 ruler 克隆**。
card.svelte:9-11 与 card.css:150-154 早已写明重构宿愿："the seat
Dialog's × is designed to occupy **when Dialog is refactored onto
Card**"。

Owner 的裁决方向（讨论记录）：

1. Card 作为所有"框内三段式"的**结构基础**——但拆两层：皮（`<Card>`
   根：边框/背景/阴影）与结构件（Header/Body/Footer）分离，浮层只要
   结构件不要皮。
2. ruler 是**纯 CSS 能力**，载体是"结构属性贴纸"（`data-jx-card` 属性
   族 + CSS 规则集），不是组件包裹——`{@attach}` 被否决（attach 运行
   在 effect 期，SSR 缺席、时序晚于 context 读取；贴属性 SSR 即生效）。
3. ButtonBar 退役：ButtonGroup 配当组件是因为有真复杂度（-1px 缝折
   叠、簇阴影、溢出机器）；ButtonBar 没有自己的法则，zone 职责归区
   域/结构件骨架，flex 排布职责归 utilities（tw4 utility-first 法则
   本来的裁定）。
4. **区域动作区 zone 法则**：凡组件的动作区（head/foot/dock 的按钮
   区），分区骨架自带安静 zone（head ghost / foot ghost+flat），消费
   者永远不操心。

## What Changes

- **T1 ButtonBar 退役**：删组件/docs/测试/registry 条目/全部配置与快
  照回退（general:15→14）；教训记入本 change 的 design.md（组件存在
  的理由是法则，不是便利）。
- **T2 Card 结构内核**：`data-jx-card` 属性族升为公共结构 API（贴上
  = ruler 网格 + jx-card 容器 + 分区放置规则，任意元素可用——
  card.css 已是贴纸就绪形态）；新建 **CardBody**（滚动 cell 职责，
  沟槽补偿公式单源化）；CardHeader 补 standalone fallback；CardFooter
  为唯一 footer 组装（吸收 DialogFooter，label 中性默认文案）；Card
  根自举（内部改用自己的结构件）。
- **T3 Dialog 瘦身**：对外 API 不变（title/head/footer/scroll/
  cancelGuard/open），内部改说 Card 方言——scroll 宿主贴
  `data-jx-card`、head 用 `.jx-card-head-grid`、**× 坐
  `.jx-card-end-action-slot`**（宿愿实现）、body 用 CardBody、foot
  走 CardFooter 方言；删 dialog-header.svelte / dialog-footer.svelte /
  dialog-footer.css / dialog.css 的 B 列皮肉规则；15rem 反转统一走
  card-footer.css 的原生 @container；消费者迁移（search-palette、
  docs dialog 页、blueprint scene、测试锚点）。
- **T4 spec 落法**：删 button-bar Requirement；新增 **the structural
  kernel law**（浮层不长皮肉；结构=贴纸；分区骨架自带 zone；
  ButtonGroup 是唯一排布组件、散排归 utilities；attach 判据——等元素
  上屏才做的事才用 attach）。
- **T5 野生区收编**：code-card foot 区包 ButtonVariantScope(ghost,
  flat) + copy 直用 PressButton（density sm + copied hue 配方保留）；
  canvas dock foot 的手绘 reset 按钮 → Scope + IconButton。
- **T6 docs**：card 页（贴纸 + standalone 结构件）、dialog 页（方言
  化 + Card 系用法）等。

## Impact

- 删除：button-bar 全影响面（12 整文件 + ~10 处编辑）、dialog-header/
  dialog-footer/dialog-footer.css、dialog.css B 列。
- 新增：card-body.svelte、CardHeader standalone fallback、
  2026-09-09-card-surface-kernel change。
- 重写：dialog.svelte 内部实现、card.svelte 自举、card-footer label。
- 迁移：search-palette、docs dialog 页、blueprint scenes、
  card/dialog 相关测试锚点。
- registry.json：删 button-bar 条目；dialog 依赖 +@jixoai/card；
  code-card 依赖 −@jixoai/button-bar。
- 破坏性（无兼容层）：DialogHeader/DialogFooter 的 import 全部改
  CardHeader/CardFooter；`[data-jx-dialog-scroll]` 内部锚点更名。

## 范围外（follow-up 记档）

- section-card 第三套 ruler 克隆切 Card 方言。
- alert-dialog / sheet 皮肉方言化（现为纯机制+自备皮肉形态，无 ruler
  依赖）。
- CardFooter standalone 窄屏反转缺口（贴纸化顺带修复，本次验证）。
