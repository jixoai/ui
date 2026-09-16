# Epic40 多角色协同协议 — 规格 v0.2

- 日期：2026-09-15；起草：ZCode（基于 Owner 五项裁决 D1-D5，见 `decisions.md`）
- 状态：**v0.2 实现就绪基线**。B1-B6、P9、P11 及 CLI 行式规则已由本轮探针冻结；剩余 `【未决】` 仅保留不改变协议语义的实现治理项，见 §12。
- 代码锚点（worktree 实存）：`packages/design-tool/src/server/stamp/transform.ts`（TextSpan/collectTextSpans）、`packages/design-tool/src/server/prop-edit.ts`（CAS/serializer）、`.zcode/epic40/lab/`（P1-P7、P8、P10、P12-P20 实验）、`.zcode/epic40/substrate-decision.md`（底座裁决与实验证据，冻结历史，不改）。

## 1. 分层与真相

```
Loro 文档（运动态：合并大脑 + 状态） ←— op — 三端（面板/Agent CLI/外部·未来）
        ↓ 投影（序列化桥）
op journal（裁决与审计真相：append-only，冲突判定/归属/tail-5 查询）
        ↓
.svelte 工作树 + 嵌套 git（静止态：save=wip / release=tag / promote/apply=diff3）
```

- server 是 admission 权威；三端提交同一 op 词表、同一 `baseFrontiers`，无角色翻译层。
- 面板可本地乐观回显（浏览器侧 LoroDoc 镜像），但不能绕过 server 把本地状态当文件真相：面板只向 server 提交 op；server 只向面板推送已接纳的 Loro update/receipt。409 或依赖失败时，镜像丢弃 pending overlay、以 canonical update 重基后才允许重提；断线重连先按 client log-cursor 拉取 canonical 增量。
- 脚本（D5）只在**发起脚本的本地设备 admission 侧**执行一次；跨设备同步的是已接纳 op-logs，远端只导入 op，不重放 JS。

## 2. 身份

- 每个组件一个**全局唯一 ID**，直接使用**原生 `id` attribute**（非 data-* 自定义标记）；协议表面一律裸 ID（路径退役，journal 留可读路径供日志）。
- **ID 格式（短，省 token，Owner 终审 2026-09-15）**：`<页字母><组件序号>`，如 `a13`。页字母 = 宿主页面/kit 画布的小写字母（`a`、`b`、… 耗尽后 `aa`、`ab`…），页面收养时分配、单调不复用；组件序号 = 页内十进制计数器，单调累加**永不复用**——删除组件只留 tombstone 不释放序号，后续组件继续累加。全局唯一性由页字母唯一性保证。
- **自动注入**：file-resync/ingest 站解析源码 → 无 `id` 的 usage → 按上述格式生成并注入原生 `id` → LoroTree 建节点 → journal 记「收养」事件（含页计数器高水位）。AI 手写源码无需带 ID；**已有合法 `id` 一律原样采纳**（人工命名也是稳定身份，不重打），须通过文件内唯一性与 HTML 合法性校验，冲突返回 `409 bad-target`；生成器跳过页内已存在的任何 id 值，防止与人工命名撞号。
- 页计数器高水位 = max(journal 高水位, 页内含 tombstone 已见最大序号)；跨压缩周期不复位。
- 树结构由 LoroTree 维护（稳定节点 ID、移动、环检测）；源码 `id` ↔ Loro 节点 ID 的映射存 journal。
- 原生 `id` **保留进 DOM，不剥离**——合法 HTML 锚点，与 DOM 指示器/测试选择器天然协同；设计稿本身不落地正式代码。
- 能力：跨版本导出携带 ID → AI 语义 diff（同 ID = 同实体）。

## 3. 命名文本缓冲区与 op 词表

- 缓冲区 = 某组件某属性值（含 props 字符串值、slot 文本片段、`<script>`、`<style>`、page 级区域）。非字符串 props（bool/enum/number）按其文本序列化值处理，同词表。
- 词表（协议表面）：

| op | 语义 | 内核形 |
|---|---|---|
| `#ROW:COL` | 光标定位（类鼠标） | 锚点 cursorBytes（Loro Cursor encode） |
| `+TEXT` | 于锚点插入 | insert(offset, text) |
| `-n` | 自锚点删 n 字符 | delete(offset, n) |
| `!n TEXT` | 选 n 字符替换 | delete+insert |

