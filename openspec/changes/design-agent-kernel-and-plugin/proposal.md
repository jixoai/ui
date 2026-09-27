# design-agent-kernel-and-plugin

## Why

Owner 架构裁决（2026-09-27，两轮对话定形）。此前 Codex 讨论把「发布面断层」
的解法误指向「agent 适配器插件化」——本轮裁决纠正了切法：

1. **dsh 是内核，不是外挂**。dsh 是我们拿来做二次开发 agent 的内核：
   - 名字不外露（延续 r5「不要强调 dsh」的产品文案法）；
   - **不能简单 spawn** 外部二进制——内核内嵌于 design-agent 产品进程；
   - 产品没有提供完全的人工编辑功能——这个产品不是「给人编辑的」，
     是让 Agent 直接写代码，所以 **Agent 不可脱离内核**，必须开箱即用。
2. **与其它 agent 协作 = mcp + skills**。不是给第三方 agent 做适配器
   插件；我们只需要对外提供 MCP 服务面与 skills 包，任何 agent 都能
   通过标准协议协作。
3. **分发形态 = 产品级插件**（参考 opendweb 插件系统）：
   - 包名：`@jixoai/ui-plugin-design`；
   - 命令面：`jixoai-ui design` ≡ `jixoai-ui use design` ≡
     `jixoai-ui plugin add --package=@jixoai/ui-plugin-design &&
     jixoai-ui use design`；
   - 宿主 CLI 泛化出 `plugin add / use`（opendweb 的
     marketplace + lockfile 模式），design 是第一个官方插件。
4. **参考项目对接**（原始指令逐字）：「dsh 内核的开发，请参考
   /Users/kzf/Documents/书法/shufa-server 和 ../skill-creator-v2 这两个
   项目……后台有模型管理、前台有 Agent 对话面板。你需要都在我们的
   design-agent 这个产品中全部都对接上。」
5. **组件回馈**：「这个过程会产生一些组件，请同步到我们的官方组件库中
   并提供标准规范文档。」
6. **走查协议**：「vision 子代理必须使用 ego-browser 进行走查验证组件，
   进行真实交互体验。」（不再用截图判读替代真实交互；截图仅作辅助证据）

## What Changes

1. **内核内嵌**（agent/dsh.ts 重构）：spawn 外部 dsh 二进制的车道退役，
   内核以进程内模块形态驱动 agent 回合（参考两个项目的执行循环）。
   `--agent dsh` 对外更名（内核名不外露；具体产品名随实现定）。
2. **模型管理后台对接**：settings 面板的 model routes 已有七轮打磨；
   补齐两个参考项目的运行时消费面（路由真正驱动请求、探活、凭据
   桥接内核）。
3. **Agent 对话面板前台对接**：studio 的 chat 车道升级为完整的
   agent 对话面板（消息流/工具事件/流式/中止/重试，对齐参考项目的
   消息模型），过程中的通用组件回馈 registry（含 demo-standard
   规范文档页）。
4. **MCP + skills 协作面**：design agent 对外暴露 MCP 服务与 skills
   包，第三方 agent 走标准协议协作（不在本变更实现第三方适配器）。
5. **插件化命令面**：`jixoai-ui plugin add/use`（opendweb 式
   marketplace 候选 + 用户包管理器安装 + lockfile），
   `@jixoai/ui-plugin-design` 作为第一个插件包承载 design 产品；
   `jixoai-ui design` 保留为等价直达命令。
6. **官网更新**：design-agent 文档页按新口径改写（内核故事、
   mcp+skills 协作、插件安装命令面）。


## Owner 裁决（grilling Round 1，2026-09-27）

1. `--agent` 旗标**整体删除**（破坏性更新）：server 默认即产品态；
   只读语义=未配模型路由时 agent 车道 typed unavailable；探针/走查
   改用环境变量开关，不进 CLI 面。
2. **产品模型对齐**（Owner 原话转述）：design 工具面向专门的
   设计项目——项目内拉取 UI 库、搭建原型页；设计项目与目标用户
   的最终项目混在一起；**导出代码**给用户落地自己的前端项目。
   设计项目完全归 design 工具使用：**agent 对其内代码全权写、无
   审批摩擦；改坏了 CLI 可重新下载原版源代码**。UI 组件代码一般
   不改，除非用户确需定制能力/样式（可改）。
   → MCP 权限分级随之定形：design 工作区内=直接写；工作区外
   （宿主项目文件）=proposal 人批。
3. **main 已暂停**：全力把 design 分支维护/开发到生产级交付质量
   再推出；期间等同于在此线上开发（合并时机不受阻塞）。
4. **版本锁步** + 采用 **pnpm 12 原生 changesets** 作为发版最佳
   实践（三包同火车）。
5. **参考项目只借鉴模式，全部重写**（它们是产品级，我们是组件级
   ——要做大量变体与优化打磨，按本仓 stylex payload + demo-standard
   规范重做）。
6. **内核跟 alpha 通道最新**（@deepseek-ai/dsh-* 始终最新 alpha，
   非 rc 非钉死；升级配桥接契约测试）。

## Non-Goals

- 不做第三方 agent 的适配器插件（协作走 mcp+skills，非本变更）。
- 不改变 settings 面板已验收的七轮打磨交互（只在运行时消费侧对接）。
- 内核对外产品名、marketplace 的多插件生态运营——随实现给出提案，
   命名由 Owner 拍板。
