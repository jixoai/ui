# Proposal: print-pipeline — paged.js 内核 + 冻结克隆 + 现有页零改动

## Why

Owner 验收裁决（2026-08-30，三条反馈 + 架构定调）：

1. 前一版 Paged\* 家族是「平行宇宙」——接管了整页布局。正确形态：
   **现有文档页正常网页流原样不动**，Paged 只做打印侧优化与自适应。
2. 核心只有两件事：**生成打印相关 CSS** + **基于打印模式控制 Context**。
3. 引擎不自研：**直接用 paged.js**。包装一层：按我们的配置冻结
   （live 干预 → 动画 pause → 深克隆），把这份**脱离 live tree 的
   克隆**交给 paged.js 内核；paged.js 只接触该克隆与页产物——
   **sim 与真打印同管线同产物**。真页眉页脚（margin boxes）、
   目录页（attr 回填页码）、真页码由内核布局供给。

证据基座：pagedjs-source-research.md（源码级研究，master@6b0ff80，
preview(content,stylesheets,renderTo) 共存模式、handlers 全表、
CSS 共存边界、503KB/97KB gzip 懒加载）。

## What Changes

### 1. 冻结与克隆（`lib/print/freeze.svelte.ts`）

- **时序合同**（研究最大风险的直接对策）：**预备媒介信号**
  （sim 盖 stamp / 直接打印同入口先盖 stamp，filter 开门；beforeprint
  仅真实信号）→ print 插件干预 live contexts（density→**既有 sm 档**、
  hue→钉缺省，响应式落 DOM；motion 冻结走作用域动画协议**不是插件**）
  → `document.fonts.ready` +
  图片就绪门 → 深克隆 → 克隆上注入动画暂停 CSS（只染克隆）→
  克隆变换（见 3/4）→ 交内核。
- 退出（afterprint / sim 关闭）：contexts 响应式回弹，克隆销毁。

### 2. 内核管线（`lib/print/pipeline.svelte.ts`）

- `pagedjs@0.5.0-beta.2` 锁版安装（npm 停滞，vendor 心态；懒加载
  chunk、仅客户端——SSR 零路径）。
- `preview(clone, stylesheets, renderTo)`：sim 容器挂页化产物；
  真打印同一产物 + `@media print` 隐藏 app 根（内核不代劳）。
- **样式表分离法**（研究红线）：喂内核的 print CSS 与站点 sim 的
  `@media not print` 副本是**两个源头**，后者绝不入内核。
- 探针时序：computed 断言一律在 `rendered` 事件后（渲染期内核临时
  禁 overflow 规则会短暂失真）。

### 3. 打印 CSS 层（喂内核那份）

- 既有 unlayered 白名单/投影法则**正式迁转**（完整表+意图头入 kernel-print.css，css-architecture delta 同步登记；hide/flatten/滚动解除/
  代码块换行）；paged.js 产物本身 unlayered 落 head 尾——层叠权威
  心智一致（研究确认）。
- 代码块打印行为（换行 + 行号槽）迁入克隆变换：**pre→行 span 拆分
  在克隆上做**（活 DOM 零接触），行号 `lineNumbers` 配置位随 freeze
  配置走；print/sim 两态同一变换。

### 4. 目录页与页眉页脚（内核供真）

- **ToC**：web = 站点既有 ToC（零新组件）；打印 = 克隆变换注入
  目录页（nav + attr 回填页码：布局完成后管线把每条目的真页号
  回填为数据属性、样式表以 attr() 渲染——walkthrough r2/r3 弃
  target-counter：其解析器丢 keep-with-next 挪动的目标；章节源 =
  站点既有 heading 结构，不另养注册表）。
- **margin boxes**：配置驱动的 @page 规则（页眉 string-set/running
  element、页脚 counter(page)/pages），sim 里真实可见——上一版
  「Chromium fixed 复位」假货退役。

### 5. print 插件（`lib/print/context-plugin.ts`）

context-plugin-system 的第一个真实消费者：**filter**（sim/print 媒介
门控——预备 stamp 之后开门）+ **before**（density→既有 sm 档、
hue→钉缺省，经 hue adapter）——**不用 init**（无默认值注入需求）。
motion 冻结不是插件：走 prepareSnapshot 的作用域动画协议（含
per-slot CSS 帧转移与六类诊断码，两出口分载：sim 渲染诊断行 /
direct print 记 artifact metadata + console）。

### 6. 落页与退役

- **验收面 = 现有页**：print 层接入 docs +layout（**内容根正常流与
  页面自有样式不变**；layout 的打印控件/输出 sibling 是声明增量）；
  打印入口 = 页内按钮（sim 开关 + 直接打印，UI 入口完成
  prepareSnapshot 后才 window.print；Ctrl+P = 原生降级路径，文档化
  不入合同）。
- `/docs/paged.html` **重做为普通文档页**：讲打印能力，自身吃层。
- 退役（完整表见 design「退役表」）：PagedDoc/Section/Figure/Aside/
  Ref/Block/Table/ToC/**PagedCode**、registry.svelte.ts、paged.css、
  print-projection.css 与旧试点页内容；白名单**正式迁转**入
  kernel-print.css（表+意图头+css-architecture delta 同步登记）；
  medium.svelte.ts 保留接线、verify-print 重写（产物零 pagedjs 断言
  + 管线冒烟），先改 gate 再删目录，删后零引用断言。

## Impact

新：lib/print/（freeze/pipeline/sim 组件/两份 CSS/插件）、pagedjs
依赖（devDep+懒加载）[package.json 归集成者]、paged.html 重做、
layout 接线。退役：lib/paged/ 平行组件（manifest/引用/测试同步）。
既有页 web 行为零改动（全量测试回归证明）。
