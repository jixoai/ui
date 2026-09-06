# registry — 增量

## ADDED Requirements

### Requirement: 检测能力按 item 拆分，一 detector 一 item

语言检测能力 SHALL 遵循引擎矩阵的一能力一 item 法则：`highlight`
core item 只扩契约文件（lang-detector.ts + HIGHLIGHT_DETECT_KEY
seam，零 npm 依赖）；DLD 四层 SHALL 是独立 item
（`highlight-lang-detector`，声明 `@jixoai/betlang-wasm` 依赖与
`@jixoai/highlight` registry 边）；引擎自带检测（highlight.js
highlightAuto）SHALL 接线在既有引擎 item 内，不新开 item。code-card
的 `langDetector` prop 与 `lang="auto"` 路径 SHALL 零成本默认——不装
DLD 的消费者构建图中不存在检测模块边。verify:shadcn-add SHALL 为新
item 自动派生隔离安装 case（canonical files、npm 独占、typecheck）。

#### Scenario: 裸 code-card 消费者

- **WHEN** 消费者只装 code-card（不带 DLD）并构建
- **THEN** 构建产物不含 DLD 表层、结构探针与 betlang wasm 的任何
  字节；`lang="auto"` 运行时触发 reject 报安装命令并纯文本回退

#### Scenario: DLD 消费者隔离安装

- **WHEN** 消费者 `add @jixoai/highlight-lang-detector`
- **THEN** 落地四层文件与 @jixoai/betlang-wasm npm 依赖；clean
  vite build 通过且 wasm 经 ?url 发射为真实资产
