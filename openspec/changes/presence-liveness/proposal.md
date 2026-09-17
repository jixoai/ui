# presence-liveness

## Why

presence-visuals（f3d52d12）的真机验收暴露七项缺口：远程**选中**不同
步、光标进 kit iframe 即断流、props 输入仍等 Enter、caret 不及时且无
select-range、nav 彩带形态错误（Owner 明确 border-image 竖向语法）、
树选中样式未入彩带模型、整体同步延迟感（非帧级）。Owner 裁决工作
方式：**先设计 TDD 测试与验收标准写入 change，TDD 驱动开发，再由
vision 子代理真机走查**。

## 验收标准（每项可断言——矩阵/走查的双门槛）

- **P1 选中同步**：A 点击画布/树选中组件 → B 端 ≤200ms 内出现 A 色
  的远程选中环（badge 含 A 名，落点=目标组件 box ±2px）。selection
  即 attention——人的选中不再沉默。
- **P2 光标跨帧连续**：A 的指针从 canvas 空白**划入 kit iframe 内部**
  继续移动 → B 端光标连续跟随无断流（帧内坐标 + iframe offset，
  误差 ≤2px）；划出回到空白同样连续。
- **P3 输入实时**：A 在 props 文本 input 打字（不按 Enter）→ B 端
  ≤600ms 内值更新（digest/输入同步），op 经短 debounce admit。
- **P4 caret/selection**：光标移动/键盘选区/拖选 → B 端 caret 条
  ≤100ms 跟随；选区（start≠end）渲染为选区高亮；textarea 多行/
  软折行位置合理（参考 HTML 的零宽 span 镜像法，MIRROR_PROPS 全量
  复制）；selectionchange 事件驱动 + rAF 节流。
- **P5/P6 彩带形态（Owner 语法，逐字）**：nav 页面行与树行的高亮
  用 `border-inline-start: 2px solid transparent` 占位 +
  `border-image: linear-gradient(to bottom, …) 0 0 0 1 / 0 0 0 2px`
  ——竖向分段，单人=现状纯色语义，多人按本地序均分；自身
  selected 行与远程点亮行**同一彩带模型**（自身=自己色段）。
  computed style + 截图双证（方向必须竖向）。
- **P7 延迟预算**：光标端到端 ≤100ms（上报 rAF 级、网关合并窗
  ≤16ms、转发 rAF、渲染 60ms transition）；caret 上报 ≤32ms。

## 矩阵计时纪律（.zcode/presence/tdd-matrix.mjs 的 P 组，2026-09-18 修订）

共享机器上跑计时断言的三条实证纪律（每条都有 round 编号背书）：

1. **页内打点**：时延在页面内用 rAF 观察者打 performance.now/Date.now
   （轮询 evaluate 的 RTT 在矩阵负载下 50-100ms，曾把真实 40ms 测成
   205ms——round-2 vs 空载 probe 对照）。
2. **安静门**：计时前双端（A studio/canvas + B canvas）rAF 心跳 max
   gap < 60ms 才开测——冷启动的 /sync + Loro 导入长任务曾制造 606ms
   假延迟（round-5）。
3. **min-of-3**：同一探针采样三次取最小——机器上 73 个后台 Chrome
   的抖动曾让同代码在 334ms↔1305ms 间摆动（round-6/7 对照）；
   预算测的是产品能力，不是机器忙闲。
4. **门槛纪律（Codex R1 B2 修正，2026-09-19）**：验收断言永远用
   本节冻结的 Owner 预算（200/600/100）——环境噪声（loadavg、
   采样明细）进 evidence 回执做诊断，不抬高验收线；矩阵每跑一轮
   落一份 JSON 回执（.zcode/presence/runs/，curated 副本进本变更
   evidence/ 目录）。
5. **caret 读取双轨（Codex R1 B3 修正）**：selectionchange 的读取
   合并由纯 rAF 改为 rAF+8ms setTimeout 双轨单发——rAF 饥饿（重
   页面/满载机）下一帧可达 300ms+，而读取本身只是两次属性读；
   32ms 线上节流已在下游合并突发，rAF 唯一职责是按 tick 折叠，
   不得拥有长尾。

产品链路的空载基线（双 context probe 实测）：gateway→渲染 ≈40ms；
选中链合成事件探针 3/3 稳定（mount-null → a1 → null 无丢失）。

## What Changes

1. selection→attention 接线（shell 的 selection 变化上报 canvas
   focus；Escape/切换清除）。
2. frame-entry 光标转发（帧内 pointermove → postMessage → overlay
   换算 offset → surface `frame:<id>` 上报/渲染——词表已预留）。
3. 面板文本输入实时化（input 事件 debounce 300ms admit，不等
   Enter）。
4. remote-caret 重写（参考 HTML：零宽 span 镜像、selectionchange+
   fallback 事件、rAF；caret→selection{start,end} 渲染 caret 条+
   选区高亮；词表 caret 扩为 range）。
5. nav/树彩带按 Owner 语法重做（统一 ribbon 模型：自身 selected +
   remote 点亮合并计算）。
6. 延迟压缩：cursor 上报 50ms→rAF、gateway 合并 50ms→16ms、
   attention 120ms→32ms。

## Impact

改 frame-entry/presence-overlay/picker（选中上报 seam）、
gateway/store（节流常量、caret range 词表）、shell（selection 接线、
彩带语法）、property-panel/panel-collab（实时输入）、
remote-caret（重写）、component-tree（统一彩带）；矩阵新增 P1-P7
断言组；vision 真机走查。
