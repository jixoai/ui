# collab-protocol — tasks

里程碑串行推进，里程碑内任务可并行。每个里程碑收口 = 对应探针移植绿 +
`npm run verify` 相关门禁绿。协议语义问题一律回 `protocol-spec.md` 裁决，
不得现场发明。

## M0 — 地基

- [x] `packages/design-tool/src/server/collab/` 模块骨架 + 依赖落锁
      （loro-crdt@1.16.1、quickjs-emscripten@0.32.0 变体与 WASM 哈希校验）
- [x] P1-P20 从 `.zcode/epic40/lab/` 移植为包内回归电池（node --test），
      CI 可跑。编排裁决：yjs 对拍臂不移植（底座已冻结 Loro，对比残留
      归 lab 档案；端口处以 YJS_OMITTED 标注）；WASM 解析走包 exports
      的 `./wasm` 子导出（`dist/emscripten-module.wasm` 直连会命中
      ERR_PACKAGE_PATH_NOT_EXPORTED）

## M1 — 身份与 ingest

- [x] `identity.ts`：页账本（bijective base-26 字母、单调不复用）、页内
      计数器（高水位 = max(journal, 含 tombstone 已见最大序号)）、原生
      `id` 注入、verbatim 采纳与唯一性/HTML 合法性校验（IdentityError
      →上层映射 409）；非字面量 id 抛 `unreadable-id`、账本缩减撞号抛
      `letter-collision`（不变量强制）
- [ ] `resync.ts` ingest 站雏形：解析 → 注入 → LoroTree 收养 → journal
      账（P15 语义：幂等、并发重复收养）——与 M3 buffers 合并落地
- [ ] usageIndex 寻址退役：stamp/面板/CLI 全部改 id 优先（expectedRaw
      降为校验证据）——依赖 M3 投影桥，随后落地

## M2 — 运动态内核与 admission

- [x] `types.ts` + `store.ts`（注入式 Memory/File 两实现，冻结布局
      `design/.jx-collab/` + gitignore）+ `kernel.ts`（容器键编码、
      peer 注册表 1001 起、journal 重放重建 canonical、anchors 影响集、
      WAL 审计恢复）+ `admission.ts`（串行门、四类错误码信封、opId
      幂等含拒绝、cursor 重算）——25 新测试；附加 tsc --noEmit
      --strict 0 error
- [x] 崩溃恢复：按 opId/transactionId 去重重放（WAL abort 路径）
- 遗留给 M4 的引擎发现：loro 1.16.1 无法复活 remove 的直接目标节点
  （只能复活 tombstone 后代）——M4 时 revisit revive 语义或升引擎

## M3 — 文本 op 与投影桥

- [x] `bridge.ts` + `resync.ts`：ingest 站以 file-system actor 的 op 流过
      admission 落地（树 insert + 各缓冲首个 insert；ensureBuffer 仅作
      空容器 bootstrap——kernel 缺口已记录：缺缓冲创建 op）；observed
      frontier/hash 记录；P15 幂等语义内核集成路径复验（journal/WAL
      delta 0）；ResyncStation 有状态站 + recoverLedger（tombstone 计入
      高水位）
- [x] 投影桥：projectSource 从单一 snapshot 读，逐 hole 重序列化——
      槽文本走 serializeTemplateText、prop 走 renderValue、script/style
      verbatim；对 prop-edit.ts 仅一处加法导出（renderValue），既有测试
      零感知；往返字节级对齐（实体/花括号/多行/trim 律/不动点）
- 遗留给 M5 的 kernel 缺口：① 缓冲创建 op（当前 ensureBuffer bootstrap
  例外）；② 树 item data-update op（换源脚手架只能 scaffoldStale）；
  ③ 树载荷读取访问器（桥走 snapshot 客户端读）

## M4 — 冲突、撤销与树 op

- [x] `undo.ts`：giveUp（forkAt 目标提交后 frontier → revertTo(parent) →
      相对 canonical 当前版本导出 import；全量 fork 的 revertTo 会杀第
      三方、applyDiff 重放并发区间会损坏文本——两条死路均探针实证排
      除）+ supersedes 记账幂等（跨 actor 跨重启）；override = per-actor
      session fork + 真 loro UndoManager，他人 op 存活；补偿用全新注册
      peer（`give-up:<targetOpId>`）防计数器碰撞
- [x] 树 LWW receipt：contenders/orderKey{lamport,peer}/winner/
      resolution 挂在竞争检出的提交上，与引擎 getLastMoveId 交叉校验；
      move 不隐式复活守卫测试钉死（含继承性场景）
