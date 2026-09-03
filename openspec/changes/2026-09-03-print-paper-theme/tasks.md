# Tasks: print-paper-theme

## 1. 声明语法 [P]

- [ ] 1.1 page-config.ts：`PrintPaperTheme` 类型 + `theme?` 字段 +
      `parseTheme` 校验（非法值 `PageConfigError`；缺席 undefined）
- [ ] 1.2 theme 不进 `compilePageCss`（管线消费字段，@page 语法不变）
- [ ] 1.3 print-page-config.spec.ts：合法/非法/缺席/不编译四查
      （www + registry 镜像）

## 2. 盖章与退役（管线） [P]

- [ ] 2.1 pipeline.svelte.ts：`PAPER_THEME_ATTR` 常量；
      `ensureOutputRoot(standby, theme)` 幂等盖章（类对 Toggle、
      inline colorScheme、data-print-theme）
- [ ] 2.2 run() 接线：`parsedConfig.theme ?? 'light'`；light 时
      `retireDarkUtilities(snapshot.clone)`（复用路径在章前早退,零误伤）
- [ ] 2.3 freeze.svelte.ts：`retireDarkUtilities` 纯函数导出
      （前缀 `dark:` 类剥离,计数返回,屏幕树无关）
- [ ] 2.4 print-pipeline.spec.ts：默认 light 章 / dark 章 / 仅换主题
      重建且无类残留 / 非法 theme fail-loud / 退役保真（dark: 剥离、
      余类保真、活树不动）/ dark 保留
- [ ] 2.5 print-freeze.spec.ts：retireDarkUtilities 纯函数三查
      （剥离+计数、lookalike 类名不误伤、无 class 树零 fabrication）

## 3. CSS 两半 [P]

- [ ] 3.1 code-card.css：`:where(.jx-light .jx-code-card)` 回翻块
      （五变量浅色公式,置于 dark 块之后）;registry/files 镜像同步
- [ ] 3.2 code-card.spec.ts：回翻块存在性 + 无 `oklch(1 0 0)` +
      顺序 load-bearing 断言;census 9→10
- [ ] 3.3 kernel-print.css §10：暗纸家族（print-color-adjust exact
      双前缀 + `.pagedjs_page` 纸底）+ intent 头登记
- [ ] 3.4 print-stylesheet-gate.spec.ts：§10 两规则入表 + 负面断言
      （内核无 `='light'`/`.dark`/`.jx-light` 选择器）
      （www + registry 镜像）

## 4. 真实探针 [P]

- [ ] 4.1 verify-print.mjs 2k 段：暗色文档（html.dark + colorScheme）
      下开 sim → 章/scope/colorScheme/正文墨水亮度 <0.45/
      `--tok-token-function` 无 `oklch(1 0 0)` 字面量
- [ ] 4.2 verify-print.mjs 2k 段：直接盖 dark 章 → `printColorAdjust
      === 'exact'`、纸底亮度 <0.1、墨水亮度 >0.55、token 公式带
      `oklch(1 0 0)`（CSS 链整体验证）;退出时还原文档态

## 5. 记录与门禁 [P]

- [ ] 5.1 openspec change：proposal（Owner 裁决原话）/ design（审计 +
      数据流 + 放弃方案）/ specs/print-pipeline delta / tasks /
      verification
- [ ] 5.2 全量：apps/www vitest 全套、`verify:mirror`、`pnpm build`、
      `verify:print`（真实 Chromium）
- [ ] 5.3 Codex 复核（herdr 异步）并按结论迭代
