# Epic40 合并底座裁决

- 研究日期：2026-09-15
- 实验工作区：`.zcode/epic40/lab/`
- Node：`v24.21.0`
- 实测版本：`yjs 13.6.32`、`loro-crdt 1.16.1`、`@automerge/automerge 3.4.1`、`svelte 5.57.0`
- 生产代码：未修改 `packages/`

## 结论

**单一最佳方案：Loro 1.16.1。**

角色定义：Loro 是 server/CLI/panel 共享的「运动中的状态」内核；应用层 op journal 是冲突裁决、审计字段和 tail-5 查询的真相；`.svelte` 文件与嵌套 Git 仍是「静止时的真相」。Loro 不是网络层，也不是文件序列化器。

选择理由按硬项排序：

1. `LoroTree` 原生提供稳定节点 ID、移动、父子关系和环检测，直接覆盖组件树 op；Yjs/Automerge 需要我们长期维护这些不变量。
2. `LoroText` + `Cursor` 通过实际并发插入测试；游标可以 `encode/decode`，适合将来 presence 的稳定锚点。
3. `Frontiers`/version vector/`export({mode: "update", from})`/`getAllChanges` 已覆盖 log-cursor 的传输底座；默认完整 OpLog 更接近协议要求。
4. Node/WASM 入口和 Svelte 桥接成本低；属性级缓冲小于 1KB 的负载不会逼迫换引擎。
5. Loro 仍需自建 WebSocket/MCP/CLI transport、语义重叠判定和跨 actor 补偿撤销。这些是明确的应用层部件，不是选择 Loro 后消失的工作。

Yjs 是生态和 presence 的更稳妥备选，但 P4 的身份纪律成本、默认 GC 与无高层文本重叠报告使它在本协议硬约束下排第二。Automerge 3 保留为参照，不进入实现池：它没有现成 UndoManager 或文本范围冲突原语，也没有 movable tree。

## 集成边界

```text
                    binary update / ephemeral presence
   +-------------+  <--------------------------------->  +----------------------+
   | Studio GUI  |       browser LoroDoc mirror          | canonical LoroDoc    |
   | panel       |  --------------------------------->    | per page/workspace   |
   +-------------+       op RPC / update                 +----------+-----------+
                                                                   |
   +-------------+       same op vocabulary                         |
   | Agent CLI   |  -----------------------------------------------+
   +-------------+                                                   |
   +-------------+       same admission/version contract             |
   | MCP / raw   |  -----------------------------------------------+
   | CLI future  |                                                   |
   +-------------+                                                   v
                                                         +----------------------+
                                                         | op journal           |
                                                         | actor/time/path/prop |
                                                         | baseFrontier/span    |
                                                         | raw fingerprint      |
                                                         +----------+-----------+
                                                                    |
                         file-system actor / projection            v
                                                         +----------------------+
                                                         | Svelte bridge        |
                                                         | transform.ts         |
                                                         | prop-edit.ts         |
                                                         +----------+-----------+
                                                                    v
                                                         .svelte + nested Git
                                                         static truth
```

约束：server 是 admission authority；panel 可以本地回显，但不能绕过 server 直接把 CRDT 状态当文件真相。CLI、MCP、GUI 都提交同一个 op 词表和同一个 `baseFrontiers`，没有角色专用翻译层。`file-resync` 以 `file-system` 作为合成 actor 导入，手改文件、git apply、promote/apply 都进入同一日志。

## P1-P7 实验

可复现入口：

```sh
cd /Users/kzf/Dev/GitHub/jixoai-labs/ui-design-tool/.zcode/epic40/lab
npm install
npm run all
```

每项脚本、断言和 JSON 结果均留在 lab；最后一次 `npm run all` 为全绿。

### P1：词表映射与稳定光标

脚本：`p1-vocabulary.mjs`；结果：`results/p1-vocabulary.json`。

