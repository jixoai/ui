# presence-walkthrough-r2 矩阵 evidence

Owner 走查（2026-09-19）六项反馈的矩阵断言组（A1-A6）+ 既有 65 项
（A/B/C/D/E/P 全组）在同一轮里跑——回执含 provenance（git SHA、矩阵
源码 sha256、studio bundle manifest、chromium 构建）与 loadavg。

| 文件 | 结果 | 门槛 | 说明 |
| --- | --- | --- | --- |
| matrix-71of71-final.json | 71/71 | Owner 冻结硬门槛（P1 200/P3 600/P4 100） | loadavg≈14.6 下全绿。A1 轮盘法（alice-v=343/bob-v=162/probe ≥40° 不正对）、A2 desktop kit 定位（ring 落 desktop box 内且不落 mobile）、A3 彩带槽位独占（shadow:none + 行左边宽 2px）、A4 晚来者 5s 内见停驻光标、A5 箭头+difference blend、A6 名签/badge 半透明背景 |

## 迭代中发现并一并修复的产品 bug（r7-r10 轮实证）

1. **ring 放置无重试**：placeRing 的幂等跳过在解析失败（kit 未加载，
   ringKey null）后也生效——ring 永不出现。修：失败态每帧重试。
2. **光标放置无重试**：frame-surface 光标在 kit iframe 未挂载时停靠且
   不再尝试。修：parkedCursor 记忆 + align 循环重试。
3. **canvas 挂载竞态丢 roster**：转发是 store 通知边沿触发——welcome
   早于 canvas iframe 挂载时快照丢在 null target 上（晚来者空白）。
   修：iframe bind + load 双时机重推 + 网关对晚来者逐活玩家发
   presence 突发帧（「主动推送状态快照」的传输层落地）。
4. **Svelte scoped CSS 剪枝**：`.studio-canvas-row[…] .jx-item[…]`
   后代选择器因 `.jx-item` 不在本组件模板被整条剪掉（build 的
   unused-selector 警告即此）——A3 首轮红。修：`:global()` 包裹。
5. **走查服务器共享 journal 污染矩阵**：5199 端口的走查实例与矩阵
   同写 design/.jx-collab/presence.json（D11 counter 18→8 异象）。
   法则：矩阵运行期间不得有共享 journal 的常驻服务。

| matrix-71of71-p1-fixed.json | 72/72 | 同上 + PAGEERROR 硬门禁（恒记录绿行） | Codex r2w P1（parkedCursor 未初始化 → align 循环每帧对 undefined 崩溃、绿灯掩盖）修复后：ensureEntry 补 parkedCursor:null、跨画布停靠清记忆、applyBrandHueTo 空守卫（历史噪声一并清零）、解析顺序改 frameId-kit → 宿主 → 全扫（宿主诱饵断言）；矩阵新增零异常硬门禁（含 ResizeObserver/favicon 容忍名单）。569/569 电池 |

## Codex 走查轮复核（2026-09-19）

- `.zcode/presence/codex-review-r2w.md`：7.8/10 NEEDS-WORK。P1 阻塞 = parkedCursor 未初始化（上文已修 + 门禁）；非阻塞 = A2 宿主碰撞边界（已修+断言）、pickHue 阈值收紧（前 6 人相邻 ≥90°，已改）、TTL 直接测试（已补，9/9）、applyBrandHueTo 历史噪声（已修）。
