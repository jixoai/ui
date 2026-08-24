# tw4-css-modularization review-r5

> 审查意图（2026-08-24）：在 Owner 批准实现前，以真实 registry、theme CSS、
> shadcn schema/build 与 apps/www build 验证本 change 能产生唯一且可安装的
> Tailwind v4、模块化 CSS、folder-per-component 交付。

## 结论

**Block。尚未达到“可实现前定稿”。** B11-r4 和 B12-r4 的主要契约已经收敛，
B13-r4 也补上了 consumer entry 的顺序和 P3a clean-consumer gate；但真实
`jixoai-theme` item 的 npm 依赖闭包尚未成立，按新合同安装第一个
utility-authored UI item 的干净消费者仍会在 CSS import 处失败。另一个遗留是
`code-card` 的特殊 shared-lib/npm/registry dependency chain 被指定为要验证，
但 P1 full gate 没有相应的可执行断言。

## 已验证

- `openspec validate tw4-css-modularization --strict`：通过。
- `npm run build`：通过，shadcn 4.19.0 构建当前 84 个 flat items。
- `npm --prefix apps/www run build`：通过，只有既有 Svelte/a11y/CSS warnings；
  仍无本 change 的 folder、manifest、P0 fixture 或 P3 migration 实现。
- `registry.json:8-19` 的 `jixoai-theme` item 安装
  `registry/files/theme/jixoai.css -> @lib/jixoai.css`，但没有 npm
  `dependencies`。真实 theme CSS 在 `registry/files/theme/jixoai.css:29-30`
  导入 `@fontsource-variable/jetbrains-mono` 和 `@fontsource/share-tech-mono`。
  这些包只在 docs app 的 `apps/www/package.json:16-17`，不随 registry theme
  item 交付。
- 当前 73 个 `registry:ui` item 中只有 `toc`、`code-card` 已有
  `@jixoai/jixoai-theme` dependency；草案正确将“utility-authored 后统一声明”
  作为 P3 工作，不能把现状误报为已迁移。

## r4 问题复核

| r4 问题 | 判定 | 依据 |
| --- | --- | --- |
| B11 canonical main | **已解决** | registry delta:19-26 将 `apps/www/mirror-manifest.json` 的每 UI item 唯一 `canonicalMainSource` 定为唯一机器来源；tasks 0.3:33-45 定义缺失/重复/non-local/files[] 不一致即失败，1.1:51-62 规定 generator 只读它；toast 是显式 `toast-viewport.svelte`。 |
| B12 fixture 集合 | **主要解决，见 B15** | tasks 0.2:20-28、1.5:80-83 与 registry delta:47-51、62-71 一致固定 `accordion + toast`；toast 同时覆盖 non-identical main 与 item-shipped `@lib/toast-store.ts`。不再有 code-card 作为“second P0.2 fixture”的冲突。 |
| B13 entry/theme setup | **部分解决，仍 Block（B14）** | proposal:69-77、registry delta:37-46、component-authoring delta:7-18、tasks 3.1:111-119 和 3.2:120-130 都固定 import order、theme dependency 与 clean SvelteKit compiled-output gate。它们没有使 theme 自身的 font imports 成为随安装可解析的 npm dependencies。 |

## 阻塞问题

### B14-r5 — `jixoai-theme` 不能在干净消费者中闭合其 CSS npm imports

新合同让每个 utility-authored UI item 以 `registryDependencies` 带来
`@jixoai/jixoai-theme`，并要求 consumer entry import `@lib/jixoai.css`。但 theme
CSS 导入两个 npm font packages，而 `jixoai-theme` item 没有 `dependencies`。因此
干净 consumer 按 P3a 的公开 setup 编译时，Vite/Tailwind 无法解析 CSS imports；
P3a fixture 只能发现问题，不能使 implementation 有确定的正确交付。

