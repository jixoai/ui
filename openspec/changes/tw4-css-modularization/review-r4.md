# tw4-css-modularization review-r4

> 审查意图（2026-08-24）：对 Owner 的 Tailwind v4、CSS 模块化、每组件一
> 文件夹三项重构，在实现前确认 OpenSpec 合同能给出唯一迁移与验收结果。
> 本报告只审 change 草案和真实工作区证据；不把任务清单或当前基线构建当作实现。

## 结论

**Block。尚未达到“可实现前定稿”。** r3 的 B9、B10 已得到实质修复：toast
不再受同名主文件假设限制，`app.css` 也不再被要求拆散 Tailwind 全局上下文。
但本轮发现 canonical-main 的机器来源、P0.2 fixture 集合和消费者 Tailwind
entry/theme 合同仍没有唯一、可执行的答案。三者会分别影响 73 个 index 生成、
P0 gate 是否完成，以及 P3 后安装组件能否实际生成/解析 token utilities。

## 已验证

- `openspec validate tw4-css-modularization --strict`：通过。
- `npm run build`：通过，shadcn 4.19.0 仍构建当前 84 个 flat items。
- `npm --prefix apps/www run build`：通过；输出仅有既有 Svelte/a11y/CSS
  warnings。当前 registry/mirror 尚未实施本 change 的 folder、manifest 或 utility
  迁移，故这些构建不是 P0/P1/P2/P3 的完成证据。
- 当前 `registry.json` 的 73 个 `registry:ui` item 中，72 个有同名
  `<name>.svelte`，唯一例外是 `toast -> toast-viewport.svelte`；但 schema 的
  `files[]` 只有 `{ path, target, type }`，没有 component entry/canonical-main
  字段。`toast-store.ts` 仍是同一 toast item 内的 `@lib` target。
- 当前 `apps/www/src/app.css:14-51` 确实持有唯一 `@import 'tailwindcss'`、两个
  theme import、`@theme inline` 与 global `@layer base`；
  `registry/files/theme/jixoai.css:219,630-631` 还定义 base、`dark` variant 和
  token mappings，验证了 B10 不能把 compiler context 分散到 route CSS。

## r3 B9/B10 复核

| 项目 | 判定 | 真实依据 |
| --- | --- | --- |
| B9-r3 toast main | **已解决，但见 B11** | registry delta:9-20、design D3:93-97、tasks 0.2:24-29/1.1:48-57 都明确 `toast-viewport.svelte` 是 `ui/toast/` 的 canonical main、target 为 `@ui/toast/toast-viewport.svelte`，index default export 指向它，store 留在 `@lib`。 |
| B10-r3 app.css boundary | **已解决** | css-architecture delta:23-30、tasks 2.2:88-95、2.3:96-102 与 design D4:138-141 一致：保留唯一 fan-in 和所有 global context；仅列举的 site-only selectors 可移；无关 route 和 consumer fixture 都必须验证 `dark:*`、`border-border`、`bg-background`、base。 |

## 阻塞问题

### B11-r4 — “component entry”没有机器可读的唯一来源

`registry` delta:11-20、design D3:93-97 与 tasks 1.1 都以“item's component
entry/canonical main”驱动 73 个 folder、index 和 target 的生成；但真实
`registry.json` 与 shadcn 的 `registryItemFileSchema` 都不表达 entry。P0.3 所定义
的 `apps/www/mirror-manifest.json` schema 也只有 source/mirror/target/owner/
move-vs-dependency/exception，未记录 `canonicalMain`。当前 toast 由文字特判虽可
读懂，但脚本无法从 item files 一般地判定主文件；以后再有非同名或多个 root
component 的 item，index default export 和 docs rewrite 又会回到人工猜测。

**可验证修复：**在 P0.3 的 committed mapping schema 增加每个 `registry:ui` item
恰有一个 `canonicalMainSource`（及其 consumer target），并在 registry delta 写成
normative source of truth：同名 `.svelte` 可由脚本推导，非同名项必须在 mapping
显式声明；脚本对缺失、重复、非 item-local path 或和 `files[]` 不一致均失败。
把 toast 作为该显式行，并使 P1 index/target generator 只读取该字段。P0.2 断言
toast index 的 default import 正是 mapping 指定的文件。

### B12-r4 — P0.2 的第二 fixture 在 normative scenario 与 tasks 中互相冲突

tasks 0.2:21-29、registry delta:35-38 固定两项为 `accordion + toast`；但同一
registry delta 的“shared lib file”scenario:48-54 仍规定 `code-card` 是“second
P0.2 fixture”。真实 `code-card` 同时含 `@lib/shiki.ts`、npm `shiki` 和 registry
dependencies，和 toast 的 `@lib/toast-store.ts` 覆盖面不同。因此按该 delta 完成
两 fixture 时，无法同时满足“第二个是 toast”与“第二个是 code-card”。

