# highlight-engine-matrix — CodeCard 引擎矩阵与单引擎默认

## Why

Owner 需求（2026-09-06）：

> CodeBlock 组件底层引入多种引擎，当前的引擎作为默认引擎。（引擎按需
> 加载）候选项目：microlighter / highlight.js / prismjs / shiki /
> Tree-sitter / sugar-high。支持通过插件配置默认高亮引擎和语法支持，
> 默认是只提供单个引擎和该引擎的全部能力。但是可以做到打包到多个引
> 擎，并对每个引擎做定制（如果引擎支持的话）来减少体积。

现状（2026-09-02 `highlight-backend-pluggable` 已落地，不重复建设）：
`HighlightBackend` 接口（markup/range 双输出模型）、`HIGHLIGHT_DEF`
context seam、`shiki()/prismjs()/microLighter()` 三工厂、全引擎懒加载、
`prop → context → DEFAULT_SHIKI_BACKEND` 解析链，全部就位。

真实缺口（3 个）：

1. **候选引擎缺 3 个**：highlight.js、sugar-high、tree-sitter。
2. **默认捆绑违背单引擎法则**：`code-card` 与 `highlight` 两个 item 把
   prismjs + microlighter 写进 npm `dependencies` —— 消费者装 code-card
   即装下全部三引擎，与"默认只提供单个引擎"直接矛盾。
3. **语法集不可定制**：curated 语言集是 backend 文件里的模块级常量，
   没有"按引擎裁剪语法集以减体积"的通道。

## What Changes

**E1 — 引擎矩阵补全（3 个新 backend，全部懒加载）**

