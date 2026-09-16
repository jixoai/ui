# Epic40 `spec-v0.md` 对抗性复核

- 日期：2026-09-15
- 范围：`.zcode/epic40/spec-v0.md`、`.zcode/epic40/decisions.md`、`.zcode/epic40/substrate-decision.md`、lab P1-P8/P10
- 约束：未修改 `packages/`

## 结论

本轮没有发现 spec 与 Owner 的 D1-D5 发生方向性矛盾；但原草案把若干关键实现前提写成了“已有协议能力”。已将能够由证据确定的问题直接修入 spec，剩余问题仍足以阻塞实现启动。

**综合评分：6.0/10**

评分依据：一致性 7.5（裁决映射清楚，少数能力仍只有约束没有实现）；可行性 5.5（Loro 关键原语可用，但 admission/WAL、事务执行器、沙箱 wrapper 尚未落地）；完整性 5.5（本轮补齐了竞态和同步方向，树并发、错误协议和重放边界仍未冻结）；未决治理 5.0（§12 已分层，但 5 个实现前决策不能继续留在探针池）。加权后得到 6.0，而不是把 Loro 底座的 8.4/10 直接当成协议完成度。

## 阻塞项（实现前必须关闭）

1. **Admission 原子提交与持久恢复未实现。** 必须在同一 page/workspace admission gate 内完成 frontier 重检、candidate fork、compile/registry gate、canonical update、WAL/journal、receipt；`opId` 重试必须幂等。仅有 `cmpFrontiers` 不能防止两个请求同时通过 TOCTOU。
2. **稳定寻址和错误协议未实现。** 外部文本 op 不能只带 offset；需要 cursor/item identity、container 校验、UTF-16 边界校验，以及 unknown/stale/future frontier、stale cursor、错误 target 的明确状态码和 resync envelope。Loro 对未知 frontier 会直接抛出 `The given Frontiers are not included by the doc`，不能把异常当作普通并发。
3. **`group`/`parallel` 执行器未实现。** 树 op 与文本 op 已证实可以在 Loro 一次 commit 中形成一个 change，但整组冲突、Svelte 编译门禁、`rollback`、`keep-partial`、补偿 receipt、parallel 汇合和 remove tombstone 仍没有实现级证据。
4. **QuickJS 沙箱契约未实现。** P8 实测 `eval` 与 `Function` 默认可用并能计算 42，`Date.now`/`Math.random` 默认也是 function；只有 `process`、`require`、`fetch` 未定义，`WebAssembly` 未定义。必须先落 wrapper，禁用动态代码/模块加载，注入确定性时钟和随机源，并冻结 Promise/async、handle dispose、重入和中断预算。
5. **file-resync 的原子 rebase 未实现。** P10 实测并发 agent op 与 stale 全文件 ingest 直接 import 后 canonical 为 `FB`，外部文件仍为 `F`。必须在 observed frontier/hash 失效时返回 409，禁止覆盖外部文件；成功 admission 后才按 canonical 投影原子写回。
6. **结构并发策略未冻结。** P4 只证明 LoroTree 的稳定 ID、父子约束和环拒绝；并发 move 的 tie-break、结构冲突 receipt、remove 对子树和 buffer 引用的处理尚未实测。

## 建议项（不阻塞协议方向）

- 将 lab 的 `loro-crdt` 从 `latest` 固定为 `1.16.1`，否则 D3 的实验基线会随安装时间漂移；QuickJS 也应记录确切 WASM 变体和构建产物哈希。
- 完成 P9（无标源码注入、幂等收养、并发重复收养）和 P11（组件粒度 cursor、tail-5、跨 actor 增量）后再宣称 D4/D2 已可交付。
- 为 `cli update` 明确 `#ROW:COL` 到 cursor 的解析、换行/UTF-16 规则和 malformed 行的 fail-stop receipt；当前行式车道只冻结了词表和“不回滚”。
- 保留完整 OpLog + append-only journal，再定义 snapshot/压缩窗口和 stale-base 恢复；不能让 shallow snapshot 成为唯一审计存储。
- NocturneJS 仍是候选观察位：上游字面 LICENSE 和 WASM 目标未证实前不进入默认实现；presence 与外部 MCP/CLI 按 decisions.md 后置。

## D1-D5 一致性核对

