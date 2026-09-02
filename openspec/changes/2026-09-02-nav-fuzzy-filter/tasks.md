# Tasks: nav-fuzzy-filter

## 1. 内核与左轨 [P]

- [x] 1.1 `lib/search/nav-filter.ts`：fuzzysort 内核（分组保
      持 + title/subtitle 取优 + 高亮索引 + 空查询恒等 +
      CommandMatch 兼容出口）+ 内核单测。
- [x] 1.2 `docs-sections-nav.svelte` 换内核：行为保留清单全过
      （design §2 表）+ 匹配字符高亮渲染。
- [x] 1.3 `docs-nav-filter.spec.ts` 按 fuzzy 语义重写真值表 +
      高亮断言。
- [x] 1.4 fuzzysort 依赖落位（版本/分组报 ZCode；npm view 核对
      最新稳定版）。

## 2. ⌘K 修活 [P]

- [x] 2.1 SearchPalette 上提根 `+layout.svelte` + docs 子树去
      重 + corpus 全站可用核对。
- [x] 2.2 非 docs 页 ⌘K/按钮可用 spec（含 docs 页不双开回
      归）。

## 3. 门禁与整合 [I]

- [x] 3.1 分域 spec 全绿 → ZCode 共享文件落盘（package.json
      与 icons-docs 同批）→ 全量 vitest + verify:all + build
      冒烟。
- [x] 3.2 codex review（与 icons-docs 同轮）→ 结论处理 → 再
      验证。
