# tw4-css-modularization review-r3

审查日期：2026-08-24。审查对象：r3 修订后的 proposal/design/tasks、4 个
change delta、基线 specs 与真实 registry/import 状态。

## 结论

**Block。尚未达到“可实现前定稿”。** B5-r2、B7-r2、B8-r2 的主要方向已
真正收敛，但本轮发现两个新的实现边界未写成确定合同：`toast` 这一真实
`registry:ui` item 不符合 `<name>.svelte` 主文件假设；P2 对 `app.css`
全局 Tailwind context 的搬迁范围没有定义，可能破坏所有 consumer utility。

## 验证

- `openspec validate tw4-css-modularization --strict`：通过。
- `npm run build`：通过，shadcn 4.19.0 构建现有 84 items。
- `npm --prefix apps/www run build`：通过；只有现有 Svelte/a11y/CSS warnings，
  未发现本 change 已实现的代码或迁移路径。
- 当前 registry 仍为 flat tree：81 个 `registry/files/ui` 文件（79 个
  `.svelte` + 2 个 CSS），79 个中 72 个带 scoped `<style>`；registry.json
  为 84 items（73 ui、9 lib、1 theme、1 file）。P0.1/P0.2/P0.3 尚未执行，
  所以本报告只确认合同是否可验证，不把任务清单当作运行时证据。
- 工作区仍包含 jx-pure/website-scaffold 等 change 外修改；本报告未修改或
  回滚它们。

## B5/B7/B8 复核

| 项目 | 判定 | 依据 |
| --- | --- | --- |
| B5-r2 `cn()` scope | **已解决** | delta 改为 WHEN 组件迁移为 utility-authored paint 时才要求受影响 class slots 使用 `cn()`；P0-P2 transitional scenario 明确无义务；Tier-2 永不进入 `cn()`。design D5.3、tasks 3.1/3.4 一致。 |
| B7-r2 P1/P2 顺序 | **已解决** | tasks 1.1/1.2/1.3 将 companion CSS 物理移动、相对 import、target、mirror/manifest 放进同一 P1；P2 只处理 layer/selector/cascade，并有双轴 gate。 |
| B8-r2 registry scope | **大体解决** | registry delta/design 已区分 73 ui 与 9 lib/1 theme/1 file，shared `@lib` 支持文件保留 canonical root，P0.3 要求逐文件 mapping table；多文件 item 由脚本全量枚举。下面的 toast 例外仍未被正式写入。 |

## 阻塞问题

### B9-r3 — `registry:ui` 的主文件合同仍不覆盖 `toast`

证据：

- r3 registry delta:10-16 将每个 `registry:ui` component-local file set 定义为
  包含主 `<name>.svelte`。
- 真实 `registry.json` 的 `toast` 是 `registry:ui`，但 files 只有
  `registry/files/ui/toast-viewport.svelte` 与
  `registry/files/lib/toast-store.ts`，没有 `registry/files/ui/toast.svelte`。
- tasks 1.1 仍写成 `registry/files/ui/<name>.svelte`，D3 示例与 P0.2 只说明
  accordion/code-card 或 toast 的共享 lib，不说明无同名主文件的 UI item 如何
  生成 folder/index。

这会使实现者在 `toast` 上产生不同结果：目录叫 `ui/toast/` 但主文件叫
`toast-viewport.svelte`，index 是否生成、default export 指向谁、registry target
是否改成 `@ui/toast/toast-viewport.svelte` 都没有唯一答案。它直接影响 shadcn
add、`$lib/ui/toast`、P0.2 fixture 与 manifest。

可验证修复：在 registry delta/design/tasks 明确一种规则并加入 fixture。推荐：
`registry:ui` item 的主文件不要求同名；以 registry item 的 component entry
（`toast-viewport.svelte`）作为 canonical main，生成
`ui/toast/index.ts` 的 default export，目标固定为
`@ui/toast/toast-viewport.svelte`，shared `toast-store.ts` 仍为 `@lib`；并在
P0.2 用 toast 取代“code-card or toast”的二选一，断言目录、index、canonical
lib file 和 import 全部成立。若要求每个 item 必须有 `<name>.svelte`，则必须把
toast 拆为明确的 `toast-viewport` item + 独立 store dependency，并同步 payload
与 docs。

### B10-r3 — P2 的 `app.css` 收缩合同会误伤 Tailwind 全局 context

证据：

- css-architecture delta:23-24 要求 `app.css` 只保留 Tailwind entry + import
  order；tasks 2.2 要求把 app.css supplements 散到 route/module CSS。
- 真实 `apps/www/src/app.css` 除 site-only selectors 外还承载全站必需的
  `@theme inline` radius mapping，以及 `@layer base` 的 `@apply border-border`,
  `@apply bg-background text-foreground antialiased`, body font、focus、
  selection 等全局规则。
