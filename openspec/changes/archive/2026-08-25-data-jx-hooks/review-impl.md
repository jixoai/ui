# data-jx-hooks implementation review

日期：2026-08-25  
复核基线：`1a01fa5` → `ad5b537` → `8ffec5a`  
复核方式：从 `8ffec5a` 建立 detached clean worktree；Owner 未提交的
`prototype-docs/**`、`overview-card.svelte`、catalog/layout WIP 未纳入或修改。  
结论：**Block**  
实现质量评分：**7.5/10**

## 复核证据

clean worktree 中运行：

```text
node scripts/jx-inventory.mjs
defined 278 / staticHooks 0 / families 0 / directives 29 /
handReview 0 / references 295

node scripts/verify-hook-law.mjs --selftest
9 个常规 fixture PASS；注入冲突捕获 PASS；clean shadow 断言 FAIL
（jx-rainbow-host, jx-rainbow-host）；exit 1

node scripts/verify-hook-law.mjs --post
hooks/families/handReview 三项 PASS；shadow 断言 FAIL：
jx-rainbow-host@apps/www/test/press-button.spec.ts:36,55；exit 1

npm run build                 PASS
apps/www: npm run build       PASS
npm run build:site            PASS（clean tree）
Vitest（主工作区）            327/327 PASS
press-button 定向测试         14/14 PASS
npm run verify:mirror         FAIL（committed manifest stale）
```

inventory 的 `engine@3.8` 与提交清单的 `278/0/0/29/0/295` 一致，说明主要
迁移面、镜像内容和审计器硬化已落地；失败来自整合产物和 gate 输入，而不是
Owner WIP 的漂移。

## 阻塞问题

### B1. CSS-owned rainbow host 被错误写成 data hook，D4 shadow gate 不可通过

`registry/files/ui/press-button/press-button.css:135,166,321` 和镜像定义了
`.jx-rainbow-host`；组件实现也在
`registry/files/ui/press-button/press-button.svelte:206` 保留该类，因为它
承载实际彩虹效果的 CSS。可是
`apps/www/test/press-button.spec.ts:36,55` 将不存在的
`data-jx-rainbow-host` 放入断言数组。`collectDataJx()` 按设计扫描测试输入，
所以 `--post` 和 `--selftest` 都稳定报告该 css-defined shadow。

可验证修复：测试中的“无 effect host”数组只保留迁移后的
`data-jx-shimmer-host`、`data-jx-pulse-host`、`data-jx-ripple-host`，并另加
`expect(btn.classList.contains('jx-rainbow-host')).toBe(false)`（无 effect
时）；带 rainbow effect 的现有 `button.jx-rainbow-host` 断言保持为类查询。
修复后在 clean tree 运行 `node scripts/verify-hook-law.mjs --selftest`
和 `--post`，两者 shadow 断言必须 PASS、退出码为 0。

### B2. 已提交 mirror manifest 的 SHA 与实现文件过期，镜像门禁失败

`node scripts/gen-mirror-manifest.mjs --check` 在 clean `8ffec5a` 稳定退出 1：
`committed manifest is stale — run: node scripts/gen-mirror-manifest.mjs`。
重新生成前，至少 69 个已迁移 source/mirror 文件对仍使用旧 SHA（包括
`press-button`、`terminal-header`、`input`、`alert`、`toggle`、`tabs` 等）；
实际 source 与 mirror 内容相同，但 `apps/www/mirror-manifest.json` 没有反映
本次实现，因此 P2.1 的 mirror gate 不是绿的。

可验证修复：在实现提交树执行
`node scripts/gen-mirror-manifest.mjs`，提交更新后的
`apps/www/mirror-manifest.json`，再执行
`node scripts/gen-mirror-manifest.mjs --check`；必须输出
`check GREEN`，且 source/mirror SHA 与当前文件一致。

## 非阻塞建议

- `openspec/changes/data-jx-hooks/design.md:18,77` 仍把 hand-review 规模写成
  `159`，而最终 engine@3.8 clean 结果为 `0`（实现前清单也经历过多个口径）。
  建议明确标注历史阶段值与最终值，避免后续审计误读。
