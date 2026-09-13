# Proposal: design studio — `jixoai-ui design`, an agent-driven prototype canvas on real components

> 原始需求（Owner，2026-09-11）：推出一个专门的 design 工具，启动方式
> `jixoai-ui design`，启动一个 webui。完全独立的 Agent 产品：提供原型画布，
> 响应式设计、状态设计，用的全部是真实的 jixoai-ui 组件（事实的 svelte
> 项目预览器）。Agent 编写真实的 svelte 代码。职责两部分：(1) 提供 jixoai-ui
> 最佳实践——什么时候用什么组件、利用变体能力/Context 能力定制状态机；
> (2) 提供 prototype 标准（类比 sveltekit 标准）——通过组织文件夹和文件
> 实现原型界面展示，标准本身是一套组件（prototypeCanvas/prototypePage/
> prototypeComponent）。AI 部分在 `@deepseek-ai/dsh` 基座上展开：换掉它
> 的 webui 插件，换成 jixoai-ui-design-webui。想法粗糙，实验性质，fast-remix
> 工作方式，先带出真的能用的原型产品。

## Why

jixoai-ui 今天的设计探索发生在 Agent 会话里（prototype skill 的变体
探索 + registry/ 的 `routes/prototypes/` 孤岛），没有产品化的载体：

1. **消费侧没有画布**。消费者项目装了组件，但看响应式矩阵（390/768/
   1280 × light/dark）和状态矩阵（一个组件走完它的状态机）需要手工
   起一个页面逐个摆——Agent 每次都要重新发明这个 harness。
2. **最佳实践锁在仓库里**。什么时候用 press-button 的哪个 rung、
   Context 怎么定制状态机、8 态拓扑怎么落——这些知识在 registry 描述
   和 spec 里，但没有一个 Agent 可直接消费的知识包。
3. **Agent 产品缺一个壳**。dsh（deepseek-harness）提供了完整的 agent
   host 运行时（session/tool/workspace，cordis 插件化），它的 webui
   是通用 chat——不是设计工具的形态。换掉 webui 插件 = 站在完整
   agent 基建上，只重做设计工具的前端。

实验要回答的问题（不是最终架构承诺）：

- prototype 标准的形状对不对？（canvas/page/component + 文件夹约定）
- 一个 live vite 预览嵌进 agent webui，工程上成立吗？（同源双表面：
  studio shell + canvas iframe）
- dsh 基座我们到底要用多少？（chat + 文件编辑 + session 就够了吗）
- registry 元数据 + llms-txt 够不够支撑好的组件选型建议？

## What Changes

一图（数据流）：

```
jixoai-ui design ── CLI (cli/bin/design.mjs)
   │ 1. ensure design/ workspace (scaffold on first run)
   │ 2. ONE vite dev server (createDesignViteServer, @jixoai/ui-design)
   │      /__design__/          → studio shell (navigator + chat + guide)
   │      /__design__/frame     → frame surface (mounts one ref'd file,
   │                               theme class on document root)
   │      /prototypes/*/        → canvas pages (matrix trees, live HMR)
   │ 3. agent host: DesignAgent seam ── DshAgent | EchoAgent(manual)
   │ 4. open browser
   ▼
┌ studio shell (svelte5, dogfoods project components) ──────────┐
│ [navigator: canvas tree] [preview iframe grid] [agent chat]   │
└───────────────────────────────────────────────────────────────┘
        ▲ iframes, same origin                    ▲ chat API (SSE)
┌ design workspace ──────────────────┐   ┌ knowledge pack ──────┐
│ design/prototypes/<name>/          │   │ registry.json →      │
│   canvas.svelte (the matrix tree)  │   │ selection guide;     │
│   pages/*.svelte      (full pages) │   │ variant/Context law; │
│   components/*.svelte (isolated)   │   │ prototype standard;  │
└────────────────────────────────────┘   │ state-machine idioms │
      ▲ frame surface mounts these       └──────────────────────┘
        by server-side convention glob
```

四条交付面（一个 change，全部新面，零破坏）：

1. **prototype-kit registry item**（`registry/files/ui/prototype-kit/`）：
   `PrototypeCanvas`（grid 容器，可嵌套）、`PrototypePage`（整页 frame：
   width×height×theme）、`PrototypeComponent`（组件 frame）；ref 经
   canvas 文件内的 `import.meta.glob` 字面量解析（sveltekit 文件约定
   的同一权力工具，零新插件）。新 spec：`prototype-standard`。
2. **@jixoai/ui-design 包**（`packages/design-tool/`，命名遵守
   `@jixoai/ui-` 前缀法则）：`createDesignViteServer`（合成 vite 配置，
   同源双表面）；studio shell 源码（随宿主项目的模块图分发，天然
   dogfood 宿主已装的 jixoai 组件）；`DesignAgent` seam（`DshAgent` |
   `EchoAgent`）；knowledge pack（最佳实践系统提示词构建器）。
   新 spec：`design-tool`。
3. **CLI `design` 命令**（`cli/bin/design.mjs`，jixoai-ui.mjs 保持
   单一意图不改）：`jixoai-ui design [--port] [--agent dsh|echo|none]`。
4. **dsh 基座接入**（`packages/design-tool/src/dsh/`，实验级，两级目标）：
   v0 主路径 = **DshAgent API 适配器**——dsh host 进程作为 agent 运行时，
   经其 api 控制器对接进我们自己的 studio（studio 本来就跑在我们的
   vite server 上，不发生 webui 替换）。stretch goal = cordis 前端
   插件形态替换 dsh-web-app 的前端表面——该路径的摩擦本身就是实验
   要产出的问题清单素材。Owner 原始表述是"换掉它的 webui 插件"，
   v0 的降维（适配器优先）是为解耦产品回路与 dsh 风险；若实验证明
   适配器路径已满足"能起、能聊、能改文件"，cordis 前端替换是否
   还值得做，交 Owner 裁决。装不上/接口对不上时 EchoAgent 保底。

**验证车辆**：本仓库自身。`registry/files/routes/prototypes/` 已有
list-item-fusion 孤岛先例；本 change 增加 studio 路由 + 一个完整 demo
原型（checkout-flow：响应式矩阵 + 状态矩阵），`jixoai-ui design` 在
本仓库跑通端到端（scaffold → server → studio → canvas → chat）。

## 非目标（实验边界）

- 不做消费者 npm 发布（版本号、publishConfig、镜像桥全部后置）。
- 不做多画布路由器/权限/远程协作——单机单工作区。
- dsh 插件不做通用化（不提交上游，不抽象 plugin API）。
- studio chrome 不追求完整 jixoai 视觉法则验收（dogfood 尽力，
  shell 保底可用；完整法则化是后续 change）。
