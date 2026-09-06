# lang-detection — 增量

## ADDED Requirements

### Requirement: 语言检测是独立契约，三检测环 + null 级联

系统 SHALL 提供 `LanguageDetector` 契约（`detect({ code, filename }) →
Promise<DetectResult | null>`；DetectResult 携带 canonical lang、分层
source 标记与可选 confidence）与 `AUTO_LANG = 'auto'` 常量，随
`highlight` core item 发行且不引入任何 npm 依赖；`lang` prop 保持
string 类型，AUTO_LANG 为运行时哨兵（**严格全等 `lang === AUTO_LANG`，
无 trim、大小写敏感**，其余值一律按普通 lang 走既有路径）。

卡片 `lang === AUTO_LANG` 时 SHALL 按序解析检测器——**检测环三个**：
① `langDetector` prop 非 undefined；② `HIGHLIGHT_DETECT_KEY` context
对象且 `.detector` 为函数；③ `backend.detector` 为函数；三环皆缺 →
（非环的链尾终态）运行时 reject，报错文本给出 DLD 安装命令与两种
接线形态指引。

**null 级联法则**：某环 detector resolve null（无意见）SHALL 级联下一
环；某环 reject/throw（终态）SHALL 纯文本回退 + warn 报出该环 id 与
错误；链上全部可用环皆 null SHALL 纯文本回退 + warn 报出各环 id。
**reject/warn 文本契约**：兜底 reject 与终态 warn 的文本 SHALL 包含
缺失的 detector 环描述、DLD 安装命令与两种接线形态指引——错误
字符串断言列入契约测试（r5-N6）。
检测产出的 lang SHALL 走既有别名/curated/reject 法则。`lang` 非
AUTO_LANG 时一切存量行为逐字节不变，检测路径零字节加载。

**零静态 import 法则**：卡片与 core SHALL NOT 引用 DLD 的任何
specifier（动态亦不可——bundler 构建期解析静态字符串，裸消费者无法
构建）；DLD 的默认地位 SHALL 经 context 默认值落地。**provider 作用
域法则（r2）**：Svelte context 只向子树传播——接线 SHALL 为包装形态
之一：① registry:ui item `highlight-detect-default` 的
`<HighlightDetectDefault>` children 包装组件，或 ② 子树根组件
`<script>` 手写 `setContext(HIGHLIGHT_DETECT_KEY, { detector:
defaultLangDetector() })`；嵌套 provider 取最近值；lib item 保持
framework-free（组件不进 lib item）。DLD 与 wrapper 均 runtime
import core 的 `HIGHLIGHT_DETECT_KEY`/`AUTO_LANG` 保持 registry 边
活性。

**检测终态法则（r2）**：检测成功而 backend 的 curated/reject 拒绝
SHALL 为终态——reject 消息按矩阵失败法则点名覆盖引擎，不回退换检测
器重试。

#### Scenario: SSR 恒纯文本

- **WHEN** 页面预渲染/prerender 构建包含 `lang={AUTO_LANG}` 卡片
- **THEN** 产物为纯文本（检测零调用——构建期 detector 调用计数为 0
  的断言），hydration 后首次 paint 才进检测链

#### Scenario: AUTO_LANG 哨兵边界

- **WHEN** lang 取值 `'AUTO'`、`' auto '`、`'auto\n'`
- **THEN** 皆不触发检测（严格全等 `lang === AUTO_LANG`，无 trim；
  这些值按普通 lang 走既有路径并由 backend reject 法则处理）

#### Scenario: prop 压过一切

- **WHEN** 卡片写 `lang={AUTO_LANG}` 且 `langDetector={betlangDetector()}`
- **THEN** 检测走显式 detector，context 默认与 backend 自带 detector
  均不参与

#### Scenario: null 级联（互补语义）

- **WHEN** prop detector 对样本返回 null，context 默认为
  `defaultLangDetector()`
