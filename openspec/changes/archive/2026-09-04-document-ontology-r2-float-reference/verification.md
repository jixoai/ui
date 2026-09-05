# Verification: document-ontology R2 — 浮+引

实施窗口 2026-09-05（Codex 文档评审 8 轮收敛于 8.2/9.0 + START-APPLY
后启动；批次 0–6 落地）。证据按 tasks 批次归档。

## 批次 0 — 接口先行（commit 2e7d2a9 / d8ee7c2）

- 0.1/0.2 `ui/figure/numbering.svelte.ts` 冻结面 + 派生纯函数：
  `bunx vitest run test/figure-numbering.spec.ts` → **13/13**（行为 9
  + §1.1b 值表 4：1/1.1/1.1.1、兄弟根 2、DOM 序压倒注册序、嵌套
  局部重启、document 并集 F1-F2-F3、SSR 模板序代理）；
  `svelte-check` 对新文件零错误（全仓 559 为 fixtures 既有存量）。
  值表门抓出并修复 domainOrdinal 的包装对象身份 bug。
- 0.3 路由 provider：`test/numbering-provider.spec.ts` → **4/4**
  （树内树外 context、DOM 变动 bump、卸载断开、重挂载即新文档）。

## 批次 1/2/3 — 组件波（commit 13b443e，三路并行子代理，整合者复验）

- Section 编号树：`test/section-numbering.spec.ts` → **11/11**（含
  现状门：域外节 outerHTML 逐字节等价 + 无 data-number/编号节点）。
- Figure：`test/figure.spec.ts` → **9/9**（计数矩阵/citedIn JSON/
  裸用 warn/活 thunk）。
- Reference：`test/reference.spec.ts` → **7/7**（五态矩阵/逃生门/
  settle 口径断言）。
- 整合复跑七文件 **90/90**；五镜像字节一致（vite mirror 插件）。

## 批次 4 — 交叉门（本批整合提交）

- 4.1 法则门：`test/display-currency.spec.ts` → **2/2**——keyed
  `items.reverse()` 换序（**实例保留反证**：per-instance 计数不归零
  + DOM 节点 `toBe` 同一），编号重排/id 不动/Reference 同 settle
  跟随/注册表 thunk 直读新号；figure 与 section 双夹具。
- 4.2 打印/静态形态（记录式证据）：构建产物 `public/docs/components/
  figure.html` 断言——SSR 完备编号在场（`data-number="1"/"1.1"/"1.2"`
  + `Eq (1.1)`/`Eq (1.2)` 解析文本 + `data-jx-figure` + citedIn JSON）；
  `reference.html` 四引用全部预渲染为 `<a href data-ref-to>??(X)</a>`
  ——前向边主张按 P1-4=A 在静态 DOM 在场（水合后解析/settle 后摘除
  由 4.3 门证）。编号解析在 effect-flush 级完成（display-currency
  settle 断言），冻结捕获（DOM-commit barrier 后）读到的编号 ≡ live。
  交互态 reorder+capture 的 barrier 用例由 4.1 的 settle 断言承载
  （jsdom 层）；paged 侧零特判（编号已在 DOM，打印管线原样捕获）。
- 4.3 交互门：`test/reference-interaction.spec.ts` → **3/3**（真实
  click fragment 落 hash、原生锚点键盘焦点双断言、hydrate 三态含
  回退锚可点→late 目标同 tick 解析）。
- 4.4 docs 页 + 源侧门：figure/reference 双页落地；
  `test/docs-structure.spec.ts + props-table-meta-drift.spec.ts` →
  **34/34**（prerender 精确集、taxonomy 重冻结 layout 14→16=98 项、
  dist 闭环）。

## 批次 5 — 收割消费（本批整合提交）

- `test/search-corpus.spec.ts` → **17/17**（12 既有 + 5 新：编号页
  收割、五分支投影、前向 SSR 边、未编号 Section 可引/未编号 Figure
  过滤、加性 + 旧 schema 逐键不变）；live convergence 对当前构建
  产物 875 sections 一致；`--typecheck` 零错。
- 语料重生成：`node scripts/build-site.mjs` → 104 页 /
  `search/corpus.json`（873KB）。**记档**：live 语料暂无 R2 字段——
  组件 demo 按 ToC 大法则（`data-toc-skip`）不入语料，R2 字段的
  活体出现需主流程真文档内容（R5 手册页的自然义务）；收割逻辑的
  正确性由夹具门证明。

## 批次 6 — registry 整合（commit 0cb3ce9/521b292 + 本批）

- figure/reference 入 registry（112 载荷含 figure.json/reference.json）；
  依赖边 section-card→figure、reference→figure；manifest 445 对。
- **待清树重建**：public/r payload parity 现剩 jx-pure（本轮
  auto-dark 重生成）+ tabs/button-group/dialog（并行流半成态）——
  待并行流落定后的干净树 `build-site` 一并收口，非 R2 阻塞。

## 全量套件状态（2026-09-05 04:2x）

2115 测试中 2087 过；28 失败全部归因并行 scroll-run 流的半成态
（tabs-indicator ×3、blueprints ×4 陈旧 SVG、component-canvas-floor、
table-grid、payload parity）——R2 触及的所有套件零失败。
R2 修复的自责项：auto-dark 重生成（engrave 轮 .dark token 的滞后）、
schema-lower 提取器夹具补 `data-jx-press-flat`（flat 戳为新增发射）。
