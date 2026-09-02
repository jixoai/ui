# Proposal: toast-v2 — sonner 方言四能力（堆叠/展开/滑动关闭/暂停 + VT 展开）

## Why

Owner 裁决（2026-09-02）：toast 全面升级，参考 npm:sonner 的优势——
1. 支持堆叠（折叠态），hover/touch 展开
2. 滑动关闭（swipe-to-dismiss）
3. 页面不可见时暂停计时（visibilitychange——toast 不该在用户看不见时烧完）
4. 开箱即用的 view-transitions-to-dialog：toast 展开成 Dialog

前置已就绪：浮层 P0（点击护盾/巨型卡片）、排队隐形死亡、幽灵退场
均在对抗审查波修复并收敛（a15ec40/b1c9f08）；well/指针/grid 法则已
落盘 living specs——v2 在干净地基上施工。

## What Changes

### 1. 堆叠方言（grid-not-position 的 sonner 表达）

折叠态（默认）：栈仅完整展示最前（最新）一张卡，其后 visibleToasts-1
张以 translateY(-gap×i) + scale(1-0.05×i) 的「物理深度」叠在下面
（CSS 变量 `--jx-toast-i` 由 viewport 盖章；卡片高度折叠时归一到最前
卡高——后卡内容 `max-height` 裁切）。hover/touch 栈区 → 展开：每卡
translateY = 前置卡高累计 + gap×i（JS 量高后经 `--jx-toast-ey` 盖章），
展开态用 `::after` 填隙保 hover（pointer 法则：栈透明、卡 opt-in 不变）。
`expand` prop 恒展开。`maxVisible` 语义不变（排队 + +N 芯片仍在）。

### 2. 滑动关闭（sonner 机制，法则方言）

卡片 pointer 事件把拖拽位移写进 `--jx-toast-swipe`（translate 跟手）；
非允许轴带摩擦（位移×0.2，位移回落不硬停）。判定：位移 ≥ 48px 或
速度 > 0.11 px/ms（动量）→ dismiss（走既有退场管线）；否则弹回。
`swipeDirections` 按位置词表（默认：向近屏幕边）。setPointerCapture
拖出卡仍收事件。reduced-motion：用户驱动的拖拽保留，回弹动画取消。

### 3. 页面不可见暂停（unified hold 新暂停源）

`document.visibilitychange` → hidden 时 store 冻结全部时钟
（`pauseAll('visibility')`），visible 恢复。与既有 hold（hover/focus，
按 id）和可见性握手（D-2）正交：visibility 是全局源，不触碰 per-id
的 held 标志（卸载语义 D-2/CR-1 P3-2 已有测试护住）。

### 4. view-transitions-to-dialog（开箱即用）

push 配置 `expandable: true` 的 toast：卡片可点（或尾部展开钮）→
`document.startViewTransition` 包裹「卡片收起 + Dialog 面板挂载」，
共享元素 `view-transition-name: jx-toast-<id>`（卡与面板同名，morph
天然衔接）；不支持 VT 的引擎 → 两条 motion 法则先例的 WAAPI 回退
（面板从卡 rect 起始 animate 到位）。展开态暂停该 toast 时钟；Dialog
关闭（含 light-dismiss 对应）→ toast 恢复折叠（再次 VT morph 回），
或按配置 `dismissOnClose` 直接完成退场。

### 5. 落点文件

- `apps/www/src/lib/toast-store.ts` + registry 镜像：swipe/expandable
  元数据、pauseAll/resumeAll（visibility 源）
- `ui/toast/toast-viewport.svelte`：堆叠方言、索引/展开盖章、swipe
  手势、expand 态
- `ui/toast/toast.css`：折叠/展开 transform、高度归一、::after 填隙、
  swipe 跟手与回弹
- `ui/toast/toast-dialog.svelte`（新）：VT 展开面板（.jx-surface 族）
- docs 页 toast.html：burst 演示（堆叠/展开）、swipe 演示、visibility
  演示（iframe 或说明）、expandable 演示 + playground 旋钮
- 测试：堆叠数学、swipe 判定（阈值/速度/摩擦 纯函数）、visibility
  冻结/恢复、VT 引擎选择

## Impact

- API 纯增量：新 push 字段（expandable/swipeDirections 默认值）与新
  viewport props（expand、gap、swipeDirections），默认行为变化仅一处
  ——多卡时从「全部平铺」变「折叠堆叠」（Owner 要的核心体验）。
- 法则遵循：堆叠/展开全 grid+transform（无新增 position）；填隙
  ::after 是效果伪元素豁免类；Dialog 面板走 .jx-surface 减色影层轨。
- 与 search 并行流无文件交集（toast 域独占）。