**可验证修复：**把
`@fontsource-variable/jetbrains-mono` 与 `@fontsource/share-tech-mono` 加到
`jixoai-theme` 的 registry item `dependencies`，或将字体 import 迁为一个明确由
consumer setup 负责且可不安装的替代机制。前者符合现有 `code-card -> shiki` 的
schema 用法。P3a clean-consumer fixture 必须从空的 SvelteKit project 运行
`shadcn add`，检查 package manifest 安装这两项依赖，并在真实 build 中解析
`@lib/jixoai.css`，再断言现有的 `dark:*`、`border-border`、`bg-background` 与
组件 utilities。

### B15-r5 — `code-card` 依赖链的“P1 full gate”没有实际测试任务

registry delta:48-51 称 `code-card` 的 npm/registry dependency chain 在 P0.3
mapping 与 P1 full gate 中断言；tasks 0.3:42-45 只记录 mapping 表，tasks 1.5
仅重跑 P0.2 的 `accordion + toast` fixtures 和通用 build/parity。它没有指定一个
对 `code-card` payload/install tree 的断言。真实 item 同时包含
`@lib/shiki.ts`、npm `shiki`、`@jixoai/shiki` 和 `@jixoai/jixoai-theme`
dependencies（`registry.json:434-455`），其 target 去重/递归依赖不同于 toast，
不能由 toast fixture 证明。

**可验证修复：**在 P1.5 明确加入 code-card chain assertion：在已发布 payload
及 clean consumer installation tree 中验证 `@lib/shiki.ts` 只落一次、npm `shiki`
和两个 registry dependencies 被解析、无 target clobber；可作为第三个命名
fixture，或作为同一 full-gate fixture 的第二个 `shadcn add` case。测试名称、
输入 item、预期 targets 和 package manifest 断言必须列出，不能只称“full gate”。

## 非阻塞建议

1. P0.3 schema 描述应将 parent `itemName`（或等价的 registry item key）写为
   required field；虽然可由 `canonicalMainSource` 回查 `registry.json`，显式 key
   会让“每 registry:ui item 恰一条”的 validation 错误更直接。
2. `scripts/check-tw4-prereq.mjs` 在 P4 才写入，但 P3a 要以它所描述的 public
   setup 完成 gate。把 setup 文档/脚本最小版本提前到 P3.1，可避免 fixture 与
   最终 public check 两套逻辑漂移。
3. design D3:117-120 仍把两个 P0 fixture 概括为“single/multi-file item”，实际
   是 multi-file accordion 与 non-identical-main toast；改为准确标签有助于后续
   维护。

## 与 r4 的变化

- B11 已关闭：canonical main 不再由文字示例推断；manifest 的
  `canonicalMainSource` 是唯一机器输入，toast 有显式例外行，P1 generator 受其
  约束。
- B12 的 fixture 名称冲突已关闭：所有 normative P0.2 文本均为
  `accordion + toast`，code-card 被明确移出该集合。
- B13 相比 r4 有实质进展：consumer entry 顺序、token sheet arrival、P3a clean
  consumer compiled-output probe 已写入 proposal、delta 和 tasks。
- 新发现 B14（theme CSS 的 npm dependency 闭包）及 B15（code-card 专门依赖链
  缺少 full-gate assertion）均来自 `registry.json`、theme source 和任务交叉核对，
  不是对修订说明的复述。

## 评分与裁决

- 实现质量：**2/10**。尚无本 change 的实现；当前 build 只证明 flat baseline。
- 方案质量：**8/10**。B11/B12 的生成与 P0 fixture 边界已可判定，B13 的 consumer
  entry 和 P3a runtime gate 也已形成闭环；扣分来自 B14 的实际 install closure
  缺失，以及 B15 未落地为可执行的依赖树断言。
- 综合参考：**10/20**（实现 2 + 方案 8；不是产品验收分）。

**最终裁决：Block。** 完成 B14/B15 后，再运行 strict validation、root registry
build、apps/www build；实现阶段以 clean `shadcn add` consumers 取得 B14/B15 与
P3a compiled-output 的运行证据，再进入 Owner 批准后的实施。