- **THEN** DLD 继续检测；DLD 亦 null 且 backend 无 detector 时纯文本
  回退 + warn 列出两环结论

#### Scenario: reject 终态

- **WHEN** context 默认的 betlang wasm 加载失败（reject）
- **THEN** 不再级联，纯文本回退 + warn 报出 betlang 环错误

#### Scenario: hljs 卡片不写 detector

- **WHEN** `lang={AUTO_LANG}`、无 prop、无 context 默认、backend 为
  `highlightJs()` 系
- **THEN** 使用该 backend 实例自带的 highlightAuto 检测（D7 冻结语义：
  私有 lib/core、候选 = 实例 langs 集、空集 → null、无命中 → null、
  不带 confidence）

#### Scenario: 裸消费者运行时 reject

- **WHEN** 未装 DLD、未接线、backend 无 detector、卡片 `lang="auto"`
- **THEN** 运行时 reject 报安装命令与接线指引，卡片纯文本回退；
  构建图中不存在任何 DLD 字节

#### Scenario: canonical 权威表恰好一次

- **WHEN** lang-canonical.ts 编纂完成
- **THEN** 每 betlang 标签恰好映射一个 canonical id 或显式 `-`（无
  重复、无遗漏）；L1/L2 表与标签映射全部从该表派生

#### Scenario: 检测命中但引擎不支持

- **WHEN** 检测返回 rust，当前 backend 为 highlightJs()（curated 集
  不含 rust）
- **THEN** 终态：reject 消息点名 shiki 等覆盖引擎，卡片纯文本回退，
  不重试其它检测器

#### Scenario: 存量路径不变

- **WHEN** 卡片 `lang="ts"`（或任何非 auto 值）
- **THEN** 检测路径零字节加载，渲染与引擎矩阵行为逐字节一致

### Requirement: DLD 是四层瀑布，层层按需

默认检测器 DLD（`defaultLangDetector()`，registry item
`highlight-lang-detector`）SHALL 按低成本到高成本组织四层：L1
filename 层（扩展名表 + 精确 basename 表）、L2 shebang/meta 层（解释
器表 + 首行 modeline）、L3 特殊结构探针层、L4 betlang 统计层。每层
SHALL 是独立懒模块——前一层命中后行 SHALL 零加载后续层；L1/L2 的映射
表 SHALL 以多行字符串常量表达（首次使用才 parse 成 Map，进程级缓
存）。表数据源 SHALL 取 linguist languages.yml（extensions/filenames/
interpreters 字段）与本仓库 canonical 支持集的交集，挖掘时的 linguist
commit SHA SHALL 落表头注释；歧义扩展名（heuristics.yml 138 组消解
块覆盖的）SHALL 被排除出 L1，交由 L4。

#### Scenario: 扩展名即答案

- **WHEN** `lang={AUTO_LANG}`、filename 为 `main.ts`
- **THEN** L1 命中 typescript，L2-L4 模块零加载

#### Scenario: basename 即答案

- **WHEN** filename 为 `Dockerfile`（无扩展名）
- **THEN** L1 的 basename 表命中 dockerfile

#### Scenario: shebang 即答案

- **WHEN** 无 filename、code 首行 `#!/usr/bin/env python3`
- **THEN** L2 命中 python（`#!X` 与 `#!/usr/bin/env X` 两形态等价；
  `# -*- mode: X -*-` 首行 modeline 同层处理），L3/L4 模块零加载

#### Scenario: 层间短路可测

- **WHEN** L1 命中
- **THEN** L2-L4 模块加载计数为零（vi.mock 计数法断言）

### Requirement: 结构层只做高确判探针，不做编程语言指纹

