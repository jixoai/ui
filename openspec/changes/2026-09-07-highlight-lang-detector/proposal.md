# highlight-lang-detector — 语言检测能力：LanguageDetector 抽象 + DLD 四层探测器

## Why

Owner 需求（2026-09-07，引擎矩阵收尾四问之 Q4 的正式立项）：

> 新增一个 langDetector 属性，我们将 backend 进一步抽象出 langDetector
> 能力。highlightjs 默认使用自带的（highlightAuto）。我们则是提供一个
> 轻量级的 fallback 方案。backend 本身可能携带 detector，LanguageDetector
> 则是明确使用某种 detector，它们不冲突，但是互相补充。后续我们称默认
> detector（fallback 方案）为 DLD（defaultLangDetector）。
>
> 1. DLD 按需加载，默认不引入；DLD 本身是多层，每层也是按需加载
> 2. 提供 `lang="auto"` 属性启用检测；langDetector 属性指向一个
>    LanguageDetector 检测器，默认值就是我们内置的检测器
> 3. filename/ext：DLD 检测的第一道门槛，extension mapping 表用高效
>    结构表达（体积不小，整理成多行字符串）
> 4. shebang/meta：`#!/usr/bin/env python3` 类内容，需要 shebang 表
> 5. 特殊结构识别：XML/HTML/SVG（首行特征）/ JSON（直接 parse）/
>    YAML/TOML/INI（正则特征碰撞）——本层**不做编程语言检测**（哪怕
>    Rust/Go/Kotlin/Swift 指纹明显），因为 Markdown 干扰太重；只做
>    开头或全篇即可确判的特征，可靠性高、代价轻
> 6. 统计式语言识别：参考 betlang（编译 wasm 测体积，≤100KB 可用）；
>    否则参考 linguist 的 languages.yml + heuristics.yml。betlang 若
>    超标可作为非默认 detector 供手动启用（plugin 可配为默认项）

现状（2026-09-06 `highlight-engine-matrix` 已归档）：六引擎矩阵、
`HighlightBackend` 契约、`prop → context → DEFAULT_SHIKI_BACKEND` 解析链、
失败法则（reject 带提示 → 纯文本回退）全部就位。检测是横切能力，不在
任何引擎内部。

## What Changes

**L1 — LanguageDetector 契约与解析链（core item 扩展）**

- `lib/highlight/lang-detector.ts`（随 `highlight` core item 发行，零 npm
  依赖）：`LanguageDetector` 接口 + `DetectResult` + `DetectSource` +
  `AUTO_LANG = 'auto'` 常量（`lang` 保持 string，哨兵值导出常量 + 运行时
  严格全等 guard：`lang === AUTO_LANG`，无 trim、大小写敏感）。
- `context-key.ts`（core 既有零依赖 seam 文件）增补
  `HIGHLIGHT_DETECT_KEY` 与 `HighlightDetectContextValue` —— registry-safe
  身份对象，所有消费者（含插件）共用同一 Symbol。
- `HighlightBackend` 增加可选 `detector?: LanguageDetector` 槽位：引擎
  自带检测能力（highlight.js 的 highlightAuto）经此暴露。
- **解析链（r1 评审修正：卡片与 core 零静态 DLD import —— 可选 item 的
  动态 specifier 会在构建期解析，裸消费者无法构建）**：
  `langDetector` prop → `HIGHLIGHT_DETECT_KEY` context → backend.
  detector → 运行时 reject（报 DLD 安装 + 接线指引）。**DLD 作为
  "默认检测器"的落地形态是 context 默认值**（r2 冻结作用域：Svelte
  context 只向子树传播，provider 必须是包装形态）——独立 registry:ui
  item `highlight-detect-default`（index.ts barrel + jixoai-theme
  依赖，icon/icon-set 形状）发行 `<HighlightDetectDefault>`
  **children 包装组件**，或消费者在子树根 `<script>` 手写一行
  setContext（两种等价形态并列进文档与报错指引；DLD lib item 自身
  不发行任何 Svelte——framework-free）；装好接线后该子树
  所有 `lang="auto"` 卡片吃到 DLD，未装者的构建图中**不存在任何**
  DLD 边。**检测成功但 backend 拒绝 = 终态**（按矩阵失败法则点名可
  覆盖引擎，不换检测器重试）。
- **null 级联法则（"不冲突、互相补充"的工程化）**：检测器返回 null =
  无意见 → 级联下一环；reject/throw = 终态 → 纯文本回退 + warn。三
  检测环（prop/context/backend）皆缺或皆无意见 → 纯文本 + warn；链
  皆 null → 纯文本 + warn（报出各环 id 与结论）。检测产出的 lang 走
  既有别名/curated/reject 法则——检测只给 lang，高亮边界一寸不动。
- SSR/prerender：检测是异步运行时行为；预渲染产物恒为纯文本（渐进
  增强地板不变），hydration 后首次 paint 才检测。

**L2 — DLD（defaultLangDetector）：四层瀑布，层层按需**

新 registry item `highlight-lang-detector`（**仅导出两个 detector
工厂**：`defaultLangDetector()` + `betlangDetector()`，framework-free
零 Svelte；真实 runtime import core 的 `HIGHLIGHT_DETECT_KEY` 保持
registry 边活性
—— 仅 type import 会被 verify-deps 判 dead）。每层独立懒模块，前一层
命中即短路：

1. **filename/ext**：扩展名表 + **精确 basename 表**（`Dockerfile`/
   `Makefile`/`CMakeLists.txt` 类，linguist `filenames` 字段 ∩ canonical
   支持集），均多行字符串常量，首次使用才 parse 成 Map。数据源 =
   linguist languages.yml（挖掘时 commit SHA 落注释）∩ canonical 集；
   歧义扩展名（heuristics.yml 138 组消解块覆盖的）不进 L1，留给 L4。
