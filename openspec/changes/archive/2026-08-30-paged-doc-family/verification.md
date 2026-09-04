# Verification: paged-doc-family

## Unit（vitest）

- 编号注册表：文档序注册、PagedRef 回填 §N、ToC 章节号代位；嵌套与
  动态 section 的注册序与 CSS counter 一致（同源 DOM 顺序断言）。
- MediumState reducer：真 print↔screen、sim 进入/退出、真 print 压过
  sim、afterprint 后 sim 戳仍在则恢复 sim（r5 裁定的退出语义）。
- aside 宽/窄类切换；PagedCode flow|shrink 类；heading-keeper 打包。

## 探针（verify-print.mjs，print 媒介仿真）

- 白名单命中：三 utility（display:flex、overflow:auto、
  max-block-size:min(32rem,60vh)）同时在场时，print 媒介下
  `[data-jx-print="hide"]` computed display:none、
  `[data-jx-canvas-scroll]`/`[data-jx-code-card-pre]`/
  `[data-jx-props-table-scroll]` computed overflow visible 且
  max-block-size none。
- sim 排他：screen 媒介 sim 戳生效；print 媒介下 sim 规则退出。
- bundle：lib/paged/ 无 pagedjs / 无 npm import。

## 页面与门禁

- /docs/paged.html：docs 骨架 lint 合规；双列/单列切换；边注浮动/沉降；
  打印按钮出 print 投影（人工验收项标注）。
- verify:all 全绿（含新 verify-print）[集成者]。