- [x] revive 调和冻结（矛盾化解：p12 的「move 可复活」指被删子树的
      **后代**，直接目标 move/handle.move 均抛 is deleted）：revive 直接
      目标 → 404 bad-target（detail 含引擎限制）；后代 → 引擎路径 200。
      **升级路径已记录待 Owner 时机**：(b) journal 级重绑同 id 新节点
      （需改 M2 钉死项）或升 loro 引擎
- [x] 冲突呈现角色不对称（admission 侧）：409 冲突信封齐备；面板/CLI
      侧呈现归 M6/M7
- **产品可见限制（已冻结，待升级路径裁决）**：树 remove 的 give-up 返回
  503 compensation-unsupported（revertTo 会造裸新节点、TreeID/journal
  映射双失，探针实证）——叠加 revive 直接目标 404，**当前「删除组件」
  不可逆**；M5 或升级轮必须给出路（journal 级重绑 / 引擎升级 /
  remove 前强制快照锚点）

## M5 — file-resync 完整版 + 内核缺口 + 递归身份（✅ 三路落定）

- [x] 内核缺口三件（M5a）：`kind=create` 缓冲创建 op（独立 kind 而非
      隐式 insert——§4 标签联合律；已存在容器 409 conflict；tombstone
      一律 404）；树 `update` op（全量替换 item 载荷，tombstone 404，
      并发不 409——loro 容器数据 per-key LWW）；`treeItems()` 访问器
      （与 snapshot 读逐字段等价钉死）
- [x] B5 递归身份（M5b）：pre-order DFS 全块结构收养（If/Each/Key/
      Snippet/Await 链），页内扁平 document-order 编号，树 insert 带
      parent=最近祖先组件，嵌套投影往返字节级钉死
- [x] §8 全周期（M5b）：observed 失效→409（不覆盖外部文件）；三向
      rebase（base@observed——两向 diff 会把并发人类编辑误判为外部
      漂移，测试实抓后修正）；原子写回（tmp+rename+读回 hash 校验）；
      `projection-pending` 恢复；watcher 接缝 `onFileChange`（去抖，
      server 接线归 M6）
- [ ] **O1/O2 实施轮（探针已裁决，实施待发）**：出路 A = journal 级
      重绑（同 componentId 重插新节点 + 复用存活容器，A9 配方端到端
      全绿——O1+O2 同时解决）；B = 升级哨兵（1.16.1 即最新，「不复活
      直接目标」是 1.0.0-alpha.1 起的刻意法则，#1055/#938 未合）；
      C = remove 前快照**否决**（判别性反例：tombstone 下文本 give-up
      补偿仍 200 且真实改 buffer——「remove 后无并发写」不成立）。
      探针报告 `.zcode/epic40/o1o2-probe.md`
- [x] M5b 记录的 kernel 侧小尾巴（M6a 收）：`textAt(containerKey,
      frontier)` 访问器已落（等价测试对拍）；`projection-pending` 行
      类型进 types/store（M6a 类型先行，M6 修复轮完成内核工作列 +
      base 字段正式化）

## M6 — JS 运行时与 CLI（✅ M6a+M6b 落定）

- [x] `runtime/sandbox.ts`（M6a）：QuickJS RELEASE_SYNC wrapper 产品化——
      wasm 哈希硬门、逃逸面全灭、确定性 Date/Math、受控 Promise、
      显式 dispose、预算三限（memory/stack/interrupt）
- [x] `runtime/executor.ts` + `compile-gate.ts`（M6a）：ctx 面（组件/
      缓冲/树）、group（单 candidate fork + 真实 svelte 编译门禁 + 单
      commit；rollback/keep-partial）、parallel（parallel-start 锚点铸
      造——实证修复了锚挂错版本的缺陷）、deps 三形态；脚本 intent 工件
      先于执行落 journal；返回信封 = 日志 + receipts + tail-5
- [x] `cli.ts` + `cli/bin.ts`（M6a）：四命令（update 行式 P20 冻结规则/
      update-js/sync tail-5/log 详情）；503 退役，transactionId 真车道
      （`gate.runExclusive` 排它段 + `admitWithinTransaction` 机械栅栏）
- [x] server 托管（M6b）：`collab-host.ts`——vite 生命周期挂点（open/
      dispose 包装、进程级 registry 单例、corrupt journal 降级只读）；
      watcher 复用 vite chokidar（macOS realpath 双向容错）；自写识别
      防二次 ingest；HMR 骑同一事件流
- [x] dsh 迁轨（M6b）：`routeTurnWrites`——turn 后 mtime 识别变更集，
      逐文件经 host 收编（身份注入 + journal actor=file-system + 冲突
      409 自动 rebase）；dsh 子进程零改动（file-system actor 车道）；
      chat 侧信封外显