- `#ROW:COL`、`+TEXT`、`-n`、`!n TEXT` 映射到 Y.Text/LoroText 的 `insert`/`delete`/替换，`abcd -> aQcd`，两家结果一致。
- 两条分支在 `abcd` 的 `b/c` 之间建立锚点，另一支在开头插入 `X`；Yjs RelativePosition 和 Loro Cursor 都把光标从 2 移到 3。
- Loro Cursor 实际 `encode()` 10 bytes，再 `Cursor.decode()` 后解析成功；这不是纸面 API 检查。

结论：P1 通过。协议应在线上携带稳定 cursor/anchor bytes 或等价 item identity，不能只携带整数 offset。

### P2：重叠冲突检测

脚本：`p2-overlap.mjs`；结果：`results/p2-overlap.json`。

- 初始文本 `abcd`；human 删除 `[1,3)`，agent 删除 `[2,3)`，两边从同一 base 并发写入。
- 两家 CRDT 合并结果均为 `ad`，并不会自动返回「两段重叠」；Yjs state vector/update 与 Loro `cmpFrontiers`/`findIdSpansBetween` 只能提供因果/变更集合，不是语义文本冲突策略。
- 探针以 `{actor, baseVersion, offset, length}` journal 做重叠判定；重叠 case 被识别，非重叠控制 case 通过。

结论：P2 **不能由库原语单独完成**。这是两家共同的应用层硬要求：提交 op 必须带 `baseFrontiers`、容器、影响 span、操作前 raw/fingerprint；server 在自动 `import` 前先拒绝重叠并返回 409/冲突信封。报告不能把 CRDT 的静默收敛称作冲突检测。

### P3：选择性撤销

脚本：`p3-selective-undo.mjs`；结果：`results/p3-selective-undo.json`。

- Yjs：human 自己的 `UndoManager` 做 `undo()`/`redo()` 后，agent 的 `B` 仍存活，结果由 `BbaseA` 回到 `Bbase` 再回到 `BbaseA`。
- Yjs 接收方即使把 `agent` 放进 `trackedOrigins`，也不会凭远端 `applyUpdate` 获得可撤销栈。give-up 的可行路径是让 agent 分支的 UndoManager 生成反向 update，再把该 update 应用到 canonical；结果 `baseA`，第三方编辑不被连带。
- Loro：recipient `UndoManager` 明确只撤本 peer；实验用 agent 分支记录 `before` frontier，`revertTo(before)` 生成补偿操作，再导入 canonical。canonical 同时有第三方 `C` 时，结果为 `baseC`，证明只移除目标 B。

结论：P3 通过，但“选择性撤销”是补偿 op/time-travel 流程，不是 `undo(otherActor)` 单 API。补偿操作必须新记账、带 `supersedes`/`targetOpId`，不能删除历史记录。

### P4：树与身份

脚本：`p4-tree-identity.mjs`；结果：`results/p4-tree-identity-loro.json`、`results/p4-tree-identity.json`。

- Loro 创建 page/component-a/component-b/nested，移动 component-a 后稳定 ID 仍为 `2@501`；把 root 移到 descendant 时实际抛出环错误。
- Yjs 用 `Y.Array<Y.Map node records>` 模拟同一结构，探针必须额外维护 5 项：唯一 ID、父存在、移动后的 children 顺序、环检测、删除 tombstone/reference 策略。

结论：P4 是选 Loro 的决定性硬项。Yjs 方案并非不可做，但身份纪律会散落在每个组件树写路径，且并发移动的策略要另写一套。

### P5：file-resync

脚本：`p5-file-resync.mjs`；结果：`results/p5-file-resync.json`。

- 外部把 `<Button label="Save">Click</Button>` 改为 `label="Commit"`、`Click now`；单 span 投影 diff 为 `start=15, deleteCount=11`，Yjs 与 Loro 两边最终文本都精确等于外部文件。
- Loro commit message 写入 `actor=file-system path=page/button`，使旁路写可被日志查询。
- 额外换行被识别为真实尾部插入 `{start:23, deleteCount:0, insertText:"\\n"}`。

结论：P5 通过。序列化器必须以 canonical `.svelte` 文本为基准，格式化噪音应可见、可审计，不能在 CRDT 层偷偷 normalize。