- `tasks.md:7-16` 的 P0.1/P0.2 仍未勾选，且 codemod 注释
  `scripts/codemod-data-jx.mjs:5` 仍写 `engine@3.1`；应同步完成状态和
  engine@3.8 版本说明。
- `npm run verify:surface` 本轮 clean run 为 46/47，唯一失败是
  `entry: slide stops at the shadow spot`；实现只改了该脚本的 selector 形态，
  该项更像时序敏感的既有浏览器探针，但应重跑基线或明确记录为独立问题。
- clean tree 的 `build:site` 是通过的；脏工作区因 Owner 的 prototype-docs
  WIP 失败应继续保持为单独的 Owner-WIP 条件，不应混入本 change 的实现结论。

## 评分依据与裁决

迁移覆盖面、AST inventory、D1/D2 证据、双树镜像内容、构建和 327 项测试均
显示实现主体完成，故不低于 7 分。可是两个直接门禁（D4 shadow、mirror
manifest）在 clean committed tree 均可复现失败，且一个是错误的消费者断言、
一个是提交产物未同步；在修复前无法证明“整合电池全绿”或发布后的镜像
完整性。

**最终裁决：Block。**

## 第 2 轮复审（`e135030`）

日期：2026-08-25  
复核基线：`e135030`（相对上轮 `8ffec5a`）  
结论：**Accept**  
实现质量评分：**9.0/10**（上轮 7.5，+1.5）

### 复核证据

从 `e135030` 建立新的 detached clean worktree 后，串行执行避免 selftest
临时 probe 与 post gate 争用同一源码路径：

```text
node scripts/jx-inventory.mjs
defined 278 / staticHooks 0 / families 0 / directives 29 /
handReview 0 / references 297

node scripts/verify-hook-law.mjs --post
PASS：hooks / families / handReview / shadow；exit 0

node scripts/verify-hook-law.mjs --selftest
全部常规 fixture PASS；注入 css-defined shadow 捕获 PASS；
clean-shadow PASS；exit 0

node scripts/gen-mirror-manifest.mjs --check
check GREEN: trees match the committed manifest (paths + hashes)

apps/www: npm run test -- --run
24 files / 327 tests PASS

npm run build
PASS
```

### 上轮阻塞关闭情况

- **B1 已关闭。** `apps/www/test/press-button.spec.ts:37-40,58-61` 仅检查
  已迁移的 shimmer/pulse/ripple attributes；无 effect 时单独断言
  `jx-rainbow-host` class 不存在，而带 rainbow effect 的
  `button.jx-rainbow-host` CSS-owned 类查询仍保留。故 shadow collector
  不再看到伪造的 `data-jx-rainbow-host`，`--post` 与 selftest 均通过。
- **B2 已关闭。** `apps/www/mirror-manifest.json` 已按最终实现重生成；
  mirror gate 实测为 GREEN，85 items / 220 pairs 的 hash 记录覆盖本次
  迁移的 registry/mirror 对。

### 阻塞

无。clean committed tree 已满足 hook law 的零 hooks/零 families/零
handReview/零 shadow 条件，且 mirror manifest 门禁可通过。

### 非阻塞建议

- 提交没有改动 `openspec/changes/data-jx-hooks/design.md`；其
  `:18,43,77` 仍写实施前的 `159` 和 `engine@3.1`。这不影响现有的权威
  `inventory.json` 或门禁，但和本轮“已同步历史/最终计数”的说明不符，建议
  后续将它们标为历史值，并注明最终 engine@3.8 的
  `278/0/0/29/0/297`。
- `--selftest` 会在固定产品路径写入并删除
  `apps/www/src/lib/__shadow-probe__.svelte`；与 `--post` 并行运行时会
  造成可复现的暂态 shadow 失败。CI/本地电池应串行运行二者，或让 selftest
  使用独立 worktree/锁定机制。

### 评分依据与裁决

上轮两个硬缺陷均以正确方式修复，D4 hook-law gate、selftest、mirror
完整性和 327 项测试均有当前复现证据。仍保留文档口径与 selftest 并发隔离的
小问题，故不评满分。

**最终裁决：Accept。**
