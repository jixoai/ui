# tasks — terminal-input-p0

## Phase 0 — 冻结（ZCode + Codex）

- [x] proposal / design / tasks / briefs / specs delta（r0）
- [ ] Codex change review → 修订 → ≥8 冻结

## Phase 1 — Batch A：绑定层（子代理，探针先行）

- [ ] 探针：OSC 52 载荷形态（set/query/选择器）、SGR/X10/UTF8 编码
      字节序列、MOUSE_TRACKING 随 DECSET 翻转、encoder SIZE 换算、
      OSC parser 流语义（混合流容错 / 跨 vtWrite chunk 切分 /
      reset-end 生命周期 / 未完结序列缓冲——self-review B4）
- [ ] readMouseTracking + onMouseTrackingChange
- [ ] mouseEncode（事件编组 + setopt_from_terminal + 全格式测试）
- [ ] title 直读（DATA_TITLE）+ onTitleChange；OSC 52 三路线探针
      → onOsc52（OPT 26/38 回调 → parser 边界 → 宿主扫描）
- [ ] 门面透传（mouseEncode/onMouseTrackingChange/onTitleChange）
- [ ] 黄金测试全绿；报告 ABI 偏差

## Phase 2 — Batch B：组件（子代理，依赖 A 接口）

- [ ] IME：compositionstart/update(end)、preedit 绘制、提交走
      paste gate、composition 期间 keydown 让位
- [ ] 鼠标路由：mouse prop、Shift 旁通、tracking 翻转路由、X10 特例
- [ ] OSC 52：clipboardWrite（默认开+上限）、clipboardReadFrom
      （默认拒）、onTitleChange prop
- [ ] jsdom 测试（路由切换/旁通/上限/提交路径/raw 层优先级不变）

## Phase 3 — Batch C + 整合（C 子代理 + ZCode）

- [ ] docs playground：mouse 开关 + 标题栏接 onTitleChange
- [ ] unipty demo 复验清单（vim 点击/滚轮、OSC 52、IME）
- [ ] ZCode：镜像同步、manifest、registry docs、全门禁
- [ ] 浏览器实测（docs + demo 双站点）

## Phase 4 — Codex 实现复核

- [ ] review（顺带覆盖冻结后未复核的累积迭代 commits）
- [ ] 修复循环至通过

## Phase 5 — 收尾

- [ ] rebase main 检查、verification.md、archive、push、清 worktree
