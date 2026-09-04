# Design: paged-doc-family

**契约正文 = synthesis v5**（`.agents/audit/2026-08-30-site-walkthrough/
paged/synthesis.md`，经 codex-review-r1..r5 五轮评审至 READY 8.8/10）。
本文件只记录实现映射与裁剪，不复述方案；实现遇歧义以 synthesis 为准。

## 实现映射

| synthesis 条目 | 落点 |
| --- | --- |
| §1 媒介契约三轨道 | CSS：print CSS 文件；Svelte：`medium.svelte.ts`；模拟：`data-jx-print-sim` + `@media not print` 包裹（生成器 v1 允许手写两份 + parity 断言测试，AST 生成器留 followup） |
| §1 层叠白名单表 | `apps/www/src/lib/paged/print-projection.css`（unlayered `:where()`，逐条对应 synthesis 表）+ css-architecture spec delta 同表登记 |
| §2 断点 API | PagedDoc/Section/Fig/Table/Code props 直译；orphans/widows 全局 `:where()` 规则；fillKeep 等阈值**不实现**（pagedjs 档词汇占位） |
| §3 FreezeSnapshot | v1 只落 freeze 动词语义（print CSS 动画 kill 沿 reduced-motion carve-out + medium.svelte.ts 的 Svelte 冻结钩子）；序列化器帧擦洗独立 change |
| §4 画布协议 | pilot 页的 canvas 带 `data-jx-print="freeze"`（dock 隐藏 + output 投影——读出行复用既有 output prop，v1 手动传） |
| §5 PagedToC | 章节号代位；PDF 锚点标「best effort」不写合同 |
| §6 native/pagedjs 分界 | engine prop 占位；bundle 零 pagedjs import（探针断言） |

## 编号信源（原型实证）

CSS counter 渲染归渲染，JS 读不到（getComputedStyle 返回未解析的
`counter(sec)`）。生产版信源 = **Context 注册表**：PagedSection init 时
向最近 PagedDoc 注册（文档序），目录与 PagedRef 从注册表取数；
CSS counter 仍负责视觉编号（同序派生，无漂移可能——都源于 DOM 顺序）。

## 验收门（r5 Apply 要求）

1. markup 合同落地：`[data-jx-props-table-scroll]` 真实输出 + source guard
2. 白名单 probe 真跑：print 媒介仿真（page.emulateMedia）下 computed
   style 断言（三 utility 同时在场仍胜）
3. sim 排他：`@media not print` 下 sim 规则生效、print 媒介下退出
4. bundle 探针：lib/paged/ 零 pagedjs/零 npm 依赖
