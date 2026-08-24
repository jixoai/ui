# data-jx-hooks review-r4

日期：2026-08-25  
复核基线：`133df2c` + `19c927f`  
结论：**Block**  
评分：**7.5/10**（r3：7.0/10，+0.5）

## 复核证据

Owner 的 8 个未提交 WIP 文件未触碰。为避免脏树漂移，我从 `19c927f` 建立了临时 clean worktree，并仅链接现有 `apps/www/node_modules` 供 Svelte parser 使用。

```text
node scripts/jx-inventory.mjs
defined 281 / staticHooks 360 / families 13 / directives 36 / handReview 282 / references 300

node scripts/verify-hook-law.mjs --selftest
all regression fixtures PASS; both selftests PASS; exit 0

node scripts/verify-hook-law.mjs --post
3 pre-migration failures (hooks/families/handReview); shadow PASS; exit 1
```

manifest `inventory.json` 的 engine、计量与 clean worktree 输出一致。r4 声称的尾连字符、family evidence、parts/variants 互斥、行号/条件证据、selftest shadow 捕获及 CHROME_PATH/live 变更均能在提交代码和上述运行结果中得到支持。

## 阻塞问题

### B1. inventory 与 shadow collector 的“产品输入”边界仍不一致，迁移后 handReview 永远不能归零

`buildInventory()` 在 [`scripts/jx-inventory.mjs:50-60`](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/jx-inventory.mjs:50) 将 `scripts/*.mjs` 全部纳入 `codeFiles`，包括审计器自身 `jx-inventory.mjs` 与 `verify-hook-law.mjs`。因此权威 manifest 已记录审计器源码：

- `hooks.jx-kbd` 包含 `scripts/verify-hook-law.mjs:134`；
- `handReview` 包含 `scripts/jx-inventory.mjs:174,327,333` 以及 `scripts/verify-hook-law.mjs:22,39,71,72,116,121` 等永久字符串。

`verify-hook-law.mjs:98-105` 的 `--post` 要求 `inv.handReview.length === 0`，而 r4 只在 [`verify-hook-law.mjs:38-60`](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/verify-hook-law.mjs:38) 的 shadow collector 中排除了 auditor。即使所有产品 markup 已迁移，两个审计器仍在扫描输入中，故 gate 仍会因自身注释、fixture、import 和 CLI 文本产生 handReview，不能通过。这是迁移完成的硬阻塞，不是计量差异。

可验证修复：为 inventory 与 shadow gate 抽出同一个版本化的产品输入清单，至少明确排除 `scripts/jx-inventory.mjs` 和 `scripts/verify-hook-law.mjs`（或把 fixture 移到明确不参与产品扫描的目录）；重新生成 `inventory.json`。新增一个 post fixture 证明审计器自身源码不会产生 hook/handReview。验收必须同时满足：clean pre-tree 仍有 3 个预期失败、shadow/selftest PASS；迁移树上 `staticHooks=0`、`families=0`、`handReview=0` 且 shadow=0。

## 非阻塞建议

- `design.md:38` 仍写 `Clean-HEAD measurement (engine@2)`，而权威 manifest 是 `jx-inventory@3`；应同步版本和计量说明，避免审查者误读。
- `tasks.md:13` 的 `scripts/codemod-data-jx.mjs` 仍为待实现项。作为“Approve 后实施”的设计阶段可接受，但实现阶段必须消费这份互斥、带 file:line/expr evidence 的 manifest，不得重新启用独立正则扫描。
- CSS-defined selector 提取仍是启发式 parser；后续整合电池应保留 `:where/:is`、嵌套 at-rule、Svelte route `<style>` 和 site sheet 的回归样例，并把输入边界写进 manifest provenance。

## r3 → r4

