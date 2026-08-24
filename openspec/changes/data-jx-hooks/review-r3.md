# data-jx-hooks review-r3

日期：2026-08-25  
复核基线：`6fcafcb` + `ffcd2d8`  
结论：**Block**  
评分：**7.0/10**（r2：5.5/10，+1.5）

## 复核证据

我从 `ffcd2d8` 归档到临时 clean worktree，并将现有依赖只读链接到该树；当前工作区的 Owner WIP（8 个未提交文件）未触碰。两棵树的 tracked manifest 与 clean 运行结果一致：

```text
node scripts/jx-inventory.mjs
defined 281 / staticHooks 360 / families 13 / handReview 284 / references 300

node scripts/verify-hook-law.mjs --selftest
fixtures: PASS (trailing-dash, family variants+shapes, svelte query visibility)
selftest: PASS
exit 0

node scripts/verify-hook-law.mjs --post
exit 1
4 FAIL: hooks 360 / families 13 / handReview 284 / shadow jx-alert
```

`inventory.json` 为 `engine@2`，counts `281/360/13/284/300`，与 clean tree 字节一致。r2 的 B1、B2 基础数据、B7 query 扫描确实有明显进步：尾连字符为零，families 有 variants/shapes，query 引用为 242 条且带 file+line。

## 阻塞问题

### B1. shadow gate 扫描并命中了自己的审计器源码，迁移后也无法通过

`verify-hook-law.mjs:76-79` 把 `scripts/*.mjs` 纳入 shadow 扫描；同一文件又在 `:89` 写入 `data-jx-alert="x"`，在 `:104`、`:110` 使用 `[data-jx-alert]`。原始正则 `:72` 会把这些源码字符串收集为 `jx-alert`，而 `alert` family 在 inventory 中存在，于是 clean `--post` 的第四个失败固定为 `shadow jx-alert`。这不是迁移目标中的消费者 markup，而是 gate 的自引用；迁移完成后仍会失败。

可验证修复：shadow 扫描必须使用结构化 markup/fixture 输入，或明确排除 `verify-hook-law.mjs` 的 selftest/live 源码并单独执行 selftest；增加“迁移后无真实 shadow、审计器自身字符串不计入”的 fixture，要求 clean post 不再报告 `jx-alert`。

### B2. selftest 仍是 vacuous pass，没有调用真实 shadow 判定

`verify-hook-law.mjs:87-93` 注入 `<div data-jx-alert="x">` 后只重建 inventory，并判断 `inv2.defined.has('jx-alert') || inv2.families.has('alert')`。`data-jx-*` 不属于 inventory 的 CSS/template hook 输入，而基线本来就有 `alert` family；因此即使删除注入文件，这个表达式仍为真。当前 `--selftest PASS` 不能证明 B3 的 shadow 断言可检出。

可验证修复：让 selftest 调用与 `--post` 完全相同的 shadow collector，注入唯一的 css-defined/family-base 冲突并断言 collector 返回该 token、file、line；再删除 fixture 后断言 clean post 通过 shadow 断言。

### B3. parts 与 family variants 发生互斥的双重归类

`addVariantToken`（`scripts/jx-inventory.mjs:132-143`）把任何 query 形态的 `jx-<family>-<suffix>` 都加入 family。实际 manifest 同时出现：

```text
hooks:    jx-alert-title, jx-avatar-fallback, jx-result-title, ...
variants: alert.title, avatar.fallback, result.title, ...
```

真实来源是 `alert.svelte:70`、`avatar.svelte:143`、`result.svelte:63-66` 以及对应测试查询；这些是 design.md:21-25 明确要求保持 boolean 的字面部件 hook，不是 valued family variants。相同 token 同时进入 hooks 和 variants，codemod 无法决定 `[data-jx-alert-title]` 还是 `[data-jx-alert="title"]`，会直接破坏部件查询语义。

可验证修复：family manifest 区分 dynamic/conditional variant 与 literal part；query 只有在能证明来自同一动态族值（例如 `alert-default`）时才归入 variant，部件查询保留 static hook；增加 alert-title/avatar-fallback/result-title 的互斥分类断言，要求一个 token 只能落在一个迁移类别。

### B4. “span 内证据”和 class: 结构化结果仍不可审计

variants 的值目前只有文件路径数组（`inventory.json.families.*.variants`），没有条件 source span、行列或表达式片段；`addFamily` 的 `sites` 也只保留相对文件名。`class:jx-hue-play-on={isPlaying}` 在 AST 分支 `scripts/jx-inventory.mjs:234-236` 仍只是 `addHook(a.name, f)`，没有输出 directive 的 boolean shape 或条件表达式。因此 D1/D2 虽有识别代码，D3/codemod 仍拿不到可审计的变换证据。

可验证修复：manifest 为每个 variant/shape 输出 file、line/column、source span、condition/branch；class directive 输出 `boolean-directive` 与表达式偏移；为 tgroup ternary、file/toast `&&`、hue-play-on 各加精确 fixture。

### B5. `--live` 声称支持 CHROME_PATH，但实现仍硬编码路径

提交中的 `verify-hook-law.mjs:97-100` 仍直接使用 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`，没有读取 `CHROME_PATH`，也没有 Playwright 默认 executable fallback。该探针在非该路径环境不能执行；且 `:109-113` 只检查 valued attribute 存在，不检查非空或预期 tone。属于门禁可移植性缺口。

可验证修复：读取 `process.env.CHROME_PATH`，无值时使用 Playwright bundled/default executable；variant probe 要求 `sample` 非空并匹配已知 fixture 值，同时报告 file/line。

## 非阻塞建议

- CSS-defined 提取仍是 `([^{}@]+)\{` 文本启发式（`jx-inventory.mjs:65-87`），虽已覆盖 Svelte `<style>`、注释与 `:where/:is`，仍建议补 nested at-rule、declaration value、site sheet 的 parser fixture，避免未来假阳性/假阴性。
- `inventory.json.root` 是 `/tmp/jx-clean-head` 的绝对路径；建议 manifest 将 provenance 与机器路径分离，保证其他机器重生成时只比较稳定内容。
- `scripts/codemod-data-jx.mjs` 仍不存在，tasks.md:0.2 保持待办；作为实施阶段工作可接受，但 codemod 必须消费上述互斥且带 span 的 manifest，而不能重新正则扫描。

## r2 → r3

r3 已真实修复：尾连字符三条路径、variants/shapes 基础 schema、family mixed handReview、shadow 命名空间和 tests/scripts 范围、Svelte cn/query 同遍扫描、242 条带行号 query evidence、same-base merge 文档，以及常跑 fixture/pre-state fail gate。

仍需修复 B1-B4 后才能 Approve：当前 post gate 的 shadow 失败来自 gate 自身源码，selftest 不是有效的负断言，parts/families 双重归类会生成错误 valued selector，且条件/directive 没有 source-span 证据；`--live` 的实现也与提交说明不符。综合评分从 5.5 提升至 **7.0/10**。

**最终裁决：Block。**
