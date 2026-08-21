# LAYOUT-AUDIT — components 页面布局审计

> 审计日期：2026-08-20（server: http://127.0.0.1:8766，dist 构建与 HEAD 一致）
> 方法：headless Chromium（Playwright）度量 + 截图视觉复核；视口 desktop 1440 / laptop 1024 / mobile 390。
> 审计范围对照原始需求：Law-01~03 三卡容器（现为 card-grid）、二级导航分组罗列（terminal-header mega 面板）、
> components + overview 拆分为独立页面 + componentCanvas 工作台（LIVE / Playground / TreeView+CodeCard 抽屉）。

## 通过项（先给结论）

| 检查 | 结果 |
| --- | --- |
| overview card-grid subgrid 等高 | PASS — 全部 6 组、18 卡，卡片子项 `grid-row: span 2 + subgrid` 生效；每行 headerTops / headerBottoms / cardBottoms 完全一致（0 misaligned），原需求"Header 高度不一致、卡片高度不一致"已被 subgrid 方案修复 |
| 水平溢出 | PASS — 所有页面 × 所有视口 `scrollWidth − clientWidth = 0`，无越界元素 |
| CopyCommand 与链接冲突 | PASS — 18/18 copy 按钮命中自身（stretched-link z-0、body 行 z-1 的分层正确，button 不嵌套在 `<a>` 内，无非法嵌套交互） |
| Playground 窄屏折叠 | PASS — <48rem 视口 `.jx-canvas-stage-row` 转列，playground 折到 stage 正下方（belowStage=0），≥48rem 时位于 stage 右侧 256px、顶边对齐 |
| 代码抽屉展开 | PASS — `</> Code` 点击后 drawer 0fr→1fr 展开（desktop ~449px / mobile ~345px）；≥48rem 时 tree（224px）与 code view 并排；TreeView 侧栏 + CodeCard 主区无重叠 |
| 分组节奏 | PASS — 组间 50px、组内 h2→grid 14~24px，六个组完全一致 |

---

## P0 — 影响可用性

（无）

## P1 — 视觉 / 交互问题

### A1. 索引卡 "→" 箭头是死区：整卡看似可点，实际平均 16% 高度不可导航
- 位置：`/components/overview.html` — 所有 18 张索引卡的 body 行（`overview.html/+page.svelte` L207-219）
- 问题：stretched link（`a.jx-card-link`）铺满卡片 z-0，但 body 行 `div.relative.z-[1]` 整行压在其上且只有 CopyCommand 需要pointer 事件。实测 0/18 的 "→" 箭头可点击；箭头及其所在行的大片空白点击无任何反应，而卡片 hover 却给出 `border-primary + 位移` 的整卡可点暗示——可点性暗示与真实命中区不符。
- 修复建议：body 行加 `pointer-events-none`，仅对 CopyCommand 恢复 `pointer-events-auto`（或把箭头包进 `<a href={item.href}>`）。这样整卡（含箭头）都导航，复制按钮仍可独立点击。
- 优先级：P1

### A2. form / dialog / popover 三个组件页没有 ComponentCanvas 工作台
- 位置：`/components/form.html`、`/components/dialog.html`、`/components/popover.html`
- 问题：19 个组件路由中 15 个用 ComponentCanvas（LIVE 区 + Playground + TreeView/CodeCard 抽屉 + GitHub Source 按钮），唯独这三个页面只有 SectionCard + CodeBlock 用法片段：无完整源码树、无 GitHub 跳转。form 是最大的组件页（input/select/textarea/checkbox/radio/toggle/number-input 七个控件），缺位最明显，违背"每个组件页面提供源代码展示 + 跳转 github"的原始需求。
- 修复建议：按 press-button.html 的模式为 form 页补一个（或每控件一个）ComponentCanvas；dialog/popover 若因 top-layer 交互不适合进 stage，可用 canvas 的 iframe/说明变体或至少补 sourceUrl + ?raw 源文件树。
- 优先级：P1（功能缺失，而非纯视觉）

