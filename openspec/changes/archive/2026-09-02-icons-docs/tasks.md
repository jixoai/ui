# Tasks: icons-docs

## 1. 词汇表补洞（css-laws）[P]

- [x] 1.1 `icon-vocab.ts` 增 plain `check` 槽（三块冻结顺序律，
      :root 队尾 / dark 块队尾）+ `jx-pure.css` 重生成 +
      `icon-uris.test.ts` fixtures 重冻结。
- [x] 1.2 combobox 消费核对：`--jx-icon-check` 由死变量变真实
      存在；combobox.css 零改动或记录差异证据。

## 2. 插件槽位重构（vite-plugin）[P]

- [x] 2.1 `IconSlot` `pipette`→`palette` 改名（SLOT_REGISTRY、
      safety 文案、测试同步；零兼容层）。
- [x] 2.2 概念槽 + 派生墨水：`src/icons/ink.ts` 等价移植烘墨法
      则 + 等价性测试锁（默认 glyph 双跑字节对照）；serializer
      覆盖概念槽时同烘 plain + ink + .dark/.jx-light 白墨矩阵；
      `check`/`invalid` 概念槽入联合类型；派生矩阵 spec
      （9 概念 → 11 变量全覆盖）。
- [x] 2.3 插件测试更新（test/icons/）：改名后的槽位面、派生闭
      环、混搭不可能（覆盖 calendar 后 calendar-ink 同源）。

## 3. www dogfood + lucide-svelte 清退 [P]

- [x] 3.1 `vite.config.ts` `jixoai({ icons })`（lucide provider +
      默认 safety）+ 构建冒烟 + 渲染零 diff 验收。
- [x] 3.2 `gen-icons.mjs` manifest 补 `copy` → icons.ts 重生成
      （verify:icons）→ copy-command / copy-icon-button 迁移到
      `icons.ts`；lucide-svelte 移除（package.json 报 ZCode）。

## 4. 文档页 [P]

- [x] 4.1 姊妹表 `icon-table`（glyph 预览列 + 槽名/消费者/技
      术/可覆盖性）+ TokenTable 合同不动。
- [x] 4.2 route dir `docs/icons.html`（+page.svelte 三段：命名
      库词汇表 / --jx-icon-* 词汇表 / 插件定制高级文档含活演示
      块）+ toc。
- [x] 4.3 接线：prerender entry、docsSections 行、
      docs-structure.spec 重冻结、registry meta.href（共享文件
      报 ZCode 落盘）。
- [x] 4.4 glyphs 渲染 spec（预览列真实 SVG 输出）+ 页面结构
      lint 过绿。

## 5. 门禁与整合 [I]

- [x] 5.1 分域 spec 全绿（css-laws / vite-plugin / www icons
      域）→ ZCode 共享文件落盘 → 全量 vitest + verify:all +
      build 冒烟（99+1 页）。
- [x] 5.2 codex review（与 nav-fuzzy-filter 同轮）→ 结论处理
      → 再验证。
