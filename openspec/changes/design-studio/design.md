# Design: design studio

> r2（2026-09-11）：吸收 super-thinker 复核（7/10）的 B1–B3 阻塞与
> H1–H5 风险。frame 机制改判为服务端约定 glob（canvas 文件回归纯
> 声明式）；补包消费模型与插件清单；dsh 降维摆上台面。

## 0. 意图清单（本文件）

1. 产品拓扑决策：单 vite 服务器三表面（studio / frame / canvas）。
2. prototype 标准的机制选型：服务端约定 glob + 声明式 canvas，
   否决 per-canvas glob（r1）与 virtual-module 改写（r0）两案。
3. 主题机制：frame 文档根类（iframe 隔离下的 `.dark`）。
4. Agent seam 形状（SSE 传输）与 dsh 适配的实验级边界。
5. 知识包的内容源、组装与快照分发。
6. 包消费模型：源码分发 + file: 依赖 + CLI 路径探测。

原始需求输入：Owner 2026-09-11（见 proposal 引言）。

## 1. 产品拓扑：一台 vite 服务器，三个表面

```
vite dev server (createDesignViteServer)
├── /__design__/            studio shell（SPA，svelte5 mount）
│     ├── navigator         画布树（/__design__/api/manifest.json）
│     ├── preview grid      <iframe src="/prototypes/<name>/">
│     └── chat panel        ↔ /__design__/api/chat（SSE 流）
├── /__design__/frame       frame 表面（一个 ref'd 文件的挂载页）
│     ?p=<proto>&f=<file>&theme=dark&w=1280&h=800
│     = 动态 import 约定 glob 命中的模块 + 挂 theme 类于 <html>
└── /prototypes/<name>/     canvas 页（canvas.svelte 挂载，声明式矩阵树）
```

为什么一台服务器：同源 iframe（零 CORS/零 postMessage 鉴权）、共享
模块图（frame 之间组件代码去重靠 vite 模块缓存，实例各 frame 独立——
这正是"真实视口语义"的代价与收益）、CLI 只管一个进程生命周期。

## 2. prototype 标准：服务端约定 glob，canvas 纯声明式

Owner 草案（保留原文）：

```
<prototypeCanvas grid-cols=N grid-rows=M>
  <prototypePage id="x-desktop-1280-dark" ref="x.svelte" width=1280 height=800 theme=dark />
  <prototypeCanvas ...>
    <prototypeComponent id="x-ccc-dark" ref="x-ccc.svelte" width=360 height=200 theme=dark />
  </prototypeCanvas>
</prototypeCanvas>
```

机制裁决（r2，替代 r1 的 per-canvas glob）：

**对接契约（子任务分工的硬接口，双方不得擅改）**：

- frame URL：`/__design__/frame?p=<prototype>&f=<file>&theme=light|dark|auto&w=<px>&h=<px>`，
  `f` = ref 字符串去掉前导 `./`（如 `pages/checkout.svelte`）。
- canvas 页 URL：`/prototypes/<name>/`（挂载 canvas.svelte 的 HTML 壳）。
- manifest：`/__design__/api/manifest.json` →
  `[{ name, path, frames?: [{id, ref}] }]`（frames 为 best-effort
  正则提取，缺席合法）。
- canvas 文件 import kit 的**稳定说明符**：`#jixoai/prototype-kit`
  （design server 的 alias 表把它映射到宿主安装的 kit 源——canvas
  文件跨宿主可移植，不认识宿主别名方案）。
- chat：SSE，端点与事件形状由 T5 在 seam 约束内定稿。

- **frame = 真 iframe**。`PrototypePage`/`PrototypeComponent` 是
  声明式 frame：它们不解析模块，只把 `ref`（相对 canvas 文件夹的
  路径）+ 尺寸 + 主题拼成 frame 表面 URL，渲染 `<iframe>`。媒体/
  容器查询因此天然跟随 frame 视口（iframe 语义）——这是"真实响应式
  矩阵"的核心卖点，div frame 做不到（r1 矛盾的根因，B1）。
- **ref 解析收敛到服务端**。frame 表面的入口是一个由
  `createDesignViteServer` 注入的虚拟模块
  （`virtual:jixoai-design/frame-entry`），内含一条**根相对字面量
  glob**：`import.meta.glob('/design/prototypes/*/pages/*.svelte')`
  与 `.../components/*.svelte`。请求 `?p=welcome&f=pages/checkout.svelte`
  → 查表 → 动态 import → mount。未命中 = frame 表面渲染**响亮的
  错误页**（点名 ref 与 glob 根下实际存在的键），HTTP 200 + DOM
  错误（iframe 内可见，不是死白）。
- **canvas 文件零脚本**。r1 要求 canvas 文件头写两条 glob 字面量
  （vite 硬约束下唯一合法位置），r2 把 glob 移进服务端虚拟模块后，
  canvas 文件回归 Owner 草案的纯声明形态——Agent 只写标记树。
  "文件夹即标准"的字面意义更强：`pages/`、`components/` 的**位置**
  就是解析依据。
