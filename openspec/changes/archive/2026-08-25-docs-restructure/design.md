# docs restructure — design decisions（r1 终案）

> 状态：r1 裁决落定（Codex 设计轮 2026-08-25，gpt-5.6-terra xhigh，
> 23m49s；初评 6.4/10、置信 0.91，扣分点已全部并入本终案）。
> 关键实证经 ZCode 交叉核验为真：73 registry:ui → 仅 60 个物理 href
> （form.html ×13、scroll-area.html ×2）；routes/components/ 目录 63 个；
> svelte.config crawl:false + 显式 entries；build-site.mjs 产物断言与
> llms sections 按旧目录配置；capture-baseline.mjs 扫描 routes 目录发现
> 截图目标。原型可运行面：/prototype-docs（dev :5199；Codex 环境经代理
> 不可达，Apply 前需本机复验 SSR）。

## P0 — 路由基数终律：73 个 canonical 页 + family hub

proposal 原文的「85+ move」是误判。终案：

- **58 个一对一路由目录**直接迁往 `routes/docs/components/<name>.html`。
- **form.html 拆出 13 个 item 页**（input、select、textarea、native-select、
  number-input、range、date-picker、color-picker、combobox、tags-input、
  checkbox、radio、toggle——以 registry 登记序为准）；原 form.html 保留为
  `/docs/components/form.html` **family hub**：服务数据录入总览 + 旧链接的
  fragment 落点（#all-types、#select-textarea、#example-form 必须保留），
  不进入组件 inventory。
- **scroll-area.html 拆出 scroll-area.html 与 scroll-virtual.html**。
- 每个 registry:ui 的新 `meta.href` 唯一指向自己的页；73 项 × prev/next
  才能成立。family hub 与非 UI 项不占 inventory 位。
- svelte.config `entries` 由 docs-route-model 生成的全量清单重建
  （crawl:false 下动态 [slug] 不会自动生成 73 页——必须显式枚举）。

## D1 — 旧路由：生成式静态跳转壳（同意 lean，强化为 manifest+emitter）

发布层迁移，不是保留旧 Svelte 路由：

- 新增 `legacy-doc-routes.json`（站点与构建共用）：`[{from, to,
  preserveHash?}]`，由 docs-route-model 从旧 href 全量生成。
- `scripts/build-site.mjs` 在 vite 产出后、复制到 public 前**运行
  emitter**，写 `dist/components.html`、`dist/components/*.html` 壳：
  `meta refresh(0)` + `canonical` 指新页 + `robots noindex,follow` +
  `location.replace(to + location.hash)`（JS 只为保 fragment）+ `<a>Moved</a>`
  兜底。
- 新 meta.href 与 llms.txt **只发布 /docs/***；llms 生成配置显式排除
  `components.html` 与 `components/**`。无 sitemap 实现需要改。
- 旧 fragment（form.html#all-types 等）静态服务器无法辨识 → 由 family
  hub 承接（见 P0）。

## D2 — 侧栏接管 chrome tree cell（同意 lean）

- Sections nav 落 `data-area="tree"`（ComponentTreeNav 退场删除；tokens
  路由不再有组件目录 rail），与 `data-area="toc"` 并存，SSR 首屏直渲染
  在最终 grid cell（firstpaint 法则）。
- 断点形态：≥1200 Sections rail 左 / 正文 / Toc 右；900–1199 Sections
  化为底部 tree bar、Toc 右；<900 Toc 顶部 bar、Sections 底部 bar。
  沉浸法则沿用：桌面 rail 随 header 紧凑上移不离场；窄屏 bar 下藏上现。
- 禁止 docs 内容再嵌 sticky sidebar（website-scaffold.css:102 的单一
  空间契约；原型页面内两栏仅作预览形态，不进生产）。

## D3 — 分类终案：layer 组插入 navigation 后（同意 lean + 逐成员表）

组序：`general → layout → navigation → layer → data-entry →
data-display → feedback`。

| 成员 | 组 | 理由 |
| --- | --- | --- |
| dialog / popover / tooltip / toast / alert-dialog / sheet / hover-card / command / popconfirm / tour | **layer 浮层** | modal/anchored/docked 顶层浮面（tour=spotlight overlay） |
| alert / progress / skeleton / spin / result | **feedback** | inline 通知、进度、加载态、结果态 |

layer 中文「浮层」；feedback 描述改「inline notices, loading and
operation outcomes」。涟漪：CatalogGroupId、registry meta.group、
catalog.spec、mega panel、sidebar 计数、pager 顺序快照。

## D4 — planned 页面不发布（否决 lean，采纳 Codex）

不创建公开占位页：会被 llms.txt 收录成对外不完整文档。introduction /
installation / usage·CLI / registry-item.json 在内容达标前**不进入生产
docsSections**（更不留 `#` 死链）；原型里的 planned 条目仅存于原型。
内容质量门由 Owner 后续裁决，不阻塞本 change。

## D5 — 首页收敛（同意 lean，收紧）

`/` = 品牌 + 快速开始 overview（现有首页实际硬编码 9 项，不是完整
catalog）；`/docs/components.html` 是唯一完整目录。首页所有组件链接改指
canonical docs URL，主入口指 `/docs.html`。

## D6 — docs-route-model（有条件同意）

原型 docs-structure 迁移为 `$lib/docs-route-model.ts`，但必须建立在 P0
的 73-canonical-page 模型上（slug≠页的假设废除）；sections/链/related
全部由它派生，layout 药丸与 docs 路由共用。锁测试见 tasks#2。

## D7 — pager 与 related 修正（同意 + 修 bug）

- 链序：CATALOG_GROUPS 组序 × registry.json 同组登记序；73 项预期序列
  锁成快照测试。
- **related 修正**：按距离交替取「前一、后一、前二、后二」——原型
  `filter().slice(0,4)` 是组内前 4 个，并非 nearest-first（Codex 抓到的
  原型 bug，生产实现修正并加锁）。

## D8 — 视图转场与 active 律（同意 + 修正）

- carousel 仅 `['/', '/docs', '/docs/components', '/tokens']`，比较前
  统一剥 `.html`；detail 页走默认过渡（不两两配对）。
- 顶栏单 active 律：组件页 = Components 药丸 active；其余 docs 路由
  （sections/registry）= Docs 药丸 active。滚动记忆按 pathname 自然
  工作；hash ladder 在新路径下回归验证。
