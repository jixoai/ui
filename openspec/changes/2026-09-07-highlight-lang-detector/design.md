# highlight-lang-detector — Design

r1（5.5）→ r2（6.5）→ r3-astra（6.4）逐轮消化。r3 六阻塞：
D1/D2.1 AUTO_LANG 改严格全等（去 trim，与 spec 场景对齐）+ 术语改
"三检测环 + 兜底 reject"；D3.2 围栏正则补 1-3 空格缩进；D5 文件
归属去撞名（DLD 工厂独立文件）+ wrapper 补 UI 合同要件；D8.1
canonical 表补可解析 grammar 与生成/门禁步骤；D8.2 统一 context
值模型（kernel 值 LanguageDetector|undefined + 存储 adapter
{ detector }）。D2.2 冻结 provider 为 children 包装形态并落独立
registry:ui item、D3.1 冻结文件名/shebang 边界行为、D3.2 统一
Markdown 守卫与 front-matter 规则、D4 冻结门禁测量对象并补精确
字节证据 + Owner 的 linguist 降级兑现、D5 冻结双 item 形状与
framework-free 合规、D7 补 newInstance 隔离与默认候选集、新增 D8
canonical registry 权威表与内核侧最小契约。

## D1 — LanguageDetector 契约（core item，零 npm 依赖）

```ts
// registry/files/lib/highlight/lang-detector.ts（随 highlight core 发行）
export const AUTO_LANG = 'auto';   // lang 哨兵：严格全等（无 trim），大小写敏感

export type DetectSource =
  | 'filename'    // DLD L1：扩展名/basename 表
  | 'shebang'     // DLD L2：解释器表 / modeline
  | 'structure'   // DLD L3：结构探针
  | 'statistical' // DLD L4：betlang wasm
  | 'engine';     // 引擎自带（hljs highlightAuto）

export interface DetectResult {
  lang: string;            // 本仓库 canonical id（单一命名空间，见下）
  source: DetectSource;
  confidence?: number;     // 0..1；betlang 校准概率直传；表/结构/engine 层缺省
}

export interface DetectInput {
  code: string;
  filename?: string;       // 卡片 filename prop 原样透传（可能含路径）
}

export interface LanguageDetector {
  id: string;              // 'dld' | 'betlang' | 'hljs-auto' | 消费者自定义
  detect(input: DetectInput): Promise<DetectResult | null>;
}
```

裁决记录：

- **单一 canonical 命名空间**：检测器返回的 lang 与卡片 `lang` prop
  同域（本仓库 canonical id，如 `typescript`/`python`）。检测器内部
  完成标签收敛（betlang 的 `TypeScript` → `typescript`），卡片侧零
  翻译逻辑；canonical id 随后走 backend 自己的别名表与 curated 集
  （backend 的 reject 法则原样适用）。
- **Promise 返回**：同步层（L1-L3）也包 Promise——wasm 层天然异步，
  契约不允许双态。
- **`filename` 只透传**：文件名归属检测器（DLD L1 取扩展名 + 精确
    basename；自定义 detector 可读全名做特判）。
- **`AUTO_LANG` 常量而非联合类型**：`lang` prop 保持 `string`（存量
  调用零破坏）；哨兵匹配冻结为 **`lang === AUTO_LANG` 严格全等**
  （无 trim、大小写敏感）——`'AUTO'`、`' auto '`、`'auto\n'` 一律
  不触发检测，按普通 lang 走既有路径并由 backend reject 法则处理
  （r3-B2 裁决，与 spec 场景一致）。

## D2 — 解析链、null 级联与接线模型

### D2.1 链与存在判据（完整决策表）

`lang === AUTO_LANG` 时按序解析检测器。**术语律（r3-N1）：检测环
三个（prop / context / backend），第四项不是环而是链尾的运行时
reject 终态**——下表保留四行是完整决策表，行④即 reject：

| 环 | 存在判据 | 不存在时 |
|---|---|---|
| ① prop | `langDetector !== undefined` | 进② |
| ② context | `getContext(HIGHLIGHT_DETECT_KEY)` 返回对象且 `.detector` 为函数（组件窗口内） | 进③ |
| ③ backend | `backend.detector` 为函数 | 进④ |
| ④（非环）兜底 | 三环皆缺 | 运行时 reject：报"lang='auto' 需要检测器"，给出安装命令 + 两种接线形态指引 |

