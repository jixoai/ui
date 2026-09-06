# highlight-engine-matrix design notes

## D1 — 为什么是"一引擎一 item"而不是可选依赖

shadcn registry 的 `dependencies` 字段没有"可选依赖"语义——装了就
`npm install`。所以"默认单引擎 + 按需加引擎"只有一条 registry 惯用
解：每引擎一个 item，各自声明自己的 npm 依赖；core（`highlight`）
退化为纯契约（backend.ts + context-key.ts，零 npm 依赖）。code-card
的默认引擎经 registryDependencies 指向 `@jixoai/highlight-shiki`，npm
面只剩 `shiki`——"默认只提供单个引擎和该引擎的全部能力"落成依赖
闭包的形状，而不是运行时判断。

target 路径全部保持 `@lib/highlight/<file>`：item 边界动了，目录
不动，消费者的 `$lib/highlight/prismjs` 导入在升级后无需改写。

### 依赖闭包矩阵（Codex r1 A1/A2/B1 修正——registry 图与 npm 图分离声明）

| item | files | registryDependencies | npm dependencies（版本钉在探测实证口径，r2-3） |
|---|---|---|---|
| `highlight` (core) | backend.ts, context-key.ts | （无） | （无） |
| `highlight-shiki` | shiki.ts | **@jixoai/highlight + @jixoai/shiki** | （shiki 经 @jixoai/shiki 传递） |
| `highlight-prismjs` | prismjs.ts, vendor-prismjs.d.ts | @jixoai/highlight | prismjs@^1.30.0 |
| `highlight-microlighter` | microlighter.ts, vendor-microlighter.d.ts | @jixoai/highlight | microlighter@^2.1.0 |
| `highlight-highlightjs` | highlight-js.ts, highlight-js-jixoai.css | @jixoai/highlight | highlight.js@^11.12.0 |
| `highlight-sugar-high` | sugar-high.ts | @jixoai/highlight | sugar-high@^2.3.1 |
| `highlight-tree-sitter` | tree-sitter.ts, tree-sitter-queries.ts | @jixoai/highlight | web-tree-sitter@^0.27.0, tree-sitter-typescript@^0.23.2, tree-sitter-javascript@^0.23.1 |
| `code-card` | （不变） | jixoai-theme, **highlight, highlight-shiki**, utils, icons | **仅 shiki** |
| `inline-code` | （不变） | @jixoai/shiki 等（不变） | （不变） |

版本策略：caret 下限 = 探测实证版本（evidence/npm-probe-2026-09-06.md）；
clean-consumer 探针断言解析到的版本与 wasm 子路径在实证范围内（ABI
窗口随之被锁进 lockfile 语义）。

所有权裁决（Codex r1 A1/A2）：

- `lib/shiki.ts`（facade）**保持独立 item**（inline-code 也在消费它），
  highlight-shiki 显式声明 `@jixoai/shiki` 边——引擎 item 的法则表述
  修订为"声明 @jixoai/highlight **加它实际导入的任何跨 item 文件
  owner**"（spec 同步修订）。
- `context.svelte.ts` **维持 site-only**（mirror-manifest siteOnly 现状；
  现行法则 "context-kernel wiring stays app-side — no kernel dependency
  rides the item" 不变）。随 item 发行的 seam 只有零依赖的 context-key.ts
  （HIGHLIGHT_KEY + HighlightContextValue）；消费者子树默认值的配方 =
  文档页交付的 ~10 行自写 provider（`setContext(HIGHLIGHT_KEY, …)`）。
  verify:shadcn-add 增补 fixture：code-card + 每个 engine item 在 clean
  consumer 中安装 + typecheck 通过（context/kernel/默认 backend 三态
  的可安装性由该探针实证）。

## D2 — 工厂选项 = per-instance 允许集闭包

`langs` 选项不改模块级共享注册表（两个 shiki() 实例带不同允许集不能
互踩）；backend 实例闭包持有 canonical 化后的允许集，`highlight()` 入
口先做集内校验，集外 lang reject 带提示（→ 卡片纯文本回退，与未知
lang 同一条 law）。默认（无选项）= curated 全集。shiki 的
`registerLanguage/registerTheme` 扩展 API 不受影响（注册表照旧，允许
集只做"门"，不做"册"）。

这是"对每个引擎定制来减少体积"的统一表达：hljs 的 core+选择性注册、
prism 的语法链裁剪、shiki 的 grammar chunk 裁剪、tree-sitter 的
grammar wasm 裁剪，同一个选项名，各自的引擎语义。

