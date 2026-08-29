# implementation review (codex) — 6.5 → 8.5/10

## 要点

- 拖拽丢 RELEASE（离面清零后 release 分支不再进）
- 会话未锁（mid-drag tracking-off/Shift 仍上报）
- query 异步卸载后回包
- probe 门禁缺 mouse 族 13 项
- → 修复（会话锁配对/alive 守卫/门禁/observer 释放）→ 复验 8.5 零阻塞
