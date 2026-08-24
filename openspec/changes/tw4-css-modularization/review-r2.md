# tw4-css-modularization review-r2

审查日期：2026-08-24。审查对象：修订后的 proposal/design/tasks、4 个
change delta、基线 specs 与当前真实工作区。

本轮结论：**仍 Block，但已从方向性退回收敛为三处契约/阶段阻塞 + 若干非阻塞
修订项。** 修订稿确实吸收了 r1 的大部分问题；没有发现已开始实现本 change
的代码，故实现质量仍为 2/10。

## 当前验证

- `openspec validate tw4-css-modularization --strict`：通过。
- `npm run build`：通过，本地 shadcn 4.19.0 构建现有 84 items。
- `npm --prefix apps/www run build`：**失败**。`@tailwindcss/vite` 在处理
  `apps/www/src/app.css` 的 import 链时报告 `CssSyntaxError: Missing closing
  } at @layer components`。当前工作区另有未归属于本 change 的
  `apps/www/src/lib/jx-pure.css` / `registry/files/theme/jx-pure.css` 修改；
  因此本报告不把该失败归因于本 change，也不把站点构建当成通过证据。P0 开始
  前必须先恢复一个可构建的基线，再记录截图和 browser probe。
- 当前 registry 仍是 flat tree；`registry.json` 仍使用旧的
  `@ui/*.svelte`、`@lib/toc.css`、`@lib/website-scaffold.css` targets。
  P0.1/P0.2/P0.3 都仍是未执行任务，因此本轮只审契约是否把验证边界写对，
  不把任务清单当作已取得的运行时证据。
- 当前工作区有 11 个已跟踪的、未归属于本 change 的修改（jx-pure 和
  website-scaffold 等）。本报告未将其作为 change 实现，也未修改或回滚。

## B1-B6 对照

| r1 问题 | r2 判定 | 依据 |
| --- | --- | --- |
| B1 Tier-2 与 utilities-win 冲突 | **已解决** | proposal:32-41、design D1、`css-architecture` delta 的 Tier-2 scenario 都明确 Part A unlayered、Parts A-D consume-only，且禁止复制/移动/重包裹。`jx-pure` living spec 未被暗改。仅需处理下面的措辞收紧建议。 |
| B2 folder CSS / `@utility` 处理链 | **契约已解决，运行证据待 P0** | design D2:59-79、tasks 0.1 已明确相对 side-effect import、标准 CSS、禁止独立 `@utility`、单次加载与浏览器 specificity probe。这比 r1 是实质修复；任务尚未执行，所以不能声称运行时已证明。 |
| B3 shadcn folder target / consumer install | **契约已解决，运行证据待 P0** | design D3:91-103、tasks 0.2 把真实 SvelteKit consumer + local HTTP registry + `shadcn add` + `$lib/ui/<name>` + `tsc` 全列为迁移前 gate，并诚实区分 payload build 与 install。 |
| B4 mirror/lock 事实不符 | **大体解决，映射细节仍不够** | baseline mirror-sync 已如实记录 6-item partial lock 与已知 exceptions；delta/tasks 要求完整 manifest、双 parity、不同失败信息。但“theme mappings”和“allowed path-mapped css”仍未定义具体 canonical path 映射表，见非阻塞建议。 |
| B5 `cn()` dependency/cascade 错误 | **部分解决，仍阻塞** | design D5 与 tasks 3.1 已纠正 npm `dependencies` vs `registryDependencies`，并声明 `cn()` 不解决 cascade；但 `component-authoring` delta:7-17 仍把“Tier-1 components 的 class prop merges through cn()”写成全局 SHALL，而 tasks 3.1 又限定只接入 utility-authored slots、且发生在 P3。两者对 P0-P2 的组件状态不一致。 |
| B6 计数/阶段/零视觉差不一致 | **部分解决，仍阻塞** | proposal/design/tasks 的 r2 计数和 P0-P4 已统一，D4 也拆成双验收轴；但 `openspec/specs/component-authoring/spec.md:57` 仍保留旧的“73 of 80” baseline。另有 P1/P2 CSS target 顺序冲突，见 B7。 |

## 阻塞问题

### B5-r2 — `cn()` 的 normative 范围仍与 P3-only 计划冲突

证据：

- `openspec/changes/tw4-css-modularization/specs/component-authoring/spec.md:7-17`
  要求“Tier-1 components SHALL ... class prop merges through `cn()`”。
- `design.md:135-144` 与 `tasks.md:64-81` 又明确 `cn()` 是 P3-only，且只接入
  utility-authored class slots；P3a/P3b 之前的 Tier-1 仍然是 legacy string
  interpolation。