**裁剪的语义边界（终审 r1 阻塞修正）**：langs 裁的是**运行时加载闭包**
——未选语法零注册、零 import、零网络请求；不是构建图裁剪。构建图保持
全集懒 chunk（静态 loader map 的必然，也是仓库 engine-minissearch 懒
加载法则的既定形态）。零构建法则（"不需要编译，只是一个默认的值"）
禁止引入编译期选择机制；若未来确需构建图裁剪，那是独立的构建期
feature，不属于本矩阵的运行时契约。

## D3 — highlight.js：core + 选择性注册是旗舰场景

- `highlight.js/lib/core`（无语言）+ `import('highlight.js/lib/languages/<id>')`
  按需注册——这是 hljs 官方的减体积通道，也是本引擎存在的意义。
- 语言现实（2026-09-06 tarball 实证）：**无** tsx/jsx/svelte/vue 模块。
  curated 集 = typescript/javascript/xml/css/scss/json/bash/markdown/
  yaml；别名 ts/js/html/sh/md/yml/htm→xml 等，镜像 shiki facade 的
  别名表；tsx/jsx/svelte/vue → reject 提示"改用 shiki backend"。
- 主题：`jixoai` = item 内嵌 CSS（`hljs-keyword → var(--tok-token-keyword)`
  等，~25 条规则，零下载，观感与 shiki 默认对齐）；其余名字 →
  `highlight.js/styles/*.css` 显式懒加载表（vite 无法静态分析模板化
  子路径——prism/microlighter 同款法则）。
- **语言边界法则（子代理 B 实测回写）**：hljs 语法模块会向引擎
  注册表自报别名——typescript 自报 `ts` **和 `tsx`**。curated 边界
  必须以自维护表为准（reject 检查先于 `getLanguage`），不得信任
  引擎自身的别名注册，否则 tsx 会直接涂色穿透 reject 契约。
- **类系引擎的语义损耗（已接受的妥协）**：`hljs-attr` 一个类在
  shiki scope 表里横跨三种颜色（xml 属性名→function、json/yaml
  键→keyword、对象键→前景），类选择器只能取一——取 keyword
  （json+yaml 是量最大家族），CSS 头注释记录。这是 class 系
  （hljs/prism）相对 scope 系（shiki/tree-sitter query）的固有
  损耗，非缺陷。实测口径：41 个 distinct 类 token → 34 条规则
  （非估算）；diff 三词表（addition/deletion/change）为语义确定
  的稳定词表映射，非实测枚举，出处注明。
- 类型：hljs 11.12 自带（`types/index.d.ts` + `lib/*.d.ts`），
  **不加** @types/highlight.js。

## D4 — sugar-high：2.x 现实修正

设计期假设"sugar-high 仅 JS/TS"已被 2.3.1 事实推翻：现在是 29 语言
多语言引擎，`highlight(code, {lang})` 直接返回 HTML 字符串。这个修正
反而简化集成：markup backend 的最短路径（转义由引擎负责，我们只做
语言名 canonical 化 + 内嵌 CSS 接线）。零选项豁免的依据从"只有
JS/TS"改为"全量即极简"（TS 场景 9.9KB min / 4.35KB gzip，其自带
基准表低于 prism 14.6KB 与 hljs 29.5KB；按语言拆分不是它的发行模型）。
`lang` 别名收敛到它的 29 个 canonical 名（ts→typescript、js/jsx→
javascript——JSX 是其 JS 语法的原生方言、sh→shell、md→markdown、
yml→yaml…），tsx 不设别名 → reject 提示改用 shiki backend；其余集外
lang 同样 reject 带提示。

## D5 — tree-sitter：markup + query + npm wasm 资产

- **输出模型选 markup**（span + inline `color:var(--tok-token-*)`，
  inline-code 的渲染先例）：print freeze 克隆存活；range 模型继续由
  microlighter 独占（接口的"另一种形态"展示位，不稀释）。
- **query-based 高亮**：curated languages = typescript/tsx/javascript/
  jsx（tree-sitter-javascript 语法原生解析 JSX）。.scm 高亮 query 源码
  （MIT，取自 tree-sitter-{typescript,javascript} 仓库）内嵌为
  `tree-sitter-queries.ts` 常量；capture 名（@keyword/@string/
  @function/@type/…）→ `--tok-token-*` 映射表在 backend 文件内。
  多 capture 区间重叠时短区间胜（更具体的节点）；渲染前源码切片
  实体转义。