### P6：journal、游标增量、tail-5

脚本：`p6-journal-cursor.mjs`；结果：`results/p6-journal-cursor.json`。

- 6 次提交持久化为 517-byte Loro snapshot；恢复后 6 条变更仍在。
- 从第 2 条 frontier 导出的增量为 376 bytes；按组件路径筛选后，`tail-5` 正确返回 agent/file-system/human/agent/human 五条，字段包含 actor、path、property、before、final value、frontier。
- 实测发现 `commit({origin})` 的 origin 不随 Loro export 持久化；持久 actor 必须放入 message 或外部 journal。message 和 sidecar journal 都保留。
- Loro root container 名不能含 `/`；探针把 `page/component-1/label` 编码成合法容器键，把可读路径留在 journal。容器命名编码必须成为 schema 的固定规则。

结论：P6 通过，且明确了日志分层：Loro 提供版本/增量/变更 DAG，应用 journal 提供协议需要的可读审计字段。不要只保存 shallow snapshot；shallow export 会丢历史。

### P7：Node 与 Svelte 序列化桥

脚本：`p7-node-bridge.mjs`；结果：`results/p7-node-bridge.json`。

- Node `v24.21.0` 直接运行 `svelte/compiler`，识别 `InlineComponent` 的 direct Text child。
- 实际 span 为 `[57,71)`，raw 是 `Click &amp; go`，buffer visible text 是 `Click & go`；回写时重新 escape `& < > { }`，源文件字节数保持 83。
- 探针级桥接为 43 行，不代表产品成本；真正的生产桥仍以 `transform.ts` 的 `collectTextSpans` 与 `prop-edit.ts` 的 CAS/序列化规则为唯一权威。

结论：P7 通过。Loro 只占据命名文本 buffer 层，不替换现有 AST、trim、half-open UTF-16 span、CAS 和实体转义机器。

## override / give-up 的精确路径

### 提交与 admission

每一个文本 op 的 envelope 最少为：

```text
actor, opId, componentPath, property, containerId,
baseFrontiers, cursorBytes, kind(insert|delete|replace),
offset/length, expectedRawOrHash, text, timestamp
```

server 处理序列：

1. 从 canonical `LoroDoc` 取当前 `frontiers()`；用 `cmpFrontiers(submittedBase, current)` 判断是否同一因果链，`undefined` 表示并发分支。
2. 对并发且同一 `containerId` 的 journal 变更，用 offset/length + expected raw/fingerprint 计算影响集；重叠就返回 409，返回目标相关 tail-5 和冲突双方 op，不调用 `import`。
3. 非重叠时，用 `Cursor.decode(cursorBytes)` 和 `doc.getCursorPos(cursor)` 将客户端锚点投影到当前文本；执行 `LoroText.insert`/`delete`。
4. 写前调用 `doc.setNextCommitOptions({origin: actor, timestamp, message})`；message 至少带 actor/path/property/opId；`doc.commit()`。
5. 同步 append-only journal，再用 `doc.export({mode: "update", from: clientVV})` 返回 canonical 增量和目标 log 增量。

### give-up：撤掉目标 actor 的变更

Loro 的可行实现不是修改旧历史，而是补偿新 op：

```text
targetParent = targetOp 的依赖 frontier
branch = canonical.forkAt(targetParent) 或从 targetOp 所在分支 snapshot 建隔离副本
branch.revertTo(targetParent)       // 生成反向操作
inverse = branch.export({mode:"update", from: canonical.oplogVersion()})
canonical.import(inverse)
commit message = targetOpId + supersedes + actor + reason
```

实际探针用 `revertTo(before)` 生成 inverse，canonical 同时有第三方 `C` 时得到 `baseC`。实现前仍需把 branch 创建、目标 op 精确定位和 overlap guard 固化成回归测试；不得用“回到旧 snapshot 覆盖当前状态”的粗暴替代。

### override：保留自己的选择

对于当前 peer 自己的本地操作，使用同一 peer 绑定的 `UndoManager`：

