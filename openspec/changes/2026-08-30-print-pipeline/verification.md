# Verification: print-pipeline

## Unit（vitest，jsdom 起变换不起内核）

- 克隆变换逐条：动画暂停 style 注入只染克隆、pre 行拆分（含
  lineNumbers=false）、目录页 nav 注入（条目 = h2[id] 序）、
  id/锚点保持。
- page-config 编译：margin boxes/页码 counter 规则快照。
- print 插件：三干预 + 媒介门 + 不可变（冻结入参断言）。
- 样式表分离：**AST gate**（kernel-print.css 零 `@media not print`、
  零 `[data-jx-print-sim]`）+ **runtime spy** 捕获真实 preview() 入参
  （sim-shell.css 绝不在场）+ 零引用 gate（lib/paged 与 Paged* 全扫）。
- 同一产物：sim→直接打印复用（页数/目录页码/@page hash 三元组相等）；
  失效重建（改 config 后三元组变化）。
- 动画协议：预暂停项不被启动不被恢复；CSS 动画 source/clone 同帧
  fixture；WAAPI 走诊断行。

## 管线（verify-print，真实 Chromium）

- sim 开 → 容器出现页化产物（pagedjs 页类选择器存在）→
  margin boxes computed 可见 → 目录页条目带真页码 → sim 关 →
  容器清、contexts 回弹。
- rendered 后断言窗口（渲染期失真规避）；既有白名单三 utility
  对抗断言保留全绿。
- 真打印出口：@media print 下 app 根 display:none、页容器可见
  （emulateMedia 断言，不出真纸）。

## 回归与门禁

- 现有页 web 零改动：全量 vitest + verify:all 绿；press-button.html
  作验收面（正常页 + 打印优化）。
