# Epic40 深谈决策记录（2026-09-15，Owner grilling 会话）

会话模式：单题 grilling，配合具体使用场景裁决。本文档是裁决的权威记录；背景底稿见 `epic40-round1.md`（八路径攻击/16 轴/15 开放问题）、`epic40-landscape.md`（市场调查）、`substrate-decision.md`（Codex 深研报告）。

## D1 — 协同前提：真实时协同，git 式冲突哲学

- 多角色（人类 GUI / Agent CLI / 未来外部 MCP·CLI）**同时写不被禁止**。不靠锁或队列预防冲突，而是**揭示冲突**：人类 override / give-up，Agent 拿冲突内容重新推理再调用。
- 角色差异只在操作形态（Agent 走工具调用、粗粒度；人类 event+debounce 碎片化 patch），**不在协议**。人类也可直接用 CLI 写。
- 出局：single-writer 排队模型；「本 epic 只做政策」的弱化定位。
- 一步到位解读：架构现在就按终态设计（无过渡脚手架）；人类鼠标键盘 presence 可后置交付，协议留位。

## D2 — 操作对象与日志：属性级命名文本缓冲 + op 词表 + log-cursor

- **属性 = 命名文本缓冲区**。op 词表模拟人类输入：`#ROW:COL`（定位）、`+TEXT`（插入）、`-n`（删 n 字符）、`!n TEXT`（选区替换）。协议表面 ROW:COL，内核 offset+length。`<script>`/`<style>` 亦为命名缓冲区，吃同一协议。
- 人类 GUI 编辑 = event+debounce 碎片化 patch，天然产同词表 op——「模拟人类」是字面同构，一套协议两种角色。
- **自动 op 日志**：每写记账（谁/何时/何属性/终值）。**log-cursor**：树结构、到**组件粒度**为止；工具调用自动推进、按目标同步；`cli sync` 默认返回变更摘要（每颗粒点 tail-5），`cli log` 详情（git log 心智）。**返回信封自动携带目标相关 log 增量**。
- `#` 光标操作符一等公民：现在服务寻址，未来 presence 广播同一词表（patch 时是操作、直播时是遥测）。

## D3 — 合并底座：Loro 1.16.1（Codex 深研 + 实验，8.4/10）

- **Loro = 运动态内核**（server/CLI/面板共享，浏览器侧 LoroDoc 镜像）；**应用层 op journal = 冲突裁决与审计真相**；**`.svelte` + 嵌套 git = 静止真相**（save/release/promote/apply 保留）。server = admission 权威，三端同一 op 词表、同一 `baseFrontiers`，无角色翻译层。
- 决定性依据：`LoroTree` 原生稳定节点 ID/移动/环检测（Yjs 需自维护 5 项不变量）；默认完整 OpLog；`Cursor` encode/decode；`revertTo` 补偿路径。实验 P1-P7 全 PASS（`.zcode/epic40/lab/`，`npm run all` 可复现，ZCode 已独立复跑验证）。
- **硬约束（P2 结论）**：重叠冲突检测**任何库都不提供**——CRDT 静默收敛。op journal + 409 admission 是协议一等公民，CRDT 只负责可重放状态与因果增量。
- 冲突策略：不同属性自动合并；**同属性非重叠自动融合、重叠冲突**；呈现角色不对称（人类打字中不被打断，冲突弹给 Agent 侧重试；人类已提交碎片撞 Agent 写 → 内联 override/give-up 选卡）。
- give-up = **在含目标 op 的当前分支上 `revertTo(targetParent)` 生成补偿 op，再 export→import 回 canonical**（第三方编辑存活；P3/P10 复核修正：`forkAt(targetParent)` 后再 revert 是 **no-op**，该旧路径作废）；override = 本地 UndoManager undo/redo。一切撤销皆新记账（supersedes 指向旧 op），历史不改写。
- 实操约束：Loro 容器名禁 `/`（路径编码为合法键）；`commit({origin})` 不持久化（actor 写 message/sidecar journal）；不得只存 shallow snapshot。

## D4 — 身份：源码显式 ID，全量自动注入（资产，非负担）

- 每个组件在源码携带**显式稳定 ID**；AI 手写设计源码无需带 ID，design 系统语法分析后**自动注入**（注入点 = file-resync/ingest 站）。
- **产品能力**：跨版本导出的语义 diff——两版设计稿中相同 ID = 相同实体，AI 语义关联零猜测。设计稿定位为正式开发的参考标准（不直接落地正式代码）。
- **地址 = 裸全局 ID，路径形式退役**（省 token）；树结构在 LoroTree 内部，journal 留可读路径供日志阅读。
- **原生 `id` attribute**（Owner 终审 2026-09-15：不用 data-* 自定义标记），保留进 DOM 不剥离。
- **短 ID 格式**（Owner 指定，省 token）：`<页字母><组件序号>`（如 `a13`）——页面/kit 画布 = 小写字母（a、b…耗尽 aa、ab…）单调分配不复用；组件序号页内十进制单调累加**永不复用**（删除只留 tombstone 不释放序号）；已有合法 `id` 原样采纳（生成器跳过已存在值防撞号）；页计数器高水位 = max(journal 高水位, 含 tombstone 已见最大序号)。全局唯一性由页字母保证。
- 连带清欠：usageIndex 文档序寻址退役；expectedRaw 降级为校验证据而非主寻址。