DLD 结构层 SHALL 按 design D3.2 冻结伪码实现：规范化（strip BOM、
首非空行、512 字符头部窗口、非空行计数）→ **Markdown 守卫最高优先**
（任一 `^ {0,3}(?:\x60{3,}|~{3,})` 围栏——含 1-3 空格缩进与闭合
围栏，或 ≥2 个 `^ {0,3}#{1,6}\s` 标题行——标题密度阈值防 `# 注释`
单行误杀 TOML/YAML → 本层整体弃权；缩进围栏/闭合围栏/CRLF 入样本
矩阵；YAML 判据另含
front-matter 规则：第二个 `---` 后内容含任一 md 标记即弃权）→
JSON 全文 parse 硬判据 → SVG（`<svg` 根或 `<?xml…?><svg` 头窗组合，
优先于 XML）→ XML（`<?xml` 前缀）→ HTML（`<!doctype html`，大小写
不敏感）→ YAML（`---` 首行 + key-colon 行占比 ≥60%，≥3 非空行）→
TOML（section 整行 + ≥2 个两侧空格 `=`，≥3 非空行，TOML 优先于 INI）→
INI（section 整行 + ≥2 个无左侧空格 `=`）→ null。本层 SHALL NOT 对
编程语言做指纹检测；此类样本 SHALL 穿透到统计层。正负样本矩阵 SHALL
锁死 front-matter 边界（`---`+keys+`---`+md 标记正文 → 守卫弃权）与
markdown 链接（`[t](u)` 不触发 section 判据）。

#### Scenario: Markdown 干扰负样本

- **WHEN** `lang={AUTO_LANG}`、code 为含 Rust/Go/Kotlin/Swift 明显
  指纹的样本（无 filename、无 shebang）
- **THEN** 结构层不捕获任何语言，样本落到 L4 统计检测

#### Scenario: front-matter 边界

- **WHEN** 样本以 `---` + YAML keys + `---` 开头，`---` 后正文含任一
  Markdown 标记（标题/围栏/列表项）
- **THEN** front-matter 规则弃权，L3 不声明 yaml；无 md 标记的纯
  多文档 YAML 仍声明 yaml；单标题 + 围栏负样本与 TOML/INI 伪装样本
  入矩阵

#### Scenario: JSON 硬判据

- **WHEN** code 全文通过 JSON.parse
- **THEN** 声明 json（source=structure）；首字符 `{` 但解析失败
  SHALL NOT 声明

### Requirement: betlang 统计层过 KiB 字节门禁，wasm 不入 git

统计层 SHALL 由 betlang（crates.io 版本 `=0.1.1` 钉死）编译的 wasm
承载，发行通道 SHALL 为自建 npm 包 `@jixoai/betlang-wasm`（packages/
betlang-wasm，CI 构建发布；Cargo.lock + 工具链版本 + 完整 sha256 +
字节精确尺寸入 ARTIFACT.md——wasmRawBytes / wasmGzipBytes /
wasmSha256 / tarballSha256）。**门禁测量对象 = 且仅 = `.wasm` 文件
字节**（装载器 JS 与 tarball 不入预算）。预算 SHALL 以 KiB（1024
字节）字节精确计量：raw ≤ 100 KiB、内部预警线 raw 98 KiB、gzip ≤
70 KiB（Node zlib.gzipSync level 9，算法冻结）；探针基线 raw
100,055 B / gzip 58,461 B（sha256 56d0243d…82360）入 evidence。
`scripts/verify-betlang-pin.mjs` SHALL 核验 sha256、magic bytes 与双
预算；预警线越线 SHALL 触发降级预案（betlang 转非默认 detector
item，L4 换装 linguist 派生精简启发层——heuristics.yml 与 canonical
集有交集的 curated 子集、linguist SHA 版本化、同规格门禁与样本
矩阵，L4 章按实况改写后重新送审）。wasm 二进制 SHALL NOT 进入 git
与 registry payload。装载
SHALL 经 `wasmLoader → { url } | { bytes }` seam：浏览器走真实 HTTP
资产 URL，Node/vitest 走真实字节并真实初始化 wasm（不 mock，file://
不作为浏览器证据）。betlang 48 标签到 canonical id 的映射 SHALL 以
完整多行字符串表内嵌（版本绑定注释），无对应标签 SHALL 返回 null
并一次性 warn（每标签每进程至多一条）。

