# presence-visuals

## Why

collab-presence（750101a6）落地了中心化网关与三指示器的骨架；Owner
第二轮裁决（2026-09-17）把视觉推到协作级：指示器色去硬编码、光标
归位画布层、树/导航/属性面板全面 MultiPlayer 化。

## What Changes

1. **指示器色跟随 Player primary**：picker 的 hover/selected ring
   告别硬编码蓝/红——`--brand-hue`（jixoai-ui 的 primary 驱动变量，
   oklch 色相）由**本端 Player 的 colorHue 联动**（壳、canvas 文档、
   frame 文档全层设置；frame 的 light/dark 主题不变，只有 primary
   hue 联动）；selected ring = `var(--primary)`，hover ring =
   primary 半透明（color-mix）。presence 的 colorHue 是 HSL 度数，
   提供纯换算 hslHue→oklchHue（采样校验）。
2. **光标归位 canvas 级**：远程光标只渲染在 page>canvas 层——
   cursor 帧携带 canvas 名，接收端只渲染「与自己在同一 canvas」的
   光标（不同页面的 Player 互不可见）；壳层光标渲染与上报整体
   退役（光标不再溢出到控制面板）。
3. **树/导航 MultiPlayer 彩带**：border-inline-start 单色高亮升级
   为彩虹彩带（border-image 渐变分段）：单人=现状纯色；多人=按
   本地视角顺序（self 优先）均分色段。导航页面行按 Player 所在
   canvas 归属；树组件行按 attention 的 componentId（stamp 收集带
   id）归属。共享纯函数 `ribbonGradient(hues[])` 产出 border-image。
4. **Props 面板 MultiPlayer**：远程 Player 的字段焦点深化——
   input/textarea 行 focusWithIn **+ 文本 caret 共享**（attention
   增设 caret offset，客户端经既有 reportAttention 通道实时上报；
   渲染为镜像测量定位的 Player 色 caret 条）；其它控件 focusWithIn
   （字段行描边）。

## Impact

- 改：`server/entries/picker.js`（色变量化）、`presence-overlay.js`
  （光标 canvas 过滤 + brand-hue 联动 + frame 广播）、`gateway.ts`/
  `presence-store.ts`（词表：cursor.canvas、attention.panel.caret）、
  `shell.svelte`（brand-hue、壳光标退役、nav 彩带）、
  `component-tree.svelte`（彩带 + id 归属）、`property-panel.svelte`
  （focusWithIn + caret）、`selection.ts`（树行携带 componentId）。
- 新：`studio/presence-visuals.ts`（hsl→oklch 换算 + ribbonGradient
  纯函数）。
- 协议 op 词表零变化（presence 词表小步演进，向后兼容策略：旧帧
  丢弃）。specs：design-studio-shell MODIFIED/ADDED。
