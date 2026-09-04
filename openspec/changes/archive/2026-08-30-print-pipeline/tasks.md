# Tasks: print-pipeline (r2)

## 1. 冻结与克隆 [P]

- [x] 1.1 `lib/print/freeze.svelte.ts`：**prepareSnapshot 事务**
      （**预备 stamp 事务所有权**（screen 才自盖并记录 createdStamp；
      既有 sim 复用不持有；afterprint 只摘自盖的——sim→直接打印→
      afterprint→sim fixture）→插件干预→**作用域动画捕获**（subtree 枚举、记录
      {wasRunning, currentTime}、仅暂停 running、预暂停永不触碰）→
      DOM-commit 屏障 double-rAF+stamp 断言 fail-loud→readiness gate
      （lazy 解除+超时预算+进度/取消）→深克隆→克隆变换→**幂等
      restore token** 只恢复本事务暂停项）。
      变换纯函数（**CSS per-slot 帧转移**（元素序路径+slot 匹配；phase=((c−d)
      mod D)、pre-delay→剩余延迟；finished/alternate/unmatched→
      诊断行）/**结构化诊断列表（sim 渲染行、direct print 记入
      artifact metadata+console）**/pre 行
      拆分 lineNumbers/目录页 nav/id 保持），jsdom 可测。
- [x] 1.2 根与并发：[data-print-source]/[data-print-output] sibling
      合同、**renderTo 可测量断言**（offsetWidth>0，失败 fail-loud）、
      single-flight token（准备阶段取消；preview 后 best-effort=
      移除 output 根+销毁产物句柄）、四路幂等 cleanup（pages/
      head-style 句柄/listeners）、退出回弹断言（精确回 raw 引用 +
      afterprint 摘 stamp）。

## 2. 内核管线 [P]

- [x] 2.1 `lib/print/pipeline.svelte.ts`：pagedjs 懒加载、preview
      封装、rendered 门、渲染错误→sim 诊断行；**同一产物语义**
      （snapshot hash + stylesheet hash 有效期；失效重建）。
- [x] 2.2 `kernel-print.css`（白名单表+意图头正式迁转+投影+换行/
      行号+目录页规则）与 `sim-shell.css`（not-print 包裹）分离；
      **AST gate**（kernel 零 not-print/零 sim 选择器）+ preview 入参
      runtime spy 快照。
- [x] 2.3 `lib/print/page-config.ts`：结构化值+校验器（拒绝无效
      size/margin/marks/header-footer），parser 单测。
- [x] 2.4 sim 容器组件 + 真打印出口（prepareSnapshot 完成后
      window.print；@media print 隐藏 app 根）。

## 3. print 插件（context-plugin 首个消费者）[P]

- [x] 3.1 `lib/print/context-plugin.ts`：density→sm、hue→钉缺省
      （经 hue adapter）；filter 媒介门；不可变纪律；**接缝合同**
      ——依赖 context-plugin-system 先行落地（含 hue adapter 与
      definePlugin 契约），未验收前本任务不开工。

## 4. 落页与退役 [P]

- [x] 4.1 docs +layout 接入（内容根不变；打印按钮控件）；验收面 =
      现有页（press-button.html 优先）。
- [x] 4.2 `/docs/paged.html` 重做为普通文档页（讲打印能力，自身吃层）。
- [x] 4.3 退役表执行（design 的表；含 PagedCode/registry/paged.css/
      print-projection.css；**先改 gate 再删**；删后零引用断言）。

## 5. 门禁与集成 [I]

- [x] 5.1 pagedjs devDep（锁 0.5.0-beta.2）+ 懒加载接线
      [package.json 归集成者]。
- [x] 5.2 verify-print 重写：SSR/prerender 产物零 pagedjs 断言、
      管线冒烟（sim 开→页产物+margin boxes+目录页码→关→清理回弹）、
      **stamp 时序断言**（prepare 前可见、afterprint 后移除）、
      **动画协议 fixture**（预暂停不启动不扰 currentTime；CSS 双 slot+
      非零原 delay+相异 currentTime 的同帧断言；WAAPI/边界诊断不
      throw；**sim→直接打印→afterprint→sim 的 stamp 所有权**）、**可测量失败 +
      preview 后取消无残留**、三场景残留测试（连续 sim/sim→print/
      失败重试）。
