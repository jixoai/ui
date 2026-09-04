# Proposal: print-paper-theme — 纸是白的：打印投影钉死 light，声明式暗纸例外

## Why

Owner 裁决（2026-09-03 原话）：

> 打印模式下，必须强行修改要打印的内容的 Context，将它的 theme 固定成
> light，因为纸张没有暗色模式，都是白纸。除非明确声明要用暗色风格，
> 那就变成黑纸白底，那你就要专门适配。

现状违反这条法则：pagedjs 产物住在 `document.body` 下的
`[data-print-output]` 里，站点样式照常级联——`html.dark` 时近白
`--foreground`/`--border`、白色分隔线、code-card 的 `.dark` 版 Shiki
token（`oklch(1 0 0)` 硬混）全部渗入产物；而 sim 纸张硬编码 `#fff`。
**暗色模式下打印 = 白字白纸，不可读**。全仓与所有 openspec 记录均无
打印主题法则。

## What Changes

1. **纸张主题盖章**（管线自有根，一枚章覆盖 sim + 真实打印）：
   `ensureOutputRoot` 每次飞行按解析后的主题幂等重盖——默认
   `class="jx-light"` + `style.colorScheme='light'` +
   `data-print-theme="light"`；声明 dark 时 `class="dark"` +
   `'dark'` + `"dark"`。作用域词汇即主题表自己的 `jx-light`/`dark`
   类（component-canvas 舞台先例）；不动 `<html>`（零全站闪变、零
   theme-toggle 竞态）。
2. **声明语法**：`PrintPageConfig.theme?: 'light' | 'dark'`，缺席 =
   light（法则即默认）；`parsePageConfig` 校验，非法值抛
   `PageConfigError`。theme 进 `parsedSignature` → `stylesheetHash`，
   仅换主题也会重建产物（无误复用）。管线消费、不编译进 @page
   （headerIcon 同款先例）。
3. **`.jx-light` 作用域补全（墨水回翻）**：code-card.css 在
   `:where(.dark .jx-code-card)` 之后新增
   `:where(.jx-light .jx-code-card)` 回翻块——`.dark` 按**祖先**命中，
   声明了 light 作用域也躲不开，其中字面 `oklch(1 0 0)` 混色在白纸上
   发白（顺带修复 component-canvas light 舞台在暗色文档下的存量同类
   bug）。顺序即语义：回翻在后，声明胜出。
4. **克隆退役（light 声明的工具类半边）**：`dark:` 变体工具类键于
   `.dark` 祖先（`&:where(.dark, .dark *)`），作用域类关不掉它——
   inline-code 的 `dark:[--tok-*]`、表单件的 `dark:scheme-dark`。
   freeze 新增纯函数 `retireDarkUtilities(clone)`：light 声明下从
   克隆剥离全部 `dark:` 前缀类（屏幕树不动，克隆才是产物）；dark
   声明下保留（它们就是适配）。
5. **暗纸专门适配（声明即生效）**：kernel-print.css §10——
   `[data-print-output][data-print-theme='dark']` 上
   `print-color-adjust: exact`（继承覆盖整条墨水链），`.pagedjs_page`
   `background: var(--background)`（纸张自绘纸色；内核规则同时覆盖
   sim 与真实打印，产物面本就同一表面）。light 不需要内核规则：盖章
   + 退役两半已收口。
6. **门禁与探针**：print-stylesheet-gate 锁 §10 规则（且断言内核无
   `.dark`/`.jx-light`/`='light'` 选择器——内核保持主题无关）；单测锁
   theme 语法、盖章幂等/换域重建、退役行为；verify-print 新增
   「暗色文档 → 白纸深墨」computed 探针 + 暗纸 CSS 链探针。

## Impact

- 代码：page-config.ts（theme 字段）、pipeline.svelte.ts（盖章 +
  退役接线）、freeze.svelte.ts（retireDarkUtilities 导出）、
  code-card.css（回翻块，镜像同步 registry）、kernel-print.css（§10）。
- 测试：print-page-config / print-pipeline / print-stylesheet-gate /
  print-freeze / code-card 五个 spec + registry 侧两份镜像；
  scripts/verify-print.mjs 新增 paper theme 两查。
- 不做：不翻 `<html>` 主题；不动全局 `@custom-variant dark`（CSS 表达
  不了「最近作用域胜」，会破坏嵌套暗岛）；零改 jixoai.css token 表
  （light 块已存在）；主题不上 ContextDef 插件总线（CSS 级联即主题
  总线，加插件属过度设计）；非文档页的原生 Ctrl+P 降级打印不在本轮
  （文档页已被 ambient beforeprint 全覆盖）。
