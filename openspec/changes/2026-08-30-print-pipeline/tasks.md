# Tasks: print-pipeline (r2)

## 1. 冻结与克隆 [P]

- [ ] 1.1 `lib/print/freeze.svelte.ts`：**prepareSnapshot 事务**
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
- [ ] 1.2 根与并发：[data-print-source]/[data-print-output] sibling
      合同、**renderTo 可测量断言**（offsetWidth>0，失败 fail-loud）、
      single-flight token（准备阶段取消；preview 后 best-effort=
      移除 output 根+销毁产物句柄）、四路幂等 cleanup（pages/
      head-style 句柄/listeners）、退出回弹断言（精确回 raw 引用 +
      afterprint 摘 stamp）。

## 2. 内核管线 [P]

- [ ] 2.1 `lib/print/pipeline.svelte.ts`：pagedjs 懒加载、preview
      封装、rendered 门、渲染错误→sim 诊断行；**同一产物语义**
      （snapshot hash + stylesheet hash 有效期；失效重建）。
- [ ] 2.2 `kernel-print.css`（白名单表+意图头正式迁转+投影+换行/
      行号+目录页规则）与 `sim-shell.css`（not-print 包裹）分离；
      **AST gate**（kernel 零 not-print/零 sim 选择器）+ preview 入参
      runtime spy 快照。
- [ ] 2.3 `lib/print/page-config.ts`：结构化值+校验器（拒绝无效
      size/margin/marks/header-footer），parser 单测。
- [ ] 2.4 sim 容器组件 + 真打印出口（prepareSnapshot 完成后
      window.print；@media print 隐藏 app 根）。

## 3. print 插件（context-plugin 首个消费者）[P]

- [ ] 3.1 `lib/print/context-plugin.ts`：density→sm、hue→钉缺省
      （经 hue adapter）；filter 媒介门；不可变纪律；**接缝合同**
      ——依赖 context-plugin-system 先行落地（含 hue adapter 与
      definePlugin 契约），未验收前本任务不开工。

## 4. 落页与退役 [P]

- [ ] 4.1 docs +layout 接入（内容根不变；打印按钮控件）；验收面 =
      现有页（press-button.html 优先）。
- [ ] 4.2 `/docs/paged.html` 重做为普通文档页（讲打印能力，自身吃层）。
- [ ] 4.3 退役表执行（design 的表；含 PagedCode/registry/paged.css/
      print-projection.css；**先改 gate 再删**；删后零引用断言）。

## 5. 门禁与集成 [I]

- [ ] 5.1 pagedjs devDep（锁 0.5.0-beta.2）+ 懒加载接线
      [package.json 归集成者]。
- [ ] 5.2 verify-print 重写：SSR/prerender 产物零 pagedjs 断言、
      管线冒烟（sim 开→页产物+margin boxes+目录页码→关→清理回弹）、
      **stamp 时序断言**（prepare 前可见、afterprint 后移除）、
      **动画协议 fixture**（预暂停不启动不扰 currentTime；CSS 双 slot+
      非零原 delay+相异 currentTime 的同帧断言；WAAPI/边界诊断不
      throw；**sim→直接打印→afterprint→sim 的 stamp 所有权**）、**可测量失败 +
      preview 后取消无残留**、三场景残留测试（连续 sim/sim→print/
      失败重试）。
- [ ] 5.3 manifest SITE_ONLY（lib/print/）+ taxonomy/route 同步。