- [x] 5.3 manifest SITE_ONLY（lib/print/）+ taxonomy/route 同步。

## 6. Owner 验收反馈轮（r5，2026-09-01 四点）[P]

- [x] 6.1 **页眉页脚行业规范**（①）：page-config 语法扩展——token
      序列（空白分隔）+ 引号字面量（`" / "` 可含空格，禁引号内 css
      元字符；splitTokens 引号感知 tokenizer 修复裸引号致渲染挂起）
      + `headerIcon`（站点相对路径校验）；kernel 第 9 族——
      `h1/h2 string-set: docTitle/sectionTitle` 裸选择器、margin 家具
      低语排版（nav 字体 8.5pt/55% 色）、角落 nowrap+ellipsis 防长题名
      越纸；pipeline stampHeaderIcons（真 img 盖进 top-left 盒——
      margin-box content css 带不了图）；docs 布局规范版默认
      （icon+docTitle 左/sectionTitle 右/`counter(page) " / "
      counter(pages)` 居中）；试点页旧覆盖退役。
- [x] 6.2 **双层留白**（②）：kernel `:where(section.bg-card) > div
      { padding: 0 }` + 兄弟 `margin-block-start` 保节奏——页边距是
      唯一 frame。
- [x] 6.3 **打印行高**（③）：实证源/克隆 computed 逐行一致
      （12.5px/20px）——**非 pagedjs 克隆 bug**，是媒介排版判断；
      kernel `pre { line-height: 1.2 }`（1.0 会让 wrap 行贴死）。
- [x] 6.4 **换页判定**（④）：诊断页界——p1 ToC 页（break-after:
      page 设计如此）；p2 61% 填充是 pagedjs 对 avoid 链的保守整链
      搬移（eyebrow+figcaption+pre 绑定链不尝试链尾代码内再切）——
      keep 语义的代价，Owner ④要求的团聚已由声明式 keep 链+后渲染
      执法达成，无需全量二次智能排版。
- [x] 6.5 **切割边法则（载体为界）**（子代理预复核修正）：重定位
      执法增切割感知——data-split-to 标记在载体层或以下（载体自身
      子树被切）永不搬移（搬了会撕裂卡片）；标记只在 host 级恰是
      经典 strand（头完整收尾、身整体后移）必须搬移。全链扫描版
      会把每个 strand 的 host 标记都看到、执法整通道哑火（实证：
      p2 figcaption 孤悬 ~338px 死空间、keepRelocated 钉 0 出货）
      ——子代理实证捕获后当日修正，pipeline+verify 同步。两条配套
      法则：①搬移后复访同页（搬移暴露新页底，可能再 strand）；
      ②适配检查——续半块所在页装不下载体 = keep 物理不可满足
      （pagedjs 已选的 least-bad 断点），强制搬=推出页盒（实证：
      28px figcaption 塞进 0px 余量的 p3 即溢出 28px），豁免不搬
      不告警；门禁法则 = strands 0（有牙：有空间而未搬仍告警）。
- [x] 6.6 门禁同步：verify-print margin grammar 断言重写
      （组合 folio/running heads/icon 计数+加载/空角盒 content:none/
      icon complete 等待）、keepRelocated 降级诊断字段（布局干净时
      执法空转是正解）、动画 phaseSource wrap 感知推进断言；
      page-config spec +4 用例（序列/字面量/headerIcon 正反）；gate
      spec +1 用例（r5 家具九族法则）；registry 镜像散件清除
      （mirror 门禁恢复 GREEN）。

