# Design: icons-docs

## 1. 最终词汇契约（css-laws 与 vite-plugin 共同面向的 CONTRACT）

```
概念槽(concept)      词汇变量(vocab)                          派生
─────────────────────────────────────────────────────────────
calendar         →  --jx-icon-calendar        +calendar-ink
clock            →  --jx-icon-clock           +clock-ink
chevron          →  --jx-icon-chevron         —
palette          →  --jx-icon-palette         —（mask 内联 fallback）
clear            →  --jx-icon-clear           —
mail             →  --jx-icon-mail            —
search           →  --jx-icon-search          —
check      [新]  →  --jx-icon-check     [新]  +valid-ink
invalid   [新]  →  （无 plain）               +invalid-ink
─────────────────────────────────────────────────────────────
9 概念槽 ⇔ 11 条词汇声明（7 plain 含 check + 4 ink）+ palette
内联 fallback 面（无 :root 行）＝ 插件默认输出 12 面（含 palette
覆盖行）——统一口径："11 声明 + 1 内联面"，勿把插件输出面数与
sheet 声明数混同
```

- plain 槽位顺序律沿用冻结序：`:root` 块 `calendar, clock, mail,
  search, chevron, clear, check`（check 追加在队尾）；`.dark`/
  `.jx-light` 块 `mail, search, calendar, clock, chevron, clear,
  check`（mail/search 领头 + check 队尾）。`check` 的 glyph 即
  jxGlyphs.check（valid-ink 同源，strokeWidth 2.5 归 ink 专属，
  plain 用默认）。
- `palette` 词汇面不变（仅 mask 内联 fallback，`:root` 无行）；
  修复方式是**插件改名对齐词汇**，不是词汇改名对齐插件。
- `invalid` 只有 ink 位（UA 伪元素专属），概念槽覆盖它只重烘
  invalid-ink，不造 plain 变量。

## 2. 派生墨水（vite-plugin 侧）

- `vite-plugin` **零 dependencies**（实测 package.json 无运行时
  依赖），不新增对 css-laws 的依赖：烘墨法则（把 ink 烘进 SVG
  URI：黑色 alpha 版 / 白色版矩阵）**等价移植**为
  `src/icons/ink.ts`（独立单文件，注释标注与
  `css-laws/src/icon-uris.ts` 的 `iconUri` 同源）。
- **等价性测试锁**：默认 lucide glyph（calendar/clock/check/
  circle-alert）双跑对照——vite-plugin 移植烘出的 URI 字节 ===
  css-laws fixtures 里的 URI 字节。漂移即测试红。
- serializer 语义：用户覆盖概念槽 X 时，同时写出 X 的 plain 值
  与派生 ink 值（`.dark`/`.jx-light` 白墨矩阵同烘），覆盖面
  `@layer theme` 与现行输出位面一致。

## 3. www dogfood

- `apps/www/vite.config.ts`：`jixoai()` → `jixoai({ icons: {
  provider: lucide, safety: 默认 } })`，槽位全默认。
- **零 diff 验收**：切换前后站点渲染一致（默认槽字节与
  jx-pure.css 词汇块等价）；dogfood 的价值 = 插件路径进入日常
  构建回归，不改变站点视觉。
- 演示块的「真跑」：docs 页演示面板用**局部作用域覆盖**
  （wrapper 上重定义 `--jx-icon-*` 同名变量）——词汇消费面真实
  repaint、无截图伪造；站点级覆盖路径由 dogfood 冒烟证明。

## 4. 文档页形态

- 路由 `apps/www/src/routes/docs/icons.html/{+page.svelte,
  +page.ts}`；toc 段：vocabulary / css-slots / plugin。
- 姊妹表组件 `icon-table`（www lib，不进 registry）：列 =
  glyph 预览（`{@html}` 直接渲染 jxGlyphs/icons 面）｜槽名｜
  消费者｜技术（mask/background-image）｜可覆盖（概念槽名）。
  TokenTable 纯文本合同不动（多页既有消费零风险）。
- 接线清单（ledger r1：116-119）：prerender entries（手维护）、
  docsSections 加行（Sections 组）、docs-structure.spec 重冻
  结、registry icons 条目 meta.href 更新、llms.txt/sitemap 自动。

## 5. 包边界与共享文件

- 子代理禁改：`apps/www/package.json`（lucide-svelte 移除）、
  `registry.json`（meta.href）、`docs-route-model.ts`、
  `svelte.config.js`——报告变更，ZCode 统一落盘。
- registry 镜像同步：`icon-vocab/icon-uris` 无镜像面（css-laws
  包内）；`icons.ts` 双份（registry/files/lib 与 apps/www 镜
  像）由 gen:icons 同步，字节一致门禁看护。