2. **shebang/meta**：解释器映射表（多行字符串）—— shebang 两形态
   （`#!/usr/bin/env X` 与 `#!X`）+ emacs 首行 modeline（`# -*- mode:
   X -*-`，仅 `#` 注释形态）。均只看首行。
3. **特殊结构**：冻结判据（design D3.2 规范化伪码 + 阈值 + 正负样本
   矩阵）：JSON 全文 parse 硬判据；`<?xml`+`<svg` 根 → svg（SVG 优先
   于 XML）；`<!doctype html` → html；YAML（`---` 文档头 + key-colon
   密度）/TOML（section + 空格 `=`）/INI（section + 无空格 `=`）互斥
   判据，≥3 非空行才参判；**Markdown 守卫**（围栏/标题行出现 → 本层
   全弃权）。本层**不做编程语言指纹**（Owner 法则）。
4. **统计式（betlang）**：wasm 探测实证**过门槛**（lean 绑定观测带
   raw 97.75–97.80KiB / gzip 57.06–57.14KiB（KiB=1024B 口径，预算
   raw ≤100KiB / gzip ≤70KiB，预警线 raw 98KiB 最坏余量 213B；
   evidence/betlang-probe-2026-09-07.md）。**发行通道冻结为 A**：自建
   `@jixoai/betlang-wasm` npm 包（packages/betlang-wasm，CI 从钉死
   crates.io `betlang = "=0.1.1"` 构建，Cargo.lock + rustup 工具链 +
   完整 sha256 + 字节精确尺寸入档；verify 脚本按 Node zlib level 9
   gzip 定量）。**降级预案（r2 兑现 Owner 的 linguist 兜底）**：最终发行物 raw 越预
   警线（98KiB）→ betlang 转非默认 detector item（Owner 预案），DLD
   的 L4 换装 **linguist 派生精简启发层**（heuristics.yml 与 canonical
   集有交集的 curated 子集，linguist SHA 版本化，同规格门禁与样本
   矩阵；138 块完整移植维持 Non-Goal）。48 标签 → canonical 映射表
   内嵌（**从 lang-canonical.ts 权威表派生**，betlang 版本绑定 +
   未映射标签一次性 warn 缓存）；无对应 → null（级联/回退）。

**L3 — highlight.js 自带 detector 接线（r1 评审冻结语义）**

detector 忽略 filename；对传入 code 跑 highlightAuto，候选 = 该 backend
实例 `langs` 选项的 canonical 集（懒加载注册进**该实例私有** lib/core，
不依赖其他实例或全局注册表）；空 langs → 直接 null（无候选）；无命中
→ null；命中经实例别名表收敛为 canonical id，`source: 'engine'`，不带
confidence（hljs relevance 不可归一）。测试锁死：空集、双实例不同
allowlist 隔离、无命中 null。

**L4 — 门禁与文档**

- 契约测试：三检测环优先级 + 兜底 reject + null 级联/throw 终态、
  AUTO_LANG guard（'AUTO'/' auto '/'auto\n' 皆按普通 lang 走 reject）、
  hljs detector 边界、`lang="auto"`+filename 端到端上色、Markdown 干扰
  负样本矩阵（Rust/Go/Kotlin/Swift 穿透 L3）、L1 命中后 L2+ 模块零加载
  （vi.mock 计数法）。
- betlang wasm 门禁：sha256 + magic bytes + **KiB 字节精确双预算** +
  预警线（scripts/verify-betlang-pin.mjs）。
- verify:shadcn-add 自动派生隔离 case **三连**：**裸 code-card**（构
  建零 DLD 字节 + `lang="auto"` 运行时 reject）、**code-card+DLD lib**
  （clean build + wasm ?url 发射）、**code-card+DLD+wrapper**（包装
  接线后 `lang="auto"` 端到端检测）。
- code-card 文档页 lang="auto" 段落 + playground 实演（filename 探针 /
  统计检测两条 demo）；blueprints + llms/search 语料同步。

## 破坏性变更

无。全部增量：新 prop、新可选槽位、新 item；`lang` 保持 string。存量
卡片行为逐字节不变（不写 `'auto'` 永不进检测路径）。

## 内核侧（site-only，与 HIGHLIGHT_DEF 同法）

`HIGHLIGHT_DETECT_DEF` + `createHighlightDetectContext` 落
`lib/highlight/context.svelte.ts`（该文件是 site-only 模块——
context-key.ts 头注释的既有法则：registry-safe 身份随 core 发行，内核
编排属站点）。插件投影（`targets: [HIGHLIGHT_DETECT_DEF]` 配 betlang
为全站默认）是站点/context-plugin 消费者的组合自由，不随 item 发行；
registry 消费者用 `HIGHLIGHT_DETECT_KEY` + setContext 自写 provider
（UI item `highlight-detect-default` 的
`<HighlightDetectDefault>` 即官方参考实现；DLD lib item 自身无
Svelte 导出）。

## 依据与探测（evidence/）

- `betlang-probe-2026-09-07.md` —— wasm 构建命令、尺寸矩阵（朴素
  114.5KiB→lean 97.7KiB raw / 62.8→57.1KiB gzip，KiB 口径）、8 样本
  检测全对、fearless_simd 需 rustup 工具链（Homebrew rust 缺 wasm
  std）、官方 npm 渠道缺失结论、模型 sha256 全量。
- linguist 盘点 —— languages.yml 165,390 B（161.51 KiB）/ 2069 语言
  （extensions + filenames + interpreters 字段为 L1/L2 数据源；挖掘时
  commit SHA 入表注释）；heuristics.yml 40,624 B（39.67 KiB）/ 138 组
  歧义消解块（L1 排除表来源）。
