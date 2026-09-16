# Epic40 `spec-v0.md` 对抗性复核 Round 2

- 日期：2026-09-15
- 复核对象：`spec-v0.md` v0.2、`decisions.md` D1-D5、冻结历史 `substrate-decision.md`
- 范围：`.zcode/epic40/lab/` P1-P20；未修改 `packages/`
- 上轮基线：6.0/10

## 结论

六个阻塞项均已在协议层冻结，并有可执行探针证据；P9/P11 和版本、CLI 建议项也已关闭。
本轮综合 **8.5/10**。这表示规格已达到实现就绪基线，不表示生产 admission/WAL、持久化和文件 watcher
已经写入 `packages/`。剩余未决项已收窄为存储治理，不再悬置操作语义。

## D1-D5 一致性

| 裁决 | v0.2 对齐点 | 结论 |
|---|---|---|
| D1 真实时并发、冲突揭示 | §1/§5 保留并发请求；gate 只保护 commit 原子性，重叠仍 409，不改成 single-writer 预防 | 一致 |
| D2 命名缓冲、`#+-!`、log-cursor | §3/§9/§10 冻结属性缓冲、稳定 cursor、组件 tail-5；P20 补齐行式解析 | 一致 |
| D3 Loro 1.16.1 + journal + 文件投影 | §1/§5/§8/§9 明确 Loro 是状态/因果增量，journal 是审计，文件是投影；完整 OpLog 不被 shallow snapshot 替代 | 一致 |
| D4 源码显式全局 ID + 自动注入 | §2/§8 固定 ID 生成、已有 ID 优先、幂等/并发收养 | 一致 |
| D5 双车道、QuickJS-WASM、本地执行、op-log 同步、WAT 撤销 | §7/§10 固定 RELEASE_SYNC wrapper；远端只导入已接纳 op，不重放 JS | 一致 |

## 逐项状态

| 项目 | 状态 | 关闭结论与证据 |
|---|---|---|
| B1 admission 原子门 | **closed** | `p17-admission-gate` 模拟两个同 base 并发请求：一个提交、另一个在 gate 内观察新 frontier 后 `409 stale-or-unknown-frontier`；`maxActive=1`；成功和拒绝的同 `opId` 重试都返回原 receipt，canonical/journal 无重复。证据：`lab/results/p17-admission-gate.json`。WAL 顺序已写入 §5；真实存储故障注入仍属实现测试。 |
| B2 错误协议 + 寻址 | **closed** | `p13-errors-and-cursor` 实测未知 frontier 抛 `The given Frontiers are not included by the doc`，malformed decode 抛 `Hit the end of buffer, expected more data`；错 container、missing target、deleted cursor、UTF-16 surrogate 边界均有向量。§5 冻结 `409 stale-or-unknown-frontier`、`409 stale-cursor`、`404 bad-target`、`422 utf16-boundary` 及 canonical update/retry cursor envelope。证据：`lab/results/p13-errors-and-cursor.json`。 |
| B3 group/parallel 执行器 | **closed** | `p18-executor` 使用真实 `svelte/compiler`：invalid group 在 commit 前丢弃 candidate（rollback 零效果）；keep-partial 保留成功 op 并逐项列 rejected；parallel 两分支汇合；Loro candidate 支持树+文本同一次 commit。若未来引入非原子执行器，§7 要求改用带 `supersedes` 的补偿 op。证据：`lab/results/p18-executor.json`、`lab/results/p10-review-loro.json`。 |
| B4 QuickJS 沙箱 wrapper | **closed** | `p14-sandbox-wrapper` 固定 `RELEASE_SYNC` WASM；wrapper 移除 module loader、遮蔽 eval/Function/WebAssembly 和普通/async/generator/Date 原型 constructor，`Function.constructor`、`Object.getPrototypeOf(Date).now` 与其他 prototype 链逃逸均失败；Date/Math 注入确定性；controlled Promise + `executePendingJobs` 和显式 dispose 通过；interrupt/memory/stack 基线通过。证据：`lab/results/p14-sandbox-wrapper.json`。 |
| B5 file-resync 原子 rebase | **closed** | `p19-file-resync` 用 `LoroDoc.cmpFrontiers` 检出 observed frontier/hash 失效，先返回 409 且外部文件保持 `F`；携 canonical update、external hash/diff、retry cursor；重基得到 `FB`，成功 admission 后 canonical 与文件同为 `FB`。证据：`lab/results/p19-file-resync.json`。 |
| B6 LoroTree 并发策略 | **closed** | `p12-tree-policy` 实测并发 move 采用有效 Lamport LWW，同序以数值较大 peer 胜，commit timestamp 不参与；remove 隐藏子树但保留 root/descendant tombstone 与嵌套 buffer，deleted buffer 写入真实抛错；Loro 原生 move 可复活节点，故 §6/§11 新增显式 revive；receipt 固定 contenders/orderKey/winner/resolution 形状。证据：`lab/results/p12-tree-policy.json`。 |
| P9 注入探针 | **closed** | 无标 Svelte 源码确定性注入 `data-z-id`；再次 ingest 不重复注入/记账；并发重复收养合并为同一 ID/journal 条目。证据：`lab/results/p15-ingest-ids.json`。 |
| P11 sync/log 探针 | **closed** | 组件粒度 frontier cursor、目标过滤 tail-5、跨 actor `export(update, from)` 重建均通过；§9 明确 Loro 增量可能包含因果闭包中的其他容器，journal 才做目标过滤。证据：`lab/results/p16-sync-log.json`。 |

