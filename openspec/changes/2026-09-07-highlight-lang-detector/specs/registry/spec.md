# registry — 增量

## ADDED Requirements

### Requirement: 检测能力按 item 拆分，可选层零构建边

语言检测能力 SHALL 遵循引擎矩阵的一能力一 item 法则：`highlight`
core item 只扩契约文件（lang-detector.ts + context-key.ts 的
HIGHLIGHT_DETECT_KEY 增补，零 npm 依赖）；DLD 四层 SHALL 是独立 item
（`highlight-lang-detector`，声明 `@jixoai/highlight` registry 边与
`@jixoai/betlang-wasm` npm 依赖，并携带真实 runtime import——接线组件
import core 的 `HIGHLIGHT_DETECT_KEY`/`AUTO_LANG`，纯 type import 会被
verify-deps 判 dead）；引擎自带检测（highlight.js highlightAuto）
SHALL 接线在既有引擎 item 内，不新开 item。code-card 的
`langDetector` prop 与 AUTO_LANG 路径 SHALL 零成本默认——卡片与 core
不存在指向 DLD 的任何静态 specifier，未装 DLD 的消费者构建图零 DLD
字节，`lang="auto"` 运行时 reject 报安装与接线指引。
verify:shadcn-add SHALL 派生双隔离 case：裸 code-card（clean vite
build 通过 + 构建产物零 DLD 字节断言）与 code-card + DLD（一行接线
后 clean vite build 通过 + wasm 经 ?url 发射为真实资产）。

#### Scenario: 裸 code-card 消费者

- **WHEN** 消费者只装 code-card（不带 DLD）并构建
- **THEN** clean vite build 通过，构建产物不含 DLD 表层、结构探针与
  betlang wasm 的任何字节；`lang="auto"` 运行时触发 reject 并纯文本
  回退

#### Scenario: DLD 消费者隔离安装

- **WHEN** 消费者 `add @jixoai/highlight-lang-detector` 并以
  `<HighlightDetectDefault />` 接线
- **THEN** 落地四层文件与 @jixoai/betlang-wasm npm 依赖；clean vite
  build 通过且 wasm 经 ?url 发射为真实资产；`lang="auto"` 卡片端到
  端检测上色