- [x] 6.7 **codex r6 轮（leaf 测量修正）**：codex 独立复核确认适配
      检查的 content-bottom 扫描把 pagedjs 重建的继承高度包裹 div
      也计入（恒触区域底 → available 恒 0 → 全员豁免——da65ccf 的
      "0px 余量/不可满足"叙事是坏测量的假象，figcaption 实际有
      45px 真余量）；ZCode 探针复证（anyBottom 100% vs leaf
      49-98%）。修复 = 双检测器 leaf-only 底测量；门禁重锁
      keepRelocated≥1（figcaption 搬移复活为稳定正例，复访轮对
      新暴露的 208px transaction 块按 17px 真余量正确豁免）。
      codex 侧随后遭上游 API GROUP_DELETED 硬中断，最终评分未出，
      档案见 codex-impl-review-print-r6-outcome.md。

## 7. Owner 验收反馈轮（r7，2026-09-02 五点）[P]

- [x] 7.1 **页眉一行 + icon 预计算**（①）：kernel (0,4,0) 特异性盖
      pagedjs 注入的 `> *` display:block 与 ::after 块化——icon
      inline-block、题名 inline，同一行；prewarm 缝（PrintDoc
      $effect → pipeline.prewarm）把 headerIcon fetch 成 data-URI
      缓存（btoa 分块构造，无 FileReader），run() 内有界等待兜底，
      stamp 零网络竞态（预览=导出）；idle 预取 pagedjs chunk。
- [x] 7.2 **行高根因**（②）：Shiki classic 在 span.line 间留字面
      \n 文本节点，kernel 把行设 block 后每个 \n 生成匿名空行块=
      双倍行距；splitPreLines 剥 whitespace-only 分隔符（仅
      span.line 形状，空行注空格保高）+ 删 pre line-height:1.2
      ——行距回归授权值原样克隆（verify 锁 step=20px±2）。
- [x] 7.3 **吞页**（③）：三层根因连破——(a) Shiki token 的
      color:var(--tok-*) 内联样式被 UndisplayedFilter 标
      data-undisplayed（920/1049）致 chunker 失明 → 颜色迁
      .jx-tk-* 类 + 预览器第三样式表 jx-tok.css；(b) figure 的
      flex 单体（jx-pure figure 法则 + fill 工具类）→
      .pagedjs_page .jx-code-card display:block；(c) 生产环境
      chunker 拒绝在单个高 pre 内断开（沙箱完全复刻可切、生产
      不切，根因未隔离）→ freeze 预分块：>40 行 pre 拆后继
      <pre> 兄弟（行原样搬移、jx-print-cont 续类、锚点顺序
      插入），verify 反吞页门禁（120 行全落页区、零失明元素）。
- [x] 7.4 **sim-bar 状态 + glass**（④）：pending 即盖（飞行开始
      时带 [data-jx-print-bar-status] 与置灰按钮），管线状态面
      （preparing+phase/done/total → rendering → N pages·ready /
      error）直写；.jx-glass 同款材质（blur(14px)
      saturate(1.35)+outline 代 border）+ 页面同款阴影层级；
      @media print 隐藏保留。
- [x] 7.5 **bar-print 零重跑**（⑤）：挂载 sim 产物即打印权威
      （与 ambient 入口对齐）——guarded('print') 快路径跳过
      prepareSnapshot，metadata 加 renderId 单调计数，verify 断言
      bar-print 后 renderId/pages/@page hash 三不变 +
      window.print 恰一次。
- [x] 7.6 门禁同步：verify-print 32 检查（新增一行页眉+bar、
      行距奇偶、\n 零残留、反吞页、renderId 复用；bundle 签名
      修正——.pagedjs_pages 字面量躺内核 ?raw 文本致假阳性）；
      freeze/lifecycle/gate spec 共 +6 用例；全量回归绿。

## 8. 标题孤悬执法扩展（2026-09-03，Owner：Section 的 H* 常落在页末、下一页才是正文——二次排版该挪）

