# presence-walkthrough-r4

## Why

Owner 走查 r4（2026-09-21）三项：

1. **同族断层排查**——「页面跳转高亮延迟」的根因是 nav 归属只由画布
   pointermove 光标帧承载。同类缺口还有两处：**boot**（新开的浏览器在
   鼠标动之前完全不可见）与 **reconnect**（断线重连后归属丢失）。
2. **左下 title**——组件树标题显示画布名（`welcome`），Owner 裁决应为
   `layers`。
3. **左下角设置入口**——见 `design-settings-panel` 变更（S 系列验收）。

本变更只覆盖 1 与 2（3 由姊妹变更承载）。

## What Changes

- `src/studio/shell.svelte`
  - 新增 boot/reconnect park effect：presence 状态到 `online` 的边沿，
    立即以 park 坐标上报当前画布归属（`reportCursor(canvas,'canvas',…)`）
    并点亮 `ownCursor`。store 绑定与 online 边沿的竞态由响应式读
    `presenceStoreRef` 兜底（store 晚到时 effect 重试）。画布读取走
    `untrack`——切页语义仍归 `selectCanvas` 自己的上报。
- `src/studio/component-tree.svelte`
  - 树标题 `{canvas ?? 'canvas'}` → 固定 `layers`。
- `src/server/entries/presence-overlay.js`
  - 三处 `doc.documentElement.clientWidth` 补 null 卫兵（iframe
    mid-(re)load 的 about:blank 过渡帧；矩阵 PAGEERROR 门捕获的真实
    竞态——与 `applyBrandHueTo` 的 null-guard 同族）。
- `.zcode/presence/tdd-matrix.mjs`
  - 新增 **A8**：零鼠标移动的第三浏览器 boot → 对端彩带 ≤600ms 跟到
    + 树标题 = `layers`（74 断言）。
  - **P5① 前提修订**：boot-park 落地后每个在场浏览器都常驻自己的画布
    彩带，welcome 的「单人态」不复存在——单人语法改由临时第三页
    （carol-p 独占 echo-demo）验证；A/B 全程不动（P8 复用的 canvas
    帧句柄不受重载影响）。②③ 的 self-first 断言仍以 A 页为准。
  - **P8** 句柄重解析：P 组开头解析的 canvas 帧在跨断言窗口内可能
    重载（R2 round-3 FATAL 同族的防御性修法）。

## Acceptance

- 矩阵 74/74（A8 绿、P5①/P8 绿、PAGEERROR 零异常门绿）；回执
  `.zcode/presence/runs/matrix-2026-09-20T20-14-12-881Z.json`。
- boot park 探针：B 在场 → C 全新打开零鼠标移动 → B 端 11ms 见彩带。
- 全包电池 580/580。

## Scope

- 不动 hue 序列 / kit 寻址 / join 快照（r2w 已收口）。
- 设置面板（入口/存储/桥/内核消费）见 `design-settings-panel`。