- **highlight.js**（markup）：`lib/core` + 按需注册语言——`langs`
  选项是本引擎的旗舰场景（core+选择性注册 vs 全量 bundle 的体积差）。
  探测实证（2026-09-06 tarball）：hljs 11.12 **没有** tsx/jsx/svelte/vue
  语言模块（curated 集 = typescript/javascript/xml/css/scss/json/bash/
  markdown/yaml + 别名；tsx/jsx/svelte/vue → reject 并提示改用 shiki）；
  11.12 自带类型（types/ + lib/*.d.ts），**不需要** @types/highlight.js。
  `jixoai` 主题 = item 内嵌 CSS 把 `hljs-*` 类映射到 `var(--tok-token-*)`
  （零下载，与 shiki 默认观感对齐）；其余主题名 → `highlight.js/styles/*.css`
  懒加载 curated 表。
- **sugar-high**（markup）：探测修正——sugar-high 2.3.1 已是**多语言**
  引擎（29 种 canonical 语言，JS/TS/JSX 为默认强项），`highlight(code,
  {lang})` 直接返回 HTML 字符串（无 DOM 依赖），TS 场景 ~10KB（全矩阵
  最小；其 README 基准**测于 2.2.2**，引用按此口径：sugar-high 9.9KB vs
  prism 14.6KB vs hljs 29.5KB）。零选项（引擎自身即极简，"如果引擎
  支持的话"的豁免分支）。别名：ts→typescript、js/jsx→javascript（JSX
  为其 JS 语法原生方言）、sh→shell 等；tsx 无对应 → reject 提示改用
  shiki（详见 evidence/npm-probe-2026-09-06.md）。
- **tree-sitter**（markup，print 存活；range 模型继续由 microlighter
  独占展示）：web-tree-sitter + query-based 高亮（.scm capture →
  `--tok-token-*`），curated = typescript/tsx/javascript/jsx。
  **wasm 资产走 npm 源**（Owner 裁决：npm 靠谱即用 npm）——探测实证：
  `web-tree-sitter@0.27.0` 自带 `web-tree-sitter.wasm` + `.d.ts`；
  `tree-sitter-typescript@0.23.2` 自带 `tree-sitter-typescript.wasm` +
  `tree-sitter-tsx.wasm` + queries；`tree-sitter-javascript@0.23.1` 自带
  `tree-sitter-javascript.wasm` + `highlights-jsx.scm`。经 vite 动态
  `?url` 导入自托管（供应链 = lockfile，无需 ghostty 式 pin 工作流）；
  `wasmBase` 选项可覆写为自定地址；query 源码（MIT）内嵌为 item 内
  TS 常量。

**E2 — registry 拆分：一引擎一 item，默认单引擎（破坏性）**

```
highlight (core, engines)      backend.ts + context-key.ts，零 npm 依赖
highlight-shiki                shiki.ts（+工厂选项）→ deps: @jixoai/highlight + @jixoai/shiki
highlight-prismjs              prismjs.ts + vendor-prismjs.d.ts
highlight-microlighter         microlighter.ts + vendor-microlighter.d.ts
highlight-highlightjs          highlight-js.ts + highlight-js-jixoai.css（新）
highlight-sugar-high           sugar-high.ts（新）
highlight-tree-sitter          tree-sitter.ts + tree-sitter-queries.ts（新）
```

`code-card`：npm deps 瘦身为 `["shiki"]`，registryDeps 追加
`@jixoai/highlight-shiki`。**破坏性声明（不写胶水，边界完整列出——
Codex r1 A6 修正）**：

| 旧安装形态 | 拆分后失去 | 迁移命令 |
|---|---|---|
| `@jixoai/code-card`（默认） | prismjs/microlighter 的 npm 包与工厂文件 | 按需 `shadcn add @jixoai/highlight-prismjs`（或 -microlighter / -highlightjs / -sugar-high / -tree-sitter） |
| `@jixoai/highlight`（直接装） | shiki/prismjs/microlighter 三个工厂文件与 vendor 声明 | 装对应 `highlight-*` item（`$lib/highlight/<engine>` 路径对已装引擎保持不变） |

消费者加引擎 = `shadcn add @jixoai/highlight-prismjs`（各自只带自己的
npm 依赖）；文件仍落 `@lib/highlight/` 同一目录，**`$lib/highlight/<engine>`
导入路径仅对安装了对应 engine item 的消费者保持不变**。

**E3 — 语法定制通道：工厂选项（不新增配置机制）**

`shiki({ langs })` / `prismjs({ langs })` / `highlightJs({ langs })` /
`treeSitter({ langs, wasmBase, wasmLoader })` —— per-instance 允许集（闭包持有，
不改共享注册表，多实例不互踩）；默认（无选项）= 该引擎 curated 全集
（"全部能力"）；集外 lang → reject 带提示 → 卡片纯文本回退（既有 law）。
microlighter / sugar-high 无语法选项（引擎不支持选择性语法，写入 spec 豁免条款）。

配置面分层（Codex r1 A1 修正——示例只含**可安装**的通道）：

```ts
// ① per-instance（任何消费者可用）
<CodeCard code={src} backend={highlightJs({ langs: ['ts', 'bash'] })} />

// ② 子树默认值：消费者自写 ~10 行 provider（随文档交付配方），
//    基于随 item 发行的零依赖 seam（HIGHLIGHT_KEY / HighlightContextValue）
setContext(HIGHLIGHT_KEY, { backend: prismjs() });   // 任意组件根

// ③ 内核插件形态（site 参考实现 context.svelte.ts 仍为 site-only，
//    不随 item 发行——现行 "no kernel dependency rides the item" 法则不变）
definePlugin({ targets: [HIGHLIGHT_DEF], filter: (_def, env) => isPrintProjection(env.medium), before: () => shiki() })
```

**E4 — 站点与文档**

code-card 文档页新增引擎矩阵区（输出模型/体积姿态/语法覆盖/定制能力/
print 行为对照表）+ playground 引擎切换；blueprints/highlight.svelte 架构
图更新；两树 package.json 增依赖（版本钉在探测实证口径：
highlight.js@^11.12.0 / sugar-high@^2.3.1 / web-tree-sitter@^0.27.0 /
tree-sitter-typescript@^0.23.2 / tree-sitter-javascript@^0.23.1，
registry.json 各 item 同口径）。

## 分工

- 子代理 B：highlight.js backend（E1-hljs）
- 子代理 C：sugar-high backend（E1-sugar）
- 子代理 D：tree-sitter backend（E1-tree-sitter，含 vitest 下 wasm
  加载通道的实现验证）
- 子代理 E（vision 协助）：文档页引擎矩阵 + playground + blueprints（E4）
- ZCode 直担：E2 拆分、E3 选项化、共享文件（registry.json / 两树
  package.json / mirror-manifest / 测试骨架）、整合门禁与 Codex 送审

## 破坏性变更（声明）

装 `code-card` 不再捆绑 prismjs/microlighter（AGENTS.md 大胆更新法则：
不做向下兼容，不写胶水代码）。迁移路径一行：`shadcn add @jixoai/highlight-<engine>`。
registry docs 与 README 说明同步。