- 内核规范形 offset+length（UTF-16，与 AST 坐标同族）；外部文本 op 必须携带稳定 cursorBytes 或等价 item identity，不得只携整数 offset（P1 结论）。仅允许 ingest 生成的内部合成 op 省略 cursor，且必须携 observed frontier、canonical source hash 与 expectedRaw，由 server 在同一 admission 中重新定位；不得把该例外暴露给 CLI/MCP。
- `cli update` 的行式解析规则冻结于 §10：`ROW`/`COL` 为 1-based，按当前缓冲逐行解析，列和 `offset/length` 均以 UTF-16 code unit 计；游标或影响区间若落在 surrogate pair 内返回 `422 utf16-boundary`。行式 patch 一旦遇到 malformed 行即 fail-stop，已成功行保留，后续行不执行且 receipt 标出行号。
- 序列化桥沿用 transform.ts/prop-edit.ts 的既有机器（half-open span、trim 策略、`& < > { }` 转义、expectedRaw 指纹降级为校验证据）。

## 4. op 信封

```text
actor            角色身份（human / agent:<id> / file-system / 未来外部）
opId             全局唯一（actor + 单调序）
target           { componentId, buffer }   // 裸全局 ID + 缓冲名
baseFrontiers    提交方所见因果版本（Loro frontiers）
domain            text | tree
cursorBytes       锚点（文本 op 必填；仅内部 ingest/结构 op 可空）
kind             text: insert | delete | replace | create；tree: insert | move | remove | revive | update
offset/length     影响区间（内核形；由稳定锚点在 admission 时重算并校验；仅 edit 类 text op）
expectedRaw/Hash 目标缓冲指纹（校验证据）
text             插入内容
tree              结构载荷（insert/move/remove/revive/update 的字段见下文）
timestamp         客户端事件时间（另由 server 记录单调 admission 时间）
syncCursor        { kind: frontier, value: Frontier[] } | { kind: vv, value: VersionVector }
transactionId     可选 group/parallel 事务 ID；同一事务内的 tree/text op 共享一个原子 receipt
```

op 信封是带标签的联合：`domain=text` 时 `kind` 为 `insert | delete | replace`（edit 类，必须带
`cursorBytes`——内部 ingest 例外见 §3——及文本字段）或 **`create`**（携带 `text` 作 initialText，
可为空串；**不带 cursorBytes/offset/length**——容器尚不存在无法铸锚，携带任一即结构违约 TypeError；
目标容器已存在 → `409 conflict`（先提交者胜）；tombstone 组件上 create 一律 `404 bad-target`；
create 无可重叠对象，不进影响集；行级 journal `kind=create`）。`domain=tree` 时 `kind` 为
`insert | move | remove | revive`（载荷 `insert={item,parentComponentId,index}`、
`move={componentId,newParentId,index}`、`remove={componentId}`、`revive={componentId,parentComponentId,index}`）
或 **`update`**（载荷 `update={componentId, item}`；item 必须是纯 JSON 值（递归 string/number/
boolean/null/纯数组/纯对象——JSON 深拷贝会静默损毁的值一律边界拒绝）；**全量替换** item 载荷，
父子/顺序不动（那是 move 的车道）；未知组件或 tombstone → `404 bad-target`；并发 update 不 409
（loro 容器数据 per-key LWW，双方各自 journal——§6 只为并发 move 冻结裁决 receipt）；行级 journal
记 `before`=被替换载荷）。两种载荷
可以在同一 `transactionId` 下组成一个原子 group，不能靠省略字段来猜测 op 类型。
`offset/length` 只属于 `domain=text`；`domain=tree` 必须省略文本定位字段，避免把结构索引
误当成可跨版本稳定的文本偏移。

`syncCursor` 也必须带标签：`{ kind: "frontier", value: Frontier[] }` 或
`{ kind: "vv", value: VersionVector }`。只有前者调用 `frontiersToVV(value)`；后者直接作为
`export({ mode: "update", from })` 的 `VersionVector`。缺失、格式错误或已裁剪的 cursor
统一返回 `409 stale-or-unknown-frontier`，不得把 VV 当 frontier 传给 Loro。

