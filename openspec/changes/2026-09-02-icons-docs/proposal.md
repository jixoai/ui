# Proposal: icons-docs — 图标词汇文档页 + 插件定制缺陷闭环（ICON-1..4）

## Why

Owner 指令（2026-09-02 grill 会话，五项决策 I1–I5）：

1. **I1 单 change 全包**：ICON-1/2（P2）修复 → 文档页（词汇表 +
   插件定制）→ ICON-3/4（P3）同 change 收尾——页面文档始终描述
   修完后的正确词汇，不记录已知错误行为。
2. **I2 palette 统一**（ICON-1）：插件槽 `pipette` → `palette`，
   写出 `--jx-icon-palette`；CSS 词汇与字节冻结 fixtures 不动
   （pipette 本就是死名，零破坏面；词汇表其余槽位按 glyph 名命名
   的惯例成立）。
3. **I3 派生式墨水闭环**（ICON-3）：插件按**图标概念**开槽，覆盖
   一个概念自动重烘墨水变体（黑/白/暗色矩阵）——换一次、全家跟
   随，混搭不可能发生；孤立 ink（invalid）单独开概念槽；等效可
   覆盖面 7 → 11。
4. **I4 dogfood**（ICON-4）：www 走 `jixoai({ icons })` 插件管线，
   文档页放真跑的覆盖演示——插件路径从此有持续回归保障。
5. **I5 lucide-svelte 清退**：copy-command / copy-icon-button 两处
   直连 import 迁到命名图标库（manifest 补 `copy` glyph），www
   依赖中移除 lucide-svelte——R3 ③「必须用命名图标库」纪律闭环。

ICON-2 走唯一解：词汇表补 plain `check` 槽（combobox.css 已消费
`--jx-icon-check`，combobox.css:79-91），并入插件可覆盖集。

## What Changes

1. **词汇表补洞**（css-laws）：`icon-vocab.ts` 增 plain `check`
   槽（glyph=check，`:root`/`.dark`/`.jx-light` 三块、冻结顺序
   律）；重生成 `jx-pure.css` 词汇块；`icon-uris.test.ts`
   fixtures 重冻结。
2. **插件槽位重构**（vite-plugin）：`IconSlot` 联合
   `pipette`→`palette`（零兼容层——死名直接改名）、补 `check`；
   serializer 覆盖概念槽时**自动派生**墨水家族（calendar→
   calendar-ink、clock→clock-ink、check→valid-ink、invalid 独立
   概念槽）；烘墨法则**等价移植**（vite-plugin 零 dependencies
   的发布面保持自足）+ 与 css-laws `iconUri` 的等价性测试锁。
3. **www dogfood**：`vite.config.ts` 裸 `jixoai()` →
   `jixoai({ icons: { provider, safety } })`；站点图标经插件管线
   供给，默认槽渲染**零 diff**（dogfood 的回归保证）。
4. **lucide-svelte 清退**：`scripts/gen-icons.mjs` manifest 补
   `copy` → `icons.ts` 重生成（verify:icons 门禁）→ 两处站点外
   壳组件迁移；`apps/www/package.json` 移除 lucide-svelte（共享
   文件，ZCode 落盘）。
5. **文档页 `/docs/icons.html`**（新路由，ledger 接线清单）：
   route dir + `+page.ts` toc → `svelte.config.js` prerender
   entries → `docs-route-model.ts` docsSections 加行 →
   `docs-structure.spec.ts` 重冻结 → registry `icons` 条目
   `meta.href` 由 `/docs/components.html` 占位更新为专页（共享文
   件，ZCode 落盘）。页面三段：
   - 命名图标库词汇表：`icons.ts` 全量 glyph 预览 + `{@html}`
     用法 + verify:icons 门禁说明；
   - `--jx-icon-*` 词汇表：槽名 / glyph 预览 / 消费者 / 绘制技
     术 / 可覆盖性（姊妹表组件承载，TokenTable 纯文本合同不
     动）；
   - 插件定制高级文档：provider 四型、概念槽 + 派生墨水法则、
     safety、`virtual:jixoai-icons`、**活演示块**（局部作用域
     变量覆盖同一词汇面，真实可见地 repaint；站点级插件路径由
     dogfood 构建冒烟 + 渲染零 diff 证明）。
6. **门禁**：vocab 冻结重跑、插件槽位/派生矩阵/等价锁 spec、
   dogfood 构建冒烟、icons 页结构 lint、glyph 预览渲染 spec。

## Out of Scope（记录在案的回访条件）

- `icons.ts` 全量扩容（34 个之外的命名，按需另开）；
- font provider 深化、mixin 高级组合文档；
- 词汇表新增其它 plain 槽（invalid 保持 ink-only 概念）；
- `virtual:jixoai-icons?dom` JS 面的文档化（CSS 面先行）；
- megaGrid / 导航过滤（并行 change `2026-09-02-nav-fuzzy-filter`
  承载）。
