# collab-protocol

## Why

Epic #40（多角色协同编辑）的协议已经冻结：Owner 五项裁决（D1-D5，2026-09-15
grilling 会话，`protocol-decisions.md`）经 Codex 三轮深研/对抗复核
（`substrate-research.md` 选型 8.4 → `review-round1.md` 6.0 六阻塞 →
`review-round2.md` 8.5 全闭），产出实现就绪的 `protocol-spec.md`（v0.2）与
二十个可复现探针（P1-P20，`.zcode/epic40/lab/`，本 change 将其移植为包内回归）。

现状没有任何一层：面板写是 per-endpoint 文件 CAS、dsh 直写文件零版本意识、
SSE 锁只盖当前 tab、组件寻址是结构一变就移位的文档序号——角色冲突今天是
文件系统层的未定义行为。

## What Changes

- **运动态内核**：每 workspace 一个 Loro 文档（`loro-crdt@1.16.1`）做合并
  大脑；`.svelte` 工作树 + 嵌套 git 仍是静止真相；server 是唯一 admission
  权威。
- **身份**：组件原生 `id` attribute（不用 data-*），格式 `<页字母><序号>`
  （如 `a13`），页字母/页内序号皆单调永不复用；ingest 站自动注入、已有合法
  id 原样采纳；usageIndex 寻址退役。
- **op 协议**：属性级命名文本缓冲 + `#+-!` 词表 + tagged union 信封
  （text/tree）+ 稳定 cursorBytes 寻址 + 四类错误码与重试信封。
- **admission**：per-document 串行门（frontier CAS + opId 幂等含拒绝 receipt
  + WAL 顺序冻结 + 整组 Svelte 编译门禁）。
- **冲突与撤销**：非重叠自动融合、重叠 409 角色不对称呈现；give-up 走
  `revertTo(targetParent)` 补偿（supersedes 记账），override 走本地
  UndoManager；树并发 LoroTree LWW（receipt 含 contenders/orderKey）。
- **JS 编排运行时**：`cli update`（行式，fail-stop 不回滚）+ `cli update-js`
  （QuickJS-WASM 沙箱，`quickjs-emscripten@0.32.0` RELEASE_SYNC + 产物哈希；
  group 事务/parallel 汇合/deps 守卫；脚本入 journal 只存档不重放）。
- **file-resync**：手改/git apply 等旁路写经 `file-system` actor 收编——
  observed frontier/hash 失效即 409 + rebase，成功才原子投影回写。
- **journal 与 log-cursor**：append-only 账本（actor/时间/目标/前后值），
  组件粒度 cursor，`cli sync` tail-5 / `cli log` 详情。
- **面板与 agent 迁轨**：面板 prop/slot 编辑从文件 CAS 迁到 op 车道
  （canonical→mirror 方向，409 重基，冲突选卡）；dsh adapter 从直写迁到
  CLI op 车道（D5：无审批门，冲突即审批面）。

## Impact

- 新增 `packages/design-tool/src/server/collab/`（内核/admission/journal/
  ingest/runtime/cli）与对应测试电池（P1-P20 移植）。
- 改造 `property-panel` 写路径、`dsh` adapter、file watcher（ingest 站）、
  stamp 寻址（id 优先）、嵌套 git save（显式路径集 staging）。
- 后置不做（协议位已留）：presence 广播、外部角色 MCP/CLI 实装
  （下一 epic）、字符级离线协同。

## ALIGNMENT-WITH-RULINGS

D1 真实时协同（冲突揭示非锁预防）→ spec §1/§5；D2 op 词表+日志+cursor →
§3/§9；D3 Loro 底座+应用 journal → §1/§5；D4 原生短 ID → §2；D5 双车道
JS 运行时+本地执行+同步 op-logs → §7/§10。协议全文以本 change 目录内
`protocol-spec.md`（v0.2）为唯一权威文本。
