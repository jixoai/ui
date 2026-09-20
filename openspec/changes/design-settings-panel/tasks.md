# Tasks — design-settings-panel

- [x] T1 `src/server/settings/dsh-settings.ts`：类型 + 两面孔持久化（JIXOAI_DESIGN_HOME 可迁移）+ 桥接 YAML 手写发射/保留 + 连接测试 + activeBridgeRoute 查询
- [x] T2 `src/server/settings/dsh-settings-api.ts`：GET/POST dsh.json + dsh-credential + dsh-test（草稿 baseURL 覆盖）；POST 返回 view（含 keyPresence）
- [x] T3 create.ts 挂载中间件（meta/collab 之后、studio 资产之前）
- [x] T4 `src/agent/dsh.ts` 桥接模式：resolveSpawnPlan 逐轮分叉（DSH_HOME 桥 vs env+patch 回退），info() 动态
- [x] T5 `src/studio/settings-panel.svelte`：list-detail 弹窗（rail/detail/active model/credential eye/endpoint/models/test/save/remove/new）
- [x] T6 shell.svelte `.studio-nav-foot` 入口 + SettingsPanel 挂载
- [x] T7 单测（15 项：两副面孔 + API 门 + Codex r4 五个 P1 反例全数入锁）；全电池 584/584
- [x] T8 浏览器探针 17/17（p-probe-settings.mjs，含 P1-4 数字编辑与 P1-2 clear）+ 内核 smoke PASS（p-probe-dsh-smoke.mjs：真实 dsh headless 消费桥接 → TRANSPORT 层失败 = 选择/凭据/形状全通）+ 矩阵 74/74
- [x] T9 Codex r4 复核修复轮：P1-1 models 块序列 + reasoningEfforts 字典（内核固定七档 off..max 全链门禁）、P1-2 省略 key=clear（双侧）、P1-3 测试连接脱敏（禁回上游 body + key 洗刷）、P1-4 数字字段提交边界解析（Input uncontrolled 陷阱绕开：草稿空串初始化）、P1-5 activeBridgeRoute 桥面验证（settings.yaml 解析 + 凭据 ref 在位，缺任一即回退 env+patch）；P2-1 A8 加 multi 断言、P2-2 凭据冷启动 clear 规范形、P2-3 意图清单/导出 JSDoc/运行时 decoder
- [ ] T10 Codex r4 第二轮复核通过（standing loop）