这不是文字风格问题，而是 requirement 的适用域不明：若按 delta 的 SHALL
读取，P1 机械 folder move 或 P2 CSS placement 期间所有 Tier-1 都已违规；若按
tasks 读取，未迁移组件不应承担 `cn()` 合同。

可验证修复：把 delta 改成“**WHEN a Tier-1 component is migrated to
utility-authored paint, its affected public class slots SHALL use `cn()`**”；
明确 P0-P2 只保留现有 class merge 行为，P3a/P3b 逐组件启用。增加 scenario：
未迁移组件不要求 cn、已迁移组件要求 cn、Tier-2 classes 不进入 cn。然后用
P3a consumer fixture 验证，不要把全局 SHALL 留在 P3 前。

### B7-r2 — P1 target 改写与 P2 CSS 移动顺序互相打架

证据：

- `tasks.md:35-37` 的 P1.2 要求所有 item CSS target 已改为 folder target，
  且不能有 `@lib/toc.css` legacy alias。
- `tasks.md:51-59` 却把 `toc.css` 和 `website-scaffold.css` 的物理移动、相对
  import 改写、旧手工 import 删除放在 P2。
- 当前 `registry.json:151-160,175-185` 的 source 仍在
  `registry/files/ui/*.css`，target 仍是 `@lib/*.css`；这正是 P1/P2 的交界。

按当前任务顺序，P1 结束时会出现“source 仍在旧路径、target 已指向未来 folder、
组件仍使用旧 `$lib/*.css` import”的过渡状态。它可以勉强被 `shadcn build` 写
进 payload，但不满足 D3 的 folder item contract，也不能作为 P1 的完整
consumer/install gate；若 P1 的 manifest 只接受最终 folder shape，则 phase gate
必然自相矛盾。

可验证修复：二选一并写死：

1. P1 同批移动每个 item 的 companion CSS、改写相对 import、更新 target 和
   mirror/manifest；P2 只做 layer/selector/cascade 变化；或
2. P1 明确是“仅 Svelte/index 的 transitional phase”，暂时允许旧 CSS
   targets/imports，P1.2 不得要求消灭 legacy alias，等 P2 完成后再做最终
   folder-contract gate。

建议选 1，因为它让每个 phase 结束后的 registry item 都是自洽的 folder shape。

### B8-r2 — folder law 把所有 registry item 与 component-local files 混为一类

证据：

- `registry` delta:7-23 无条件规定每个 item 的 file set 都在
  `registry/files/ui/<name>/`，并以 `@ui/...` 为 target；D3 和 tasks 1.2 又把
  这个模型用于 "all ~80 items"。
- 真实 `registry.json` 有 84 items，其中 73 个 `registry:ui`、9 个
  `registry:lib`、1 个 `registry:theme`、1 个 `registry:file`。例如
  `jixoai-theme`、`toc-engine`、`jx-pure`、`llms-txt` 都不应进入 `ui/`，这也
  与 design D3 的 "ui/lib/theme stay as-is" 相冲突。
- 即使是 `registry:ui`，`code-card` 的 file set 还包含共享的
  `registry/files/lib/shiki.ts` → `@lib/shiki.ts`，`toast` 包含
  `registry/files/lib/toast-store.ts` → `@lib/toast-store.ts`。把它们机械搬进
  `ui/code-card/` / `ui/toast/` 会改变共享库 target 和现有 `registryDependencies`
  的 install contract。

这会使 P1 的迁移集合和 consumer proof 没有确定输入：实现者无法判定一个
`registry:lib`、`registry:theme` 或 UI item 的 support file 应保留原位、改为
dependency，还是跟随组件移动。

可验证修复：将 registry delta 和 tasks 1.1/1.2 的 folder law 限定为
**`registry:ui` item 的 component-local UI files**（main/subcomponents/index/
companion css）。`registry:lib`、`registry:theme`、`registry:file` 保持各自的
canonical roots/targets；为每个 UI item 中的 `@lib` support file 建一张迁移
映射表，写明 canonical owner、consumer target 与是否改为仅由
`registryDependencies` 安装。P0.2 至少用 `code-card` 或 `toast` 作为第二个
consumer fixture，断言 UI folder 与 `@lib` dependency 同时安装且无重复/覆盖。

## 非阻塞建议