## 5. admission 序列（server）

0. 以 `opId` 做幂等键；同一 `opId` 的重试必须返回原 receipt，不得重复 commit。每个 page/workspace 的 commit point 在 admission transaction 内串行化，或使用等价的 canonical-frontier CAS/retry；这只保护提交原子性，不把 D1 的并发写改成 single-writer 预防模型。
1. 在 admission transaction 内取 canonical `frontiers()`；执行 `cmpFrontiers(submitted, current)`。`0` 为同版本；`-1` 为已落后——**不强制同步，直接进入第 2 步影响集判定**（并发同伴的写正是以 `-1` 形态到达 gate：双方同 base 时先落者使后到者变 `-1`；拒绝它会强制每次提交前同步、制造同步风暴，违背 D1 实时精神；同缓冲重叠仍由第 2 步拦下）；`undefined` 为并发分支；`1`（客户端领先）或 API 抛出的 unknown/已裁剪 frontier 均拒绝并返回 `409 stale-or-unknown-frontier`，要求 sync 后重提。
   【2026-09-15 澄清修订：原文只列 `1`/抛异常为拒绝项，`-1` 的处置留白引发复核歧义（impl-review-1 B1）；本句把既有语义显式化——实现零改动，spec 文本消歧。】
2. 并发且同 target 缓冲：查 journal 中该缓冲自提交方 base 以来、以稳定 item/cursor identity 变换后的影响集；不得直接把两个 base-relative offset 求交。重叠 → `409 conflict`（双方 op 详情 + 目标 tail-5 + 当前全文），**不 import**；非重叠 → 继续。`expectedRaw/Hash` 只作校验，不作身份。
3. `Cursor.decode(cursorBytes)` 后必须校验 `cursor.containerId()` 等于 resolved target buffer 的 container ID；目标容器不存在或目标节点是 tombstone 返回 `404 bad-target`；container mismatch、游标 malformed、无法定位或已删除且无可更新游标返回 `409 stale-cursor`；UTF-16 边界非法返回 `422 utf16-boundary`，禁止降级成裸 offset。通过后才执行 `LoroText.insert/delete` 或树 op。
4. 对单 op 或 `transactionId` group 在 candidate fork 上完成全部树/文本变更与 Svelte compile/registry 校验；写前重检 canonical frontier 未变，否则回到步骤 1。调用 `setNextCommitOptions({origin: actor, timestamp, message})` 后 `commit()`；树与文本混合 group 只能一次 commit。
5. 持久化顺序冻结为 `WAL prepare → candidate 校验 → canonical update → journal append → WAL receipt/commit → receipt`；candidate 校验失败写 `WAL abort` 并保持 canonical/journal 不变。崩溃恢复按 `opId`/`transactionId` 去重，不能出现 canonical 已变而 journal 无账，也不能在未有 prepare 记录时写 canonical。
6. 按 `syncCursor` 标签归一化 frontier/VV（缺省则返回受限 snapshot），返回
   `export({mode:"update", from})` 增量 + 目标 log 增量（返回信封）。

错误响应统一携带 `code`、`status`、`target`、`canonicalFrontier`；`stale-or-unknown-frontier` 还必须携带
`canonicalUpdate` 和重试所需 `syncCursor`，`stale-cursor` 必须携带 canonical 版本；若 `getCursorPos` 返回
`update` 则提供可重新编码的 `retry.cursorBytes`，否则提供 `retry.reason="reselect"`（malformed 或
container mismatch 也不得伪造 cursor），`bad-target` 携带解析失败的 target，`utf16-boundary` 携带行号/范围。file-resync 的 409 envelope 另加
`externalHash`/`externalDiff`，不得覆盖外部文件。

容器命名：Loro 容器名禁 `/`，componentId/buffer 编码为合法键（规则进 schema）【未决·命名编码方案】。origin 不持久化——actor 元数据以 message + sidecar journal 为准（P6 结论）。

## 6. 冲突与撤销

