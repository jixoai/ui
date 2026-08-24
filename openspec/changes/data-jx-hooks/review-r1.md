# data-jx-hooks review-r1

日期：2026-08-25

结论：**Block**

评分：**4.0/10**

依据：本次在当前工作区直接运行 `node scripts/classify-jx-hooks.mjs` 得到 `232` 个 CSS token、`751` 个使用 token、`223` 个已使用 defined、`528` 个 hook-only；因此 Owner 声明的 `529/232` 口径目前不能由这份脚本稳定复现，必须先固定输入快照并解释差异。除此之外，defined 集合和 used-map 的输入边界尚不正确，D2/D3 不能覆盖真实源码形态，D4 没有形成可执行且可失败的 gate，且承诺的消费者破坏性说明尚未落地。按当前稿直接 codemod 会有确定的样式回归和非 class 字符串误改风险。

## 阻塞问题

### B1. 当前 inventory 口径不可复现

Owner 要求的 `529` 个 hook-only 类与当前脚本输出的 `528` 不一致（使用总数也为 `751` 而非 `752`）。报告不能把旧运行结果当作当前证据；这会让 codemod 输入和验收总数漂移。

修复验收：在干净、固定 commit 的输入上运行一次 classifier，提交机器可读 manifest（含文件清单、defined/used/family 数量和版本），并说明当前工作区少掉的 token；后续 codemod/gate 必须消费同一 manifest。

### B2. css-DEFINED 漏扫 Svelte `<style>`，会把真实 CSS 类转成 data 属性

`classify-jx-hooks.mjs:29-34` 只遍历 `registry/files/**/*.css` 和 `apps/www/src/**/*.css`，没有抽取 `.svelte` 内的 authored CSS。可复现反例：

- `apps/www/src/routes/components/popover.html/+page.svelte:284` 使用 `class:jx-try-on`，同文件 `:541-549` 定义 `.jx-try-on`；当前脚本仍把 `jx-try-on` 列入 HOOK。
- `apps/www/src/lib/components/hue-popover.svelte:95-97` 使用 `class:jx-hue-play-on`；该文件的 scoped style 定义相邻的 `.jx-hue-play`（`:210-233`），说明 class directive 必须被结构化解析为 hook 语义，不能靠全文 token 扫描猜测。
- `apps/www/src/lib/ui/component-tree-nav.svelte:134-175` 代表同一类大量 inline component CSS。

修复验收：defined 扫描必须抽取全部 `.svelte` `<style>`（含 route/site sheets），并排除 CSS 注释/字符串后解析 selector；增加上述两个真实位点的回归断言，确保它们始终留在 class。D5 Q3 也必须明确“CSS-defined 优先于 docs 一并转换”。

### B3. used-map 是无上下文正则，会误识别 ID、事件、注释和模板前缀

`classify-jx-hooks.mjs:47-55` 对所有 `.svelte/.ts/.mjs` 文本执行 `/\bjx-[a-z0-9-]+/g`。实际反例：

- `registry/files/ui/menubar/menubar.svelte:77,91-104` 的 `jx-bar-panel-${id}` / `jx-bar-trigger-${id}` 是 DOM id 和 `getElementById` 目标，不是 class；当前输出已经出现 `jx-bar-panel-`、`jx-bar-trigger-`。
- `registry/files/ui/alert/alert.svelte:63`、`badge/badge.svelte:42` 的 `jx-alert-${tone}` / `jx-badge-${tone}` 被拆成尾连字符 token；若直接按 HOOK 集合生成属性，可能产生非法的 `data-jx-alert-` 或错误改写。
- `onjx-disabled`、`jx-reset` 等是事件协议/事件名，注释和文档代码片段也会命中该正则，不能作为 markup class 迁移。
- `registry/files/ui/popover/popover.css:49-52` 的 `.jx-pop-shadow` 只出现在注释，真实 markup 在 `popover.svelte:263`；当前 CSS 正则仍会把注释 token 当作 defined，证明“全文 token 扫描”也会制造假阴性（把实际 hook 排除在迁移之外）。

修复验收：改为 AST/结构化扫描，只把 class 属性、`class:` 指令、classList、CSS/DOM 查询选择器纳入相应类别；id、事件名、custom property、注释和 prose 必须保留。动态 prefix 必须归并为 family，尾连字符不得进入 HOOK token；无法安全转换的站点必须 fail-closed 并列出 hand-review。

### B4. D2 未覆盖仓库实际的条件形态，且与 D1 自相矛盾

D1:8 声明支持 `class:jx-foo={c}`，但 D2:23-26 又称 family 只来自拼接和 conditional strings，并写成 Svelte 没有 dynamic class directives。真实源码存在：

- `apps/www/src/lib/components/hue-popover.svelte:95-97`：`class:jx-hue-play-on={isPlaying}`（相邻 CSS 类定义在同文件 `:210-233`）。
- `apps/www/src/routes/components/popover.html/+page.svelte:283-285`：`class:jx-try-on={canvasTries.includes(cell.id)}`，且该类是 CSS-defined（见 B1）。
- `registry/files/ui/toggle-group/toggle-group.svelte:123-126`：`cn(...)` 内 `condition ? 'jx-tgroup-on ...' : ...` 的条件 hook。
- 仓库还有 `condition && 'jx-*'`、映射表值和嵌套模板字符串；D2 只描述 prefix 拼接和简单 ternary，未定义这些输出是 boolean、valued 还是 hand-review。

