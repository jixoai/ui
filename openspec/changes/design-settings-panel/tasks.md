# Tasks — design-settings-panel

- [x] T1 `src/server/settings/dsh-settings.ts`：类型 + 两面孔持久化（JIXOAI_DESIGN_HOME 可迁移）+ 桥接 YAML 手写发射/保留 + 连接测试 + activeBridgeRoute 查询
- [x] T2 `src/server/settings/dsh-settings-api.ts`：GET/POST dsh.json + dsh-credential + dsh-test（草稿 baseURL 覆盖）；POST 返回 view（含 keyPresence）
- [x] T3 create.ts 挂载中间件（meta/collab 之后、studio 资产之前）
- [x] T4 `src/agent/dsh.ts` 桥接模式：resolveSpawnPlan 逐轮分叉（DSH_HOME 桥 vs env+patch 回退），info() 动态
- [x] T5 `src/studio/settings-panel.svelte`：list-detail 弹窗（rail/detail/active model/credential eye/endpoint/models/test/save/remove/new）
- [x] T6 shell.svelte `.studio-nav-foot` 入口 + SettingsPanel 挂载
- [x] T7 单测 11 项（两副面孔 + API 门）；全电池 580/580
- [x] T8 浏览器探针 15/15（p-probe-settings.mjs）；矩阵 74/74 回执已并入姊妹变更 evidence
- [ ] T9 Codex 复核通过（standing loop）
