# data-jx-hooks review-r2

日期：2026-08-25  
复核基线：`07a0512 feat(data-jx-hooks): r1 remediation`，并核对当前真实工作区

结论：**Block**  
评分：**5.5/10**（r1：4.0/10，+1.5）

## 复核证据

在当前工作区运行：

```text
node scripts/jx-inventory.mjs
defined 279 / staticHooks 373 / families 12 / handReview 159 / references 271

node scripts/verify-hook-law.mjs --post
exit 1
fixtures: 3 PASS
post hooks: FAIL (373)
post families: FAIL (12)
post handReview: FAIL (159)
data-jx shadow: PASS
```

`07a0512` 旁的 `.agents/jx-inventory.json` 是 ignored、未被提交的生成文件，记录的是 `281/374/12/159/271`；这不能作为提交树的可复现 manifest。当前 dirty 工作区还包含用户未提交文件，本复核未修改它们。

## 阻塞问题

### B1. 动态族前缀仍被错误加入 staticHooks

`scripts/jx-inventory.mjs:137-144` 先从 ``jx-alert-${tone}`` 等模板识别 family，随后 `\bjx-[a-z0-9-]+` 又把 `jx-alert-` 加入 staticHooks；`scanScriptSection:225-230` 对 `cn()` 里的模板有同样问题。当前实际污染项包括：

```text
jx-alert- jx-avatar- jx-badge- jx-fab- jx-file- jx-file-icon-
jx-result- jx-sheet- jx-stat-trend- jx-step- jx-tabs- jx-toast-
```

这违反 design.md:23-25 的“trailing-hyphen tokens never enter staticHooks”，并会让 codemod 生成错误的 `data-jx-foo-` 候选。

可验证修复：模板/拼接扫描在识别 family span 后排除同一 span 的静态 token；增加 `staticHooks.keys().some((x) => x.endsWith('-')) === false` 断言，并用 alert/badge fixture 验证。

### B2. family 变体信息没有实现，D1 valued 映射不可审计

`addFamily`（`scripts/jx-inventory.mjs:122-125`）只初始化空 `variants: Set`，全文件没有 `variants.add(...)`；CLI `:284-296` 的 `familiesDetail` 只输出 sites，不输出 variants。实测 12 个 family 的 variants 全为空。因此 `jx-alert-${tone}`、`jx-badge-${tone}` 只能被计数，不能证明具体值、来源或转换为 `data-jx-alert={tone}` / `data-jx-badge={tone}`。

可验证修复：JSON manifest 为每个 family 输出稳定的 `base`、variant 来源/值（未知值明确标记 dynamic）、site、shape 和条件跨度；codemod 只消费该 manifest；对 alert tone、badge tone 做正反 fixture 和 post gate 断言。

### B3. D4 的 namespace shadow 断言是空通过

`verify-hook-law.mjs:59` 从 `data-jx-badge` 捕获 `badge`，而 inventory 的 `defined` 保存 `jx-badge-*` token；`:65` 直接比较两种不同命名空间，当前 `PASS` 不证明没有冲突。它也没有按 design.md:71-73 说明的 family base 规则比较，并且 shadow 扫描只覆盖 `registry/files` 与 `apps/www/src`（`:53-64`），漏掉 tests/scripts。

可验证修复：统一 token 规范化为 `jx-${name}`，同时比较 exact selector 与 family base；扫描与 inventory 共用同一输入 manifest，覆盖 D3 的测试、脚本、README/demo 等纳入范围；加入人为注入 `data-jx-alert` 与 css-defined `jx-alert-*` 的负 fixture，确认非零退出并打印文件:行号。

### B4. D2 的条件形态没有进入 family/shape 证据

design.md:40 声明 `cond ? 'jx-tgroup-on …' : '…'` 应映射为 valued/boolean 属性，但真实 `registry/files/ui/toggle-group/toggle-group.svelte:122-126` 只被记录成普通 static hook。真实的 `class:jx-hue-play-on={isPlaying}`（`apps/www/src/lib/components/hue-popover.svelte:95-99`）也只有 token，没有条件表达式跨度或映射记录。由此无法让 codemod 可执行地判定 `data-jx-tgroup={cond ? 'on' : undefined}`，也无法审计 class directive 的布尔语义。

可验证修复：为 ternary、`&&` 守卫、Svelte `class:` 分别输出 shape、条件 source span、base/value/boolean 结果；为 tgroup、hue-play-on、try-on 增加 fixture。CSS-defined 优先级必须先应用，`jx-try-on` 继续保留 class。

### B5. 计数与输入边界仍不具权威性

