# Tasks: print-pipeline

## 1. 冻结与克隆 [P]

- [ ] 1.1 `lib/print/freeze.svelte.ts`：readiness gate（fonts+img，
      超时 fail-loud）、深克隆、动画暂停注入（frame 擦洗位）、
      pre→行 span 变换（lineNumbers 配置）、目录页 nav 注入。
      变换纯函数化，jsdom 可测。
- [ ] 1.2 退出协议：克隆销毁、contexts 回弹验证。

## 2. 内核管线 [P]

- [ ] 2.1 `lib/print/pipeline.svelte.ts`：pagedjs 懒加载、
      preview(content, stylesheets, renderTo) 封装、rendered 门、
      渲染错误 → sim 诊断行。
- [ ] 2.2 `kernel-print.css`（白名单/投影迁移 + 换行/行号 + 目录页
      规则）与 `sim-shell.css`（not-print 包裹）分离落盘。
- [ ] 2.3 `lib/print/page-config.ts`：PrintPageConfig → @page/margin
      -box content 规则编译。
- [ ] 2.4 sim 容器组件 + 真打印出口（@media print 隐藏 app 根 +
      window.print）。

## 3. print 插件（context-plugin 首个消费者）[P]

- [ ] 3.1 `lib/print/context-plugin.ts`：density→paper、hue→
      pin-default、motion→freeze；filter 媒介门；不可变纪律测试。

## 4. 落页与退役 [P]

- [ ] 4.1 docs +layout 接入 print 层（web 零改动证明 = 全量回归）；
      打印按钮控件（sim 开关 + 直接打印）。
- [ ] 4.2 `/docs/paged.html` 重做为普通文档页（讲打印能力，自身吃层）。
- [ ] 4.3 lib/paged 平行组件退役（引用/测试/manifest 同步清理；
      medium/白名单/verify-print 保留项迁转清单）。

## 5. 门禁与集成 [I]

- [ ] 5.1 pagedjs devDep + 懒加载接线 [package.json 归集成者]。
- [ ] 5.2 verify-print 扩展：rendered 后断言、喂入清单快照、pipeline
      冒烟；verify:all 全绿。
- [ ] 5.3 manifest SITE_ONLY（lib/print/）+ taxonomy/route 同步。