**可验证修复：**选择并全处统一一个验收矩阵。若维持 Owner 已指定的两 fixture，
将该 scenario 改为 `toast`，明确它验证“non-identical main + item-shipped
canonical @lib file”；并把 code-card 的 `@lib/shiki.ts`、npm/registry dependency
路径列为 P0.3 mapping + P1 full-gate 的专门断言。若要求 `shiki` 的递归安装也作
为 migration 前 gate，则把 P0.2 改为明确的三 fixture（accordion/toast/code-card），
不得继续称 TWO fixtures。修复后 grep P0.2、registry scenarios 与 P1.5 只能得到
同一集合。

### B13-r4 — Tailwind v4 的消费者 entry/theme 安装合同缺失

proposal:66-74 和 component-authoring delta:7-9 规定 Tier-1 utility 要基于
jixoai token-sheet `@theme` mappings；但 registry delta:32-38/P4.1 只要求文档+
检测“有 Tailwind v4”。现状 73 个 UI item 仅 2 个声明
`@jixoai/jixoai-theme` dependency，71 个不会随安装获得 token sheet；即使主题文件
落到 `@lib/jixoai.css`，shadcn add 也不会自动把它接入消费者唯一 CSS entry。这样
P3 产生 `border-border`/`bg-background`/`dark:*` 后，消费者可以通过“有 Tailwind”
检测，却没有对应 `@theme`/variant，utility 可能不生成或解析为错误的 token。

**可验证修复：**在 registry/component-authoring delta 和 P0/P3 gate 定义唯一的
consumer entry setup（至少 Tailwind entry、jixoai theme import、需要时 jx-pure
import 的顺序）及其责任主体；所有 utility-authored UI item 用该 setup 作为
documented install prerequisite，必要的 registry dependency 随之统一声明。新增一
个由 `shadcn add` 产物构成的干净 SvelteKit consumer fixture：只按这份公开 setup
导入 CSS，安装一个实际 P3a utility-authored component，并在 browser/compiled
output 中断言 `dark:*`、`border-border`、`bg-background` 和组件 utility 都存在。
把此 gate 放在首个 P3a component 之前/之中，不能留到 P4 文档阶段。

## 非阻塞建议

1. tasks 顶部仍称当前 jx-pure/website-scaffold 脏基线“failing apps/www build”，
   本轮实际 `npm --prefix apps/www run build` 已通过。改为“P0 前记录干净
   baseline commit/hash”，避免已过期的 Owner 操作前置条件。
2. design D2:58 的“app.css shrinks to ~the entry block”应改为“移除 site-only
   supplements 后保留 global fan-in/context block”；否则和 D4/P2.2 的 B10 裁决
   形成不必要的文字张力。
3. proposal:103-106 把 `$lib/ui/<name>` 称为“breaks”，但 index 正是新的
   `$lib/ui/<name>` public import；应表述为旧的 `$lib/ui/<name>.svelte` 及
   sub-component flat imports break，新 folder entry import 是迁移后的入口。

## 与 r3 的变化

- B9-r3 已关闭：toast 的 folder、真实 main、target、index default export 与
  `@lib/toast-store.ts` 保留规则在任务、设计、registry delta 均已落稿。
- B10-r3 已关闭：`app.css` 的单一 Tailwind fan-in、全局 context 保留、site-only
  移动边界和跨 route/consumer compiled-output probe 都已落稿。
- 本轮新增 B11（canonical main 可机械判定）、B12（fixture 集合冲突）和 B13
  （consumer entry/theme contract）。它们均来自 revision 与实际 `registry.json` /
  shadcn schema 的交叉核对，而非自评复述。

## 评分与裁决

- 实现质量：**2/10**。没有本 change 的实现；当前 build 证明的是 flat baseline。
- 方案质量：**7/10**。Tier-2 frozen boundary、folder CSS 禁止 `@utility`、P1
  companion-CSS 同批移动、B9/B10 的收敛、完整 manifest 和双验收轴已具备较强基础；
  但 B11-B13 会使核心生成/安装/验证路径出现非唯一结果。
- 综合参考：**9/20**（实现 2 + 方案 7；不是产品验收分）。

**最终裁决：Block。** 修复 B11、B12、B13 后，重新运行 strict validation、root
registry build、apps/www build；P0/P3 实施时还须以真实 `shadcn add` consumer 与
browser compiled-output probe 取得运行证据，随后再做实现前定稿复核。