- **HMR 链**：改 `pages/checkout.svelte` → vite HMR 传播到引用它的
  frame-entry → 各 frame iframe 热更新；新增文件 → vite 的 glob
  失效传播重建 glob 表 → 新 frame 即刻可解析。canvas 文件本身的
  编辑走 svelte HMR（frame 列表变化 = iframe 增删）。V2 验证。
- **代价与边界**：frame 组件依赖 design server（裸 registry item
  在无 server 的宿主里渲染 = frame 显示"需要 design server"的
  提示态）。v0 接受此耦合：frame 矩阵本来就是 design-studio 的
  增值面；裸原型页（registry 的 `/prototypes/*` 先例）不受影响。
- **否决记录**：per-canvas glob（r1）要求每个 canvas 两条脚本且
  ref→模块映射散落各文件；virtual-module 改写 `ref` prop（r0）
  是一层编译魔术，失败面大。两案都被"服务端一条 glob"取代。

**文件夹约定**（sveltekit 精神：位置即语义）：

```
design/prototypes/<name>/
  canvas.svelte        ← 矩阵布局树（纯声明，一个原型一个画布）
  pages/*.svelte       ← 整页原型（PrototypePage 的 ref 目标）
  components/*.svelte  ← 隔离组件原型（PrototypeComponent 的 ref 目标）
```

**frame 语义**：

- `PrototypePage`：视口 frame。width×height 锁视口；页面内真实
  响应式布局照常工作。theme 经 URL 参数落 frame 文档根类。
- `PrototypeComponent`：组件 frame。小尺寸，高度自适应内容
  （height 为初始值，`fill` 属性可锁）。同一组件的多个状态 =
  Agent 写多个 ref 文件或一个状态矩阵包装文件——**状态设计就是
  写真实组件代码**，frame 不发明 props 注入协议（v0 边界，§7）。
- `PrototypeCanvas`：CSS grid 容器（`gridCols`/`gridRows`/`gap`），
  可嵌套；嵌套继承外层 frame URL 上下文（原型文件夹名），子 canvas
  可覆盖。grid 布局遵循 css-architecture 的 grid 法则。

**id 约定**：`<name>-<viewport|part>-<w?>-<theme>`（Owner 草案的
`xxxx-desktop-1280-dark`）。id 是 DOM 锚点（navigator 深链滚动定位），
不强制格式，canvas 内唯一（冲突 = dev 警告 + 首个生效）。

## 3. 主题：frame 文档根类

frame 是独立文档，token 类挂 frame 的 `<html>`（`?theme=dark` →
`html.dark`）。宿主/画布级的主题状态不影响 frame 内部（隔离即语义：
一个画布同时陈列明暗副本）。已知边界（r1 遗留，app.css:94-97）：
语法高亮的 `html.dark pre[data-syntax-theme]` pin 在 frame 内
**有效**（frame 自己的 html 挂了 .dark）——r1 的"html 级选择器不
生效"担忧随 iframe 裁决消失。`theme="auto"` = 不挂类，跟宿主。

## 4. Agent seam 与 dsh 适配（实验级）

```ts
interface DesignAgent {
  info(): { kind: 'dsh' | 'echo' | 'none'; model?: string };
  chat(sessionId: string, message: string): AsyncIterable<AgentEvent>;
  // AgentEvent = { type: 'text', text } | { type: 'file', path }
  //             | { type: 'tool', name, state } | { type: 'done' }
}
```

传输：studio ↔ server 走 **SSE**（`/__design__/api/chat`，POST 落
session + GET 流式回放；EventSource 兼容形态由 T5 定稿，禁止
WebSocket 双协议并存）。

- **EchoAgent**：`--agent echo`。回放固定剧本（scaffold demo 原型
  的完整对话流），驱动 chat UI 与"agent 写文件 → canvas HMR"的
  全链路——**不依赖任何模型服务**。实验保底线：产品回路必须先在
  Echo 上闭环。
- **DshAgent**：`--agent dsh`。dsh host 进程适配（spawn `dsh`
  headless/web，会话经其 api）。实验级边界：只验证"能起、能聊、
  能改工作区文件"。cordis 前端插件替换是 stretch goal（proposal
  交付面 #4 的两级目标），摩擦进问题清单。
- **none**：`--agent none`，studio 只读（纯画布浏览器），用于演示
  与 vision 走查。

dsh-web-app 解剖结论（r1 调研）：它是 40+ `dsh-client-ui-*` 子插件
聚合 + host-webserver + web-frontend；存在独立可引的
dsh-api-session-controller / dsh-api-workspace-controller /
dsh-host-frontend-static。"替换 webui"的可行解空间以此为基础。

## 5. 知识包（best-practice pack）

内容源（全部已有，零新权威源）：

