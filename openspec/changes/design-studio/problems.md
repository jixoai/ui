# design-studio 实验问题清单（给 Owner 的讨论稿）

> 2026-09-11，实验轮 r1。按"影响决策的程度"排序——前面的条目
> 需要 Owner 拍板，后面的只是摩擦记录。子代理摩擦点报告在集成
> 阶段追加（§5）。
>
> **2026-09-11 Owner 走查后裁决（r2 输入）**：§1–§4 全部裁毕，
> 各节末尾的"Owner 裁决"段为准；r2 变更见 design-studio-r2。

## 1. dsh 基座可用，但安装通道是硬约束；"换 webui 插件"降维为适配器

**现象与事实**（证据：dsh-probe.md）：
- 官方 registry.npmjs.org 的 tarball CDN 在本机几乎不可达（metadata
  端点通、npm pack 直接 network error、完整 install 挂 15min+）；
  **npmmirror.com 镜像 14 秒装完全部 519 包**。
- `dsh --profile headless "reply with exactly: pong"` 真实跑通
  （宿主已配好模型 key）——dsh 的 agent 回路在本机成立。
- dsh 的正确姿势比"换 webui 插件"更省：`--profile headless`
  （一次性 job）与 `--profile sdk`（换行 JSON-RPC over stdio）都是
  官方自动化表面；dsh-web-app 的本体是 484 行 cordis.patch.yml
  浏览器 roster，"替换"= 自定义 profile 派生 + 去 bundle + 装我们
  的 bundle（可行性笔记见 dsh-probe.md，本轮未实施）。

**v0 落地**：DshAgent = headless 逐回合适配（单 text 事件 + done，
无流式粒度）；sdk profile 是流式升级路径。

**要 Owner 拍板的**：
- a) `jixoai-ui design` 作为独立产品是否值得硬绑 dsh（519 包的
  依赖树 + 镜像安装前提）？还是 seam 保持开放（dsh / 自研 loop /
  其它 harness 三选一），dsh 只是第一个适配器？
- b) 若坚持 dsh：错误提示与文档要写明镜像安装通道；519 包的体积
  是否随产品分发（vendor / 引导安装 / 可选 peer）需要决策。
- c) "换掉 webui 插件"的原意如果是我们自己的 studio 顶掉 dsh 的
  chat UI——适配器路径已经做到这一点（studio 完全是我们自己的，
  dsh 只当 headless 引擎）。剩下"住进 dsh 的 webserver"还有什么
  场景价值？若无，stretch goal 可以砍掉。

**Owner 裁决（2026-09-11）**：dsh 是目前社区里最适合二开的 Agent 基座
（开箱的会话管理、自动压缩、MCP、追踪、重试、多 provider）。不硬绑
 oneself：把我们的标准封装成 **MCP + 配套 skill + system prompt**，
即可移植——未来换 Agent 引擎、甚至直接接入用户已有的 Agent 都可能。
即：seam 开放、dsh 首选、MCP 化是可移植性路径。真模型已接
（glm-5.3-flash via 本地 anthropic 兼容端点，`--patch` 覆盖层 +
隔离 DSH_HOME，见 design-studio-r2）。

## 2. prototype 标准的 v0 边界：frame 依赖 design server

frame 组件（PrototypePage/Component）的 ref 解析依赖
createDesignViteServer 的约定 glob——裸 registry item 在没有
design server 的宿主里只渲染提示态。即：**prototype-kit 作为
registry item 分发，但它的完整体验绑定我们的工具链**。

**替代方案被否的原因**（design.md §2 否决记录）：per-canvas glob
要求 canvas 文件带脚本；virtual-module 改写是编译魔术。

**要 Owner 拍板的**：这是"标准绑定工具"还是"工具实现标准"？
长期看，若 prototype 标准要独立于 jixoai-ui design 存活（其它
工具也消费这套文件夹约定），约定 glob 的解析层需要一份不依赖
我们 server 的规范文本（spec 化 frame URL 契约）。我们 server 的规范文本（spec 化 frame URL 契约）。

**Owner 裁决（2026-09-11）**：prototype 标准组件**纳入官方标准库**
（自举行为）；同时额外提供一个 prototype plugin，组件先打 **alpha**
标签独立迭代（涉及"元能力/MetaFunctions"，变动预期大），稳定后再
收编。元能力本身对社区有贡献价值——别人也能用它做特别的 Agent 产品。

## 3. 状态设计的表达方式：纯文件 vs 注入协议

v0 裁决：状态矩阵 = Agent 写真实代码文件（button-idle.svelte /
button-loading.svelte 或矩阵包装），frame 不发明 props/state
注入协议。代价：状态副本之间有样板重复；好处：所见即真实代码，
Agent 的产出直接可移植进生产。

**潜在演进**：frame 级 `props` JSON + kit 提供常用状态包装器
（loading/disabled/success）可以砍掉重复——但要小心滑向"发明
第二套组件 API"。Owner 意见？

