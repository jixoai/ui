# registry — 增量

## ADDED Requirements

### Requirement: 检测能力按 item 拆分，可选层零构建边

语言检测能力 SHALL 遵循引擎矩阵的一能力一 item 法则：`highlight`
core item 只扩契约文件（lang-detector.ts + context-key.ts 的
HIGHLIGHT_DETECT_KEY 增补，零 npm 依赖）；DLD 四层 SHALL 是独立
**registry:lib** item（`highlight-lang-detector`，framework-free：仅
纯 TS 表层/探针/工厂 + lang-canonical.ts 权威表；声明
`@jixoai/highlight` registry 边与 `@jixoai/betlang-wasm` npm 依赖，
并携带真实 runtime import core 的 `AUTO_LANG`/`HIGHLIGHT_DETECT_KEY`
——纯 type import 会被 verify-deps 判 dead）；其文件 SHALL 与 core
的 lang-detector.ts 契约文件零撞名（default-detector.ts /
betlang-detector.ts / detect-ext-table.ts / detect-shebang-table.ts /
detect-structure.ts / lang-canonical.ts，registry payload exactly-once
验证）；Svelte 包装 provider SHALL 是独立 **registry:ui** item
（`highlight-detect-default`：children 包装组件 + index.ts 纯
barrel，registryDeps 声明 @jixoai/highlight-lang-detector、
@jixoai/highlight 与 @jixoai/jixoai-theme——UI item 合同统一要求，
样式无关也声明，与 icon/icon-set 的 registry:ui 形状对齐）；引擎自带检测（highlight.js
highlightAuto）SHALL 接线在既有引擎 item 内，不新开 item。code-card 的
`langDetector` prop 与 AUTO_LANG 路径 SHALL 零成本默认——卡片与 core
不存在指向 DLD 的任何静态 specifier，未装 DLD 的消费者构建图零 DLD
字节，`lang="auto"` 运行时 reject 报安装与接线指引。
verify:shadcn-add SHALL 派生三隔离 case：裸 code-card（clean vite
build 通过 + 构建产物零 DLD 字节断言）、code-card + DLD lib（clean
vite build 通过 + wasm 经 ?url 发射为真实资产）、code-card + DLD +
wrapper（包装接线后 `lang="auto"` 端到端检测上色）。

#### Scenario: 裸 code-card 消费者

- **WHEN** 消费者只装 code-card（不带 DLD）并构建
- **THEN** clean vite build 通过，构建产物不含 DLD 表层、结构探针与
  betlang wasm 的任何字节；`lang="auto"` 运行时触发 reject 并纯文本
  回退

#### Scenario: DLD lib 消费者隔离安装

- **WHEN** 消费者 `add @jixoai/highlight-lang-detector` 并在子树根
  手写 setContext 接线
- **THEN** 落地 framework-free 四层文件与 @jixoai/betlang-wasm npm
  依赖；clean vite build 通过且 wasm 经 ?url 发射为真实资产；
  `lang="auto"` 卡片端到端检测上色

#### Scenario: wrapper item 消费者

- **WHEN** 消费者 `add @jixoai/highlight-detect-default` 并以 children
  包装接线
- **THEN** lib + wrapper 两个 item 全落地，包装子树的卡片吃到 DLD
  默认；未包装的兄弟子树不吃（context 作用域法则）；wrapper case
  以两种消费者方言导入各编译一次（
  `$lib/ui/highlight-detect-default/highlight-detect-default.svelte`
  直达与 `$lib/ui/highlight-detect-default` barrel——`@ui/…` 仅为
  registry target 别名，不作 import）