| 裁决 | 核对结果 | 证据/落点 |
|---|---|---|
| D1 真实时并发、冲突揭示而非锁预防 | 一致 | §1/§5 保留并发写、409 和 admission CAS；没有改成 single-writer 队列。 |
| D2 属性级命名缓冲、`#+-!`、log-cursor | 一致但需实现 | §3/§9/§10 保留词表、组件粒度 cursor、返回 log 增量；补充了稳定 cursor 约束。P1/P6/P7 PASS。 |
| D3 Loro 1.16.1 + 应用 journal + 静止 `.svelte` 真相 | 一致 | §1/§5/§9 明确三层边界、WAL/journal 和 Loro 只负责状态/因果增量。P2 证明重叠策略必须由应用层承担；P3/P10 证明补偿路径。 |
| D4 源码显式全局 ID、ingest 自动注入 | 一致但未交付 | §2/§8 保留自动注入、LoroTree adoption 和裸 ID；P9 仍未完成。 |
| D5 双车道、QuickJS-WASM、本地执行、同步 op-logs、WAT 撤销 | 一致 | §7/§10/§11 明确 `update` 与 `update-js`、无 Agent 审批门、脚本只在本地执行、远端只导入 op；显式写出 QuickJS 默认 Date/Math 不能视为安全边界。NocturneJS 仍按 D5 的候选/观察位处理。 |

## 本轮直接修改

- **§4 op envelope**：增加 `domain=text|tree` tagged union；补上 tree `insert/move/remove` 载荷；禁止用省略字段猜类型；`offset/length` 仅属于文本 op；`syncCursor` 改为显式 frontier/VV 标签并规定各自的 Loro 转换路径。
- **§5 admission**：保留并强化 per-document 原子 gate、frontier CAS/recheck、WAL/journal/opId 幂等、cursor/container 校验和错误分类；同步步骤不再错误地对 VV 调用 `frontiersToVV`。
- **§6 give-up**：修正为在含目标 op 的 current branch 上保存 `targetParent`，调用 `revertTo(targetParent)` 生成补偿，再导出相对 canonical 当前版本的 update；明确 `forkAt(targetParent)` 后再 revert 是 no-op，第三方并发编辑必须存活。
- **§7 JS runtime**：明确 v0 无审批门；保留双车道/WAT 撤销；把 NocturneJS 的 LICENSE/WASM 前置条件写清；要求显式禁用动态代码/模块加载、覆盖 Date/Math，并冻结受控 Promise/handle 生命周期。
- **§8 file-resync 与 §1 panel**：增加 observed frontier/hash 失效后的 409、rebase、canonical 投影原子写回；明确 panel 是 canonical → mirror，409 时丢弃 pending overlay 后重基，断线重连按 cursor 拉 canonical 增量。
- **§12/§13**：把实现前必须冻结项与后置项分开；把树+文本混合事务、P8/P10 已有证据和仍缺的 P9/P11 写成可执行验收项；补充并发 tree move tie-break 与 `cli update` cursor 解析为冻结内容。
- **lab P8**：增加 `eval`、`Function`、`WebAssembly` 默认表面实测，输出写入 `results/p8-sandbox-review.json`。

## 实验与复核证据

在 `.zcode/epic40/lab/` 实际执行：

```text
npm run all
```

P1-P7 全部 `PASS`：P1 词表/cursor，P2 并发 frontier 与 overlap 需应用层判定，P3 Loro 补偿撤销，P4 LoroTree 身份/环拒绝，P5 文件投影，P6 增量导出与 tail-5，P7 Svelte bridge。

```text
npm run p8-review
```

`quickjs-emscripten@0.32.0`：注入函数返回 42；`eval`/`Function` 可执行；`WebAssembly` 未定义；`Date.now`/`Math.random` 为 function；无限循环由 interrupt handler 以 `InternalError: interrupted` 停止；实测 memory limit 524288 bytes、stack limit 131072 bytes、interrupt checks 1002。

```text
npm run p10-review
```

树+文本混合组输出 1 个 change；错误 `forkAt(targetParent)` 分支文本为 `A`，正确的含目标 op 分支 `revertTo(targetParent)` 导入后恢复为 `A`；stale ingest 竞态输出 canonical `FB`、外部文件 `F`。

补充 Loro API 探针：对未知 frontier 调用 `cmpFrontiers` 抛出 `The given Frontiers are not included by the doc`。该异常已纳入 §5 的 `stale-or-unknown-frontier` 错误协议，而不是当作可自动合并。

最后执行 `git diff --check`，并检查 `git diff --name-only -- packages` 为空；本轮没有改动 `packages/`。
