# Design: nav-fuzzy-filter

## 1. 内核形状

```
docsSections ──┐
               ├─ navFilter(sections, query) ──► 分组保持的结果树
docsComponentGroups ─┘                              │
                                                    ├─ pages[] 带
                                                    │  highlight 索引
                                                    └─ 空节剔除
toCommandMatch(navFilter) ──► CommandMatch 兼容出口
（(item:{label,keywords?},query)=>boolean，command.svelte 冻结契约）
```

- `lib/search/nav-filter.ts` 唯一引擎入口：fuzzysort 对
  title（主）与 subtitle（副）分别跑，取优者分；分组序与组内序
  保持数据源顺序（fuzzy 只做**筛**不做**重排**——与 CommandMatch
  「隐藏不重排」语义同构）。
- 高亮：fuzzysort 返回的 indexes 交给渲染层（`<b>`/标记 span，
  沿用站内既有标记惯例）；空查询恒等、零高亮。
- 工作集 ≈105 项（registry.json → catalog.ts →
  docs-route-model.ts → 布局 deriveds，编译期），同步内存、无
  索引文件。

## 2. 左轨行为保留清单（升级的硬边界）

| 行为 | 现状锚点 | 升级后 |
|---|---|---|
| 分组保持 | visibleSections 结构 | 不变（fuzzy 只筛） |
| 空节隐藏 | 同上 | 不变 |
| 空态文案 | 147-149/223-225 | 不变 |
| Escape 清除 + stopPropagation | 110-117 | 不变 |
| 双输入位（宽轨/移动栏） | 133-144/210-222 | 不变 |
| title OR subtitle 匹配 | 90-109 includes | fuzzy 语义（超集） |

`docs-nav-filter.spec.ts` 重写为 fuzzy 真值表：保留结构断言，
匹配断言按超集语义重写（例：`'jx'` fuzzy 下命中 jx-pure 之外的
字母序命中项），新增高亮索引断言。

## 3. ⌘K 修活

- SearchPalette 从 `routes/docs/+layout.svelte` 上提到根
  `routes/+layout.svelte`（单一挂载点；docs 侧移除，避免 ⌘K 双
  监听/双面板）。
- 根布局已有触发按钮（+layout.svelte:696-704）与全局 ⌘K 键
  （search-palette.svelte:141 自持）——上提后非 docs 页按钮/快
  捷键即活。
- corpus 是构建期静态产物（`/search/corpus.json`，站根声明路
  径），面板打开时才 fetch——全站可用，无路由耦合；spec 断言非
  docs 页 ⌘K 打开面板。

## 4. 包边界与共享文件

- 子代理禁改：`apps/www/package.json`（fuzzysort 新增）——报告
  版本与依赖分组，ZCode 统一落盘（与 icons-docs 的
  lucide-svelte 移除同批）。
- 根 `+layout.svelte` 仅本 change 触碰（icons-docs 不动布局）；
  `docs-route-model.ts` 仅 icons-docs 触碰——两 change 文件域
  交叠仅 package.json 一处。