**null 级联法则**：某环 detector resolve 为 `null` = 该环无意见 →
**级联下一环**（"不冲突、互相补充"）；某环 reject/throw = 终态 →
纯文本回退 + console warn（报出该环 id 与错误）。三个检测环皆
null（皆无意见）→ 纯文本回退 + warn（报出各环 id 与
"no language detected"）。

**链的语义推论**：prop 写了但返回 null，context/backend 仍有机会
（互补）；插件把 betlang 配成 context 默认后，betlang null 时 hljs
自带 detector 仍兜底。**检测成功但 backend 拒绝 = 终态**（r2-B5）：
detector 给出的是它的最终答案，backend 的 curated/reject 法则原样
适用（reject 消息按矩阵失败法则点名可覆盖引擎），不回退换检测器
再试——检测环与高亮环是两个单向串联的阶段，不做交叉重试。

### D2.2 接线模型（r1-B1/r2-B1 修正：零静态 import + provider 作用域闭合）

卡片与 core **不 import DLD 的任何 specifier**（动态也不行——
Vite/Rollup 在构建期解析静态字符串 specifier，裸消费者缺文件直接
构建失败，"运行时才 reject"不可实现）。

DLD 作为"默认检测器"的落地形态 = **context 默认值**，两种等价接线
（Svelte context 只向子树传播——**自闭合组件无法影响同级/路由
slot**，故 provider 必须是包装形态）：

```svelte
<!-- 形态①（推荐）：registry:ui item 的包装组件，children snippet -->
<script>
  // 消费者 import 方言恒为 $lib/…（registry living spec：@ui/… 是安装
  // target 别名空间，不是 import 写法）；target 形状
  // @ui/highlight-detect-default/highlight-detect-default.svelte
  import HighlightDetectDefault from '$lib/ui/highlight-detect-default/highlight-detect-default.svelte';
</script>
<HighlightDetectDefault>
  {@render children()}   <!-- 消费者子树包在里面 -->
</HighlightDetectDefault>

<!-- 形态②（零组件）：任意子树根组件 <script> 里一行 -->
<script>
  import { setContext } from 'svelte';
  import { HIGHLIGHT_DETECT_KEY } from '$lib/highlight/context-key';
  import { defaultLangDetector } from '$lib/highlight/default-detector';
  setContext(HIGHLIGHT_DETECT_KEY, { detector: defaultLangDetector() });
</script>
<slot /> <!-- 自己的子树 -->
```

- 形态①的实现即形态②（~10 行 Svelte，`{@render children()}` 包
  slot），随独立 registry:ui item `highlight-detect-default` 发行
  （D5：lib item 必须 framework-free，Svelte 组件不进 lib item）。
- 嵌套 provider 取最近值（Svelte context 法则）；+layout 全站接线
  = docs 站 dogfood 形态（tasks 5.3）。
- 未装/未接线：构建图零 DLD 字节；`lang="auto"` 运行时 reject
  （安装命令 + 两种接线形态指引进报错文本）。

### D2.3 SSR / prerender / 检测时机

检测是异步运行时行为：预渲染产物恒为纯文本（渐进增强地板），
hydration 后首次 paint 才 resolveDetector → detect → 高亮。context
在 SSR 窗口内可用（Svelte context 法则），但 detect 永不跑在服务端。

## D3 — DLD 四层瀑布（每层独立懒模块）

```
defaultLangDetector()  ── 命中即短路，层层 fallback（层内 null 交上层瀑布语义）
  L1 filename   detect-ext-table.ts      扩展名表 + 精确 basename 表（多行字符串）
  L2 shebang    detect-shebang-table.ts  解释器表 + emacs 首行 modeline（多行字符串）
  L3 structure  detect-structure.ts      纯 TS 探针（D3.2 冻结判据）
  L4 statistical betlang-detector.ts     wasm 懒加载 + 48 标签映射表
```

### D3.1 表格式（Owner 指定：多行字符串）

