# Proposal: paged-doc-family — 出版级文档组件族（native 引擎）

## Why

Owner 第一性原理裁决（2026-08-30）：文档站的问题拆为「规范文档编写」与
「结构化信息提取」两问；前者由 Paged* 承担——不依赖 Paged.js，用原生
CSS/Svelte 以 20% 成本实现 80% 功能，API 词汇对齐 CSS Paged Media，
web 模式无页（沉浸连续流 + 响应式列），分页只是 print 媒介投影。
统一方案经 Codex 五轮复核（6.0→7.0→7.8→8.3→8.8 READY-TO-IMPLEMENT，
全文 `.agents/audit/2026-08-30-site-walkthrough/paged/`）。
Owner 验收政策：Codex 通过即开发，Owner 在最终文档页做产品验收。

## What Changes

### 1. `apps/www/src/lib/paged/`（site-only 组件族，零依赖）

- `PagedDoc` — flow="web|print"、columns="auto|1|wide"、
  page={{size,margin,bleed?,marks?}}（print 时注入 @page 规则）、
  orphans/widows（默认 2/2，投影全局 :where）、runningHeader 可选
  （Chromium-only，引擎 gated 注释）、engine="native"（pagedjs 占位词汇）
- `PagedSection` — break="auto|section|avoid|page"，heading-keeper 包裹
  （标题+首内容单元打包 avoid）
- `PagedFigure`（Figure counter）/ `PagedAside`（宽= Tufte 右浮动边注，
  窄=沉降内联）/ `PagedRef`（Context 注册表编号回填 §N）/
  `PagedToC`（包装现有 toc；web 锚点滚动；print 章节号代位页码——
  编号是 DOM 顺序的显示货币，稳定寻址靠显式 id）/
  `PagedTable`（thead 重复 + tr avoid）/ `PagedCode`（printOverflow
  ="flow|shrink"，flow=解 scrollport 恢复行间断点）

### 2. `apps/www/src/lib/medium.svelte.ts`

MediumState 三态纯派生 reducer：
`realPrint ? 'print' : (nearestSimRoot?.hasStamp ? 'sim' : 'screen')`；
真实 print > sim > screen；afterprint 只清 realPrint 源后重求值；
`data-jx-print-sim` 戳驱动 sim；SSR 安全（顶层无 window 副作用）；
`isPrintProjection ≡ state !== 'screen'`。

### 3. print 投影法则（css-architecture delta）

受审计的 unlayered `:where()` 白名单（具名表）：
`[data-jx-print="hide"]`→display:none；
`[data-jx-print="flatten"]`、`[data-jx-canvas-scroll]`、
`[data-jx-code-card-pre]`、`[data-jx-props-table-scroll]`→
overflow:visible + max-block-size:none（canvas 滚动层 min(32rem,60vh)
上限必须一并解除）。白名单外 print 规则留 @layer components。
四动词正交：hide / freeze（同 DOM 停机）/ static（替换节点）/
flatten（结构重排）；虚拟列表结果契约 snapshot|truncated 不占动词。

### 4. PropsTable markup 合同

包装层强制输出 `data-jx-props-table-scroll`，登记 component CSS-defined
hooks + source guard（禁手写替代）。

### 5. 试点页 `/docs/paged.html`（Owner 验收面）

press-button 内容的出版级演示：章节编号/图注/边注浮动沉降/交叉引用/
目录全基元 + 打印按钮；复用 canvas-schema meta 与活体画布作插图。

### 6. 探针（verify-print.mjs，verify-press 同款 playwright-core 模式）

print 媒介仿真下断言白名单 computed style 胜过 utilities
（display:flex / overflow:auto / max-block-size 三 utility 同时在场）；
sim 投影 `@media not print` 排他断言。

## Out of scope（记录在案）

- engine="pagedjs" 的实现（fillKeep/floatKeep/pageObject 阈值消费、
  「续」标记、真页码 target-counter）——词汇占位，未来 change
- FreezeSnapshot 序列化器帧擦洗升级（截图反哺线）——独立 change；
  本 change 只落 medium 冻结语义（freeze 动词的 CSS 半边）
- 223 条 demo 骨架 backlog、DensityDemo 全站退役（successor 批）

## Impact

新文件：lib/paged/、lib/medium.svelte.ts、/docs/paged.html 路由、
scripts/verify-print.mjs。修改：props-table 包装层、css-architecture
spec delta、gen-mirror-manifest SITE_ONLY 前缀 [集成者]、
verify-all 挂载 [集成者]。registry 零改动（site-only 家族）。
