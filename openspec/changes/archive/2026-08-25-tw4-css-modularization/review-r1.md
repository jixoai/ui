# tw4-css-modularization review-r1

审查范围：当前工作区中的 OpenSpec change 初稿、基线 specs、registry / mirror
源码与本地工具链。审查日期：2026-08-24。

本轮结论：退回修订，暂不具备 Owner 批准实现的条件。意图方向成立，但
consumer 安装合同、CSS 处理链、Tier-2 例外和 mirror/lock 事实均未收敛。

## 证据基线

- `npm run build`（本地 `shadcn` 4.19.0）已构建全部 84 items；这证明
  registry payload 生成，不证明 consumer `shadcn add` 的目录安装与 alias
  解析。
- `registry/files/ui/` 当前为 81 个文件：79 个 `.svelte` + `toc.css` +
  `website-scaffold.css`。其中 72 个 registry `.svelte` 有 `<style>`。
- `apps/www/src/lib/ui/` 当前为 80 个文件；存在 mirror-only 的
  `component-tree-nav.svelte`，而两个 registry CSS 不在该目录。初稿的
  `80 .svelte`、`73/80 styled` 混合了 registry 与 mirror 两侧的计数。
- `apps/www/jixoai-ui.lock` 当前只有 6 个 item，且
  `apps/www/test/registry-payload-parity.spec.ts` 只比较 `public/r` payload
  与 registry source，不比较 mirror，也不覆盖完整 lock manifest。
- `apps/www/vite.config.ts` 使用 `[sveltekit(), tailwindcss()]`；
  `app.css` 才是唯一明确的 `@import 'tailwindcss'` 入口。`toc.svelte` 通过
  `$lib/toc.css` side-effect import，`website-scaffold.css` 由
  `+layout.svelte` 单独导入，站点文档又展示了另一套导入方式。
- 当前组件大量使用字符串插值合并 `class`；没有 `cn` registry item，也没有
  `clsx` / `tailwind-merge` 的项目级依赖合同。
- 当前工作区另有 4 个未提交的 website-scaffold 改动；它们不是本 change
  的实现证据，本审查未修改或反向解释这些改动。

## 逐项复核

### proposal.md

方向与 Owner 的三点请求一致：Tailwind v4、CSS colocate、folder-per-item
确实对应当前三类债务。问题在于把尚未验证的边界写成了结果：

1. proposal:30-37 将 Tier-1 的 utility override 问题与 jx-pure 混为同一
   “utilities always win” 叙事；`jx-pure` Part A 是 unlayered 的 Tier-2
   frozen vocabulary，明确设计为压过 layered utilities。不能用本 change
   暗改该 cascade。
2. proposal:54-63 把 Tailwind v4 / `@tailwindcss/vite` 写成组件消费者的
   “explicit prerequisite”，但 shadcn registry schema 没有一个已验证的
   prerequisite enforcement 字段；这必须落为文档、检测或安装失败提示，不能
   只停在 prose。
3. proposal:82-88 正确指出 payload URL `/r/<name>.json` 可保持不变，但
   同时宣称“no consumer breakage”。文件 target、安装目录和 import
   `$lib/ui/<name>` 都会变化，这是有意的 v1 breaking layout change；URL 稳定
   不等于 consumer source/import 稳定。
4. proposal:92-99 的影响面漏掉了 mirror manifest/lock 的实现本身，也没有
   把当前两侧已有 drift 作为迁移前置条件。

### design.md

- D1/D2 的 utility-first 与 `@layer components` + `:where()` 原则可行，
  但“element-default laws”必须明确限定为 Tier-1 authored residue；
  `jx-pure` Part A/B/C/D 不能被复制、移动或重新包裹。尤其 `.jx-input`、
  `.jx-field-shell`、`.jx-input-lane` 必须继续只由 jx-pure Part A 定义。
- design:52-56、97-101 对 folder CSS 的处理链不自洽：一处称 plain
  `@import`，另一处要求验证从 Svelte `<script>` import 的 `@utility`。
  本地 `@tailwindcss/vite` 源码按 CSS request/id 建立独立 compiler；只有
  明确带 Tailwind import/context 的 CSS 才会展开 Tailwind custom utility。
  当前 `app.css` 的 context 不会自动继承到任意独立 folder CSS。`@layer` 的
  原生 CSS 层和 Tailwind `@utility` 也不能混成同一个保证。