- 不同缓冲并发：自动合并。
- 同缓冲非重叠并发：自动融合（锚点投影，P1/P2 证据）。
- 同缓冲重叠：409。**呈现角色不对称**：人类 debounce 窗口内 → 冲突导向 Agent 侧重试，人类不打断；人类已提交碎片撞已落盘写 → 面板内联选卡 override / give-up。
- **give-up**（撤他人 op）：目标 op 必须能在含该 op 的 current/target branch 中被精确定位，并保留其提交前 `targetParent` frontier。由含目标 op 的副本（例如 `canonical.forkAt(canonical.frontiers())`）调用 `revertTo(targetParent)` 生成补偿；从副本当前 oplog 导出相对 canonical 当前版本的 update，再经 admission import。不得 `forkAt(targetParent)` 后对同一 frontier `revertTo`，那条路径已截去目标 op、实际是 no-op。第三方并发编辑须存活（P3/P10 证据）。补偿 op 新记账 + `supersedes: targetOpId`，历史不改写。
   【2026-09-15 澄清修订（O1/O2 出路 A，epic40 探针 A9/C2）：tree `remove` 的补偿走**重绑补偿**——在含当前状态的补偿 fork 上以原 componentId 重插新节点（item 复制自原删除节点、pre-remove 直接子节点保 TreeID 挂回，继承性子树随父自动回归），不使用 revertTo 的树删除逆（其会捏造裸节点、丢失 TreeID 身份与节点数据）；`supersedes` 记账照旧，第三方与 buffer 存活。又：**补偿是历史回滚而非新写**——tombstone 组件上的文本 give-up 补偿 200 且生效是正确语义，下条 tombstone 写 404 法只覆盖普通写路径（探针 C2）。】
- **override**（保自己）：本 peer `UndoManager` undo/redo。
- 组件树移动：LoroTree 的并发 move 冻结为原生有效 Lamport move 顺序的 LWW；同一有效顺序下以**数值较大的 peer ID** 胜出，`commit` 的 wall-clock `timestamp` 不参与排序。1.16.1 没有公开的 LWW 开关，应用层不得自行换序。每次被裁决的并发 move 都在 receipt 中保留全部 contenders、`orderKey={lamport,peer}`、winner 和 `resolution:"lww"`，以便审计。
- `remove(componentId)` 隐藏整棵子树但保留 root/descendant tombstone、后代及嵌套文本 buffer 历史；tombstone 节点上的普通文本/结构写入返回 `404 bad-target`。只有显式 `revive(componentId,parentComponentId,index)` 可恢复目标节点，且 revive 不隐式恢复已删除后代；普通 `move` 不得借 Loro 原生副作用偷偷复活。环检测和父节点 tombstone 校验仍在 candidate fork 内执行。
   【2026-09-15 澄清修订（O1/O2 出路 A，epic40 探针 A1/A3/A5d/A6）：revive 直接目标以**同 componentId 重绑**实现——重插新树节点（parent/index 按 op 载荷、item 载荷自原删除节点数据恢复），存活 buffer 容器原样复用（remove 不销毁 doc 级容器），journal 以 `tree.rebindOf` 记录新 TreeID 与原 componentId 的谱系；继承性 tombstone 后代保 TreeID 挂回重绑新父下复活，直接删除的后代不复活。move 不隐式复活法则不变。此为实现级注记（loro-crdt 仍钉 1.16.1，引擎对直接删除节点的 move 抛错由重绑层绕开），产品语义不变：同 id 回归、内容恢复、审计谱系完整。】

## 7. JS 编排运行时（`update-js`）

- 双车道：`cli update`（行式 op：顺序、fail-stop、不回滚）；`cli update-js`（本文）。WAT 撤销。
  v0 不设 Agent 审批门；两条车道都直接进入 admission，冲突或依赖失败以 receipt/409 返回，
  不把人工批准偷偷变成第三种执行语义。
- 引擎冻结为 `quickjs-emscripten@0.32.0` 的 `@jitl/quickjs-wasmfile-release-sync` 变体；WASM 产物
  `node_modules/@jitl/quickjs-wasmfile-release-sync/dist/emscripten-module.wasm` 的 SHA-256 为
  `105c3bed22d457e43e3d1c3c1c6959fda62a8fe06f0fc8a985303c3a2be72232`。NocturneJS 保留为后续
  候选，不影响 v0 默认；升级引擎或 WASM 必须重新跑 P14 并更新哈希。