| 源 | 提供什么 |
|---|---|
| `registry.json` × 136 item 的 title/description | 组件选型表（什么时候用什么） |
| 各 item 的 variant/Context 文档（registry 描述内） | 变体梯子 + Context 定制点 |
| `registry/files/llms-txt/llms-txt.mjs` | 站点级 llms 索引（组装参考） |
| `openspec/specs/*`（component-authoring 等） | 状态机法则、8 态拓扑纪律 |
| 本 change 的 prototype-standard spec | 文件夹约定 + frame 语义 |

组装与分发：`buildKnowledgePack()` 在**本仓库构建期**生成快照
（`src/knowledge/snapshot.json`，随包提交），运行时消费快照；
`buildKnowledgePack(root)` 的 root 参数只用于覆盖式重组（本仓库
车辆），消费者机器不依赖仓库路径（H4 修复）。systemPrompt 分四层
（选型/变体/状态机/标准），各层从源机械生成 + 少量手写法则段
（如"Button 类交互元默认绑定 Loading 状态锁"——AGENTS 8 态法则
的设计侧投影）。studio 的 guide 面板渲染同一份 componentIndex。

## 6. CLI、scaffold 与包消费模型

### 6.1 scaffold

`jixoai-ui design` 首次运行 scaffold（幂等：只补缺件，永不覆盖）：

```
design/
  studio.svelte        ← studio shell 挂载页（import 包内默认 shell，可改）
  prototypes/
    welcome/           ← 内置 demo 原型（真实组件最小矩阵）
      canvas.svelte
      pages/hero.svelte
      components/press-states.svelte
```

### 6.2 包消费模型（B3 修复）

- **源码分发**：`packages/design-tool/package.json` 的 main 指
  `src/index.ts`（css-laws 先例——被 vite dev server 直接消费，
  不出 dist；studio shell 与宿主共享模块图的唯一形态）。
- **依赖边**：registry 车辆以 `file:` 依赖引入
  （`"@jixoai/ui-design": "file:../../packages/design-tool"`，
  与 ui-vite-plugin/betlang-wasm 同模式）；根 package.json 加
  workspace devDep。CLI 侧不依赖安装：`cli/bin/design.mjs` 用
  `createRequire` + 路径探测（先 `hostRoot/node_modules`，再相对
  CLI 自身的 `../../packages/design-tool`，monorepo 探测）。
- **命名**：`@jixoai/ui-design`（ui- 前缀法则）。

### 6.3 合成 vite 配置（B2 修复）

`createDesignViteServer(root)` 的合成配置**必需插件集**：
`@sveltejs/vite-plugin-svelte`、`@tailwindcss/vite`、
`@jixoai/ui-vite-plugin`（含 icons 配置——lucide provider + md/ph/rx
通道；组件树里 icon.svelte 直接 import `virtual:jixoai-icons`，
缺它则带图标的组件全灭）+ frame/canvas 两个虚拟模块注入。别名表
（H2）：monorepo 探测器产出 `$lib`/组件源/app.css 的 alias 映射 +
tailwind content 扫描根（必须覆盖 design/）；registry 车辆的
css-entry alias 手法（registry/vite.config.ts:130-168）按需复刻。
探测器是 T3 的第一个探针任务，产出物是一张可测试的 alias 表。

### 6.4 studio shell 的宿主解耦

默认 shell（包内）**不 import 宿主组件**（包不认识宿主别名），以
极简自足样式保底；dogfood 经由 scaffold 的 `design/studio.svelte`
（宿主文件）：它 import 默认 shell 并可把宿主组件传给 shell 的
可选槽（标题栏/侧栏 chrome 等）。fork 车辆在此层注入 jixoai 组件。

## 7. v0 明确不做（记录裁决，防 scope 漂移）

- frame 级 props/state 注入协议（状态矩阵靠真实代码文件表达）。
- canvas 导出（截图/PDF）。
- 多工作区/远程。
- studio 的 jixoai 视觉法则完整验收（dogfood 尽力，shell 保底）。
- dsh 的 profile/preset 配置面；cordis 前端插件替换（stretch）。
- 裸 registry item 在无 design server 宿主的 frame 降级渲染。

## 8. 验证计划（V 系列）

- V1 scaffold 幂等：两次 `jixoai-ui design` 首跑落盘一致。
- V2 frame HMR：改 `pages/*.svelte` → frame iframe 无刷新更新；
  新增 ref 文件 → 新 frame 可解析。
- V3 主题 frame：同一 canvas 内 light/dark frame 并存，token 正确
  （含语法高亮 pin 在 frame 内生效的回归）。
- V4 Echo 回路：chat 发指令 → 剧本落文件 → canvas 更新 → done 事件。
- V5 CLI 端到端：`jixoai-ui design --agent echo` → 浏览器走查
  （vision 子代理，真实浏览器，交付前自走查纪律）。
- V6 dsh 冒烟（best effort）：dsh host 起、chat 通、文件改。
- V7 隔离法则：生产模块图不含 design/（verify 脚本断言无 import 边）。