**Owner 裁决（2026-09-11）**：**代码优先**。产品定位 agent-first /
强 AI——本来能用代码更短更快表达的标准，再去抽象一层 JSON-AST 是
得不偿失（学习成本更高）。直接上 Svelte 代码。v0 的"真实文件表达
状态"裁决由此转正为长期方向；frame 级 props 注入协议不做了。

## 4. studio shell 的 dogfood 深度

包内默认 shell 不 import 宿主组件（包/宿主解耦），dogfood 经
`design/studio.svelte` 的可选槽。实验轮 shell 是极简自足样式。
**设计工具自己的 UI 不用 jixoai-ui 组件**这个事实有说服力代价
——"木匠家无家具"。完整 dogfood 需要解决"包如何引用宿主别名下
的组件"（别名注入协议），这是一个独立的 change 量级。

**Owner 裁决（2026-09-11）**："dogfood 深度"是个伪问题，撤回。
原则：从 svelte 标准落地找可行实现，不发明新工具/新概念（对 AI
也是额外学习成本）。studio chrome 成熟过程中自然用上 jixoai
组件，无需专门的 dogfood 计划。

## 5. 子代理摩擦点（反馈协议合流）

### A（标准层）报告的摩擦

1. **共享 vitest 基线已断**（最重要）：`registry/vitest.config.ts`
   import 的 `@jixoai/ui-vite-plugin` 在本机解析到仓库外一个空
   dist——主检出同样失败（预存，非本 change 造成）。A 的对策：
   独立 vitest config。这暴露了 file: 依赖 + 混装 npm/pnpm 的
   解析脆弱性——集成阶段决定是否修（或彻底转 workspace 协议）。
2. **registry/test/ 是 gitignored 车道**（编排者核验时发现，A 的
   摩擦点 3 的根因）：主检出里的"组件测试先例"全是未跟踪本地
   文件；A 的测试初版落在同车道 → 集成时迁至
   packages/design-tool/test/（被跟踪面）。
3. jsdom 环境缺口（无 CSS 全局/ResizeObserver）需 typeof 守卫；
   Svelte 5 mount effect 微任务 flush 的告警跨测试泄漏——测试
   侧 tick + WeakMap 去重。这些是 registry 组件测试基建的普适
   摩擦，值得沉淀为测试基建 note。
4. PrototypeKitContext.prototype 与 Object.prototype.prototype
   命名纠葛——getter 值字段模式（paint-zone 先例）解决；命名
   空间教训记录在案。

### B（工具层）报告的摩擦