- 沙箱：能力注入 API 面（仅下述 ctx 原语，无 fs/net/process/宿主对象）+ 指令预算 + 内存上限 + 超时中断。
  QuickJS 没有可依赖的“禁用 eval”引擎开关，wrapper 必须在 fresh context 首个脚本中执行：
  `removeModuleLoader()`，将全局 `eval`/`Function`/`WebAssembly` 设为不可配置的 `undefined`，并将
  普通/async/generator 函数原型以及 `Date.prototype` 的 `constructor` 设为不可配置的
  `undefined`，且不把原生 Date 设为 wrapper 的静态原型；P14 已验证直接 eval、`Function`、
  `({}).constructor.constructor`、`Object.getPrototypeOf(Date).now` 和各原型链逃逸均失败。wrapper 同时覆盖
  `Date`（admission 注入固定 epoch）与 `Math.random`（admission seed 序列）并冻结 `Math`；QuickJS 默认仍提供这些内建能力，
  不能把“无”写成宿主默认事实。
- v0 运行时上限基线为 memory `1 MiB`、stack `256 KiB`、interrupt handler 指令预算；超限统一返回
  `sandbox-limit` receipt。能力注入只允许可序列化值、受控函数和受控 Promise；不得把 Node/Loro/文件句柄
  直接暴露给 guest。P14 冻结 async 策略为同步 host callback + `runtime.executePendingJobs()`，不启用
  Asyncify/`evalCodeAsync`；每个函数/Promise handle 由创建方拥有，在完成或异常路径 `finally.dispose()`，
  dispose 后再次访问返回 `disposed-handle`，禁止 host 回调重入同一 admission。
- API 面（v0.2 最小形状）：

```js
const hero = await ctx.component('c-8f3a');          // 裸全局 ID
hero.text('title').at(0,0).select(4).type('Ship');    // → #0:0 !4 Ship
log('renamed hero title');
await group({ deps: [hero.frontierAt('v-12')], fail: 'rollback' }, async () => {
  hero.prop('variant').replace('ghost');
  hero.prop('size').replace('lg');
});
await parallel([ () => ctx.component('c-9b21').prop('label').insert(0,'New: '), ... ]);
```

- 语义原语：`group`=事务（fork 缓冲 + 整组编译校验 + 单次 commit；`fail: rollback | keep-partial`）；`parallel`=并发分支经 admission 汇合；`deps`=前置守卫（frontier/期望值/存在性）；执行策略顺序/并发。一个 group 可同时含树 op 和文本 op，所有影响集在同一 candidate fork 上检查，使用一个 `transactionId`/原子 receipt；v0 的 `rollback` 在 commit 前丢弃 candidate（零效果 op），若未来非原子执行器已产生效果，必须改走带 `supersedes` 的补偿 op 并在 receipt 标明；`keep-partial` 才能逐项提交并明确列出被拒项，不得把两者混成“单次 commit 但部分成功”。
- 事务内**编译门禁**：整组 op 应用到 fork 后跑 Svelte 编译 + registry schema 校验，失败整组拒绝——语义错误与冲突走同一「返回→重推理」回路。
- 脚本 = 意图工件入 journal（源码 + 哈希 + 引擎版本 + 能力清单）；**重放以 op 为准，脚本不重执行**。
- 返回信封 = 捕获日志 + op receipts + 目标 log 增量。

## 8. file-resync actor（旁路写收编）

- 触发：手改文件、git apply/promote、外部工具。ingest 站先记录读取时的 canonical frontier、源文件 hash 和投影版本；解析（含 ID 注入）→ 与该版本投影 diff → 以 actor=`file-system` 的 envelope 进入与普通 op 相同的 admission transaction。commit 前若 frontier/hash 改变则重算 diff 或返回 409，不能把 stale 全文件替换直接 import。409 时不得覆盖或静默回写外部文件；返回 canonical 增量、外部 hash/diff 和重试 cursor，由 ingest 站 rebase 后重新 admission。成功 commit 后才以 canonical 投影原子写回文件，journal 落账，Loro 状态与文件才算无分叉。ID 注入产生的源码标记、LoroTree adoption 和文本变化必须作为同一 transaction；P5 只证明单线程文本投影，P15 已证明注入映射、幂等和并发重复收养。
- 原子 rebase 的写入顺序冻结为：读取外部文件 → 记录 `observedFrontier`/`observedHash` → admission；若失效返回 409 并保留外部文件；ingest 按 `canonicalUpdate + externalDiff` 生成 rebased candidate，再以新的 canonical frontier/hash 重提；仅在 canonical commit、journal/WAL receipt 都成功后以临时文件 + 原子 rename 写回 canonical projection，并校验最终 hash。写回失败只记录 `projection-pending`，不得回滚或另写 canonical。
- 格式化噪音可见可审计，不在 CRDT 层静默 normalize。
- 新文件/新组件在 ingest 时收养并注入 ID。

