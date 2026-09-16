# design-studio-acceptance-fixes

## Why

Owner 对 collab-protocol（epic40）终态的 design-studio 验收（2026-09-16/17，
5193 真机）提出四项问题；复核确认其中两项为 bug、一项为 UX 欠账、一项为
可编辑面能力边界。Owner 裁决修复方向：**做减法——把逻辑收敛成用户能理解
的规律，而不是在现有复杂度上打补丁**（探针实证见 `.zcode/epic40/`：
真根因是 `applyHighlight/applyHover` 的幂等守卫假设 ring 位置只由本文档
模块状态决定，而 #44 多文档架构里 ring 会被其它文档的上报移动——
「选过帧内组件后再也选不回容器」即此短路，panel 切换而 ring 停留）。

## What Changes

1. **indicator 单一真相源重构**（`server/entries/picker.js`，问题 2+3）：
   宿主（canvas 文档）是 ring 的唯一摆放决策点；每个文档只上报、不藏摆放
   判断。三条可述规律取代幂等守卫 + 半边 owner law：
   - hover：最后到的事件赢（指针在哪听哪的）；
   - selected 非 null：主动选中（pick）总是赢并记下来源文档；跟随重放
     （refresh）只有来源文档有效；
   - 清除（null）：只有来源文档有效。
   跟随补齐：**每帧对齐循环**（rAF + 变化检测——静止零消息零写、无目标
   零调度、后台 tab 自然暂停），任何原因的 BCR 变化（重排/样式/resize/
   滚动）按构造跟随；宿主对 frame-owned ring 以自有 iframe 度量重挂
   （画布布局平移跟随）；死目标自动解除标记。
   selection 的 sessionStorage 恢复后经 DOWN seam 重建 ring（消除
   「面板有选中、ring 无」的重载不对称）。
2. **canvas loading 双拍**（`studio/stage-view.svelte` + `shell.svelte`，
   问题 4）：`sheet===null` 期间渲染蓝图风 skeleton（区分「加载中」与
   「无数据」）；iframe `load` → 壳就绪轻指示、首个 metrics → 渲染完成。
   侧栏 manifest 首拉完成前不再把「加载中」渲染成 "no prototypes yet"。
3. **面板可编辑面物化**（问题 1）：bare bool（`disabled`）与 absent prop
   （schema 有、用法处未写）在面板直接编辑——服务端新增 `materialize`
   复合端点，在 `commitTransaction` 原子组内重烤 page 脚手架
   （tree update）+ 惰性建缓冲（事务内 text insert），经 Svelte 编译门禁
   后原子投影写回；面板行从 "edit in code" 变为可交互控件。表达式 prop
   （`loading={starting}`）保持 readonly（绑定运行时状态，编辑语义不明）。
   顺带修 `runtime/compile-gate.ts` how 白名单漏 `prop-expr` 的门禁盲区。
4. **不修**（记录在案）：variant 行的跨文件类型提取上限（GitHub 已跟踪
   的提取器天花板，属独立史线）。

## Impact

- `packages/design-tool/src/server/entries/picker.js`（重构）、
  `studio/stage-view.svelte`、`studio/shell.svelte`（loading）、
  `server/collab/prop-materialize.ts`（新，纯变换 + 编排）、
  `server/collab/resync.ts`（AttributeNode 偏移 + envelope 复用）、
  `server/collab/runtime/compile-gate.ts`（白名单一行）、
  `server/collab-api.ts`（materialize 路由 + usage 附 skipped）、
  `studio/panel-collab.ts`、`studio/property-panel.svelte`（物化行 + seed 重入）。
- 协议词表零扩展（tree update + 事务内建容器已构成原子通道）；journal
  语义不变（物化 = tree update + text insert，既有 kind）；cursor 锚点
  无失锚风险（tree update 不触碰 Text 容器）。
- 验证：探针回归（P0-P5 复现序列全绿）+ GATE-0 walkthrough 重跑 + 包
  测试电池全量。