## 建议项

| 建议 | 状态 | 处理 |
|---|---|---|
| 固定 `loro-crdt` 版本 | **closed** | lab `package.json`/lock 固定 `1.16.1`，不再使用 `latest`。 |
| 固定 QuickJS 变体与产物哈希 | **closed** | §7 固定 `quickjs-emscripten@0.32.0` `RELEASE_SYNC`，记录 WASM SHA-256 `105c3bed22d457e43e3d1c3c1c6959fda62a8fe06f0fc8a985303c3a2be72232`；变更须重跑 P14。 |
| 完成 P9/P11 | **closed** | 由 P15/P16 完成并纳入 `npm run all`。 |
| `cli update` 行式解析 | **closed** | §3/§10 冻结 1-based `#ROW:COL`、当前缓冲解析、UTF-16 code unit、surrogate 拒绝、malformed 首错 fail-stop；P20 将 ROW:COL 变为真实 Loro Cursor 并验证 receipt 行号。证据：`lab/results/p20-cli-parser.json`。 |
| 完整 OpLog + journal / 压缩窗口 | **partial** | §9 已冻结完整 OpLog+journal 不得被 shallow snapshot 替代，旧 cursor 必须 409 重同步；具体留存窗口、周期、隐私擦除仍是治理决策，不能在实现中自行改变语义。 |
| NocturneJS、presence、外部 MCP/CLI | **closed as deferred** | NocturneJS 保留观察位，不影响 QuickJS 默认；presence 后置；外部角色延后 epic，协议位保持同一 op schema。 |

## 残余未决（非阻塞）

| 项目 | 状态 | 原因 |
|---|---|---|
| 容器键编码、actor → numeric peer 映射 | **open** | 需要存储层 schema/registry 选择；§4/§5 的 envelope、错误和并发语义不依赖具体编码。 |
| OpLog/journal 具体留存窗口、压缩周期、隐私擦除 | **partial** | 最低完整留存、shallow snapshot 禁用和 stale-base 重同步已冻结；窗口是治理策略。 |
| 嵌套 git save 显式路径集 staging | **open** | 独立于协同协议的工作树实现项，保留在 §12，不伪装成已验证。 |

## 与上轮 6.0 的变化

- 一致性：从 7.5 提升至 9.2。D1-D5 与 v0.2 的双车道、本地 JS 执行、跨设备 op-log 同步、源码全局 ID、Loro 1.16.1 均逐项对齐；`substrate-decision.md` 未改。
- 可行性：从 5.5 提升至 8.3。P12-P20 将 admission TOCTOU、真实 Svelte compile gate、QuickJS wrapper、409/rebase、LoroTree 删除/复活和 cursor 错误行为从假设变成可复现实验；生产持久 WAL 仍需实现后做故障注入。
- 完整性：从 5.5 提升至 8.5。补上树/文本混合事务、ingest 与并发 admission 竞态、panel canonical→mirror 方向、因果闭包增量、malformed fail-stop 和结构冲突 receipt。
- 未决治理：从 5.0 提升至 7.8。阻塞语义已移出探针池；仅保留容器键/actor 映射、日志留存窗口、嵌套 git staging 三项实现前治理事项。

加权后为 **8.5/10**：协议语义和探针基线已可交给实现；扣分来自探针仍是隔离沙盒而非 production crash/restart、存储留存窗口未定，以及 NocturneJS 未做默认实现验证。

## 修改清单

- `spec-v0.md`：版本/状态升为 v0.2；更新 §2 ID 注入、§3/§10 CLI、§4 tagged union；冻结 §5 错误与 WAL 顺序、§6 LoroTree 策略、§7 QuickJS wrapper、§8 file-resync rebase、§9 sync/log 方向与留存底线、§11 revive；重写 §12 已关闭/仍治理未决；扩充 §13 P12-P20 验收索引。
- `lab/p12-tree-policy.mjs`：增加 tombstone buffer 写入拒绝探针。
- `lab/p19-file-resync.mjs`：使用真实 `cmpFrontiers` 做 stale 判定。
- `lab/p20-cli-parser.mjs`：新增行式语法、ROW:COL→Loro Cursor、UTF-16 和 fail-stop 探针。
- `lab/common.mjs`：ROW:COL 解析拒绝 surrogate 中间边界。
- `lab/package.json`、`lab/run-all.mjs`：纳入 P8、P10、P12-P20 的显式 scripts/回归入口。

## 验证命令

`npm run all`、`npm run p8-review`、`npm run p10-review`、`node p20-cli-parser.mjs` 均通过；P1-P20 结果写入
`lab/results/`。未改动 `packages/`。