- [x] **内核修复轮（M6 收敛，已完成）**：① fresh 车道 drift 落地——
      `runIngest` 接受 ConvergenceBase，buffer-change 经 file-system
      replace 落账（三向：并发 canonical 存活），host 合成 envelope 路径
      退役塌缩回直驱；② pending 工作列正式化——kernel `#pendingProjections`
      从 journal 重建 + `base` 字段结构化（reason 走私退役）；③ 字面量
      表达式 prop 进缓冲（§3 对齐，W4② 根因之一）+ writeBack 守卫
      （deferred scaffold-change 永不覆盖外部字节）——走查实证 W4②
      双种子翻绿

## M7 — 面板迁轨与收尾（✅ 全落，终走查后收口）

- [x] 面板 prop/slot 编辑迁到 op 车道（M7a）：`collab-api.ts` 四面
      （usage/admit/sync/undo，晚绑定 host 注入）+ `panel-collab.ts`
      状态机（镜像单向 4s 轮询、350ms debounce 碎片、重基阶梯 3 次、
      冲突卡 override-undo+重申 / give-up 接受 canonical 双路）
- [x] usageIndex 寻址退役（M7a）：`__jxUsageMap` 携带原生 id，面板
      id 优先寻址，无 id 禁写 + awaiting-ingest 提示；expectedRaw
      指纹随 CAS 通路退役
- [x] 旧文件 CAS 写路径删除（M7a）：prop-edit.ts 706→68 行（仅存
      序列器，唯一在世消费者 bridge.ts）；SSE 客户端装饰锁移除；
      dryRunUsage 退役（面板种子改 /usage 走 canonical 投影）
- [x] 嵌套 git save 显式路径集 staging（M7 侧线）：三车道（声明集/
      proto 域/裸整合=touched 枚举，绝无 add -A）；pathspec 限定提交，
      他人已 staged 未提交内容留 index 不上车（探针实证）；API 升级为
      options 对象 + paths 审计字段
- [x] journal 留存治理落地（M7 侧线）：`evaluateCompaction` guard +
      `activeSyncCursors`/`tombstoneObligations` 枚举——cursor 越过
      压缩 frontier + **tombstone 义务凌驾一切**（宁可不压不丢身份
      高水位）；常设门待命（当前无压缩执行器，append-only 不裁剪）
- [x] GATE-0 walkthrough harness 扩展（M7 收官）：W6 三向交错剧本
      （human 面板 × agent op × 手改 ingest——三 actor 三缓冲交错 +
      存活/计账/终态断言 + fixture 自恢复）+ W4 前 fixture 双契约自检
      （seed 字面量 + `.jx-collab` 同代判据，命名前置失败不中途 FATAL）
- [x] M7 收官三修：跨时代 reconcile（`reconcileFile` 车道 + 启动扫 +
      /usage drive，旧协议 `.jx-collab` 升级后 buffer 补报树 meta 对齐）；
      host 根治（echo/收敛判定对齐当前投影 + `pushCurrentProjection`，
      admit→写回 = 一次哈希判定 + 一次原子写，651ms 时序不回退，M7a
      heal 退役）；冲突卡旧值按 buffer 过滤（差异化验证钉死）

## 收口

- [x] `openspec validate collab-protocol --strict` 绿（G1 已关闭：`text/create` 与
      `tree/update` 正式纳入 §4/§11 词表，2026-09-16 修订注记；spec delta 附注）；
      Codex 终审 8.6/10——代码结论 GO（终审报告 `.zcode/epic40/impl-review-1.md`
      §终审）；单测 420/420、GATE-0 含 W6 34/34、mirror 门绿。
      已知遗留（非本 change 阻塞）：`design-studio-r3` 校验失败属该史线在途工作。
- [ ] **Owner 走查** → commit+push + change 归档决策
- [ ] herdr/Codex 资源回收（epic40-substrate w5R:p1 / collab-impl-review w5R:p2 + workspace w5R）

## 终审残差（impl-review-2，非阻塞，后续领养）

- R1：standalone `fs.watch` 路由一次全量下超时（单跑绿）——watcher readiness
  宜改确定性握手/有限 retry，防 CI 偶发红。
- R2：journal/WAL 写入为 `appendFileSync` 无显式 fsync/目录 fsync 策略——电源
  丢失级 durability 承诺前需存储治理裁决。
- R3：compaction executor 未实现（guard 常设待命）——真正裁剪时
  `requireCompactionAllowed()` 必须置于不可绕过的删除事务。
- R4：`CollabKernel` 聚合多变化轴（恢复/WAL/树/undo/cursor/projection）——
  非违约，后续按持久化/树映射/compensation 边界拆分。
