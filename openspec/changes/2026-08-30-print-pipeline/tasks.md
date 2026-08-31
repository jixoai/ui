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