proposal.md:5-7、:16-18、:33、:68-70 仍引用 `529/232` 与旧 `classify-jx-hooks.mjs` 口径；该旧分类器当前实测为 `232/527`。design.md:29 仍写 `281/374`，而当前新引擎是 `279/373`。新引擎虽已抽取 Svelte `<style>`，但 `jx-inventory.mjs:51-61` 仍只纳入 registry/apps 的 `.svelte/.ts` 和 scripts `.mjs`，并非 proposal/spec 所称 repo-wide；README/Markdown/JSON/其他 JS/TSX 等仍不在同一口径。

可验证修复：提交 tracked、版本化的 manifest（文件清单、排除清单、parser 版本和各集合计数），统一 classifier/inventory/codemod/verify 的输入边界；更新 proposal/design/spec 的数字和来源，或明确旧 529/232 是历史基线而非验收值。

### B6. D1 的 base + valued family 合并仍未定义

真实 alert/badge 同时输出基础 token 和变体 token：`registry/files/ui/alert/alert.svelte:61-66`、`registry/files/ui/badge/badge.svelte:40-45`。design.md:36-40 与 README:71-73 只说 family collapse 为一个 valued attribute，没有明确基础 `jx-alert` 与 `jx-alert-${tone}` 是否合并为单个 `data-jx-alert="tone"`、presence selector 如何匹配，或是否保留独立 boolean。机械 codemod 可能生成重复 HTML 属性或不一致的 query 语义。

可验证修复：把“同 base 的基础 token + valued family 必须合并为一个 attribute”写成 D1 规范，并覆盖 Svelte/SSR 序列化、DOM `hasAttribute`、`[data-jx-alert]` 与 `[data-jx-alert="destructive"]` fixture。

### B7. Svelte script 的 query/classList 引用会被静默漏扫

`scanScriptSection` 在 `:212-251` 对 Svelte script 只扫描 `cn(...)`，然后提前 `return`；下面 `:253-269` 的 query/classList 规则因此不会作用于 Svelte instance/module。真实的 `tooltip.svelte`、`toc.svelte`、`+layout.svelte` 等 Svelte 脚本中的 `.jx-*` 查询没有进入 `references`，与 D3/D4 的“所有引用可审计”不符。这个问题比 handReview 数量更严重：它是漏报而不是可见的失败。

可验证修复：把 Svelte script 的 `cn()` 扫描和 query/classList AST/行扫描合并为同一遍，或明确在两个阶段都执行；用 tooltip 的 `.jx-tip-body/.jx-tip-shadow`、toc 的 `.jx-scaffold-header`、layout 的 `.jx-shell-body/.jx-nav` 加回归 fixture，要求 manifest 出现文件、kind 和行号。

## 非阻塞建议

- `scanScriptSection` 的 `isSvelteScript` 分支在 `:215-220` 重复，`:249-252` 有重复 return；删除后可降低审计器自身误读风险。
- `--live` 在 `verify-hook-law.mjs:72-88` 硬编码 macOS Chrome 路径；应接受 `CHROME_PATH`/Playwright 默认 executable，并断言 variant 值非空且等于已知 fixture 值。
- `classList`/query 扫描（`:253-269`）主要接受单行紧邻字面量；多行、拼接和模板 selector 应明确 fail-closed，而不是静默漏报。先修复 B7 的提前 return，再验证这些边界。
- tasks.md:0.2 仍是 unchecked，仓库没有 `scripts/codemod-data-jx.mjs`；当前 D3 是设计说明，不是可运行的六类文件 codemod。完成上述审计器阻塞后再实现 codemod，避免把错误 manifest 固化。

## D5 裁决与消费者说明

三项 D5 裁决（plain selector、单一 `data-jx-*` 命名空间、docs demo 的 css-defined 优先）已写入 design.md:78-84；README:55-76 已提供 breaking markup contract、valued attribute、查询/classList 对照和“无兼容类”说明。这是相对 r1 的实质改进，但不能抵消 B1-B7 的可执行性缺口。

## r1 → r2

r2 已真实落地的改进：Svelte AST 模板扫描、Svelte `<style>` 抽取、注释/ID/事件的结构性排除、平衡 `cn()` 跨行扫描、159 个 handReview 的 fail-closed 输出、三条 regression fixture、可非零退出的 `--post` gate，以及 README 消费者契约。故评分从 4.0 提升到 5.5。

仍未达到 Approve 的原因：动态族仍污染静态集合，variants/条件形态没有可审计数据，Svelte script 查询存在漏扫，shadow 断言存在命名空间错配，输入边界和权威 manifest 漂移，且 base+valued 合并法则未定。以上问题会直接改变 codemod 的输出，不是文档瑕疵。

**最终裁决：Block。**