r4 已实质关闭 r3 的五项缺口：shadow collector 与 selftest 现在共享判定且能捕获唯一冲突；parts/variants 互斥 fixture 通过；families/directives/query 证据带站点行号和条件片段；live probe 支持 `CHROME_PATH` 并校验已知 variant 值；clean manifest 已提交为 engine@3。剩余问题集中在审计器自身仍被 inventory 扫描，导致 D4 的 `handReview===0` 在迁移后不可达，因此评分提升有限且不能放行。

**最终裁决：Block。**

## r5 复审（5837ad3 + 137110d）

日期：2026-08-25  
结论：**Approve**  
评分：**9.0/10**（r4：7.5/10，+1.5）

### 复核证据

Owner 的未提交 WIP 未触碰。以 `137110d` 建立 clean worktree，并链接现有 `apps/www/node_modules` 后复现：

```text
node scripts/jx-inventory.mjs
defined 281 / staticHooks 360 / families 13 / directives 36 / handReview 273 / references 296

node scripts/verify-hook-law.mjs --selftest
all regression fixtures + auditor-boundary fixture + both selftests PASS; exit 0

node scripts/verify-hook-law.mjs --post
3 pre-migration conditions FAIL; shadow PASS; exit 1
```

用 `--json --label=clean-worktree@HEAD` 重新生成的 manifest 与提交的 `inventory.json` 字节一致。清单不再包含 `scripts/jx-inventory.mjs` 或 `scripts/verify-hook-law.mjs` 的 sites；engine 为 `jx-inventory@3.1`，计量为 `281/360/13/36/273/296`。

### 阻塞

无。r4 的 B1 已真实关闭：`AUDITOR_SOURCES` 在 [`scripts/jx-inventory.mjs:36`](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/jx-inventory.mjs:36) 导出，并由 [`scripts/verify-hook-law.mjs:22,45`](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/verify-hook-law.mjs:22) 消费；inventory 与 shadow collector 采用同一审计器排除边界。新增 fixture 在 [`scripts/verify-hook-law.mjs:90-95`](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/verify-hook-law.mjs:90) 检查审计器对 hooks/handReview 的零贡献并通过。因此迁移完成后 `--post` 的 `handReview===0` 不再被 gate 自身源码阻塞；当前 `--post` 的三项失败是迁移前目标集合存在的正确失败语义。

### 非阻塞建议

- [`design.md:18,77`](/Users/kzf/Dev/GitHub/jixoai-labs/ui/openspec/changes/data-jx-hooks/design.md:18) 仍把 hand-review 规模写成 `159`，而 engine@3.1 与权威 manifest 的实际值为 `273`。应把 273 标为当前基线，避免实施者低估人工处理范围；manifest 本身已是可复现权威数据。
- [`tasks.md:7-11`](/Users/kzf/Dev/GitHub/jixoai-labs/ui/openspec/changes/data-jx-hooks/tasks.md:7) 仍称 `.agents/jx-inventory.json` 是稳定输出，和已提交的 `openspec/changes/data-jx-hooks/inventory.json` 及 `--label` provenance 约定不一致；建议同步任务文字。
- `collectDataJx` 仍维护一份与 inventory `EXCLUDE_DIRS` 相似但不完全相同的目录遍历代码。当前目标根集合和审计器边界已通过 fixture 验证；后续可抽出共享输入清单，避免新增排除目录时两边漂移。
- `scripts/codemod-data-jx.mjs` 仍是 tasks P0.2 的待实现项，这是 Approve 后的实施工作；codemod 必须消费 engine@3.1 manifest，而不是再次独立扫描。

### r4 → r5

r5 将 r4 唯一阻塞从“审计器源码永久污染 inventory/handReview”修复为可验证的共享边界：引擎导出版本化 `AUDITOR_SOURCES`，shadow collector 复用它，新增自审计零贡献 fixture，engine 升至 3.1，manifest 从 clean tree 重生成且字节一致。既有 D1/D2/D3/D4/D5 证据在本轮回归中保持通过；无新的行为或消费者契约风险。

**最终裁决：Approve。**