- [x] 8.1 **形态普查先行**：五文档（paged/dialog/icons/recipes/
      llms-txt）真 Chromium 诊断分类——主导形态不是经典孤悬而是
      **cut-avoid 8 例**（SectionCard 头部块被切：eyebrow 18px 或
      eyebrow+h2 136-160px 留页底，其余在下一页）；另有 icons p7
      figcaption 28/356 的经典漏搬一例、ended-whole 0 例（理论
      形态，泛化顺带覆盖）。
- [x] 8.2 **keep 链全梯**：kernel-print.css `h1,h2,h3` → h1–h6
      （裸逗号列表对 pagedjs breaks.js 安全；意图表同步；gate
      spec 断言锁定新选择器形状）。
- [x] 8.3 **执法 pass 抽取 + 泛化**（lib/print/relocate.ts，注入
      KeepMeasure 的纯函数，jsdom 可测）：(a) strand 搬移目标从
      "父块续半" 泛化为**最近 split 续块祖先**——父块自身分裂则
      prepend（经典），否则 ended-whole 骑入祖先续块、锚定后继首
      个可见子块；(b) **rejoin**——被切 avoid 块（data-split-to）
      的 children 重聚进 pair 头、清空半块与空壳剪除；嵌套内半块
      是重聚内容而非撕裂（守卫只作用于 strand 路径——r5 法则
      精化）；(c) `healOrphanedSplits`——被剪除半块的对侧
      data-split-from 失配即愈合（重聚块中缝不再画"续上页"虚线）；
      (d) `resyncStringSets`——搬移后按 string-sets.js 语义重算每页
      --pagedjs-string-{first,last,start,first-except-*}（页眉不再
      指称已挪走的章节）。metadata 增 keepRejoined。
- [x] 8.4 **pagedjs 尾部时序根因**（三轮真机插桩实锤）：flow
      promise 可在最后一轮 re-chunk 尾巴落地前 resolve——被切
      eyebrow 半块在无任何 childList 变更下于数百 ms 后漂 942px
      入位（151ms:3441 → 185ms:2498 → 335ms:3440，帧稳定签名与
      变更静默双门均被波间停顿骗过）。对策三层：flight 内
      `awaitSettledLayout`（变更静默+签名稳定+250ms 最小窗）→
      扫环（mend→re-settle，封顶 3）→ **post-ready mend**（flight
      收尾发射、generation+产物同一性守卫、收敛后重发布
      metadata；Chromium 实时打印预览随 DOM 变更拾取）。
- [x] 8.5 **门禁与测试**：print-relocate.spec.ts 11 用例（经典/
      ended-whole/rejoin/嵌套切半/不可满足/愈合/resync 语义，注入
      量测）；lifecycle 假时钟补 `performance` 伪造 + 驱动时长跟进
      （settle 最小窗契约）；verify-print 检测器镜像泛化 + rejoinGaps
      门禁 + keepRejoined≥1 非空转 + meta 静默等待（读 RESTED 产物）。
- [x] 8.6 **验收**：verify-print 32/32 ×3 连跑稳定（keepRelocated=2、
      keepRejoined=2、strands=[]、rejoinGaps=[]）；五文档复测全部
      cut-avoid 重聚、icons 漏搬修复（keepRelocated 2→3）、余留
      均为真无空间的合法豁免；全量 vitest 1606/1606 绿。

## 9. 虚线块级化（2026-09-03，Owner：两页间频繁出现虚线——仅块状内容（屏幕上带边框的块，如 codeCard）断开才有必要显示）

- [x] 9.1 **根因**：旧法则"最内层切割元素拥有虚线"是元素判断——
      pagedjs 给整条祖先链打切割标记、每个分页点必切某条链，纯
      文本流断页也会在最内层普通包装 div 上画虚线（几乎每页一
      条的噪音）。
- [x] 9.2 **块判断制**（relocate.ts `stampSplitDashes`，替代
      quietOuterSplitDashes）：白名单=箱体卡家族
      `.jx-code-card + section.bg-card`（屏幕上带边框的块；逐行
      边框的 table 故意排除——行间切割自带行线）；命中块的每个
      切半块（含跨 3 页的中间半块）戳 `data-jx-split-dash`；
      kernel 虚线规则仅认戳记（规则置于外层抑制之后——owner 的
      虚线取代其被抑制的 authored 边缘）。
