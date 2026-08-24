# jx-pure Owner round 2 — review r10

## 结论

**6.5/10 — Reject。** 规则级排除主体整体正确，但 D2 仍有一个可观察的 `@media` 复活缺口，且实现注释/设计记录未完成第三次修订同步。

## 阻塞

1. **D2 / Part D auto-dark 漏排除。** PostCSS AST 解析两份镜像均为 157 条 `.jx-pure` 规则、211 个 selector subject；用户声明的 212 个排除中恰少一处。唯一漏项是 `apps/www/src/lib/jx-pure.css:2020`（registry 镜像同 line）的生成规则：
   `:where(.jx-auto-dark) :where(.jx-pure):not(.jx-light, .jx-light *) { color-scheme: dark; }`。
   在 `@media (prefers-color-scheme: dark)` 下，构造 `.jx-auto-dark.jx-pure > .no-jx-pure > .jx-pure > input` 实测 `color-scheme: dark`，所以嵌套 `.jx-pure` 仍被 Part D 复活，违反“every face rule carries `:not(.no-jx-pure, .no-jx-pure *)`”及嵌套不复活契约。应补排除并加入该探针。

## 文档残留

2. CSS header `apps/www/src/lib/jx-pure.css:41` 仍称 `[data-jx-pure-skip]` 为 B12 escape hatch；B12 旧段 `:1842-1858` 仍描述 `all: revert`、`FULLY native` 和 “`:not()` chains do not scale”。`design.md:48-59` 的“历史裁定”后仍保留旧机制的“具体规格”。这些与第三次 `:not()` 终裁、scope-laws 页面和 living spec 相互矛盾，应删除或明确标为历史记录。

## 已核验证据

- 两份 CSS mirror byte-identical；44 个伪元素规则均把排除置于 `::pseudo` 之前；`@layer`、`@supports`、reduced/forced `@media` 规则均通过 AST 检查。
- `node scripts/verify-jx-pure.mjs 5199` 全绿；`pnpm --dir apps/www test`: **327/327**；`npm run build:site` 通过。现有四探针（UA button、inline display/color、`.jx-input`、嵌套视觉面）均绿，但未覆盖上述 auto-dark `color-scheme` 复活。
- `verify-jx-pure-engines.mjs` 本轮 Firefox 因 `NS_ERROR_NET_ERROR_RESPONSE` 跳过；WebKit 仍为既有债务。

---

## 终裁（r10.1，2026-08-24）

**8.0/10 — Reject（文档与发布元数据未闭合）。** D2 的 CSS 实现现已通过：两份镜像一致，PostCSS 解析得到 211 个 `.jx-pure` selector subject，211 个均有规则级排除；44 个伪元素排除均位于 `::pseudo` 前，`@media` / `@supports` 内同样成立。生成器 companion 也已加排除。`color-scheme` 从岛外主题根继承到岛内是现行契约允许的主题流，不是面规则复活；Chromium probe、串行 Vitest **327/327**、`build:site` 均通过，gzip **17,005 B** < 18 KB。

但“契约文档一致性、残留已清”不成立：根 [registry.json](../../../../registry.json) 的 jx-pure `description` / `docs` 仍公开宣称 `[data-jx-pure-skip]` 与 `all:revert`（第 277、285 行）；scope demo 仍写 `even .jx-input reverts`（`apps/www/src/routes/components/jx-pure.html/+page.svelte:627`），与“Part A 显式类照常工作”相反；[design.md](design.md) 第 52–59 行仍以“具体规格”陈述旧 `all:revert` 机制。另，“212 处”是原始文本计数（包含 B12 注释）；实际 selector 排除为 **211**，应统一计数口径或修正文案。

移除/改写上述三处旧公开契约并清理 CSS 两镜像的尾随空格后，可按现有行为证据 Accept；无需重引入 `revert` 来阻断继承。

---

## 终裁（r10.2，2026-08-24）

**9.5/10 — Accept。** registry/demo/design 契约残留已同步为 `:not()` 法则并标明旧法仅为过程记录，排除计数统一为 211；双镜像字节一致且无尾随空白，AST（211/211，44 个伪元素顺序正确）、verify、327/327 与构建链全绿。
