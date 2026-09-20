# design-settings-panel — Model 设置面板移植 + dsh 内核使用方式升级

## Why

Owner 走查第四轮（2026-09-21）：
1. 「左下角，需要有一个设置入口。这个设置面板，参考 ../skill-creator-v2
   这是我这几天刚针对 dsh 相关打磨的 Model 的配置。请你将它移植过来。
   并且升级 dsh 的内核（参考 skill-creator-v2 使用 dsh 内核的方式）」
2. （同轮）左下树区 title 显示为 "layers"；presence 同族断层修复
   （boot/reconnect park）——已随本轮落地。

skill-creator-v2 的模式（探索报告 `.zcode/presence/` 存档）：
- **app 隔离的 DSH home**（`~/.skill-creator/dsh-home`）+ 双文件桥接：
  steward 私有 JSON（富字段真相）→ `$DSH_HOME/settings.yaml` 的
  llm-pi-ai providers 段（白名单字段）+ `.credentials.yaml` 的
  version-1 `refs:` 布局——**内核热加载，无需重启**（顶层平铺 key 会
  打挂内核 boot，2026-09-12 实证）。
- Model 配置面板：路由 tabs（provider/baseURL/api 协议/key/models），
  每模型 id/名称/efforts 档位/上下文窗口/最大输出，活动模型 + 推理强度，
  连接测试；key 客观回显（password + eye）。

## What Changes

1. **服务端 settings 存储 + API**（`src/server/settings/dsh-settings.ts`）：
   - `~/.jixoai-design/steward-store/dsh-settings.json`（routes + active
     model，revision 递增）与 `dsh-credentials.json`（0600，按 provider）
   - API：GET/POST `/__design__/api/settings/dsh.json`、credential
     set/clear、`test`（按路由 baseURL+key 实测模型列表拉取延迟）
2. **DSH 桥接**（skill-creator 双写模式）：每次真实变更同步
   `~/.jixoai-design/dsh-home/settings.yaml`（llm-pi-ai providers，
   白名单 id+contextWindow）与 `.credentials.yaml`（refs 布局）
3. **内核使用方式升级**（`src/agent/dsh.ts`）：配置了活动路由时，spawn
   挂 `DSH_HOME=~/.jixoai-design/dsh-home`（内核经桥接文件热加载路由与
   凭据），替代每轮临时 `--patch`；无配置时回退现状（env+patch）
4. **studio 设置面板**（`src/studio/settings-panel.svelte`）：nav 底部
   齿轮入口 → list-detail 弹窗（176px 导航 + 详情），Model 分区完整
   移植（路由 tabs/编辑器/凭据 eye 回显/模型条目/efforts/上下文简写/
   活动模型+推理强度/连接测试），按 studio 自身设计语言重绘
5. 「layers」title 与 presence boot/reconnect park 已并入本轮

## 验收标准

- [x] S1 settings 入口出现在 nav 底部（`.studio-nav-foot`）；弹窗打开即拉配置
- [x] S2 路由 CRUD + 模型条目（id/name/context/maxOut/efforts）；
      token 简写（0.5M/253k）解析**降级为后续打磨**（本轮数字输入直收）
- [x] S3 key 写入后回显「· key stored」+ show/hide 切换；清空即删；
      凭据文件 0600；key 本体永不跨 API（视图只含 presence 布尔）
- [x] S4 保存（dirty 门控）→ steward JSON revision+1 且桥接 YAML 同步
      （llm-pi-ai providers 白名单 id+contextWindow + agent-default-model
      保存选择段 + .credentials.yaml version-1 refs 布局；未知顶层段保留）
- [x] S5 连接测试（/v1/models 探测）返回 ok+延迟 或 失败明细；
      草稿 baseURL 可覆盖探测
- [x] S6 dsh 适配器：有活动路由时 spawn 挂 DSH_HOME=design 桥接 home、
      不带 patch（内核原生消费 settings.yaml）；无配置回退 env+patch 现状；
      info() 的 model 每轮解析
- [x] S7 单元 11 项：两副面孔逐项（schema/revision/refs 布局/白名单/
      未知段保留/桥查询三缺口）+ API 门（引用完整性/effort 档位/
      400 家族/凭据旁路/测试覆盖门）
- [x] S8 build:studio 绿（manifest 3bde2cac）+ 电池 580/580 + 矩阵
      74/74 + 浏览器探针 15/15（面板开合/建路由/存 key/active/save/
      持久化/两面落盘/零 pageerror）

## Impact

新增 `src/server/settings/`（存储+桥接+测试）、create.ts API 路由、
`src/studio/settings-panel.svelte`、shell 挂齿轮、dsh.ts 适配器升级；
不改 presence/collab 既有行为。
