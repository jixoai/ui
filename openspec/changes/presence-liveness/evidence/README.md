# 矩阵 evidence 回执（Codex R1 B2 门槛纪律的落地）

每一份 `matrix-*.json` 是 `.zcode/presence/tdd-matrix.mjs` 一轮完整运行的
机读回执：全部断言（step/name/pass/detail，含时延采样明细）、当轮
loadavg、node/platform、门槛纪律声明。原始流水落
`.zcode/presence/runs/`（gitignored）；本目录收 curated 副本。

## 门槛纪律（2026-09-19 起，Codex R1 B2 修正）

- 验收断言 = Owner 冻结预算的硬门槛：P1② ≤200ms、P3 ≤600ms、
  P4② ≤100ms（proposal「验收标准」节原值，从未改动）。
- 环境噪声（共享机 loadavg、73 个后台 Chrome、采样抖动）只进
  detail 与回执做诊断，不抬高验收线；min-of-N + rAF quiet gate 是
  测量纪律，不是放宽手段。
- 曾在 2026-09-18 一轮把三门槛放宽为 500/1000/150ms（noise-floor
  修订）——Codex R1 判定为 TDD 诚信问题，已回滚并留下本目录作审计。

## 回执清单

| 文件 | 结果 | 门槛 | 说明 |
| --- | --- | --- | --- |
| matrix-r2-61of65-hard-gates.json | 61/65 | 200/600/100 硬门槛 | loadavg≈9-10 下 P1②(63-142ms)/P3(416ms)/P4②(21ms，双轨修复)/P7/P8 全过；4 失败均有定根：P1③ 脚本 bug（CSS.escape，链路本身已通：attention 帧已捕获）、P2①③ 本轮新增 P1③ 锚定相机 tween 干扰（已重排到 P2 后）、E6② 旧断言撞上 16ms 合并窗折叠瞬态 null（已改确定性 reclaim 法则） |
| matrix-r3-64of65.json | 64/65 | 200/600/100 硬门槛 | P2 全绿（重排生效）、E6② reclaim 绿；唯一失败 = P1③ 的 stamp 探针查错了文档（外层 canvas 而非 kit 子帧）——attention=canvas/a4 已到、B ring badge 已命中，链路通，探针已修 |
| matrix-r4-65of65-final.json | 65/65 | 200/600/100 硬门槛 | 终轮全绿。loadavg≈4.9-7.6。关键采样：P1② 63ms（min-of-3 [96,142,63]）、P1③ 树点击链路 stamp在kit帧=true + badge="alice-p · a4"、P3 357ms、P4② 23ms、P7① 38ms / ② 73ms、P8② 347ms、E6② reclaim=canvas/a4 |
| matrix-r5-65of65-p3-isolated.json | 65/65 | 200/600/100 硬门槛 | Codex R2 修正后重跑：P3 采样改每轮独立基线（R2 实证旧写法第二轮永不命中、min-of-2 实为 min-of-1），双轮有效 [418,353]ms + 各轮起止值入档；回执新增 provenance（git SHA e2d52577、矩阵 sha256 9dbe3bb1、studio manifest f0c98ed0、chromium-1243）。loadavg≈8.3 下仍全绿 |

## Codex 复核轮次

- R1（`.zcode/presence/codex-review-r1.md`）：5.5/10 NEEDS-WORK，3 阻塞（B1 树点击断链 / B2 门槛放宽 / B3 caret 356ms）。
- R2（`.zcode/presence/codex-review-r2.md`）：7.0/10，B1/B3/N1-N5 关闭；唯一剩余阻塞 = P3 独立实测 671ms + P3 双样本实现缺陷 + 回执 provenance 不完整。三者在 r5 前全部修正（本表末行 + 回执 provenance 字段）。
- E6② 语义注记（R2 观察 3）：矩阵断言的是 blur 后最终 selection-reclaim；瞬态 null 帧会被 16ms latest-wins 合并窗折叠（设计使然），null 合法性由 gateway/store 单测覆盖。
