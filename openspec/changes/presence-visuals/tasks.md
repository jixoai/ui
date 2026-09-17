# tasks

## 1. 词表与主题联动（编排者线）

- [x] 1.1 presence-visuals.ts：hslHue→oklchHue 纯换算（采样单测）+
      ribbonGradient(hues[]) 纯函数（单人=纯色、多人按序均分）
- [x] 1.2 词表演进：cursor 帧带 `canvas` 名（必填非空）；
      attention{panel} 增 `caret?: number`（整数 offset）——gateway
      校验 + store 编解码同步
- [x] 1.3 --brand-hue 联动：壳/canvas/frames 全层设本端 Player 的
      oklch hue（presence 广播携带；frame 文档经 DOWN 消息设置）
- [x] 1.4 picker 指示器色变量化：selected=var(--primary)、hover=
      primary 半透明、badge 同源
- [x] 1.5 光标 canvas 级：overlay 按 canvas 名过滤；壳层光标渲染与
      上报退役
- [x] 1.6 shell nav 页面行彩带接入（ribbonGradient）

## 2. 树与 Props 的 MultiPlayer（子代理线 B）

- [x] 2.1 selection.ts 树行携带 componentId（stamp 收集 DOM 的 id）
- [x] 2.2 component-tree.svelte：attention.componentId → 树行归属；
      border-inline-start 升级 border-image 彩带（本地序：self 优先）
- [x] 2.3 property-panel.svelte：focusWithIn（字段行描边，Player 色）
      + input/textarea 的远程 caret 条（镜像测量定位）；
      reportAttention 实时上报（focus/select 事件，panel focus 带
      caret）

## 3. 验证与收口

- [x] 3.1 单测（换算/彩带/词表）+ 全量绿
- [x] 3.2 TDD 矩阵扩展断言（跨页面光标不可见、彩带多人分段、caret
      呈现）全绿
- [x] 3.3 ego-browser 双实例视觉走查（指示器=primary、彩带、caret）
- [x] 3.4 specs delta + validate + 对抗复核 + 提交推送
