# Design: print-pipeline

研究基座：pagedjs-source-research.md（行号级证据）；系统底座：
2026-08-30-context-plugin-system change。

## 管线全景（一个管线，两个出口）

```
触发（sim 开关 | beforeprint）
→ medium 派生 'sim' | 'print'
→ print ContextPlugin 干预 live contexts（不可变管道，DOM 属性响应式落）
→ readiness gate（document.fonts.ready + img complete 轮询上限）
→ 深克隆 app 根
→ 克隆变换：动画暂停 CSS 注入 · pre→行 span · 目录页 nav 注入
   （全部只染克隆；活 DOM 零接触）
→ pagedjs preview(clone, [kernel-print.css, page-config.css], renderTo)
   ├─ sim：sim 容器（屏幕上的页化呈现，margin boxes 可见）
   └─ print：同一产物 + @media print 隐藏 app 根 → window.print()
→ 退出：afterprint / sim 关 → contexts 回弹（插件 filter 关门）→ 克隆销毁
```

## 样式表分离（研究红线，硬法）

三个源头，互不喂错：
1. `kernel-print.css` —— 喂内核的打印规则（迁移自白名单/投影 +
   代码块换行/行号 + 目录页 target-counter + @page margin boxes 配置）
2. `sim-shell.css` —— 站点侧 sim 容器外观（`@media not print` 包裹，
   绝不喂内核——内核的 PrintMedia 会解包 print 块删其他 media）
3. 站点运行时 CSS —— 不喂（内核只需要它要分页的那份规则）
探针在 rendered 后断言三者边界（喂入清单快照测试）。

## @page 配置面（真页眉页脚）

```ts
interface PrintPageConfig {
  size?: string; margin?: string; bleed?: string; marks?: 'crop'|'cross'|'both'
  header?: { start?: string; center?: string; end?: string }   // string-set/counter
  footer?: { start?: string; center?: 'counter(page)'; end?: 'counter(pages)' }
  firstPageHeader?: boolean
}
```
编译为 @page + margin-box content 规则，作为第二份 stylesheet 喂内核；
sim 与真打印同规则。

## 目录页（target-counter 官方机制）

克隆变换在克隆首插 `<nav class="print-toc">`：条目 = 克隆内
h2[id]（沿用站点既有 heading/id 体系，不养平行注册表）；两条 content
规则（target-text + target-counter(attr(href url), page)）让内核逐页
回填真页码。web ToC 零改动。

## 克隆变换的纪律

- 变换是纯 DOM 函数（clone in → clone out），逐条可测（vitest 用
  jsdom 直接跑变换，不起内核）
- 动画暂停 = 克隆上注入 style 元素（animation-play-state:paused +
  负 delay 擦洗位预留），配置驱动（frame?: number）
- pre→行 span：code-block/CodeCard 的 pre 全量拆分；lineNumbers 配置
  （默认 true，可全局/逐块禁用——沿用上一版已验收的属性语义）
- id 保持：内核 id→data-id 机制保锚点（研究确认）

## 与既有资产的关系

- medium.svelte.ts：保留（驱动触发与插件门）
- 白名单/投影：迁入 kernel-print.css；unlayered 权威不变（内核产物
  也是 unlayered head 尾，层级心智一致）
- verify-print.mjs：保留扩展——rendered 后断言 + 喂入清单快照 +
  pipeline 冒烟（sim 开 → 容器有页 → 关 → 容器清）
- 退役面：lib/paged 平行组件、旧 paged.html 内容；其测试迁转或删

## 风险与对策（研究结论落法）

- 资源迟到重排风暴 → readiness gate 硬门（超时 fail-loud 不静默出页）
- 表格断点脆弱 → 表格类页面进验收清单首轮人工核（followup 记录）
- 不可分超页元素 fail 整次渲染 → pipeline 捕获渲染错误 → sim 容器
  显示诊断行（不白屏）
- npm 停滞 → 锁 0.5.0-beta.2 + lockfile 审计注释（vendor 心态）