1. `css-architecture/spec.md:51-56` 把“唯一例外”同时写成 Part A vocabulary
   和 jx-pure Parts A-D element-default laws。Part B-D 并非 unlayered 例外，
   而是 change scope 外的 living sheet。建议改成两句：Part A 是唯一有意
   unlayered 的 cascade 例外；Parts B-D 是 unchanged/consume-only 的外部
   ownership，不称为 layering exception。
2. 完整 manifest 的“theme mappings”应给出表格或固定映射函数，例如
   `registry/files/theme/jixoai.css -> apps/www/src/lib/jixoai.css`、
   `registry/files/theme/jx-pure.css -> apps/www/src/lib/jx-pure.css`，以及
   item CSS 的最终同目录映射。否则“normalized relative paths”在跨根目录
   时仍有实现自由度。
3. `tasks.md:22-27` 把现有 `component-tree-nav.svelte`、registry-side CSS
   作为 P0 allowed exceptions；应区分“迁移前已知例外”和“迁移完成后允许的
   永久例外”。P1 完成后，registry item CSS 不应继续是 path-mapped exception。
4. Tailwind v4 prerequisite 已从无依据的 schema claim 改成文档 + 检测，这是
   正确方向；P4 仍应写明检测脚本/入口、失败消息和只针对 `registry:ui` 的范围，
   避免“strongest toolchain-supported detection”再次变成空泛承诺。
5. `component-authoring` 基线仍是 73/80，而 change context 是 72/79。应在
   基线 spec 的“pre-refactor baseline”段落同步真实口径，或明确它是历史快照
   并给出来源/日期；否则 `openspec` 合并后会同时存在两组 normative facts。
6. P2 现在要求把 `toc.css`、`website-scaffold.css` 整体放入
   `@layer components` + `:where()`。这两份 global sheet 含容器查询、状态
   选择器、变量与 layout law；实现时应给 selector rewrite 规则和至少一个
   representative computed-style probe，不要只验证样式表“出现了”。
7. 现有多文件 item 不止 accordion/dropdown-menu，tabs 也有 4 files。D3/任务
   中的“sub-file siblings”应明确覆盖 registry 中全部 multi-file items，避免
   机械脚本只特殊处理两个示例。
8. 站点的当前 Tailwind 构建未通过（见“当前验证”）；这不是本 change 的设计
   缺陷，但 P0 的 screenshot/browser evidence 必须在该独立 jx-pure worktree
   问题修复或隔离后重新取得，不能沿用本轮失败环境的视觉结论。

## 与 r1 的变化

- B1：从全局 utilities-win 冲突修成 Tier-1-only，新增 Tier-2 normative
  exception；已通过。
- B2：从未定义 CSS 处理链修成相对 side-effect import、标准 CSS、禁止 folder
  `@utility`、单次加载和浏览器 probe；契约已通过，仍需执行 P0.1。
- B3：从把 folder build 当作 consumer proof 修成真实 `shadcn add` gate、
  local HTTP registry、index/tsc/CSS 验证；契约已通过，仍需执行 P0.2。
- B4：从把 6-item lock 说成 drift detector 修成 honest baseline + 完整
  manifest + source↔mirror/source↔payload 双不变量；总体已通过，映射表待补。
- B5：从错误的 `registryDependencies` npm 依赖修成 item `dependencies` +
  `utils` item，并纠正 `tailwind-merge` 不等于 cascade；范围 SHALL 尚未收敛。
- B6：P0-P4、真实 registry 计数和双验收轴已修正；基线旧计数与 CSS phase
  sequencing 仍未完全解决。
- B8：本轮基于 registry 的实际类型与 `code-card`/`toast` 的跨 root file set
  新发现的 scope 缺口；r1 的 folder examples 未覆盖此类 item。

## 方案质量评分

- 实现质量：**2/10**（维持 r1）。当前没有本 change 的实现；仅有现有根
  registry build 通过，apps/www build 在当前独立 dirty 基线上失败，P0 探针和
  迁移代码均未落地。
- 方案质量：**6/10**。相较 r1，Tier-2 ownership、breaking layout、Tailwind
  compiler 边界、真实 consumer gate、双 manifest invariant、npm dependency
  模型和 P3 分期都已写成可执行合同。扣分集中在 `cn()` 适用域的 normative
  冲突、P1/P2 target 交接、folder law 对 ui/lib/theme 与共享 support files 的
  误泛化、基线事实未同步，以及跨根 manifest 映射仍留有自由度。
- 综合参考：**8/20**（实现 2/10 + 方案 6/10；不是实现验收分）。

**复核裁决：修复 B5-r2、B7-r2 与 B8-r2 后可进入实现前最终复核；在此之前不建议
Owner 批准执行。**