- [x] 9.3 **伴随法则保持**：r3 外层 authored 边框抑制
      （data-jx-split-outer）原样保留；r4 "一切缝一虚线"升级为
      同边嵌套块塌缩到最内块（同页包含关系的候选中，外层让位
      于可见的被切对象）；愈合/重聚的缝不画。
- [x] 9.4 **门禁与测试**：gate spec 四条虚线正则改戳记制 + 新增
      旧内层规则不得回归的负断言；print-relocate.spec +4 用例
      （卡切戳记/纯流零戳/同边嵌套塌缩/跨 3 页每半皆戳）；
      verify-print 检测器改 blockDashes/blockDashed/strayDashed
      三计数（非空转：pilot 高卡跨 7-9 页保证 blockDashes≥2；
      strayDashed=0 为硬法则；outerQuiet 豁免 owner）。
- [x] 9.5 **验收**：verify-print 32/32 ×3 稳定（blockDashes=7、
      blockDashed=7、strayDashed=0、outerQuiet=33/33）；跨文档抽检
      dialog 17 戳/0 杂线、recipes 13 戳/0 杂线；全量 vitest
      1610/1610 绿。
- [x] 9.6 **判据纠偏（Owner correction，同日）**：白名单标准是
      **打印预览里的边框**而非屏幕的——默认 SectionCard 投影后
      无框（纸即画框，底缘 hairline 是分隔线不是箱体），从家族
      移除；codeCard 的 figcaption 头带（border-b+meta 背景）与
      foot（border-t）原样带进投影、整块读作离散块，保留；
      新增 `section.bg-card[data-jx-print='boxed']` 装箱变体
      （kernel 保留 1px authored 框）。单测 +1（默认 section 切割
      零戳）、塌缩用例改用 boxed 外层；spec 判据措辞与场景同步。

## 10. SectionCard 打印投影三改（2026-09-03，Owner：①section 底 border 无必要；②header div 底 border 参考 Dialog Grid 升级为布局方案+标准分割线；③子级 padding 改 padding-inline）

- [x] 10.1 **section 底部 hairline 移除**：`:where(section.bg-card)`
      去掉 border-block-end（规则之间的规则没有信息量）；bg/shadow
      lift 与 margin-block-end 节奏保留；boxed opt-out 不变。
- [x] 10.2 **header 分割线 = 布局元素 + 标准 separator**（Dialog r13
      grid 行模式在纸面的移植）：authored border-b 退役；header 区
      `::after` 作为独立 1px 轨道（flow block——不能上 display:grid，
      pagedjs 只碎片化块流，grid 会吞跨页卡尾部，r7 法则），携带
      separator 组件的 contrast ghost 墨（backdrop-filter: contrast
      (0.5)，一墨零 token；**print-to-PDF 实测栅格化保留**——先证
      后用，sim 与出纸一致）。::after 骑 header 的最后碎片，重聚的
      header 连线一起团聚。**header 区按 avoid 戳记定位而非
      :first-child**——跨页 section 续半块的 first div 是 BODY，
      位置判据会在 body 续块上长出伪分割线（真实页上抓到 4 例，
      p10 代码续块上有一例已实际画出）。
- [x] 10.3 **子级 padding 仅内联轴压平**：`> div { padding: 0 }` →
      `padding-inline: 0`——文字与纸缘齐平（纸即画框），authored
      块轴 padding（py-3/py-4…）回归为分割线轨道周围的节奏；
      `> div + div` 的 0.65rem 间距保留。
- [x] 10.4 **门禁**：gate spec 断言反转（hairline 不得存在）+ 新增
      separator 轨道/padding-inline 正则；verify-print 页内实测
      headersBorderless/separatorTracks 双计数（avoid 戳记选择器，
      7/7 全带轨道）；出纸 PDF 抽检（1285 条 1px 矩形 + 476 处滤镜
      栅格化在产物中）。verify-print 32/32 ×2。
