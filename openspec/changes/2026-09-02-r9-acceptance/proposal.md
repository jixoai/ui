# r9 — search & print acceptance round

## Why

Owner acceptance (2026-09-02) landed five search findings and three
print findings against the r7/r8 deliveries. The search round's core
complaint — "search can't find anything" — traces to the dev server
404ing `/search/corpus.json` (the corpus lives only in the built
`public/`, never in the www asset space). The rest are law violations
(fixed-overlay palette, left-nav entry, non-English copy, off-spec
icon) and print polish (bar text layout, the gutter's wrap-under
defect, highlighter lock-in).

## What Changes

搜索（S1–S5）：
- **S1 dev 语料服务**：`vite.config.ts` 新增 `devSearchCorpusFallback()`
  中间件（devRegistryFallback 同款法则）——dev 下 `/search/corpus.json`
  只读映射到 repo-root `public/search/corpus.json`；未构建过则诚实
  404 + 一次性提示。构建仍是唯一写入者。
- **S2 入口迁移**：搜索触发钮从 docs 左侧导航移除，进入根布局
  TerminalHeader 组合区（图标钮派发 `jx-search-open`）。
- **S3 原生 dialog**：面板重写为 `<dialog>` + `showModal()` 顶层渲染
  （原生 ::backdrop、Escape、焦点归还触发钮）；居中布局在 dialog
  内部控制，fixed 遮罩退场。IME 守卫/debounce/键盘导航/高亮保留。
- **S4 图标规范**：manifest 新增 `search` 图标（gen:icons 生成制，
  16px baked 法则），面板与 header 触发消费同源几何。
- **S5 文案**：placeholder 与 aria 全部落本站英文基调
  （`Search the docs…`）。

打印（P1–P3）：
- **P1 sim-bar 重排**：`[A B C D]` → 文本块（label+description 上下
  堆叠）+ 右侧按钮组；glass/sticky/print 隐藏法则与全部 data 属性
  不变。
- **P2 行号独立列**：gutter 从 `::before` 内联盒（折行文本钻到号
  下面）改为真表格列——`pre code` = table、每行 = table-row、号 =
  table-cell、代码文本 = 匿名 cell；折行缩进恒在列右（Playwright
  几何探针实证：折行各段 left 与首行文本对齐）。CHUNK 预分块断页
  面不变。
- **P3 高亮后端可拔插**（Owner 指定子代理任务）：context 内核承载
  默认后端（运行时值，零构建），`<CodeCard backend={shiki() |
  prismjs() | microLighter()} />` 实例级覆盖。microlighter 的
  CSS Custom Highlight API（零标记）与 markup 型后端在接口层
  并存；打印克隆下 ranges 型退化为纯文本为已知限制。

## 分工

- 子代理 A：搜索 UI 簇（S2–S5）；子代理 B：P1；子代理 C：P3。
- ZCode 直担：S1、P2、共享文件（registry/icons manifest/
  package.json/openspec/镜像 manifest）、整合门禁与送审。

## 环境注记

整合期撞上并行会话对 `packages/vite-plugin` 的活跃迁移（`jxoai()`
导出在途变动，apps/www 构建一度不可用）。本轮全部 app 级验证
（全管线 build/verify-print 32 断言版/corpus 再生）以并行线落地
后的整合门禁为准。


## r10 验收修正（Owner 复验，2026-09-02）

搜索：
- 面板去拥挤：输入行/命中项留白与排版重做（页面名升 overline、
  标题主行化、摘要双行松弛、面板 44rem、命中区 60vh）
- 双态补齐：**Pending**（debounce+引擎在途的三点飞行态，
  `data-jx-search-pending`）与 **NoResult**（放大镜空态 +
  回显查询 + 温和提示，`data-jx-search-empty`）；各有专属 spec
- 触发钮迁位：`[Search-Icon] [Navs] [Hue-Popover]`——pill 盒首槽，
  与 hue-popover 解耦

打印：
- **gutter 回退悬挂缩进**（r9 的 table 变体在真实页面触发 pagedjs
  崩溃：`Layout.createOverflow → indexOfTextNode` 读匿名单元格的
  undefined ref）。同几何、仅 r7 已验证原语：`padding-inline-start:
  4ch + text-indent: -4ch`，::before 行号骑首行，折行续行天然落在
  列右；opt-out 连带清零缩进。verify-print 32/32（display=block
  实测）、tall-card 120/120 分页如常