- **wasm 资产 = npm 源**（Owner 裁决"npm 靠谱就用 npm"；2026-09-06
  tarball 探测实证三个包全部自带 wasm + 类型 + queries）：
  `web-tree-sitter@0.27.0`（`web-tree-sitter.wasm` + `.d.ts`）、
  `tree-sitter-typescript@0.23.2`（`tree-sitter-typescript.wasm` +
  `tree-sitter-tsx.wasm`）、`tree-sitter-javascript@0.23.1`
  （`tree-sitter-javascript.wasm`）。经 **动态 `?url` 导入**自托管：
  资产由消费者 bundler 从 node_modules 发射，供应链 = lockfile，
  懒加载法则不破（?url 也在 lazy chunk 里）。`wasmBase` 选项覆写
  为任意自定基址（自建 CDN / 内网）。不建 ghostty 式 pin 工作流
  （那是 GitHub release 独家资产的纪律；npm 有 lockfile 纪律）。
- **ABI 注意**：grammar 包 0.23.x 的 wasm ABI（14/15）在
  web-tree-sitter 0.27 的支持窗口内；测试必须真实加载 wasm 断言
  一次（不是 mock），防 ABI 漂移静默炸。
- **wasm 装载 seam（Codex r1 A4 / r2-2 冻结版——file:// 不是浏览器证据，
  URL 与字节是两条通道）**：backend 不直接触碰 `?url`，统一经
  `wasmLoader(asset)` 解析：

  ```ts
  type WasmAsset =
    | { kind: 'core' }
    | { kind: 'grammar'; id: 'typescript' | 'tsx' | 'javascript' };  // jsx → javascript 语法（无独立 wasm/grammar）
  type WasmSource = { url: string } | { bytes: Uint8Array };
  treeSitter({
    langs?: string[],
    wasmBase?: string,                                       // 字符串前缀糖：{url: `${wasmBase}${basename}`}，覆盖 core+grammar 全部 wasm（不覆盖内嵌 query）
    wasmLoader?: (asset: WasmAsset) => Promise<WasmSource>,  // 完全接管（字节级）
  })
  ```

  接线契约（冻结；0.27 `.d.ts` 实测为准，偏差以真实初始化测试锁定）：

  | source 形态 | core | grammar |
  |---|---|---|
  | `{url}` | `Parser.init({ locateFile: () => url })` | `Language.load(url)` |
  | `{bytes}` | `Parser.init({ wasmBinary: bytes })`（Emscripten 标准入口） | `Language.load(bytes)` |

  - **静态 import map（vite 法则：`?url` 不能运行时拼接；r3-1 修正
    core 文件名——包 exports 实测为 `"./web-tree-sitter.wasm":
    "./web-tree-sitter.wasm"`，语法包无 exports 字段全文件可解析）**：
    默认 browser loader 是一张**字面量**映射表——
    `core: () => import('web-tree-sitter/web-tree-sitter.wasm?url')`、
    `typescript: () => import('tree-sitter-typescript/tree-sitter-typescript.wasm?url')`、
    `tsx: () => import('tree-sitter-typescript/tree-sitter-tsx.wasm?url')`、
    `javascript: () => import('tree-sitter-javascript/tree-sitter-javascript.wasm?url')`。
    环境选择无运行时探测：默认 = URL map（浏览器/vite 构建）；
    vitest 测试**显式注入** bytes loader（`createRequire(import.meta.url)
    .resolve('<pkg>/<file>.wasm')` → `readFile` → `{bytes}`，node 24 原生
    跑 wasm）。两条路径都做**真实** wasm 初始化，零 mock。
  - **singleton 语义（r2-B4）**：`Parser.init` 模块级单例 promise，失败
    清缓存可重试（仓库既有 hardening 法则）；grammar 经 loadOnce 按
    id 去重；每张卡不重复 init。
  - **真实 HTTP 验收**：verify:shadcn-add 的 tree-sitter case 在 clean
    consumer 里 build（覆盖全部四个静态 URL import）→ serve dist →
    fetch 每个 wasm URL → 断言 wasm magic 字节（`\0asm`）——core/
    typescript/tsx/javascript 四资产均成功发射的端到端证据。
  - **loader 优先级（r4-B 系）**：`wasmLoader` > `wasmBase` > 默认静态
    URL map——显式注入完全接管；`wasmBase` 仅在未注入 loader 时生效，
    拼接规则 `${wasmBase}${basename}`（base 需自带尾部 `/`，文档注明）。
  - **attribution（r2-B6）**：tree-sitter-queries.ts 头部携带上游
   （tree-sitter-typescript / tree-sitter-javascript，MIT）来源与版本
    注释。
- **lazy 边界（Codex r1 A5）**：lazy 法则约束的是**可下载/可分块单元**
  （引擎包模块、语法、样式、wasm、query 包源码）——它们一律在
  `highlight()` 首次 paint 时动态 import；内嵌 query 常量是 backend
  源码的一部分（无网络行为），随 item 文件本身分发，不属此列。契约
  测试断言"仅构造 backend、未 paint 时零引擎代码加载"（prism 的
  window.Prism 标记法 + vi.mock 计数法并行）。