- design:68-76 规定 `index.ts`、nested targets、`$lib/ui/<name>`，但只以
  schema/build 形状推断 consumer 安装语义。临时 folder target 可被
  `shadcn build` 原样写进 payload；尚未验证 `shadcn add`、alias 目标目录、
  index 编译及 Svelte import resolution。
- design:84-88 写成 P0→P1→P2→P3→P5，tasks 实际只有 P4；且 P2 明确改变
  cascade，却称“zero visual delta”。应改为：几何/渲染 parity + consumer
  override 行为分别验收，不能用零视觉差覆盖行为变化。
- design:9、12 与现状不符；应机器生成两侧 inventory，并显式记录
  registry-only CSS 与 mirror-only `component-tree-nav.svelte`。

### tasks.md

- 0.1 是必要的，但 `P0-3` 是不存在的任务编号；应加入产物要求：compiled
  CSS 断言、CSS 仅加载一次、`:where()`/utility specificity probe。
- 0.2 目前只要求“payload paths + consumer alias resolution”，应升级为真实
  临时 consumer 的 `shadcn add`（或等价 dry-run + TypeScript compile）：验证
  多文件 item、`index.ts`、CSS、目录 target 和 `$lib/ui/<name>` import。
- 0.3 应在迁移前阻断已有 mirror drift，而不是只做页面截图。
- 1.3 的 lock regeneration 不能只写 6 个 item；先建立完整 per-file
  registry↔mirror manifest/hash，再把它纳入 parity test。
- 2.1 的 `toc.css`/`website-scaffold.css` 会改变导入路径和 cascade，故不能
  继续标为“still zero visual delta”。同时必须删除重复的 layout/manual CSS
  imports，并改写 `?raw` 文档路径。
- 3.1 把 `cn()` 放在全局迁移前；它应只服务于 utility-authored class slots，
  不能被当成解决 CSS specificity 的证据。
- 3.2 的“all 73”应改成真实的 72 个 registry styled files，并拆为 P3a
  form/high-traffic 与 P3b remainder，或提供完整逐组件截图矩阵后再一次性执行。

### 四个 spec delta

| delta | 复核结论 |
| --- | --- |
| `css-architecture` |  placement law 方向正确，但“exactly one place / all authored CSS”过宽；必须把 Tier-2 Part A unlayered contract 写成唯一明确例外，并禁止重定义其 class/custom property。每个 normative requirement 加 SHALL/MUST。 |
| `component-authoring` |  utility-first 可作为 Tier-1 新姿态；但 scenario:17-21 把胜出归因于 `tailwind-merge`，概念错误：`twMerge` 只合并同一 class string，真正的 cascade 由 layer/specificity 决定；并须加入 Tier-2 例外 scenario。 |
| `registry` |  schema/build 可接受 nested `path`/`target`，但 consumer install/import 尚未证明。`payload stability` 只能承诺 `/r/<name>.json` 与 namespace，不能声称无 consumer breakage。`index.ts` 类型出口、CSS target、Tailwind prerequisite 要落成可测试合同。 |
| `mirror-sync` | 目标 tree 合理，但当前 lock 不是全量 drift detector，parity test 也不比较 mirror；delta 将愿景写成现状。必须先定义完整 normalized relative-path manifest，覆盖 ui folder、lib、theme 与 CSS。 |

## 阻塞问题

### B1 — Tier-2 frozen vocabulary 与全局 utilities-win 冲突

证据：`openspec/specs/jx-pure/spec.md:10-20`、
`registry/files/theme/jx-pure.css:14-21` 明确 Part A unlayered，目的就是压过
layered utilities；Part B 才是 `@layer components` + `:where()`。
初稿 `proposal.md:69-75`、`css-architecture/spec.md:34-45` 与
`component-authoring/spec.md:17-21` 却把 consumer utility win 写成普遍契约。

修复建议：将 utilities-win 限定为 Tier-1 自有 utility / folder authored
CSS；在 css-architecture 与 component-authoring delta 增加 SHALL：Tier-2
Part A/B/C/D 只消费、不得复制/移动/重新定义。若要改变 Part A cascade，另开
change 修改 living jx-pure spec，不在本 change 偷改。

