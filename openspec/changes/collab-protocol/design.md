# collab-protocol — design

- 协议唯一权威文本：本 change 目录 `protocol-spec.md`（v0.2，六阻塞全闭、
  P1-P20 探针证据）；裁决记录 `protocol-decisions.md`；Codex 三轮证据
  `substrate-research.md` / `review-round1.md` / `review-round2.md`。
- 本文件只补两件实现前必须冻结的治理项（review-round2 §12 遗留）与集成
  决策；与 protocol-spec 冲突时以 protocol-spec 为准。

## 治理冻结一：容器键编码（spec §5 未决项）

Loro 容器名禁 `/`。冻结编码：

- 组件缓冲容器：`b:<componentId>:<bufferKey>`（`:` 合法且不出现在
  componentId 的生成字符集 `[a-z0-9]` 内；采纳的 verbatim id 若含 `:`
  则整体 percent-encode——生成格式天然不含，仅防御人工命名）。
- bufferKey 由 schema 定死的安全 slug：prop 值 `p-<propName>`、slot 文本
  `t-<n>`（即 `children.text[n]` 的安全形）、`script`、`style`、page 级
  `page`。slug 字符集 `[a-z0-9-]`，永不含 `:` `/`。
- 树容器：单一 `tree`（LoroTree）；映射（源码 id ↔ 树节点 ID）只存 journal。

## 治理冻结二：actor → numeric peer 映射

- journal 内维护 append-only 注册表：actor 字符串（`human` / `agent:<id>` /
  `file-system`）→ 单调分配的 numeric peer（从 1001 起，步进 1，永不复用）。
- server 启动时从 journal 重放重建；`loro-crdt` peer 即此数值。树并发 LWW
  的「数值较大 peer 胜」因此有稳定语义（后注册者胜）。

## 引擎钉死（升级须重跑对应探针并更新哈希）

- `loro-crdt@1.16.1`（lab 与包内同版本）；`quickjs-emscripten@0.32.0`
  `@jitl/quickjs-wasmfile-release-sync`，WASM SHA-256
  `105c3bed22d457e43e3d1c3c1c6959fda62a8fe06f0fc8a985303c3a2be72232`。
- NocturneJS 为观察位候选（ISC-by-Owner-ruling；升格条件：上游字面
  LICENSE + WASM 目标探针通过 + P14 移植全绿）。

## 集成决策

- 模块落位 `packages/design-tool/src/server/collab/`：
  `kernel.ts`（LoroDoc/journal/WAL）、`admission.ts`（gate/错误信封）、
  `identity.ts`（页账本/ID 注入/收养）、`buffers.ts`（容器编码/投影桥，接
  既有 `stamp/transform.ts` + `prop-edit.ts` 机器）、`runtime/`（QuickJS
  wrapper + 编排原语）、`cli.ts`（四命令面）、`resync.ts`（ingest 站）。
- 面板/agent 迁轨按 tasks 里程碑推进，旧文件 CAS 路径在面板迁轨完成后
  一个里程碑内删除（不留双轨）。
- 嵌套 git save 改显式路径集 staging（本 change 顺带修复，独立小任务）。
- 探针 P1-P20 从 `.zcode/epic40/lab/` 移植为包内测试（node --test 或仓库
  既有跑器，以 design-tool 包 scripts 为准），lab 目录保留为研究档案。