```ts
// detect-ext-table.ts —— 数据源 linguist languages.yml（SHA 见下）∩ canonical 集
// 歧义扩展名（heuristics.yml 138 组消解块内）不在此表，留给 L4
// mined-from: github-linguist/linguist@5fb5096b95ab lib/linguist/languages.yml
const EXT_TABLE = `
ts typescript
tsx tsx
py python
rb ruby
`;
// basename 表（linguist filenames 字段 ∩ canonical 支持集；精确全等，大小写敏感）
const BASENAME_TABLE = `
Dockerfile dockerfile
Makefile make
CMakeLists.txt cmake
`;
```

- 单空格分隔、换行分隔条目；`#` 起注释行。首次使用才 parse 成 Map，
  进程级缓存（多卡片共享）。
- **文件名边界冻结（r2-N4）**：路径分隔符 `/` 与 `\` 皆取最后段；
  扩展名取最后一个 `.` 后缀并**小写化**（`.TS` → ts；`.d.ts` → ts
  取最后后缀）；basename 表**大小写敏感**精确全等（`Makefile` ≠
  `makefile`，linguist filenames 语义；`Makefile.old` 不命中）；
  无扩展名的 dotfile（`.babelrc`）走 basename 表（ linguist
  filenames 字段含 dotfile 条目）。
- **shebang 边界冻结（r2-N4）**：L2 读首行前先 strip UTF-8 BOM；
  `#!/usr/bin/env X` 取 env 后首个词（`env -S python3 -u` 取
  `-S` 后首个非 flag 词）；`#!X` 直接取解释器 basename；解释器
  后缀参数忽略（`#!/usr/bin/python3 -O` → `python3`）；表键为
  basename（`python3`、`node`、`zsh`…）。
- shebang 表同构（解释器 basename → lang：`python3 python`）。挖掘时
  的 linguist commit SHA 落表头注释（再挖掘是手动动作，SHA 即数据版本）。

### D3.2 结构层冻结判据（r1-B8 修正：可验收伪码 + 阈值）