```text
localUndo.undo()  // 临时放弃自己的最近 op
localUndo.redo()  // override 选择重新应用自己的 op
```

如果 override 的对象是另一 actor 的已提交 op，则走上面的补偿路径，再提交人类选择的新 op；不能把 `trackedOrigins` 或 Loro `origin` 当成跨 actor undo API。所有 undo/redo/compensation 都是新日志事件，原始事件永久保留。

## 三方案评分

| 方案 | 协议覆盖 40% | 长期价值 25% | 非典型适配 20% | 风险控制 15% | 综合 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Loro 1.16.1 | 9.0 | 8.2 | 8.7 | 7.5 | **8.4** |
| Yjs 13.6.32 | 7.8 | 8.6 | 8.4 | 7.3 | **8.0** |
| Automerge 3.4.1 | 6.4 | 7.6 | 7.0 | 6.8 | **7.0** |

评分依据：

- Loro 在 P1/P4/P5/P6/P7 形成闭环；P2 和跨 actor P3 仍需应用层，但两家都要补，Loro 没有因此失去 P4 的原生优势。
- Yjs 的 Awareness/生态/生产成熟度更强，P1/P3 自己的 undo 很好，但 P4 要求的稳定树身份和环/移动不变量由我们承担，且 `gc=true` 默认不满足完整历史。
- Automerge 3 的内存和字符串 API 有改善，但当前 JS 面没有 UndoManager；`getConflicts` 是对象 key 级，不是文本 span，且无 movable tree。

本轮自校：初始纸面倾向为“Yjs 生态优先”；P1-P7 首轮实际运行后，P4 原生树、P6 完整历史、P3 Loro `revertTo` 补偿路径把结论改为 Loro；P2 复核后没有虚报为库内能力，综合分从 8.1 调整为 8.4。

## 风险与明确分歧

1. **P2 overlap 仍是应用层责任（必须接受）**：Loro 的 frontier 只能判因果/并发，不能替我们定义文本影响集。Owner 需要接受 op journal + 409 admission 是协议的一等部分。
2. **跨 actor give-up 不是内建 undo**：Loro `revertTo` 补偿路径已实跑，但 branch 定位、目标 op 元数据和并发第三方保护必须在产品实现中继续测试。
3. **origin 不持久化**：actor/time/path 不能只放 `origin`；必须写 message/sidecar journal。P6 已证明这一点。
4. **Presence 不等于 durable log**：Loro 1.16.1 提供 `EphemeralStore`（旧 Awareness 已 deprecated），但它仍是独立 ephemeral transport；presence 的游标 anchor 可以复用 P1 Cursor，不应写进编辑历史。
5. **1.x/WASM 维护面**：树撤销、checkout、shallow import 仍应保留回归套件；发布前不能把本次探针视作跨平台 GUI/网络验收。
6. **历史裁剪**：不得让 shallow snapshot 成为唯一存储；完整 OpLog 与 append-only journal 需要明确保留和压缩策略。

没有需要 Owner 立即二选一的分歧；唯一必须在实现前写入设计规范的决策是：**P2 的重叠判定由应用 op journal 承担，CRDT 只负责可重放状态与因果增量。** 若 Owner 不接受这项应用层部件，Yjs、Loro、Automerge 都不满足协议，选型应暂停而不是模糊宣布“自动冲突解决”。

## 证据索引

- 本地实验脚本和输出：`.zcode/epic40/lab/p1-vocabulary.mjs` ... `p7-node-bridge.mjs`、`.zcode/epic40/lab/results/`
- 第一方 API/版本核证：`.zcode/epic40/lab/research-notes.md`
- 现有 Svelte span/CAS 机器：`packages/design-tool/src/server/stamp/transform.ts`、`packages/design-tool/src/server/prop-edit.ts`
- 版本来源：Yjs、Loro、Automerge 官方包 README/d.ts/source/release notes，已逐条列于 `research-notes.md`

验证：`npm run all`（P1-P7 全部 PASS）；`git diff --check` 通过；未修改 `packages/` 生产代码。