修复验收：给出逐形态映射表和 AST 变换规则，至少覆盖 `cn` 的 `&&`/ternary、Svelte `class:`、模板 prefix、映射表和嵌套模板；先应用 CSS-defined 优先级，再决定 attribute 形态；每类增加可执行 fixture（alert tone、badge tone、tgroup-on、try-on）。

### B5. D1 对基础 token与 valued family 的合并规则缺失

D1 同时把静态 `jx-foo` 映射为 boolean、把 `jx-foo-{v}` 映射为同名 valued attribute，并称两者可以 coexist（`design.md:6-19`）。但真实组件同时输出基础类和族类：alert 的 `jx-alert jx-alert-${tone}`（`registry/files/ui/alert/alert.svelte:61-66`）以及 badge 的 `jx-badge jx-badge-${tone}`（`registry/files/ui/badge/badge.svelte:40-45`）。机械套用 D1 会生成重复 `data-jx-alert`/`data-jx-badge` 属性，或依赖未定义的合并优先级；HTML/Svelte 序列化和 `[data-jx-foo]` 的语义都未规定。

修复验收：明确同族基础 token + variant 必须合并为单一 valued attribute，或定义独立 base 名称；规定 presence selector 对 valued attr 的行为，并为 SSR、DOM 序列化和 `querySelector` 增加 fixture/gate 断言。

### B6. D4 的“repo-wide”断言目前不可执行、也无法稳定失败

D4:55-62 和 spec delta 要求 repo-wide 零 css-less `jx-*`，但分类器只扫描 `registry/files`、`apps/www/src`、`apps/www/test` 和 `scripts/*.mjs`（`classify-jx-hooks.mjs:40-46`），遗漏 README/OpenSpec/JSON/其它源码；同时它又把注释、raw demo、id 和事件文本算入 token。这个输入集合既不是真正 repo-wide，也没有语法范围，无法同时避免漏报和误报。

此外 D4(b) 只说 data-jx 名称不得 shadow CSS selector，没有定义 exact token、variant family（如 `.jx-alert-*` 与 `data-jx-alert="tone"`）和 `:where(...)` 的归一化/冲突算法；`scripts/verify-hook-law.mjs` 也尚未提供，故三断言没有当前可复现的退出码、错误报告或 negative fixtures。

修复验收：固定扫描输入和排除清单，采用同一结构化 token/CSS selector parser；动态未知 token、遗漏文件、CSS-defined/data-jx 冲突必须非零退出并打印文件+行号；提交 B1/B2/B3 的正反 fixture，并先运行 gate 证明初始状态失败、迁移后成功。

### B7. 承诺的消费者破坏性说明尚未落地

`proposal.md:43-46` 和 `tasks.md:35-36` 承诺 README Consume 区有 breaking markup-contract note，但当前 `README.md:12-52` 只有安装、Tailwind 和目录说明，没有 `.jx-kbd` → `[data-jx-kbd]`、valued variant、classList/DOM 查询迁移或“无兼容 class”的说明。

修复验收：在 README Consume 中加入旧/新查询对照、`[data-jx-badge="destructive"]` 示例、boolean attribute 读取方式、明确无兼容 class，以及该变更影响测试/CSS/JS 查询的版本/发布说明；用发布产物或 clean consumer 对照验证说明与实际 markup 一致。

## 非阻塞建议

- D3 标题称“六类文件”，但 `design.md:36-49` 实际只列三组；应逐项列出 component registry/mirror、tests、docs routes、scenes/site Svelte、runtime TS/scripts、README/generated fixtures，并为每类指定 parser 和 skip/fail 行为。
- `tasks.md:7-14` 声称 classifier 有“JSON output”，但当前脚本只打印文本，且 `existsSync` 未使用。应提交稳定 schema（defined、used、families、foreign、hand-review）供 codemod 消费，避免再次独立解析。
- `surface-motion.ts` 等 runtime `classList.toggle` 位点（例如 `apps/www/src/lib/surface-motion.ts:95,107,109,132,164`）应明确：CSS-defined 继续使用 class，hook-only 才改为 `toggleAttribute`/`setAttribute`/`removeAttribute`；不能笼统替换所有 classList 操作。
- D5 Q3 应明确 docs 内“用于演示本地样式”的 CSS-defined 类保持 class，只有零 authored CSS 定义的语义 anchor 才转换；这条优先级应进入 gate，而不是留给人工判断。
- D4(c) 只给出浏览器查询字符串，没有 fixture、页面 URL、服务启动条件或非空断言；若页面未渲染 badge，`querySelector` 的“variant resolves”可能出现 vacuous pass。应固定 clean-consumer/docs fixture，并同时断言命中元素数量与旧 class 缺失。

## D5 裁决

1. **采用 plain attribute selector**：`[data-jx-badge="destructive"]`，不保留 CSS-defined compatibility class；但需先定义 family 归一化和迁移后查询断言。
2. **采用同一 `data-jx-*` namespace**：`jx-invalid`/`jx-disabled` 这类确属 hook-only 的状态使用 boolean data 属性；事件名 `onjx-disabled` / `jx-reset` 仍是事件协议，不迁移。
3. **docs 手写 markup 随同转换，但 CSS-defined 优先保留 class**：route/component `<style>`、site sheets 和独立 CSS 中定义的 token 不得转换。

## 最终裁定

**Block。** 先解释 `529` 与当前 `528` inventory 的差异，修正定义集/使用集的语法边界，补齐 D1/D2/D3 的真实形态和 fail-closed gate，再补 README 消费者迁移契约；完成这些后才能进入 codemod 实施和整合电池验证。