#### Scenario: wasmLoader 契约

- **WHEN** 消费者/测试自定义 wasmLoader
- **THEN** `{ url }` 与 `{ bytes }` 双形态类型收窄、初始化返回值经
  feature 探测（WebAssembly 实例就绪）、URL 加载失败（网络错误、
  HTTP 非 2xx、MIME 规范化后非 application/wasm——解析 media type
  并剥离 `;` 参数后严格比对）reject 带来源信息、环境
  选择规则 = 浏览器构建走 ?url 静态导入 map、Node 走 bytes（每类
  负向 fixture 各一）

#### Scenario: confidence 越界防御

- **WHEN** detector 返回 confidence 超出 [0,1]、NaN 或缺省
- **THEN** 越界/NaN 一律按 undefined 丢弃（不抛错、不钳制），缺省
  直通——卡片 v1 不消费 confidence

#### Scenario: vitest 真实 wasm

- **WHEN** 契约套件在 jsdom 运行统计层
- **THEN** bytes 通道装载真实 wasm，检测断言以执行结果为准（非 mock）

#### Scenario: 体积门禁失败即阻塞

- **WHEN** 最终发行物任一口径越线（raw > 100 KiB 或 gzip > 70 KiB）
- **THEN** verify:betlang-pin 失败阻塞合入；raw > 98 KiB 预警线触发
  降级预案改写流程

### Requirement: 检测身份 seam 的 registry/kernel 二分

`HIGHLIGHT_DETECT_KEY` 与 `HighlightDetectContextValue` SHALL 随
`highlight` core item 的 context-key.ts 发行（registry-safe 身份，零
依赖，所有消费者含插件共用同一 Symbol）；**存储于该 key 的 context
值 SHALL 恒为 `{ detector }` adapter**——内核管线值类型
`LanguageDetector | undefined`，内核 provider、包装组件、手写
setContext 三条写入路径产出同一形状（各一条端到端测试）。内核编排
（`HIGHLIGHT_DETECT_DEF` + `createHighlightDetectContext`）SHALL 落
site-only 的 `lib/highlight/context.svelte.ts`（与 HIGHLIGHT_DEF 同
法——registry-safe 身份随 core，内核编排属站点）。插件 SHALL 能经
`targets: [HIGHLIGHT_DETECT_DEF]` 将任意 detector（含
`betlangDetector()`）配为子树/全站默认；该默认 SHALL 压过 backend
自带 detector，但被卡片显式 prop 压过。context 值类型为
`{ detector: LanguageDetector | undefined }`（undefined = 无意见，
读取侧函数判据后级联下一环），Svelte 就近 provider 语义（嵌套取
最近），组件窗口外读取 SHALL 传播 Svelte 自身
`lifecycle_outside_component`（不捕获不归一）。

#### Scenario: 全站 betlang

- **WHEN** 站点经 definePlugin targets=[HIGHLIGHT_DETECT_DEF] 配置
  betlangDetector 为默认
- **THEN** 所有 `lang={AUTO_LANG}` 卡片（未写 prop 者）使用 betlang
  统计检测，即使 backend 是 highlightJs

#### Scenario: 包装 provider 的作用域

- **WHEN** `<HighlightDetectDefault>` 以 children 形态包住子树
- **THEN** 子树内 `lang="auto"` 卡片吃到 DLD，子树外不吃（context
  子树传播法则）；嵌套 provider 取最近值；lib item 内无任何 Svelte
  代码（framework-free 法则），包装组件属独立 registry:ui item

#### Scenario: registry 消费者自写 provider

- **WHEN** 未装 context-plugin 的消费者安装 DLD lib item
- **THEN** 子树根 `<script>` 手写 setContext(HIGHLIGHT_DETECT_KEY, …)
  即接线，无需内核依赖、无需 wrapper item
