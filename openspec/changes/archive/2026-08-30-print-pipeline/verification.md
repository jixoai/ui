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
- 动画协议（jsdom 纯函数）：路径/slot 解析、delay′ 算式、诊断
  分类（六码）；预暂停项不被启动、currentTime 不被扰动。
- stamp 所有权：sim→直接打印→afterprint 后 medium === 'sim'（既有
  stamp 存续）；screen→直接打印→afterprint 后 === 'screen'。
- stamp 时序：prepare 前 stamp 可见；afterprint 只摘事务自盖的 stamp；renderTo 可测量失败 fail-loud；preview 后取消无
  pages/head-style/listener 残留。

## 管线（verify-print，真实 Chromium）

- **CSS 帧转移 computed 断言**：双 slot + 非零原 delay + 相异
  currentTime 的 fixture，断言 clone 各槽 computed animation-delay
  === delay′ 公式值、play-state paused、computed 相位与源相等；
  finished/alternate/unmatched 与 WAAPI 走结构化诊断（不 throw；
  sim 渲染行、direct print 记 artifact metadata）。

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

## 标题孤悬执法扩展（2026-09-03）

- **形态普查**（一次性诊断，真 Chromium 五文档）：cut-avoid 8 例
  为主导（SectionCard 头部块被切于页底），经典无空间豁免 5 例，
  ended-whole 0 例；修复后复测：全部 cut-avoid 重聚，icons p7 经典
  漏搬（figcaption need 28 / avail 356）由泛化 pass 修复
  （keepRelocated 2→3），余留均为 leaf 实测无空间（304/8、256/72、
  160/138、160/52）——合法的最不坏断点。
- **verify-print**：paper projection 门禁升级为"零 strand + 零
  rejoinGap（凡有空间者）"且 keepRelocated≥1 与 keepRejoined≥1
  双非空转；检测器镜像泛化后的执法逻辑；读数前等待 artifact
  metadata 静默（post-ready mend 落地后才是断言面）。32/32 ×3
  连跑稳定：`keepRelocated=2, keepRejoined=2, strands=[], rejoinGaps=[]`。
- **pagedjs 尾部时序**（三轮插桩）：preview resolve 后被切半块
  无 childList 变更漂移 942px（151ms:3441→185ms:2498→335ms:3440）；
  帧稳定/变更静默启发式均被波间停顿骗过——settle 最小窗 + 扫环 +
  flight 收尾 post-ready mend（守卫化）三层兜底后收敛。
- **单测**：print-relocate.spec.ts 11 用例（注入量测的纯 DOM 走
  查：经典/ended-whole/rejoin/嵌套切半/不可满足/r5 防御/空续块/
  resync 语义链）；print-stylesheet-gate 锁定 h1–h6 keep 链选择器；
  lifecycle 假时钟补 performance 伪造。全量 vitest 110 文件
  1606/1606 绿。

## 虚线块级化（2026-09-03）

- **verify-print**：paper projection 门禁升级为"虚线是块判断"——
  blockDashes（戳记数）≥2 非空转（pilot 高卡跨页保证）、
  blockDashed===blockDashes（每戳必画）、strayDashed===0（无戳
  切链元素画虚线=硬法则，旧"最内层拥有"规则回归即红）；
  outerQuiet 豁免带戳 owner（其虚线取代被抑制边缘是设计）。
  32/32 ×3：`blockDashes=7, blockDashed=7, strayDashed=0,
  outerQuiet=33/33, doubledCuts=0`。
- **跨文档抽检**：dialog.html 17 戳/0 杂线；recipes.html 13 戳/
  0 杂线——箱体卡之外零虚线。
- **单测**：print-relocate.spec.ts +4（卡切两半皆戳+外层标记、
  纯流零戳、同边嵌套塌缩到最内块、跨 3 页中间半块双侧戳）；
  print-stylesheet-gate 正则锁定新规则形状 + 旧规则负断言。
  全量 vitest 110 文件 1610/1610 绿。
- **判据纠偏（2026-09-03 同日）**：白名单改为打印预览边框——
  codeCard（头/foot 带存活于投影）+ boxed 变体；默认无框
  SectionCard 移除。复验见下。

## SectionCard 打印投影三改（2026-09-03）

- **机制前置验证**：Chromium print-to-PDF 对 backdrop-filter 的处理
  ——先以最小 fixture 三种墨（ghost/color-mix/border）出 PDF 解流
  对比，确认 contrast ghost 被栅格化保留（printBackground: true），
  分割线墨 sim/纸面一致才落地。
- **verify-print**：paper projection 增 headersTotal/headersBorderless
  /separatorTracks 三计数（header 区选择器按 avoid 戳记——
  div:first-child 会在跨页 body 续块上误匹配，真实页抓到 4 例
  content:none + p10 一例伪轨道）。32/32 ×2：
  `headersTotal=7, headersBorderless=7, separatorTracks=7,
  cards=13 全 typographic（无 end hairline）`。
- **出纸抽检**：对 /docs/paged.html sim 态 emulateMedia(print) +
  page.pdf(printBackground) 导出，解 PDF 流：1285 条 1px 高矩形、
  476 处 ExtGState（滤镜栅格化）——分割线墨真实落纸。
- **单测**：print-stylesheet-gate 断言同步（hairline 负断言、
  separator 轨道正则、padding-inline 正则 + 旧 padding:0 负断言）。
- **零发明间距（2026-09-03）**：两处补偿性 margin 删除（节距回归
  栈 gap-8 的 32px；分割线周围回归 authored 36px）；gate 四断言
  （padding-inline 正则 + padding:0 / section margin-block-end /
  div+div 规则三负断言）锁定。
- **②重定性为标准组件化（2026-09-03）**：SectionCard 出厂结构性
  Separator（Dialog row-ruler 模式）；kernel 投影退役、只留 block 流
  + sep keep 链。屏幕树实测：section display=grid、命名行
  [header]/[sep]1px/[body]、header border-bottom 0px、hr[data-
  jx-separator=line] 1px×707px contrast(0.5)。打印探针：sepsTotal=7
  / separatorTracks=7、headersBorderless=9/9（宽度断言——tw preflight
  的 solid@0px 陷阱）、32/32 ×2；镜像同步后 vitest 1611/1611。
