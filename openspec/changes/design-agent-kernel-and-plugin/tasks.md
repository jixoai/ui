# design-agent-kernel-and-plugin — tasks

蓝图来源：shufa-server 与 skill-creator-v2 双侦察（2026-09-27，
Explore 报告全文见会话记录；下列条目直接引用两项目的模块路径）。

## Phase 1 — 内核内嵌（dsh 不再 spawn）

- [ ] T1.1 引入 `@deepseek-ai/dsh-app-boot`（shufa `daemon/src/kernel/boot.ts`
      蓝本）：design server 进程内 boot cordis 内核，boot 失败降级运行
      不阻塞 server（面板照常、agent 车道报 typed unavailable）
- [ ] T1.2 `agent/dsh.ts` 的 spawn 车道退役：改为
      `agents.create/resume({sessionId, meta:{cwd}, agentOptions,
      setup})` + `followup/steer/cancel(keepInbox)`（skill-creator
      `src/daemon/kernel/agent-sessions.ts` 蓝本；unknown 事件
      zod safeParse 收窄）
- [ ] T1.3 模型路由双面桥：现 dsh-settings.json（富字段真源，已有）
      → 投影 `$DSH_HOME/settings.yaml` llm-pi-ai.providers 白名单桥
      + `.credentials.yaml` refs 0600（skill-creator
      `steward/dsh-settings.ts` 的 syncDshModelRoutes/…Credentials
      蓝本；现有 PATCH_TEMPLATE spawn 补丁面退役）
- [ ] T1.4 工具面收窄 + MCP 回环：内核通用工具 disable，产品能力走
      自托管 MCP（`/mcp` streamable-http + token 经 env 模板不落盘，
      内核 dsh-mcp-client 反连）；mutation 能力只注册 `*_propose`
      变体产 proposal 等人批（skill-creator `mcp/proposals.ts` 蓝本）
- [ ] T1.5 `--agent dsh` 对外更名（内核名不外露；候选名随实现提报
      Owner 拍板），echo/none 内置不变

## Phase 2 — Agent 对话面板（前台全量对接）

- [ ] T2.1 帧契约：闭合 kind 枚举帧（对齐 skill-creator
      `DshSessionStreamFrame` 18 kind + shufa Frame 17 kind 求并集
      裁剪），seq 游标 + afterSeq 续传 + jsonl 转录 write-through
      （live==回放）；payload 出口强制 redact
- [ ] T2.2 服务面：studio 现有 chat 车道升级为 agent.* 契约面
      （session.create/prompt/cancel/answer/stream/setMode +
      queue.list/update）；流式选轮询 afterSeq（skill-creator 形态）
      起步，WS 帧流（shufa 形态）为后续可选
- [ ] T2.3 面板组件族（studio 侧新建，通用件同步 registry，见 T3）：
      Transcript / UserBubble / ReasoningRow(DisclosureRow) /
      AgentToolRow(call+result 按 toolCallId 合并) / ComposerCard
      (模式 chip + 模型 chip + TriggerMenu) / ContextMeter(用量环
      +/compact) / QueueDock / AgentApprovalCard / AgentProposalCard
- [ ] T2.4 delta 合并与投影：daemon 侧 120ms delta 缓冲、tool-args
      按 callId 分桶、turn-end usage 累计（双项目同款）；auto-compact
      阈值 `inputTokens ≥ contextWindow − maxOutputTokens`（两值齐备
      才启用）
- [ ] T2.5 ego-browser 真实交互走查（协议见
      ~/.zcode/skills/ego-browser/SKILL.md）：vision 子代理以
      ego-browser 驱动真实面板交互（发消息/中止/审批/换模型/compact），
      截图仅作辅助证据

## Phase 3 — 组件回馈官方库

- [ ] T3.1 从 T2.3 提炼通用组件入 registry/files/ui（候选：帧转录
      行族、composer 输入卡、上下文用量环、审批卡）——走 0.6.0
      stylex payload 管线（tabs.stylex.ts 模式）+ 镜像同步 +
      mirror-manifest + component-metadata-gen
- [ ] T3.2 每个新组件页按 demo-standard 规范落地（110 页同款骨架：
      Install/SeeAlso/Usage + 八轴表 + query() 实例）+ docs-structure
      锁与 llms 分类同步
- [ ] T3.3 vision 子代理 ego-browser 走查组件 demo 页（真实交互，
      非 screenshot-only）

## Phase 4 — 插件化命令面（opendweb 模式）

- [ ] T4.1 `jixoai-ui plugin add [--package <pkg>] / use <name> /
      plugin list`：marketplace 候选解析 + 用户包管理器安装 +
      lockfile（opendweb `plugin-registry.mjs`/`plugin-resolve.mjs`
      蓝本：createRequire(用户项目) 语义 + 安装即信任 + name@version
      锁定）
- [ ] T4.2 `@jixoai/ui-plugin-design` 成包：design 产品整体迁入插件
      包（exports 含 `./ui-design-plugin` 面），dist-studio 随 tarball；
      `jixoai-ui design` ≡ `jixoai-ui use design` 等价直达
- [ ] T4.3 release.yml 三包对齐（CLI + vite-plugin + ui-plugin-design
      锁步 0.6.x）

## Phase 5 — 对外协作面与官网

- [ ] T5.1 MCP + skills 协作面文档化：design agent 的 MCP 服务面与
      skills 包对第三方 agent 开放（不在本变更做第三方适配器）
- [ ] T5.2 官网 design-agent 页按新口径改写：内核故事（开箱即用、
      不可脱离）、mcp+skills 协作、插件安装命令面（plugin add/use）、
      availability 注记移除（发布闭环完成后）