## D5 — 意图打包：双车道 CLI + JavaScript 编排运行时（嵌入式引擎沙箱）

- **不发明 DSL**。Agent 直接写 JS（e2e 测试风格），运行时提供：上下文/执行函数、工具函数（日志打印、开关）、编排函数。函数自带日志，**返回信封 = 捕获日志 + op receipts + log 增量**。
- **双车道 CLI 面**（WAT 车道撤销，Owner 2026-09-15）：
  - `cli update LINE-BY-LINE-PATCH`：行式 `#+-!` op 直发，顺序执行、fail-stop、不回滚——人类简单任务 + Agent 单点微调；
  - `cli update-js JS-PATCH`：JS 编排（事务/并行/依赖/策略），AI 默认车道，人类亦可编排。
- **执行本地化（威胁模型澄清，Owner 自证）**：代码只在本地设备 admission 侧执行，**跨设备同步的是 op-logs，不是代码**——脚本永不在远端重放。沙箱定位为纵深防御：能力注入 API 面（仅 op 发射/日志/编排，无 fs/net/process）+ 指令预算/内存上限/超时 + 无 Date.now/Math.random。内部车道（自有 AI、本地执行）信任放宽；未来外部角色车道保持能力边界。
- **引擎裁决**：嵌入式 QuickJS 家族交叉编译到 WASM（域内先例：Figma 插件系统），**排除**宿主 Node `vm`（官方明示非安全边界）。候选池：quickjs-emscripten（成熟默认，支持 QuickJS-NG 等变体，探针定变体）；**NocturneJS**（Lampese——**Loro 主要贡献者之一**，Owner 补充 2026-09-15；MoonBit 写的 QuickJS-aligned 独立实现，test262 88.23% 与其 QuickJS 参考持平；license 缺失一项 Owner 裁决**按 ISC 对待**，WASM 目标文档缺失仍待探针证实——**升入候选池与 quickjs-emscripten 并列**，WASM 探针通过即定胜负；MoonBit 源码 AI 友好 + 作者与 Loro 生态同源，长期自维护战略价值高；行动项：向上游提 ISC LICENSE 补档 PR，把口头默认变成字面事实）；PrimJS 出局（ByteDance/Lynx 系，定位原生应用内嵌，方向相反）。
- 语义原语：**`group` = 事务**（fork 缓冲 + 整组编译校验 + 单次 commit；失败策略可配：rollback 补偿 / keep-partial 逐项 receipt）；**并行 = 并发分支**（各自 fork 经 admission 汇合，复用 D3 合并大脑）；**`props` = 前置依赖守卫**（frontier/期望值/存在性）；**执行策略可配**（顺序/并发）。
- 多行 PATCH ≠ 事务：多行只减少调用次数，事务显式 group。
- 设计约束：脚本 = 意图工件入 journal，op = 效果入 journal；重放以 op 为准、脚本存档不重执行。journal 记脚本哈希 + 引擎版本 + 能力清单。
- **Agent 默认无审批门**：经 admission 直写，冲突即审批面。（Owner 保留增设显式审批档的权利，默认无。）

## 悬置与后续

- **规格级（ZCode 起草 + Codex 复核，不再逐题占用 Owner）**：JS 运行时 API 形状与沙箱选型；标记命名与 ID 格式；op 信封字段终稿；journal 留存/压缩策略；`cli update/sync/log` 面正式化；容器命名编码规则；嵌套 git save 的显式路径集 staging 修复。
- **后置交付**：人类 presence（鼠标键盘，D2 词表 + Loro Cursor/EphemeralStore 已留位）。
- **延后 epic**：外部角色 MCP/CLI 实装（协议位冻结：同一 op schema + JS 运行时作为第二个 client 接入）。
- 原 round1 十五开放问题的消解映射：Q1→D1、Q2→D3、Q3→D2、Q4→D5（无门默认）、Q5→后置、Q6→后置（词表已留）、Q7→D3、Q8→D5、Q9→D1/D3、Q10→D4、Q11→D3/D5、Q12→规格化、Q13→规格化、Q14→D1 重开实时项/其余维持排除、Q15→溶解于真实时模型。
