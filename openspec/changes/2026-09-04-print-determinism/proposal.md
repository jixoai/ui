# Proposal: print-determinism — 打印输出是「文档 + printConfig」的纯函数

## Why

Owner 报告（2026-09-04）：打印时响应式查询仍在工作 —— 窄屏/移动端窗口发起的
打印预览与宽屏不一致。这是致命的：分页管线在**活窗口宽度**下做断页决策，
窗口状态被烤进 DOM；浏览器最终渲染虽按规范对纸求值，烤坏的状态已不可逆。
打印输出必须与窗口无关。

## What Changes

**核心机制（Q1 裁决：改辖域）**：PrintDoc 挂载时遍历全部可达样式表
（document.styleSheets + adoptedStyleSheets + `<style media>`/`<link media>`），
把一切**宽度特征**的 media query（`min-width`/`max-width`/`width` 及
device-width 族，无论标准断点、自定义断点还是手写 query）改写为对页面
内容盒的容器查询：

```
@media (width>=48rem) { … }          ← 原件禁用
@container jx-print-viewport (width>=48rem) { … }   ← 同层合成注入
```

页面内容盒挂 `container: jx-print-viewport / inline-size`。所有断点对**纸张**
求值 —— 语义零损失，"打印对应哪个断点"这个问题不复存在。

**生命周期（Q5 裁决：跟组件走）**：PrintDoc 挂载即生效（**standby 预览态
同激活** —— 预览必须等于打印），卸载即撤销全部副作用（骑既有零残留法则）。

**兜底（Q4 裁决）**：无法表达的 query → 封禁 + console 大声日志（选择器 +
原条件），绝不阻断用户的打印手势；差分门禁兜住实际影响。

**验收定义（Q2 裁决）**：verify-print 新增**真实浏览器双尺寸差分** ——
800×600 与 1600×1200 窗口各走完整打印姿势，页面盒序列 + 内容 stamp +
folio **逐字节一致**；jsdom 静态断言（合成了容器规则、原件被禁用）作单元层。

**视口单位（Q3 裁决：软化禁入）**：自家打印存活面的 2 处 vh cap
（component-canvas）清扫为确定性写法；框架层面**不硬禁**，落 AI-First 文档
指引：①单位仍可用 ②不建议用于打印存活内容 ③为什么（分页测量对窗口求值、
渲染对纸求值的错位）。网页应用脚手架场景无打印需求，AI 开发者按需自决。

## Impact

- `apps/www/src/lib/print/`（新模块 print-viewport；print-doc 挂载接缝）
- `apps/www/src/lib/ui/component-canvas/`（2 处 vh cap 清扫）
- `scripts/verify-print.mjs`（差分门禁）
- 文档页新增"打印确定性最佳实践"节（进 corpus/llms.txt，AI 可消费）
- `openspec/specs/print-pipeline/spec.md` 增补确定性需求

## iframe 否决记录（design.md 详述）

iframe 方案（页宽固定宿主）记档为**否决项**：ambient 打印契约破裂（原生
打印不可重定向）、全量样式搬运 + `:root` token 不跨文档、活 DOM 切断、
WebComponent 定义 per-document、双 paged.js 实例、verify-print pose 断言
全量重写、跨帧测量管线重架、Safari 怪癖。