## 9. journal 与 log-cursor

- append-only；条目含 actor/clientEventTime/serverAdmissionTime/target/前后值/frontier/opId/transactionId（+脚本工件引用）。Loro `origin` 不作为持久字段；journal/WAL 必须先能在崩溃恢复时按 opId 与 transactionId 去重并重建 canonical receipt。
- log-cursor：树形、**组件粒度**；工具调用自动推进、按目标同步；`cli sync` 默认每颗粒点 tail-5；`cli log <path>` 详情。
  component cursor 只决定 journal 摘要过滤范围；Loro `export({mode:"update", from})` 返回的是满足因果闭包的
  canonical 文档增量，可能包含其他容器，面板必须按 canonical → 镜像方向导入后再应用目标 pending overlay。
  409/断线时先丢弃 pending overlay、导入 canonical 增量、推进 cursor，再允许重提；镜像不得反向覆盖 canonical。
- 留存冻结：完整 OpLog 与 append-only journal 都是审计存储，shallow snapshot 不能作为唯一存储；压缩只能在所有
  活跃 cursor 已推进到压缩 frontier 后进行，旧 cursor 一律收到 `409 stale-or-unknown-frontier` 与 snapshot/update
  重同步。具体留存窗口、快照周期和隐私擦除边界仍是治理项，不改变协议语义。

## 10. CLI 面（初始集）

```
cli update <file> LINE-BY-LINE-PATCH     # 行式 op
cli update-js <file> JS-PATCH            # 编排脚本（QuickJS-WASM）
cli sync [path]                          # 游标增量 + tail-5 摘要
cli log <path>                           # 详情（git log 心智）
```

`cli update` 每行只允许一个完整 token：`#ROW:COL`、`+TEXT`、`-n` 或 `!n TEXT`；不做 trim，
因此插入/替换文本的空格和空行按原样保留。`ROW`/`COL` 从 1 开始，针对**该行执行前**的当前缓冲
解析，换行符按 `\n` 计一个 UTF-16 code unit；列、`n`、内核 offset/length 均按 UTF-16 code unit，
而不是 Unicode scalar 或字节计数。游标/范围触及 surrogate pair 中间位置返回 `422 utf16-boundary`。
行号、语法和普通范围错误返回带 `line` 的 `malformed-patch` receipt；surrogate 边界错误返回带 `line`
的 `utf16-boundary` receipt；第一条错误即停止，之前成功行
保留，之后行不执行。该车道不产生 group transaction，也不回滚已接受行；每个成功行仍经 §5 admission
和稳定 cursor 重算。

## 11. 组件树 op（词表外结构 op）

- `insert(item, parentComponentId, index)` / `move(componentId, newParentId, index)` / `remove(componentId)` /
  `revive(componentId, parentComponentId, index)` / `update(componentId, item)`——落 LoroTree，全局 ID
  寻址；`revive` 只恢复目标节点，不级联恢复已删除后代；`update` 全量替换 item 载荷（§4）。
- v0.2 冻结：`cli update` 行式车道只承载文本 `#+-!`；树 `insert/move/remove/revive/update` 只能经
  `update-js`/面板的结构 op API 发出，仍走同一 admission schema。若未来要把树 op 放进行式车道，必须
  新增语法版本，不得把当前行式语义隐式扩展。
- 【2026-09-16 修订（G1 关闭，impl-review-2）】：`text/create` 与 `tree/update` 由 M5a 引入、API/
  CLI/runtime/admission 全面接受并有生产测试，本节与 §4 现正式将其纳入冻结词表（语义见 §4 联合段：
  create 的无锚例外/冲突/tombstone 法则；update 的纯 JSON/全量替换/并发 LWW 法则）。§11 行式车道
  边界不变。

