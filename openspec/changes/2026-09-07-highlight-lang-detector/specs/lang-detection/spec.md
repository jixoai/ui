# lang-detection — 增量

## ADDED Requirements

### Requirement: 语言检测是独立契约，解析链四环 + null 级联

系统 SHALL 提供 `LanguageDetector` 契约（`detect({ code, filename }) →
Promise<DetectResult | null>`；DetectResult 携带 canonical lang、分层
source 标记与可选 confidence）与 `AUTO_LANG = 'auto'` 常量，随
`highlight` core item 发行且不引入任何 npm 依赖；`lang` prop 保持
string 类型，AUTO_LANG 为运行时哨兵（trim 后全等比较，大小写敏感，
其余值一律按普通 lang 走既有路径）。

卡片 `lang === AUTO_LANG` 时 SHALL 按序解析检测器，每环存在判据：
① `langDetector` prop 非 undefined；② `HIGHLIGHT_DETECT_KEY` context
对象且 `.detector` 为函数；③ `backend.detector` 为函数；④ 无第四环 —
运行时 reject，报错文本给出 DLD 安装命令与一行接线指引。

**null 级联法则**：某环 detector resolve null（无意见）SHALL 级联下一
环；某环 reject/throw（终态）SHALL 纯文本回退 + warn 报出该环 id 与
错误；链上全部可用环皆 null SHALL 纯文本回退 + warn 报出各环 id。
检测产出的 lang SHALL 走既有别名/curated/reject 法则。`lang` 非
AUTO_LANG 时一切存量行为逐字节不变，检测路径零字节加载。

**零静态 import 法则**：卡片与 core SHALL NOT 引用 DLD 的任何
specifier（动态亦不可——bundler 构建期解析静态字符串，裸消费者无法
构建）；DLD 的默认地位 SHALL 经 context 默认值落地（DLD item 发行
`<HighlightDetectDefault />` 一行接线组件，内部仅
`setContext(HIGHLIGHT_DETECT_KEY, { detector: defaultLangDetector() })`，
并 runtime import core 的 `HIGHLIGHT_DETECT_KEY`/`AUTO_LANG` 保持
registry 边活性）。

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
（``` / ~~~ 围栏或 ≥2 个 `^ {0,3}#{1,6}\s` 标题行 → 本层整体弃权）→
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

- **WHEN** 样本以 `---` + YAML keys + `---` 开头，正文含 Markdown
  标题或围栏
- **THEN** Markdown 守卫弃权，L3 不声明 yaml；无 md 标记的纯多文档
  YAML 仍声明 yaml

#### Scenario: JSON 硬判据

- **WHEN** code 全文通过 JSON.parse
- **THEN** 声明 json（source=structure）；首字符 `{` 但解析失败
  SHALL NOT 声明

### Requirement: betlang 统计层过 KiB 字节门禁，wasm 不入 git

统计层 SHALL 由 betlang（crates.io 版本 `=0.1.1` 钉死）编译的 wasm
承载，发行通道 SHALL 为自建 npm 包 `@jixoai/betlang-wasm`（packages/
betlang-wasm，CI 构建发布，Cargo.lock + 工具链版本 + 完整 sha256 +
字节精确尺寸入 ARTIFACT.md）。预算 SHALL 以 KiB（1024 字节）字节精确
计量：raw ≤ 100 KiB、内部预警线 raw 98 KiB、gzip ≤ 70 KiB（Node
zlib.gzipSync level 9，算法冻结）。`scripts/verify-betlang-pin.mjs`
SHALL 核验 sha256、magic bytes 与双预算；预警线越线 SHALL 触发降级
预案（betlang 转非默认 detector item，DLD 收缩三层，L4 章改写后重新
送审）。wasm 二进制 SHALL NOT 进入 git 与 registry payload。装载
SHALL 经 `wasmLoader → { url } | { bytes }` seam：浏览器走真实 HTTP
资产 URL，Node/vitest 走真实字节并真实初始化 wasm（不 mock，file://
不作为浏览器证据）。betlang 48 标签到 canonical id 的映射 SHALL 以
完整多行字符串表内嵌（版本绑定注释），无对应标签 SHALL 返回 null
并一次性 warn（每标签每进程至多一条）。

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
依赖，所有消费者含插件共用同一 Symbol）；内核编排（
`HIGHLIGHT_DETECT_DEF` + `createHighlightDetectContext`）SHALL 落
site-only 的 `lib/highlight/context.svelte.ts`（与 HIGHLIGHT_DEF 同
法——registry-safe 身份随 core，内核编排属站点）。插件 SHALL 能经
`targets: [HIGHLIGHT_DETECT_DEF]` 将任意 detector（含
`betlangDetector()`）配为子树/全站默认；该默认 SHALL 压过 backend
自带 detector，但被卡片显式 prop 压过。context 值类型为
`{ detector: LanguageDetector }`，Svelte 就近 provider 语义（嵌套取
最近），组件窗口外读取 SHALL 传播 Svelte 自身
`lifecycle_outside_component`（不捕获不归一）。

#### Scenario: 全站 betlang

- **WHEN** 站点经 definePlugin targets=[HIGHLIGHT_DETECT_DEF] 配置
  betlangDetector 为默认
- **THEN** 所有 `lang={AUTO_LANG}` 卡片（未写 prop 者）使用 betlang
  统计检测，即使 backend 是 highlightJs

#### Scenario: registry 消费者自写 provider

- **WHEN** 未装 context-plugin 的消费者安装 DLD item
- **THEN** `<HighlightDetectDefault />`（官方参考实现）或自写
  setContext(HIGHLIGHT_DETECT_KEY, …) 均可接线，无需内核依赖