- [x] 10.5 **零发明间距**（Owner 2026-09-03 调查后拍板）：删除两处对
      自身删除行为的补偿性 margin——(a) `section.bg-card` 的
      `margin-block-end: 1.25rem`（c485c10 边框溶解同期发明，叠在源码
      栈 gap-8 之上，实测节距 32→52px，+62%）；(b) `> div + div` 的
      `margin-block-start: 0.65rem`（a0bc24a 全量压平同期补偿，块轴
      padding 回归后双重节奏，实测分割线周围 36→46.4px，+29%）。
      组件自管节奏（栈 gap + authored py）成为唯一间距法则；audit
      结论：克隆内容上的间距声明仅此两处属发明（其余为内核自有
      DOM 或 freeze 接缝的功能规则）。gate 断言反转锁零回归。
- [x] 10.6 **②重定性：标准组件化（Owner 纠偏，2026-09-03）**——分割线
      是 DOM/组件问题，与打印投影无关：SectionCard 本体升级为
      Dialog r13/r14 的 row ruler 模式（section-card.css：单列命名行
      网格 [header]auto/[sep]1px/[body]auto），header 的 border-b
      退役，**结构性 `<Separator>` 实例**（hr[data-jx-separator]，
      contrast ghost 墨）随组件出厂，消费者永不手写；registry 镜像
      经 build 同步。kernel ::after 投影整体退役（克隆原样携带真元
      素，ghost 墨已验可落纸），打印只保留碎片化管道：
      `.pagedjs_page section.bg-card { display: block }`（屏上 grid
      是 pagedjs 不可碎片的单体，r7 法则）+ `[data-jx-section-sep]
      { break-after: avoid }`（1px 线不单独收页）。探针改真元素
      断言（sepsTotal=7 全渲染、headersBorderless 9/9 按宽度）；
      verify-print 32/32 ×2、vitest 1611/1611、屏幕树实测
      grid+hr+0px border 三证齐全。
- [x] 10.7 **card-grid 命名行契约升级 + 污染复盘（Owner 2026-09-03）**：
      (a) 污染根因——SectionCard 组件化引入第三区域后撞上 card-grid
      的 2 行 subgrid 契约，3 子块 row-major 自动放置溢出到隐式列
      （header 左 body 右）；首页消费端还残留 tw4 时代的重复法则
      `grid grid-rows-subgrid row-span-2`（工具类压组件层，span 必然
      desync）。(b) 修复——card-grid 共享行改为**命名行
      [header]/[sep]/[body]**（subgrid 继承父行名，SectionCard 自有
      区域规则两语境同词汇落位），span 3；消费端重复法则清除。
      (c) 测试空白——card-grid 此前**零测试文件**（全量 1611 绿也
      拦不住），新增 card-grid.spec.ts 6 用例锁契约（命名行/span 3/
      旧 2 行形态负断言/区域顺序+hr/无消费端 subgrid 工具类）。
      (d) 连带——registry item 声明 section-card.css + separator
      依赖、镜像手动对齐 + 清单重生成（镜像同步骑 dev server，
      非 build）、探针两处鲁棒性（pagedjs layout.js 自身 width 钉
      豁免——用户最早样本即有，非 authored 样式；行距采样取首个
      ≥4 行的 pre）。验收：首页三卡等高 339px、分割线 y=988 整排
      对齐；vitest 1617/1617、verify-print 32/32 ×3、mirror GREEN。