## 12. 未决清单（探针池）

### v0.2 已冻结（本轮关闭）

| 项目 | 冻结结论 | 证据 |
|---|---|---|
| B1 admission | per-document gate；frontier 重检；`WAL prepare → canonical → journal → receipt`；`opId` 幂等 | `lab/results/p17-admission-gate.json` |
| B2 错误/寻址 | `409 stale-or-unknown-frontier`、`409 stale-cursor`、`404 bad-target`、`422 utf16-boundary`；resync envelope 必须带 canonical update/cursor；container ID 强校验 | `lab/results/p13-errors-and-cursor.json` |
| B3 执行器 | group 混合树/文本单 commit；Svelte compile gate；rollback 零效果；keep-partial 逐项 receipt；parallel admission 汇合 | `lab/results/p18-executor.json` |
| B4 沙箱 | QuickJS RELEASE_SYNC wrapper；去 module loader 与动态代码原型链；确定性 Date/Math；受控 Promise + `executePendingJobs`；显式 dispose | `lab/results/p14-sandbox-wrapper.json` |
| B5 file-resync | observed frontier/hash 失效先 409；canonical update + external diff 重基；成功后才原子投影回写 | `lab/results/p19-file-resync.json` |
| B6 树并发 | Loro 有效 Lamport LWW，numeric peer 较大者胜；remove 保留 tombstone/buffer；显式 revive；结构冲突 receipt | `lab/results/p12-tree-policy.json` |
| P9/P11 | ID 注入/收养幂等与并发合并；组件 cursor、tail-5、跨 actor 增量 | `lab/results/p15-ingest-ids.json`, `lab/results/p16-sync-log.json` |
| 建议项 | Loro/QuickJS 版本与 WASM 哈希固定；CLI 行式规则冻结 | `lab/package.json`, `lab/results/p14-sandbox-wrapper.json`, `lab/results/p20-cli-parser.json` |

### 实现前仍必须冻结

1. Loro 容器命名编码（禁止 `/`）与 actor 字符串到 numeric peer ID 的稳定映射；这不改变已冻结的 op 语义。
2. 完整 OpLog/journal 的具体留存窗口、压缩周期、隐私擦除边界；实现必须先满足 §9 的完整留存和 stale-base 重同步，再由治理裁决窗口。
3. 嵌套 git save 的显式路径集 staging 修复（防全局 staging 卷入他人未提交文件）。

### 可由后续交付决定

4. NocturneJS 是否升格为替代引擎（需字面 LICENSE 与 WASM 目标证据；不影响 v0 QuickJS 默认）。
5. presence（后置）：D2 词表 + Loro Cursor/EphemeralStore 广播位。
6. 外部角色 MCP/CLI 实装（延后 epic）：同一 op schema + `update-js` 作为第二 client。

## 13. 验收试验（在 lab 扩充）

- 原 P1-P7 保持为回归底座。
- 新增：**P8 沙箱探针**（`p8-sandbox-review.mjs`，默认内建能力与中断/资源基线）；**P9 注入探针**（`p15-ingest-ids.mjs`，无标源码 → ID 注入 → 映射一致、幂等收养、并发重复收养）；**P10 事务探针**（`p10-review-loro.mjs`/`p18-executor.mjs`，group rollback/keep-partial、compile gate、parallel 汇合、树+文本同 commit）；**P11 sync/log 探针**（`p16-sync-log.mjs`，组件 cursor、tail-5、跨 actor 增量）；**P12 树策略**（`p12-tree-policy.mjs`，并发 move LWW、remove/tombstone/buffer/revive、结构 receipt）；**P13 错误与游标**（`p13-errors-and-cursor.mjs`，unknown frontier、malformed/deleted cursor、container、UTF-16、resync envelope）；**P14 wrapper**（`p14-sandbox-wrapper.mjs`，动态代码遮蔽逃逸、确定性 Date/Math、Promise/handle、RELEASE_SYNC 哈希）；**P15/P16** 为 P9/P11 的可复现实验；**P17 admission 门**（TOCTOU、WAL、幂等）；**P18 执行器**（真实 `svelte/compiler`）；**P19 file-resync**（stale 409/rebase/原子投影）；**P20 CLI parser**（ROW:COL、UTF-16、malformed fail-stop）。