### B2 — folder CSS 的 Tailwind/Svelte 处理链未定义，`@utility` 假设不成立

证据：`apps/www/vite.config.ts:1-7` 只有一个 Tailwind entry；
`apps/www/src/app.css:14-16` 才导入 `tailwindcss`；而
`registry/files/ui/toc.svelte:32-36` 与 `apps/www/src/routes/+layout.svelte:13-15`
使用两种不同 CSS 载入方式。已装 `@tailwindcss/vite` 4.3.3 的 transform
filter 按每个 `.css` request 建 compiler/cache；独立 CSS 没有自动共享
`app.css` 的 Tailwind context。`@utility` 在无 Tailwind import/context 的
独立 CSS 中不会得到当前草稿假定的展开结果。

修复建议：D5.2 采用一个明确合同：有残余 CSS 的组件由 Svelte 文件相对导入
`import './<name>.css'`，folder CSS 只用标准 CSS、tokens、`@layer
components` + `:where()`，本 change 禁止 `@utility`。若未来必须公开 custom
utility，集中到唯一 Tailwind entry/theme item，并单独做 compiled-output
probe；P0.1 必须验证输出、顺序和只加载一次。去掉 layout/docs 的重复手工导入。

### B3 — shadcn folder target / index / consumer alias 未验证

证据：本地 `npm run build` 通过 84 items；scratch nested path/target 也能被
build 原样写入 payload。但 `shadcn` schema 只约束 `target: string`，这不是
`shadcn add` 的安装证明。当前 `registry.json` 仍是
`@ui/accordion.svelte`、`@lib/toc.css`（如 `registry.json:151-160`、
`175-185`），尚无真实 nested consumer fixture。

修复建议：P0.2 创建临时 Svelte consumer + `components.json`，执行真实
`shadcn add @jixoai/<probe>`（可使用本地 HTTP registry），断言所有 files 落
到 `src/lib/ui/<name>/**`、`index.ts` 可被 `$lib/ui/<name>` 解析、CSS 可加载、
多文件相对 import 和 TypeScript compile 均通过。保留 `/r/<name>.json` URL
稳定，但在 spec 中明确这是 breaking install/import layout，而非“no consumer
breakage”。

### B4 — mirror/lock 合同与现状不符，且迁移前已有 drift

证据：`apps/www/jixoai-ui.lock` 仅有 6 个 item；
`apps/www/test/registry-payload-parity.spec.ts:29-42` 只回读
`public/r/*.json` 的 payload content。当前 registry-only 为两个 CSS，
mirror-only 为 `component-tree-nav.svelte`，所以
`mirror-sync/spec.md:7-12` 的“folder-for-folder + lock 是 drift detector”
尚未成立。

修复建议：P0.3 先生成并提交 inventory，明确允许的 site-only/mirror-only
文件；P1 实现完整 manifest（normalized relative path + sha256），覆盖
`registry/files/ui/**`、`registry/files/lib/**`、theme 映射与对应 mirror，
并让 parity test 在一侧新增/删除/改写时点名失败。CSS 迁移后 target 统一为
`@ui/<name>/<name>.css`（若它确属 item），不得保留旧 `@lib/toc.css` 别名。

### B5 — `cn()` 的依赖合同与 cascade 解释错误

证据：`design.md:102-104` 把 `clsx`、`tailwind-merge` 描述为
`registryDependencies`；但 baseline registry contract 的该字段是 registry
item 依赖（`registry/spec.md:24-31`），真实 npm 依赖用 item `dependencies`
（例如 `registry.json:438-454` 的 `shiki`）。现有组件也没有统一 class merge
API。`tailwind-merge` 只能消除同一字符串里的冲突，不能让 scoped CSS 让位。

修复建议：D5.3 只在 P3 采用，新增独立 `utils` registry item（npm
`dependencies: ["clsx", "tailwind-merge"]`），组件以
`registryDependencies: ["@jixoai/utils"]` 依赖；只改写 utility-authored
root/class slots，并分别测试条件类、consumer class 与 Tier-2 exception。
不得用 `cn()` 代替 `@layer`/specificity 证据。

### B6 — 事实计数、阶段编号和验收词不一致

证据：实际是 79 `.svelte` / 72 scoped-style（registry）与 80 files
（mirror），但 proposal/design/tasks 使用 80、73/80；design D4 写 P5，
tasks 只有 P4；P2 明确改变 layer/cascade 却写 zero visual delta。OpenSpec
strict validate 目前还报 4 个 requirement 缺少 SHALL/MUST 的 warning。

