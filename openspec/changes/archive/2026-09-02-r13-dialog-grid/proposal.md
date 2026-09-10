# r13 — Dialog 网格化 + ButtonGroup 升级 + 分割线组件化

## Why

Owner 验收（2026-09-02）：`data-jx-dialog-body` 不该靠 padding；要
用 **grid + subgrid** 设计网格替代 padding 并引入响应式；footer 用
Context 控制按钮默认 ghost 风格并提供 `actions` slot 自动入组；
ButtonGroup 升级（Context 传递变体、按需分割线、grid 替代 flex、
容器查询下溢出自动「多行（默认）/收纳（折叠进 Menu）」）；Dialog
内部分割线用 Separator 组件 + grid 放置，不用 border。

## What Changes

### 1. Dialog：ruler + subgrid 架构（沿 list-item 先例）
- 滚动容器（head/body/foot 的共同父级）成为**标尺宿主**：
  `grid-template-columns: inset 1fr inset`（inset 轨道吃掉 padding 的
  职责，间距变量化 `--jx-dialog-inset`，容器查询响应式收窄）
- head/body/foot 三段 `display: grid; grid-template-columns: subgrid`
  租同一标尺——标题、正文、按钮的起止边天然对齐，无重复常量
- 行轨含显式 **separator 轨**（1px）：`<Separator>` 放进轨道
  （grid-column 跨满），head/body/foot 的 border 全部退役
- `@supports not (subgrid)` 回退：保留 padding 版几何（先例要求）
- 响应式：平台元素 `container-type: inline-size`，@container 断点
  调 inset/最大宽/foot 布局
- r12 扩展（class/head/cancelGuard）与 palette 组合面不变

### 2. Dialog footer：actions slot + ghost Context
- 新 `actions` snippet：内容自动包进 ButtonGroup（footer 的组容器）
- `variant="ghost"` 经 **BUTTON_GROUP context** 下传——ButtonGroup
  暴露 variant，子按钮（PressButton/IconButton）未显式声明时采组
  变体（B 批实现，A 批消费）
- ghost 组间只留一条 Separator（组与组之间），组内靠 ghost 缝线

### 3. ButtonGroup 升级（独立批）
- Context 增面：`variant`（组配置直传子级按钮）+ `separator`
  （ghost 模式按需启用分割线——用 Separator 组件实缝，替代/兼容
  既有 -1px seam 法则）
- **grid 替代 flex**（Owner 明示接受二维性）：
  `display: inline-grid; grid-auto-flow: column`，gap/seam 语义保留
- 容器查询 + 溢出：`overflow="wrap"（默认多行）|"collapse"（收纳）`
  ——collapse 把溢出尾钮折叠进 DropdownMenu（⋯ 触发），ResizeObserver
  测量驱动，reduced 不影响静态可达性（收纳钮永远键盘可达）
- 既有 seam 法则/嵌组边界/role 法则全部保留

### 4. Separator：消费侧接线
- 现有组件（separator/）进 Dialog 轨道与 ButtonGroup ghost 缝，
  组件本体零改动（除非需要 orientation/长短变体补齐）

## 分工

- 子代理 A：Dialog 簇（dialog.svelte/dialog.css/dialog spec +
  footer actions）
- 子代理 B：ButtonGroup 簇（button-group.*/divider + PressButton 的
  context 消费 + 溢出收纳）
- ZCode：openspec/共享文件/镜像/门禁/整合/codex

## 验收面

- Dialog 三段边线来自轨道里的 Separator；窄容器下 inset 收窄、
  foot 不溢出；无 subgrid 环境回退可用
- footer 传散按钮 → 自动 ghost 入组；两组间一条线
- ButtonGroup 窄容器：默认换行；collapse 模式折叠进 menu

## 纠偏（Owner，2026-09-03 r14-9）

上述第 2 节的「`actions` slot + 两组间一条线」设计被 Owner 否定：
footer 的槽位架构属于 **Footer 区域本身**，由组件承载，不是 Dialog
的兄弟 snippet。已落地修正（r14-9）：

- Dialog 的 `footer` snippet 语义定为**整个脚部内容的裸覆盖**；
  `actions` / `end` 兄弟 snippet 退役
- 新增 `<DialogFooter>`（dialog item 内分发）：children 即动作按钮，
  自动挂入一个 ButtonGroup 骑 inline-end（ghost 继承 Dialog 的 zone
  Context 作用域，显式变体赢）；`end` 裸槽出现即替换组排布
- 对称新增 `<DialogHeader>`（title 默认标题行 / children 自定义
  flush 头）；Dialog 内部默认面直接渲染 DialogHeader（单一来源）；
  × 关闭钮与其 end-action-slot 保持 Dialog 的头架构
- ghost zone 作用域、行轨、Separator 轨道、滚动法则全部不变；
  「两组间一条线」场景随双簇语义一并退役