### D5 附注——子代理 D 实测回写（实现期冻结的三个细则）

- **query 组合法则**：包内 `queries/highlights.scm` 是按"补充件"组织
  的——tree-sitter-typescript 的 highlights.scm 仅 35 行 TS 补充捕获，
  无 string/comment/function 基础捕获。组合必须按**语法**拼装：
  javascript = JS + JSX；typescript = JS + TS；tsx = JS + TS + JSX。
  （JSX query 打在纯 TS 语法上是 QueryError：Bad node name
  'jsx_opening_element'，实测复现。）
- **重叠绘制取"减法"而非"丢弃"**：design 只冻结了"短区间胜"；
  实现细化——胜出 span 完整绘制，较长 span 绘制其**未被覆盖的余量**
  （等长时后捕获胜）。整段丢弃较长区间会让模板字符串里的 `${}`
  标点丢掉整串 string 色。
- **EmscriptenModule 类型缺口**：web-tree-sitter 的 .d.ts 引用该类型
  但不随包下发（发布方 @types/emscripten 是 devDep）；vendor d.ts
  补齐实际用到的 locateFile/wasmBinary 两成员。`Language.load` 原生
  接受 `string | URL | Uint8Array`，四象限语义与冻结表零偏差。
- `'constructor'` 是真实 capture 名——映射表必须用 Map（plain object
  会命中 Object.prototype.constructor，探针实测踩中）。

## D6 — 破坏性变更清单（一次性说清，不写迁移胶水）

| 变更 | 迁移 |
|---|---|
| code-card 不再捆绑 prismjs/microlighter | `shadcn add @jixoai/highlight-prismjs` 等 |
| `highlight` item 文件清单收窄为 core 两件 | 引擎工厂改从各引擎 item 的同名文件导入（路径不变，item 边界变） |
| vendor.d.ts 拆分为 vendor-prismjs/vendor-microlighter | 随各引擎 item 发行 |

## D7 — 验证面

- 契约测试扩展（`code-card-backend.spec.ts` 系）：每新引擎——懒加载
  首次才 import、未知/集外 lang reject → 纯文本回退、主题映射、
  允许集选项、（tree-sitter）真实 wasm 加载断言。
- hljs 类清单 snapshot（r2-B3）：对真实 `highlight()` 输出的类集合
  建 snapshot 文件；失败输出 diff 与"以 `-u` 更新、先核对引擎版本"
  的流程注释随 snapshot 落盘。
- 既有门禁全绿：verify:mirror（双树字节镜像）/ verify:deps（item
  边声明）/ verify:meta / verify:budgets（懒 chunk 不进 entry）/
  test:types 双树 / verify:docs / search-corpus 再生。
- **verify:shadcn-add 的引擎矩阵自动化（r2-4 具体化）**：CASES 不再
  手工列举——从 registry.json 的 `highlight-*` 条目**自动生成**隔离
  case（每个 engine item 一个），逐项断言：canonical files 落盘到
  alias 解析路径、npm 依赖只含本引擎（无 sibling engine 包）、
  consumer typecheck 通过；tree-sitter case 追加 build → serve dist →
  fetch wasm → magic 字节断言（?url 端到端）；code-card case 断言
  默认闭包 = 仅 shiki。

## D8 — core 边的活性：共享运行时助手（不是门禁 hack）

拆分后引擎工厂对 core `backend.ts` 的导入若只是 `import type {
HighlightBackend }`，verify-deps 的提取器会跳过 type-only import
（"erase at compile time"语义）→ 引擎 item 声明的 `@jixoai/highlight`
边被判 **dead**。但安装完整性上这条边是真实必需的（消费者
svelte-check 需要该文件在场；现行生态的答案是声明边 + baseline 台账
吃 dead 记账，如 `component-canvas -> @jixoai/shiki`——但台账只许
收缩，新增 5 条 dead 边是倒退，不可取）。

干净解法：`backend.ts` 导出两个**所有引擎今天都在重复**的运行时
助手，引擎工厂改为 value import——边自然"活"，且是真 DRY：

```ts
/** the lang a paint requested — every factory repeats this today */
export function requestedLang(opts: { lang?: string }): string {
  return opts.lang ?? 'ts';
}
/** alias canonicalization — `aliases[lang] ?? lang`, per-engine table */
export function canonicalLang(
  aliases: Record<string, string>,
  lang: string,
): string {
  return aliases[lang] ?? lang;
}
```

shiki 后端已有的 `applyDeclarations` 保持原样（只有它用）。不引入
任何仅为满足门禁的伪价值导入。