- [x] 10.8 **rev.1 回归纠偏：回到内容无关等高均衡器 + 分隔线骑行底缘（Owner 2026-09-03 晚）**：
      Owner 报 card-grid "完全不是最开始要求的效果"。考古定案：原始契约是
      1f9f7be（2026-08-21）的 **grid+subgrid equalizer——两块卡片内容无关
      契约**（首块=header 行、次块=body 行，网格从不问子卡是什么）。
      rev.1 的 [sep] 第三共享行犯了两重错：(a) 破坏内容无关契约——普通
      两块卡的第二块落进分隔行，1fr 体行悬空；(b) **命名行只存在于网格
      首 band**——换行卡自动放置进隐式行后 `grid-row: header/sep/body`
      全部失解析，文档页密度演示实测 header/sep/body 同点叠影（304px
      互压），card 3 呈左右分栏。连带暴露 SectionCard grid 化缺防炸列：
      单列 auto 按内容 max-content 计宽，CodeCard 长行撑爆卡片（横向
      溢出 + code 的 overflow-x 失效 + 换行破坏）。
      **rev.2 修复**：(1) card-grid 逐字节回原始 `auto 1fr` + `span 2`
      （内容无关法则入注释）；(2) 分隔线改为**钉在 header 行底缘**
      （section-card.css：`grid-area: 1/1` + `align-self: end`，整数格位
      在独立与任意 subgrid band 两语境同解析，与被退役的 border-b 同位
      ——等高 header 行使整排线天然对齐）；(3) **单列 minmax(0,1fr)**
      防炸列（轨道可缩，文字换行、代码回卡内滚动）。
      card-grid.spec.ts 重写为 11 用例（两行/span 2/无第三行无命名行
      负断言/no-subgrid 保留/骑行底缘整数格位/minmax 防炸列/纯 div 两块
      卡合格/区域顺序/无消费端 subgrid 工具类）。验收：文档页整页截图
      视觉核（Playground 双卡并排上下结构线对齐、card 3 上下、密度演示
      单列 band 无叠影、代码块卡内横滚 748>676、页面横向溢出 0）；
      vitest 1622/1622（111 文件）、verify-print 32/32 ×3、
      mirror GREEN（104 items / 367 pairs）、dist + public/r 重建。
      教训入册：**给共享结构加行之前先问"谁在租这些行"——subgrid 的
      租户拿不到只有房东首 band 才有的词汇（行名），整数格位才是
      语境无关的唯一放置词汇；grid 化任何组件必配 minmax(0,1fr)。**
- [x] 10.9 **SectionCard 密度采纳（Owner 2026-09-03 晚，"card-grid 的 xs-sm 几乎没有区别"）**：
      诊断：(a) 内核密度刻度（appendix A）中 xs/sm 在**间距轴完全相同**
      （inline-factor 2/2、stack-factor 1/1 → inset 8/8、stack 4/4），只差
      **文字步进**（text 11/12、secondary 10/11、line 16/18）——xs≈sm 是
      刻度设计，不是 bug；(b) 真缺陷是 SectionCard **零消费密度别名**
      （px-4/py-3 等全硬编码，连已提交版本亦然）→ DensityDemo 四格
      像素级全同，文字步进也渲染不出来。
      修复：按 result/empty 家族的范式采纳封闭别名，**token 公式在
      default scope 逐像素等于旧值**（padding-inline `inset+1u`=16、
      header padding-block `stack+1u`=12、body `stack+2u`=16、eyebrow
      `secondary−¼u`=11、summary `--jx-text/--jx-line`=13/20）；**sm:
      视口变体退役**——紧凑度归密度轴独管（双轴漂移的源头治理）。
      density-adoption packet E 家族清单 +section-card；card-grid.spec.ts
      补采纳断言（别名在场 + 无 sm:px-/sm:py- 负断言）。
      实测四格：xs eyebrow 9/summary 11/16 → sm 10/12/18（文字步进可察）、
      default 16/12+16/16+11+13/20（=旧像素）、lg 20 内距+15/24。
      全量门禁：vitest 1623/1623、verify-print 32/32、mirror GREEN、
      dist+public/r 重建（payload parity 曾抓到漏重建，已补）。
      注意：全站在 default scope 像素不变；唯宽视口下旧 sm: 20px 内距
      bump 随视口轴退役（密度轴接管，如需宽视口更松请用 density="lg"）。
