# lang-detection — 增量

## ADDED Requirements

### Requirement: 语言检测是独立契约，解析链四环

系统 SHALL 提供 `LanguageDetector` 契约（`detect({ code, filename }) →
Promise<DetectResult | null>`，DetectResult 携带 canonical lang、分层
source 标记与可选 confidence），随 `highlight` core item 发行且不引入
任何 npm 依赖。卡片 `lang="auto"` 时 SHALL 按以下优先级解析检测器：
`langDetector` prop → context 默认（`HIGHLIGHT_DETECT_KEY` seam，可经
插件配置，如全站 betlang）→ backend 自带的 `detector` 槽位（若引擎
提供）→ DLD 懒加载兜底。检测产出的 lang SHALL 走既有别名/curated/
reject 法则——检测只负责给出 lang，高亮边界不变。未装 DLD 而触发
兜底 SHALL reject 并报出安装命令；检测映射不到可渲染语言 SHALL 返回
null 并按纯文本回退法则处理。`lang` 不为 `'auto'` 时一切存量行为
逐字节不变。

#### Scenario: prop 压过一切

- **WHEN** 卡片写 `lang="auto"` 且 `langDetector={betlangDetector()}`
- **THEN** 检测走显式 detector，context 默认与 backend 自带 detector
  均不参与

#### Scenario: hljs 卡片不写 detector

- **WHEN** `lang="auto"`、无 prop、无 context 默认、backend 为
  `highlightJs()` 系
- **THEN** 使用该 backend 实例自带的 highlightAuto 检测，检测范围即
  该实例 `langs` 选项注册的语言集

#### Scenario: shiki 卡片落到 DLD

- **WHEN** `lang="auto"`、无 prop、无 context 默认、backend 无
  detector 槽位
- **THEN** 懒加载 DLD（未安装则 reject 报安装命令，卡片纯文本回退）

#### Scenario: 存量路径不变

- **WHEN** 卡片 `lang="ts"`（或任何非 auto 值）
- **THEN** 检测路径零字节加载，渲染与 2026-09-06 引擎矩阵行为逐字节
  一致

### Requirement: DLD 是四层瀑布，层层按需

默认检测器 DLD（`defaultLangDetector()`，registry item
`highlight-lang-detector`）SHALL 按低成本到高成本组织四层：L1
filename/extension 表、L2 shebang 表、L3 特殊结构探针、L4 betlang
统计检测。每层 SHALL 是独立懒模块——前一层命中后行 SHALL 零加载后续
层；L1/L2 的映射表 SHALL 以多行字符串常量表达（首次使用才 parse 成
Map，进程级缓存）。表数据源 SHALL 取 linguist languages.yml 与本仓库
canonical 语言集的交集；歧义扩展名（linguist heuristics.yml 消解块
覆盖的）SHALL 被排除出 L1，交由 L4。

#### Scenario: 扩展名即答案

- **WHEN** `lang="auto"`、filename 为 `main.ts`
- **THEN** L1 命中 typescript，L2-L4 模块零加载

#### Scenario: shebang 即答案

- **WHEN** `lang="auto"`、无 filename、code 首行
  `#!/usr/bin/env python3`
- **THEN** L2 命中 python（L1 空手后），L3/L4 模块零加载

### Requirement: 结构层只做高确判探针，不做编程语言指纹

DLD 结构层 SHALL 只声明开头或全篇即可确判的目标：XML/HTML/SVG（首行
字面量与根元素判据）、JSON（全文 parse 硬判据）、YAML/TOML/INI（互斥
标记的保守正则）。本层 SHALL NOT 对编程语言做指纹检测（Rust/Go/
Kotlin/Swift 等语法指纹）——Markdown 干扰过重，可靠性不达标；此类
样本 SHALL 穿透到统计层。

#### Scenario: Markdown 干扰负样本

- **WHEN** `lang="auto"`、code 为含 Rust/Go/Kotlin/Swift 明显指纹的
  样本（无 filename、无 shebang）
- **THEN** 结构层不捕获任何语言，样本落到 L4 统计检测

#### Scenario: JSON 硬判据

- **WHEN** code 全文通过 JSON.parse
- **THEN** 声明 json（source=structure）；首字符为 `{` 但解析失败
  SHALL NOT 声明

### Requirement: betlang 统计层过体积门禁，wasm 不入 git

统计层 SHALL 由 betlang（crates.io 版本钉死）编译的 wasm 承载，总
体积 SHALL 满足双口径预算：raw ≤ 100 KB 且 gzip ≤ 70 KB（实测 lean
绑定 97.7 / 57.1，含 47.8KB 内嵌模型）。wasm 二进制 SHALL NOT 进入
git 与 registry payload——供应链 SHALL 经 npm 通道（自建
`@jixoai/betlang-wasm`，lockfile 供应链法则）或 release 资产 + pin
manifest（ghostty 法则）承载，并有独立 verify 脚本核验 sha256、
magic bytes 与双口径预算。装载 SHALL 经 `wasmLoader → { url } |
{ bytes }` seam：浏览器走真实 HTTP 资产 URL，Node/vitest 走真实字节
并真实初始化 wasm（不 mock，file:// 不作为浏览器证据）。betlang 48
标签到 canonical id 的映射 SHALL 内嵌；无对应标签 SHALL 返回 null
并 warn。

#### Scenario: vitest 真实 wasm

- **WHEN** 契约套件在 jsdom 运行统计层
- **THEN** bytes 通道装载真实 wasm，检测断言以执行结果为准（非 mock）

#### Scenario: 体积门禁失败即阻塞

- **WHEN** wasm 重建后任一口径超出预算（raw > 100KB 或 gzip > 70KB）
- **THEN** verify:betlang-pin 失败并阻塞合入，变更必须重裁（缩绑
  定或转非默认 detector item）

### Requirement: 插件可投影默认检测器

内核插件 SHALL 能经 `HIGHLIGHT_DETECT_DEF` 将任意 LanguageDetector
（含 `betlangDetector()` 直连导出）配置为子树/全站默认检测器——
该默认 SHALL 压过 backend 自带 detector，但被卡片显式 `langDetector`
prop 压过。

#### Scenario: 全站 betlang

- **WHEN** 站点经 definePlugin targets=[HIGHLIGHT_DETECT_DEF] 配置
  betlangDetector 为默认
- **THEN** 所有 `lang="auto"` 卡片（未写 prop 者）使用 betlang 统计
  检测，即使 backend 是 highlightJs