### A3. component-canvas 响应式用视口媒体查询而非 container query，嵌套窄画布代码区被压到 382px
- 位置：`component-canvas.svelte` L243/L327/L339 的 `@media (min-width: 48rem)`
- 问题：组件自身宽度与视口解耦时（component-canvas.html 的递归演示：外层 stage 内 `max-w-[38rem]` ≈ 606px 的内层 canvas，视口 1440px），布局仍按视口进"桌面形态"：代码抽屉 tree(224px)+code(382px) 并排挤在 606px 里，code view 有效宽度只剩 382px，代码行频繁折行。同类问题也会出现在任何把 canvas 放进双栏布局的消费者页面。与原始需求"（仍然使用 grid+container-query 技术来做）"和本仓库 terminal-header mega 面板已有的 container-query 实践不一致。
- 修复建议：把 `.jx-canvas` 设为 `container-type: inline-size`（或 `container: jx-canvas / inline-size`），三条 `@media` 换成 `@container jx-canvas (min-width: 48rem)`。
- 优先级：P1

## P2 — 优化建议

### B1. laptop 视口出现"孤儿卡"整行拉伸
- 位置：overview Layout 组（4 卡）与 Display 组（4 卡）@ 1024px
- 问题：`auto-fit minmax(300px,1fr)` 在 ~976px 内容宽下出 3 列，第 4 卡独占整行并拉伸到全宽（~976px），与上一行 3 张 ~317px 卡形成强烈的宽度突变；单卡 form 组在 desktop 也是 ~1300px 全宽短卡，视觉上"一张卡摊成一条横幅"。
- 修复建议：接受 auto-fit 的简单性则可把 form 组并入相邻组或在卡片 body 补充第二行内容；或给 grid 传 `min` 更大的值（如 340px）让 1024px 下出 2 列避免 3+1；孤儿行也可用 `[data-no-subgrid]` 之外加 `grid-column: 1 / -1` 时的最大宽限制（如 `max-w-[46rem]`）。
- 优先级：P2

### B2. mobile 代码抽屉内 CodeCard 高度失控（tree-view 页 7491px 长滚动）
- 位置：`.jx-canvas-code-panels`（mobile 为 column 布局 + `max-height: 28rem` + overflow auto）
- 问题：窄屏下 tree(209px) 堆在 code 之上，code view 自然高度可达数千 px，全部塞进 449px 的滚动窗口，移动端要滚很久才到代码；且 tree 与 code 共享同一个滚动容器，选择文件时无法固定 tree。
- 修复建议：mobile 下让 tree 自身 `position: sticky; top: 0`（或独立滚动区），并给 code view 设 `max-height` 分层滚动。
- 优先级：P2

### B3. 内层 canvas 标题行在 606px 内已开始拥挤
- 位置：component-canvas.html 递归演示的内层 canvas header
- 问题：title + description + Source 按钮同排，606px 下 description 被压到 ~40ch 换 4 行，header 高于 LIVE stage 最小高，比例失衡。
- 修复建议：A3 落地 container query 后，可在窄容器形态下把 Source 按钮折到标题下方。
- 优先级：P2

### B4. 二级导航（terminal-header mega 面板）未纳入本次组件页审计范围
- 说明：mega 面板已用 `container-type: inline-size` + `@container (max-width: 28rem)` 实现分组分栏/分割线自适应（terminal-header.svelte L676-707），与本页 card-grid 无关；本次未做专项多列/分组视觉走查，建议后续单独过一遍 nav 列数随条目数与容器宽的表现。
- 优先级：P2（后续任务）

---

## 附：审计手段与证据

- 度量脚本：`/tmp/layout-audit/audit.mjs`（subgrid 真值、行对齐、hit-test、抽屉几何），截图 `/tmp/layout-audit/*.png`（desktop/mobile × overview/press-button/form/component-canvas/tree-view）。
- 关键数值：overview 每行 headerTops/headerBottoms/cardBottoms 去重后均为单值；copy hit 18/18；arrow hit 0/18；playground desktop `rightOfStage=0 sameTop=true`、mobile `belowStage=0`；drawer desktop 449px / mobile 345px；全部页面 overflowX=0。