- `registry/files/theme/jixoai.css` 也承载 `@custom-variant dark`、完整
  `@theme inline` 和全局 `@layer base`；独立 route CSS 不会自动继承
  `app.css` 的 Tailwind compiler context。把这些规则按页面拆出会使 utility
  生成、dark variant、base reset 或首屏全局语义随 route 加载而变化。

可验证修复：把 P2.2 改为明确的三类边界：

1. `app.css` 保留唯一 `@import 'tailwindcss'`、theme imports、所有全局
   `@theme/@custom-variant/@layer base` 与 import order；
2. 只有明确 site-only、非 compiler-context 的 selectors（如 data-table、
   token lab、skip-link）才移到命名的 site module CSS，并列出 owner/import；
3. P2 gate 增加 compiled-output probe，验证 `dark:*`、`border-border`、
   `bg-background` 和全局 base 在无关 route 及直接 consumer fixture 中均存在。

若 Owner 真的要求 app.css 只剩 entry/import，应先把这些全局 context 迁入一个
明确命名且唯一 fan-in 的 theme/entry item，而不是分散到 route CSS；该目标必须
在 design/spec 中写死后才能实现。

## 非阻塞建议

1. `design.md` Context 仍使用“one Tailwind context: app.css”，但
   `registry/files/theme/jixoai.css` 本身含 `@theme/@custom-variant/@layer base`。
   建议改成“site entry fan-in context”，并说明 registry theme 在 consumer 中
   需要由 app entry import 才能使 utilities 生效。
2. P0.3 mapping table 当前是任务产物，不是 change 内的固定表。建议在任务中
   明确输出路径、schema（source path、mirror path、consumer target、owner、
   move-vs-dependency、exception kind）与 fail-on-missing 字段，避免 mapping
   仍留给实现者自由解释。
3. P0.2 当前写“accordion”作为 single/multi-file fixture；建议明确实际采用
   multi-file accordion，并另用 toast 覆盖“非同名主文件 + shared lib”路径。
4. `registry:ui` 仍有 `code-card`/`toast` 的 shared `@lib` files，以及若干
   UI items 的 external registryDependencies。P1.4 应明确 import rewrite 只改
   component-local relative paths，不重写 canonical `@lib` dependency targets。
5. 现有多文件 item 的 `index.ts` export 规则应注明 context imports（tabs 的
   `./tabs.svelte`）在 folder 内保持相对路径，且不把 context key/内部类型误升格
   为 public API。
6. P4 的 Tailwind prerequisite 已具名化，但仍需在实现任务中固定 script/CI
   文件名；“named detection entry”本身还不是可执行路径。

## 与 r2 的变化

- B5-r2：从全局 `cn()` SHALL 收敛为迁移触发的 WHEN 条款，transitional 与
  Tier-2 场景已补齐，本轮判定通过。
- B7-r2：已选择 option 1，companion CSS 与 target/import/mirror 同批进入 P1，
  P2 变成纯 cascade/selector 阶段，本轮判定通过。
- B8-r2：已把 folder law 限定为 `registry:ui` component-local files，固定
  canonical lib/theme/file roots，并加入 shared-lib mapping 与双 consumer gate；
  本轮仅发现 toast 主文件命名仍未闭合。
- 非阻塞项大多已落稿：mirror canonical mappings、72/79 baseline、例外分层、
  全量 multi-file enumeration、named prerequisite intent 均有对应文字。
- 构建状态由 r2 的 apps/www dirty-baseline 失败变为当前可构建：root registry、
  apps/www、strict OpenSpec validation 均通过；warnings 仍为既有问题，不能视为
  本 change 的迁移证据。

## 方案质量评分

- 实现质量：**2/10**。本 change 没有实现代码；P0 probes、folder moves、manifest
  与 utility migration 均未落地。构建通过只证明当前 flat baseline 可构建。
- 方案质量：**8/10**。r2 的三项阻塞已实质收敛，Tier-2 ownership、P1/P2 阶段
  合同、shared-root scope、dual parity、真实 shadcn add fixture 和 cn() WHEN
  语义均可执行。扣分来自 toast 这一个未闭合的 ui item shape，以及 app.css/
  Tailwind compiler context 的迁移边界不够确定。
- 综合参考：**10/20**（实现 2/10 + 方案 8/10；不是产品验收分）。

## 最终裁决

**Block。** 先修复 B9-r3 与 B10-r3，并在修复后重新运行 strict validation、
registry build、apps/www build、两类真实 `shadcn add` fixture 与 P0.1 CSS
browser probe；完成这些后才可进入实现前定稿复核。