```
normalize(text):
  strip UTF-8 BOM；body = text.trim()；
  L1 = 第一个非空行（trim-start）；
  H  = body 前 512 字符；
  lines = body 非空行数组；n = lines.length

guard_Markdown（r2-B6 统一：围栏 ANY 即弃权；标题密度 ≥2 才弃权——
  TOML/YAML/INI 的 `# 注释` 单行会匹配标题正则，单标题弃权会把带
  注释的合法配置文件全部误杀；保守偏置法则：宁可穿透到 L4）:
  body 匹配 /^ {0,3}(?:`{3,}|~{3,})/m（任一围栏，含合法的 1-3 空格
  缩进围栏与更长围栏；闭合围栏同样命中——守卫只看存在性）
  或 ≥2 行匹配标题 /^ {0,3}#{1,6}\s+\S/ → 结构层整体弃权
  （正负样本：缩进围栏、~~~ 闭合、CRLF 行尾、TOML `# 注释` 单行）

P_JSON:  JSON.parse(body) 成功 → json                     // 硬判据，最先
P_SVG:   /^<svg[\s>]/.test(L1) → svg
         或 /^<\?xml[^>]*\?>\s*<svg[\s>]/.test(H) → svg    // SVG 优先于 XML
P_XML:   L1 以 '<?xml' 开头（大小写敏感，XML 声明规范如此）→ xml
P_HTML:  /^<!doctype\s+html/i.test(L1) → html
P_YAML:  n ≥ 3 且 lines[0] === '---'
         且 body 中 /^\s*[A-Za-z_][\w.-]*:(\s|$)/m 命中行占比 ≥ 60%（排除 '---' 分隔行）
         且 front-matter 规则（r2-B6）：若存在第二个 '---' 行，其后
         内容含任一 md 标记（围栏/标题≥1/列表项 /^[-*+]\s/）→ 弃权
         （markdown front-matter 判 markdown 语境；无 md 标记的纯
         多文档 YAML 仍声明 yaml）
P_TOML:  n ≥ 3 且 ≥1 行整行匹配 /^\[[A-Za-z0-9_.$-]+\]$/
         且 ≥2 行匹配 /^[A-Za-z_][\w.-]*\s=\s\S/（= 两侧有空格）
         且 lines[0] !== '---' 且 guard_Markdown 未触发
P_INI:   n ≥ 3 且 ≥1 行整行匹配 /^\[[A-Za-z0-9_.$ -]+\]\s*$/
         且 ≥2 行匹配 /^[A-Za-z_][\w.-]*=[^=]/（= 无左侧空格）
         且 P_TOML 未命中（TOML 优先：空格 = 是 TOML 的强标记）
         且 guard_Markdown 未触发
顺序：guard_Markdown → P_JSON → P_SVG → P_XML → P_HTML → P_YAML → P_TOML → P_INI → null
```

- **Markdown 守卫优先于一切结构声明**（Owner 的干扰担忧工程化）：
  围栏或标题密度出现 → 本层弃权，样本穿透到 L4。
- front-matter 边界：`---` + YAML keys + `---` + 含 Markdown 标记的
  正文 → guard 弃权（判为 markdown 语境）；纯 `---`+keys+`---`+keys
  多文档无 md 标记 → yaml。正负样本矩阵锁死该边界。
- `[title](url)` 类 markdown 链接不触发 section 判据（section 要求
  整行匹配 `^\[…\]$`）。
- **本层永不做编程语言指纹**：Rust/Go/Kotlin/Swift 指纹样本必须穿透
  到 L4（负样本矩阵固定项）。

### D3.3 层间短路与懒加载

- 每层一个模块，`defaultLangDetector()` 闭包内逐层 `await import()`：
  L1 命中后 L2-L4 模块零字节加载。
- 表 parse 结果模块级缓存。
- `betlangDetector()` 独立导出：直连 L4 统计检测器（插件配默认 /
  显式 prop 用，跳过 L1-L3）。

## D4 — betlang wasm 通道（r1-B6/B7 修正：通道冻结 + KiB 预算律）

**探测结论（evidence/betlang-probe-2026-09-07.md）**：tarball +
fearless_simd =0.4.0 口径的**观测带** raw 100,111–100,131 B
（97.75–97.79 KiB）/ gzip 58,427–58,499 B（Node zlib level 9）；
构建非字节确定（目录路径入产物，r9 实测），**canonical 哈希 = CI
构建产物在 ARTIFACT.md 的记录值（as-shipped 语义）**——本地重建只验
tarball cksum + 锁版本 + 预算带。betlang 进 DLD L4 作默认统计层。

**发行通道（冻结为 A；B 仅存历史评估记录，不构成本 change 的实现
路径——tasks 与 evidence 同步措辞）**：自建 `@jixoai/betlang-wasm`
npm 包，仓库位置 `packages/betlang-wasm/`：

- 构建源：Cargo.toml 钉死 `betlang = "=0.1.1"` **与
  `fearless_simd = "=0.4.0"`（r9-B2：betlang 自锁值——不显式钉死则
  lockfile 重生成会漂移到 0.4.1，产物即偏离基准）**，Cargo.lock 入库，
  `.github/workflows/betlang-wasm-release.yml`（rustup toolchain +
  wasm32-unknown-unknown target + `--locked` 构建 + npm provenance
  发布）。
- 包内容：wasm + 手写 ~40 行 JS 装载器（线性内存 UTF-8 ABI，无
  wasm-bindgen 胶水——bindgen 使 raw 增约 3-8 KiB 可能越线）+ `.d.ts`
  + MIT/上游归属。首版 `0.1.1`（镜像 crate 版本）。
- 完整性：`packages/betlang-wasm/ARTIFACT.md` 记录 wasmRawBytes、
  wasmGzipBytes、wasmSha256、tarballSha256、构建工具链版本
  （rustc/LLVM）、betlang crate sha256；`scripts/verify-betlang-pin.mjs`
  核验 sha256 + magic bytes (`\0asm`) + 双预算。

**门禁测量对象冻结（r2-B4）**：预算的输入是且仅是 **`.wasm` 文件的
字节**（不含装载器 JS、不含 tarball、不含 entry 包装）；gzip = Node
`zlib.gzipSync(wasmBytes, { level: 9 })`（算法冻结）；tarball sha256
只做完整性记录、不入预算。探针 wasm（上表）即门禁口径的第一次实测。

**KiB 预算律（字节精确，KiB=1024B）**：

| 口径 | 预算 | 实测（tarball+0.4.0 观测带） | 最坏余量 |
|---|---|---|---|
| raw | ≤ 100 KiB（102,400 B） | 100,111–100,131 B | 2,269 B |
| gzip（Node zlib.gzipSync level 9，算法冻结） | ≤ 70 KiB（71,680 B） | 58,427–58,499 B | 13,181 B |
| 预警线 raw | 98 KiB（100,352 B） | 带顶 100,131 B | **221 B** |

**降级预案（Owner 预案冻结，r2-B3 兑现 linguist 兜底）**：最终发行
物 raw 越预警线（98 KiB）→ betlang 转**非默认** detector item（手动
启用/插件配置），DLD 的 L4 换装 **linguist 派生的精简启发层**——
移植 heuristics.yml 中与本仓库 canonical 集**有交集的消解块**（数据
版本 = linguist commit SHA，正则按 JS 方言固化，配套同规格正负样本
矩阵与门禁），Owner 原话"否则你得看一下 linguist"的兑现范围即此
**curated 子集**；138 块完整移植维持 Non-Goal（超出 canonical 集的
块没有消费方）。降级触发时本变更 L4 章按实际选择改写后重新送审；
任务 4.1 以最终发行物复测为验收。

**公共法则**：二进制不入 git、不入 registry payload（ghostty 法则
原文沿用）；npm 是唯一发行通道（供应链 = 消费者 lockfile，tree-sitter
法则延续）。

**wasm 装载 seam（tree-sitter 四象限同构）**：`wasmLoader(asset) →
{ url } | { bytes }`；浏览器 `?url`（vite 资产发射）/ Node·vitest
`createRequire + readFile` bytes —— 测试跑真实 wasm，不 mock。

**标签映射**：48 标签全表 → canonical id 内嵌多行字符串（含 betlang
版本绑定注释）；无对应标签（`gemfile`/`gemspec`/`vba`/`verilog` 等）
→ null + 一次性 warn（Set 缓存，每标签每进程至多一条）。低置信度
（校准概率分裂）：仍返回 top1 + confidence 原值，消费者自行取舍。

## D5 — registry 结构与边活性（r2-B7：双 item 形状冻结）

```
highlight (core, registry:lib)     + lang-detector.ts（契约 + AUTO_LANG；零 npm 依赖）
                                   context-key.ts + HIGHLIGHT_DETECT_KEY（registry-safe 身份）
highlight-lang-detector (registry:lib, framework-free)
                                   L1-L3 纯 TS + betlang wasm 通道 + lang-canonical.ts 权威表
                                   files（$lib/highlight/ 下平铺、与 core 的 lang-detector.ts
                                   契约文件零撞名，r3-B4）:
                                     default-detector.ts     工厂 defaultLangDetector()（四层瀑布编排）
                                     betlang-detector.ts     工厂 betlangDetector()（L4 直连）
                                     detect-ext-table.ts     L1 扩展名 + basename 多行字符串表
                                     detect-shebang-table.ts L2 解释器 + modeline 表
                                     detect-structure.ts     L3 冻结伪码实现
                                     lang-canonical.ts       D8.1 权威表
                                   deps: @jixoai/highlight, @jixoai/betlang-wasm
                                   runtime import core 常量（AUTO_LANG 等）——边活性真实
highlight-detect-default (registry:ui)
                                   files: highlight-detect-default.svelte（children 包装 provider，
                                          ~10 行，实现即形态②）
                                          + index.ts（UI item 的纯 barrel 合同）
                                   registryDeps: @jixoai/highlight-lang-detector,
                                                 @jixoai/highlight,
                                                 @jixoai/jixoai-theme（UI item 合同统一要求，
                                                 样式无关也声明——与 icon/icon-set 的 registry:ui
                                                 形状对齐，r3-B5）
highlight-highlightjs              + detector 槽位接线（D7 语义）
code-card                          + langDetector prop、AUTO_LANG 路径
```

- **framework-free 合规**（registry living spec 的 lib/engine item
  法则）：Svelte 组件不进 lib item——`HighlightDetectDefault` 独立成
  registry:ui item；消费者要零组件接线就手写形态②（文档两种形态
  并列，spec 的接线场景同时锁两种）。**folder target 验证（r8-B2 方言律）**：target =
  `@ui/highlight-detect-default/highlight-detect-default.svelte` +
  `@ui/highlight-detect-default/index.ts`（barrel）；消费者导入用
  SvelteKit 方言 `$lib/ui/highlight-detect-default/…`（直达 .svelte
  与 barrel 两种各编译一次）——`@ui/…` 只出现在 registry target 与
  docs 的安装位置描述，永不作为 import 语句。
- DLD 对 core 的依赖是**真实 runtime import**（工厂与表模块 import
  `AUTO_LANG`/`HIGHLIGHT_DETECT_KEY` 常量）——verify-deps 跳过
  `import type`，纯类型边会判 dead（r1-B4）。
- `verify:shadcn-add` 派生**三 case**：裸 code-card（构建零 DLD 字节
  断言 + 运行时 reject）、code-card + DLD lib（clean build + wasm
  ?url 发射）、code-card + DLD + wrapper（一行包装接线 +
  `lang="auto"` 端到端）。
- `HIGHLIGHT_DETECT_DEF` + `createHighlightDetectContext` 为
  **site-only**（`lib/highlight/context.svelte.ts`，与 HIGHLIGHT_DEF
  同法——context-key.ts 头注释的既有二分：registry-safe 身份随 core，
  内核编排属站点）。context.svelte.ts 增补 def 时镜像两树同步。

## D6 — 显式不做（Non-Goals）

- 不做检测缓存层（同 code 跨卡片复用）——后续有真实需求再立项。
- 不做 linguist heuristics 的**完整** JS 移植（138 块）——降级预案只
  移植与 canonical 集有交集的 curated 子集（r2-B3 后的准确表述）。
- 不做 betlang 之外的统计引擎抽象（第二个实现出现时再抽公共）。
- 不改 `lang` prop 的联合类型（AUTO_LANG 常量 + guard）。
- 不做 confidence 的卡片侧行为（v1 透传，消费者/插件自行取舍）。

## D7 — hljs detector 语义冻结（r1-B5 + r2-N2）

```
highlightJs({ langs }).detector:
  detect({ code })                      // filename 被忽略
    候选集 = 实例 langs 闭包（undefined → 引擎 curated 全集）
    候选集为空数组 → null（无候选，不级联误报）
    否则：懒加载注册候选集到【本实例私有 core】——highlight.js 的
          newInstance()（lib/core 实测 API）为 detector 单开实例，
          与 highlight() 用的模块级 core、其他实例、全局注册表
          零串扰 → highlightAuto(code) 跑且仅跑该实例已注册集
    命中 → { lang: 实例别名表收敛为 canonical, source: 'engine' }（无 confidence）
    无命中 / 部分注册失败 → null（级联语义交还链）
```

测试锁死：空 langs → null；`langs` 缺省 = curated 全集为候选；双
实例不同 allowlist 互不可见（A 注册 ts、B 注册 css；A 的 detector
检不出 css 样本）；newInstance 与模块 core 的注册表隔离断言；无
命中 → null；构造不 paint 时 detector 不预注册（零额外加载直到
首次 detect）。

## D8 — canonical 权威表与内核侧最小契约（r2-B5/NIT5）

### D8.1 lang-canonical.ts（DLD item 内，单一权威数据源）

各 backend 的 curated/alias 集历史地各自为政（lib/shiki.ts、
highlight-js.ts 各自的表）——本变更不合并它们（超范围），但检测侧
需要一张**可版本化的权威表**回答"检测产物落在哪个 canonical id、
该 id 哪些引擎能渲染"：

**表 grammar（r3-B3 冻结，可解析才可门禁）**：

```ts
// lang-canonical.ts —— 单一多行字符串表（D3.1 形态）
// 行 grammar：`<canonical> <k>=<v>...`，字段序固定：
//   字段       类型    规则
//   ────────────────────────────────────────────────────────────
//   canonical  SCALAR  ^[a-z0-9+#.-]+$（lang 命名空间同域）；逗号/`=`/空白非法；全表唯一
//   betlang    SCALAR  48 标签恰好各出现在一行；无对应 = `-`
//   ext        LIST    项值域 [A-Za-z0-9+#._-]（项内无逗号）；歧义扩展名不列
//   file       LIST    同上；可缺省
//   interp     LIST    同上；可缺省
//   backend    LIST    同上（引擎 id 快照）
//   逗号法则（唯一）：仅作 LIST 分隔符——SCALAR 含逗号 = parse error；
//   前导/尾随/连续逗号（`,a`/`a,`/`a,,b`）与空项 = parse error；
//   重复项 = parse error；次序即书写序不重排
// 通用规则：`#` 起注释行；空白行忽略；同一 k 不得在一行内重复；
// canonical 不得重复出现；字段序固定为上表顺序，缺省字段直接省略
// （合法样例：`python betlang=Python ext=py interp=python,python3
// backend=shiki,hljs,prismjs` 省略 file 仍合法）；任何违例 = parse
// error（构造期抛出；五类字段级 fixture：SCALAR 含逗号、前导/尾随/
// 连续逗号、重复列表项、重复 canonical、同行重复 k——断言各自的
// 错误信息含违规字段名与行内容）。
const CANONICAL = `
# sources: betlang =0.1.1 (crates.io) | linguist @5fb5096b95ab9893c5925d87121e5faaae9f3966 | backend curated @e5b189ee
# （task 3.0 编纂时必须以当日仓库 HEAD 产生新 SHA 并随编纂提交落表
#   ——旧 SHA 被显式替换而非漂移；表内永远是不可变 SHA）
# （占位符在实现期 task 3.0 编纂时必须替换为真实 SHA——门禁断言表内
#   无 <> 占位符残留，非占位值是开工前置条件）
typescript betlang=TypeScript ext=ts interp=- backend=shiki,hljs,prismjs,sugar-high,tree-sitter
tsx        betlang=-           ext=tsx backend=shiki,tree-sitter
python     betlang=Python ext=py interp=python,python3 backend=shiki,hljs,prismjs
`;
```

**生成与门禁**：表由实现期一次性编纂（task 3.0），来源三处钉死版本
（betlang crate 0.1.1 的 48 标签清单、linguist languages.yml @SHA、
本仓库各 backend curated 集 @commit）；`scripts/verify-lang-canonical.mjs`
（或并入既有 gate）断言：48 个 betlang 标签恰好各出现一次、canonical
无重复、ext/file/interp 无跨行重复值、派生的 L1/L2/标签映射与三个
消费文件内容一致（derive-then-diff）。

- L1/L2 表、betlang 标签映射、（降级时的）linguist 消解块**全部从
  此表派生**——三处数据不会漂移（"恰好一次"映射作为表完整性测试：
  每 betlang 标签恰好映射一个 canonical 或显式 `-`，无重复无遗漏）。
- **检测成功但 backend 不支持 = 终态 reject**（D2.1）：报错按矩阵
  失败法则点名"该 canonical 由哪些已装引擎覆盖"；不换检测器重试。

### D8.2 内核侧最小契约（site-only context.svelte.ts 增补）

**统一 context 值模型（r3-B1，单一事实消除冲突）**：内核管线值类型
`LanguageDetector | undefined`（defaults/ssrSafe 皆 undefined——检测
是运行时行为，无 DEFAULT_SHIKI_BACKEND 对应物，链尾空即落
backend.detector 环）；**存储到 HIGHLIGHT_DETECT_KEY 的 context 值
恒为 `{ detector: LanguageDetector | undefined }` adapter**（registry
消费者 getContext 读 `.detector` 并做函数判据——undefined 即"无意见"
级联下一环，与手写 setContext、包装组件、内核 provider 三路写入形状
统一）：

```ts
export const HIGHLIGHT_DETECT_DEF: ContextDef<'highlight-detect', LanguageDetector | undefined> =
  defineContextDef({ key: 'highlight-detect', defaults: () => undefined, ssrSafe: undefined });

export function createHighlightDetectContext(initial?: LanguageDetector): {
  get detector(): LanguageDetector | undefined;  // pipeline.exposed 投影
  set(detector: LanguageDetector): void;         // live 切换，卡片检测链响应
} {
  // …pipeline 形态对齐 createHighlightContext…
  setContext(HIGHLIGHT_DETECT_KEY, context);     // context 即 { detector } adapter（getter）
  return context;
}
```

三条写入路径产出同一形状（端到端测试各一条）：内核
createHighlightDetectContext、包装组件（内部即形态②）、手写
setContext(HIGHLIGHT_DETECT_KEY, { detector })。卡片读取只认
`getContext(HIGHLIGHT_DETECT_KEY)?.detector` 函数判据。`set()` live
切换语义与 backend context 相同。插件 hook 测试：definePlugin
targets=[HIGHLIGHT_DETECT_DEF] 的 before/after 在检测链上生效、prop
恒压过投影。