修复建议：加入 machine-generated inventory；统一 P0-P4 编号；将 P2/P3 验收
拆成“既有 docs visual/behavior parity”与“新增 consumer override contract”；
补齐 normative SHALL/MUST 后重新 `openspec validate --strict`。

## 非阻塞建议

1. proposal 的 Tailwind v4 prerequisite 应写到 README/catalog/install
   compatibility check；registry schema 本身不能替消费者强制安装 Vite plugin。
2. `index.ts` 不要自动把私有 `Props` 升格为 API；只 re-export default/具名
   sub-components，以及明确稳定的 public types。
3. `toc.svelte` 的 CSS import 在 folder 化后必须从 `$lib/toc.css` 改为相对
   `./toc.css`；`website-scaffold` 的 layout import、docs `?raw` import 和
   usage snippet 必须同步更新，确保一次加载。
4. removal of Svelte scoped style 需要逐组件审查 selector 变换：例如
   accordion 当前的 `.jx-accordion :global(> * + *)`、pseudo-elements、
   `@supports`、media query，迁移为 global CSS 时必须显式保留选择器边界。
5. registry item 的 CSS target 应与 Svelte 同目录；site-only CSS 才放 route
   module，不能把 registry item CSS 同时称作 site-only。
6. lock 的内容 hash 与 payload parity 是两种不同不变量，测试名称和失败信息
   应分别表达 source↔mirror 与 source↔published payload。

## D5 裁决

### D5.1 `index.ts`

裁决：纯 barrel，默认 re-export 主组件、具名 re-export 已存在的 sub-components；
仅导出明确稳定的 public types。不得添加实现逻辑、默认值或把私有 `Props`
批量公开。`index.ts` 作为 `registry:file` 随 item 发布，并纳入 consumer
TypeScript fixture。

### D5.2 per-folder CSS / `@tailwindcss/vite`

裁决：采用组件内相对 side-effect import（`import './<name>.css'`），以保证
registry item 自包含；folder CSS 禁止 `@utility`，只允许标准 CSS、token
custom properties、`@layer components` + `:where()` 和所需 at-rules。P0.1
必须验证 Vite 输出、layer 顺序、pseudo/`@container`、重复 import 与浏览器
computed specificity。若实现坚持独立 CSS 中使用 Tailwind directives，应先给
出每文件 Tailwind context/entry 方案并通过同一 fixture；不能默认依赖 app.css
继承。

### D5.3 `cn()`

裁决：采纳，但延后到 P3，且只覆盖 utility-authored class slots。先建立
`utils` registry item + npm `dependencies` 合同，再逐组件迁移；`cn()` 是
class-string 冲突整理，不是 CSS cascade 修复。Tier-2 classes 不接入
`cn()` 作为重定义入口。

### D5.4 目录分类

裁决：保留 `registry/files/ui/`、`lib/`、`theme/` 三个一级类别；folder 是
item 边界，不重建 taxonomy。item CSS 与 item Svelte 放在同一 `ui/<name>/`
目录，真正 site-only 的 CSS 才归 route/module。

### D5.5 P3 范围

裁决：分期。先做 P3a（form/input 高流量族）建立 utility、cn、Tier-2
exception 与截图/consumer fixture gates，再做 P3b 其余 styled components。
本 change 可以保留两阶段的目标与合同，但不能以当前证据承诺一次完成全部
72 个 registry styled components；若 Owner 要求一次到位，必须先补齐逐组件
baseline screenshot matrix 和每组件 gate。

## 评分

- 实现质量：**2/10**。本 change 尚未实现；当前可验证的只有现有
  `npm run build`，且工作区变更是无关的 website-scaffold dirty diff。
- 方案质量：**4/10**。三项 Owner 意图、阶段骨架和 D5 问题拆分是有效起点；
  但 Tier-2 cascade 冲突、CSS compiler 前提、consumer install 未证实、
  mirror/lock 失实、`cn()` 依赖模型错误、事实与阶段不一致，均会让实现阶段
  产生不可逆的路径和样式回归。

**复核裁决：Block，修订 B1-B6 后进入下一轮；Owner 批准前不开始实现。**