1. **proposal 引用的"孤岛先例"路径失真**：`registry/files/routes/`
   是 gitignored 车道，真正的原型先例在 `apps/www/src/routes/
   prototypes/`；`registry/files/app.css` 是镜像文件（其 ./lib/*
   导入原位不可解析），probe 实际取 `apps/www/src/app.css`，
   `$lib` 基准取 `apps/www/src/lib`。**编排者简报里的仓库事实
   有一处失真**（我基于早期 ls 输出写的路径），B 以实证纠正——
   这条同时是"编排者简报质量"的教训。
2. **本仓库按车辆分装 node_modules**：根目录没有 vite/svelte，
   probe 必须先产出 moduleRoot 才能配插件；`import.meta.resolve`
   双参形态与 `require.resolve` 都不适配纯 ESM exports-map →
   自写 106 行 exports-map 感知解析器（这段代码有独立沉淀价值）。
3. **vite 8 environments 语义**：顶层 optimizeDeps.exclude 到不了
   vite-plugin-svelte 的 configEnvironment（ssr env 仍注入
   SVELTE_IMPORTS）→ client/ssr 双 env 显式 exclude；
   `optimizeDeps.include:['svelte']` 会把扫描器拖进 apps/www
   缺失的 .svelte-kit tsconfig（TSCONFIG_ERROR）→ 弃用。
4. **svelte 目录别名不可行**（internals 经 exports map 进 src/）→
   按 exports 枚举逐条精确文件别名（browser 条件优先）。
5. **虚拟入口落地的现实修正**：虚拟 id 词表保留，但 resolveId
   映射到包内真实文件——虚拟模块内 `import.meta.glob` 的变换
   行为不可证，真实文件 + 稳定 id 等价且更稳（简报预授权的
   "最小改动调整"，但值得记录：vite 虚拟模块里写 glob 的风险）。
6. `@tailwindcss/vite` 是 default export（非具名）——防御式选取。
7. **源码分发的 node 限制**：`.ts` 进 node_modules 触发
   ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING——实验轮仅 monorepo
   车辆可用，发布形态（预编译 dist 或 JIT shim）是后续议题。

### 编排者集成阶段新增

- kit 测试套件原落 `registry/test/prototype-kit/`（gitignored
  dev-syncer 车道，A 摩擦点 3 的根因）→ 迁 `packages/design-tool/
  test/kit/`；迁移暴露 @testing-library 源码分发的 runes 编译
  依赖（server.deps.inline 修复，config 注释记录）。
- worktree symlink 的 node_modules 不匹配 dir-only gitignore 模式
  → .gitignore 加 slashless twin（design-studio 特有场景）。
- `--agent dsh` 全回路真实跑通（dsh 写 dsh-probe 原型 → 三面 200），
  但 headless 单回合适配无流式粒度、无跨回合记忆——sdk profile
  （JSON-RPC stdio）是正式形态，见 dsh-probe.md。

### V5 真实浏览器走查抓到的盲区（2026-09-11，已修）

**方法论教训（重要）**：HTTP 层冒烟（curl HTML 壳 + 深模块 URL）
给出了全 200 的假绿——canvas 模块图是浏览器端动态 import 组装的，
壳 200 ≠ 图通。真实浏览器走查是唯一诚实层。两个真阻塞：

1. **TSCONFIG_ERROR 500**：worktree 从未跑 `svelte-kit sync`，
   `apps/www/tsconfig.json` extends 的 `.svelte-kit/tsconfig.json`
   缺失 → 所有经过 $lib（aliased 到 apps/www/src/lib）的 TS 变换
   500 → 画布在浏览器全断（CANVAS MISS，0 iframe）。
   修复：design.mjs 车辆 bootstrap——探测到 sveltekit 车辆缺
   generated tsconfig 时自动 `svelte-kit sync`（只写生成缓存，
   "studio tooling 只写 design/"法则的显式豁免，注释在案）。
2. **字体 403**：fontsource 资产经 realpath 的 node_modules 解析，
   symlink worktree 下落在所有 fs.allow 根之外 → fs.allow 补
   moduleRoot 的 realpath node_modules。
3. 小修：默认画布优先 welcome（原按字母序落在报错的 dsh-probe）；
   chat 流自动滚底（原最后一行被截半行）。
4. vision 子代理披露的工具链摩擦：ZCode 内置浏览器桥接在子代理
   上下文不可用、agent-browser CLI 截图命令损坏（EAGAIN）——最终
   用仓库自带 playwright-core + Chrome for Testing headless 完成
   走查。（skill/环境改进素材。）

### V5 终验结论（2026-09-11，同日第二轮修复后）

welcome 画布十帧全为真 iframe：hero 页三视口（390 单列堆叠 /
768 过渡 / 1280 横排）肉眼可辨，DARK 行实测真黑根
（`oklch(0 0 0)` vs 亮帧 `oklch(1 0 0)`），press 四态中三态一眼
可辨（disabled 与 idle 对比度留观——组件本体课题，非工具课题）。
dsh-probe 渲染真 hi 按钮。console 仅剩 favicon 404（良性）。

最后一轮抓到的第三个集成缝：kit 的 design-host 标记
（VITE_JIXOAI_DESIGN）由 kit 作者记录、却无人设置——两条
工作流的缝没人认领，一行 define 修复。**这条与 TSCONFIG 同属
"A/B 并行开发的契约遗漏"类**：URL 契约钉死了所以没出事，
契约之外的环境预期（host 标记、tsconfig、字体路径）三处全漏。
多代理并行开发的教训：环境性对接项（env/全局标记/生成文件）
必须像 URL 契约一样白纸黑字进 design.md，否则必然漏。

## 6. 实验轮遗留门禁（不阻塞讨论，合并前须清）

- `verify:shadcn-add` 打包门禁未跑（网络重：镜像打包 npm mirror）
  ——prototype-kit 条目字段已自检，镜像桥实装验证待做。
- registry/package.json 新依赖边的 lockfile 未再生（需 npm install，
  会经 symlink 触碰主检出——刻意留到 Owner 检查点之后）。
- prototype-kit 的站点文档页（meta.href 指向的
  /docs/components/prototype-kit.html）未建——routes 车道在
  apps/www，属文档站变更，超出本实验边界。
- V2 的浏览器内 HMR 体验（编辑保存→iframe 无刷新更新）只在模块图
  层验证过；真编辑器往返的走查留待日常使用中观察。
- 共享 vitest 基线的 file: symlink 解析问题（A 摩擦点 1）未修——
  属本机 node_modules 状态问题，修法（重装 registry 依赖）会动
  主检出，留 Owner 决定。

## 7. 讨论引导（Owner 最省力的读法）

按决策权重：**§1（dsh 绑定与分发形态）> §2（标准是否随工具走）
> §3（状态表达方式）> §4（dogfood 深度）**；§5 是过程摩擦存档，
§6 是合并前清单。都读不完的话：产品回路已真实闭环（echo 剧本
+ dsh 真模型都写出了可渲染的原型），剩下的全是形态与取舍问题。

