# design — 做减法：三条规律 + 一个原子端点

Owner 裁决：代码写复杂了，做减法，让用户能理解逻辑规律。本轮的一切设计
取舍以「规律能否一句话说清」为准绳。

## 1. indicator：宿主单一真相（picker.js）

### 现状的复杂度来源（删除对象）

- 每文档模块级 `highlighted/hovered` + 幂等守卫（`if (x === element)
  return`）——守卫假设 ring 位置只由本文档状态决定，跨文档切换后同元素
  重选被短路：面板切换、ring 停留（探针 P3 实证）。
- owner law 只盖 null（picker.js:381），非 null 上报无条件接受
  （picker.js:387）——旧帧迟到 refresh 抢占 ring。
- `observeTargets` 只在 HOST 分支调用——帧文档零重放观察，BCR 变化不跟随。
- 宿主 RO 只观察 canvas 目标自身——frame-owned ring 的 iframe 平移无跟随。

### 新模型（全部规律，无例外分支）

每个文档只做两件事：**上报**（target 的 box + 来源 + 语义）与**响应宿主
查询**（DOWN seam）。摆放决策只有宿主的 `accept` 一个入口：

```
accept(kind, frameName, payload|null, origin):
  origin ∈ { pick, refresh }   // pick = 用户主动（click/树/恢复）；refresh = 跟随重放
  hover:    采纳一切（最后事件赢）；payload null → 清
  selected: payload 非 null → origin===pick ? 采纳并 owner=frameName
                              : (frameName===owner ? 采纳 : 忽略)
            payload null    → frameName===owner ? 清 : 忽略
```

三条规律（写给用户的话）：hover 谁最后到听谁的；选中是主动动作说了算、
谁选中谁负责后续跟随；取消只能由选中来源自己做。幂等守卫删除——重复
pick 采纳后 transform 相同，无动画跳变，无成本。

### 跟随（refresh 的实现，问题 2）

**每帧对齐循环**（取代最初的 RO/MO/scroll/resize 四类事件组合——事件
组合盖不住纯样式平移，且「哪类变化触发重放」本身就是一条用户记不住
的暗规律）：有标记的文档每帧（rAF）重读目标 rect，**变化才**重报/重挂
——任何原因的 BCR 变化（重排、样式、resize、滚动、DOM churn）按构造
对齐；静止帧零消息零样式写（rect 读取是全部开销）；无标记不排程；
后台 tab 随 rAF 自然暂停。宿主对 frame-owned ring 以**自有 iframe 度量**
+ 保存的帧内 box 重挂（跨帧平移跟随），零跨文档查询。死目标自动解除
标记；owner 帧离开画布则收回其 ring。

### 恢复

shell 的 sessionStorage selection 恢复后经既有 DOWN seam
（`__jixoaiDesignHighlight`）驱动目标文档 pick——ring 与面板同源重建，
删除「面板有选中、ring 无」的不对称。

### 不动的东西

#44 HOST/REPORTER 角色分裂、#48 fade-window 与 glide、lens 补偿
（ringLast 重放 chrome）、lazy per-click activation、wheel relay、
`findStudioWindowFrom` 测试缝。

## 2. canvas loading 双拍（stage-view / shell）

两拍信号都是现成的，只做消费：
- 拍一「壳就绪」：iframe `load` 事件（`{#key src}` 重挂时 arm）。
- 拍二「渲染完成」：首个 `jx-design:canvas-metrics`（`sheet` 非 null）。

`sheet===null && src` 期间在 lens wrapper 渲染蓝图风 skeleton（线框 +
微光脉冲 + 「loading <canvas>」标注），拍一后 skeleton 保留但标注换壳
就绪文案，拍二移除。侧栏：manifest 首拉完成前渲染 loading 行，不再以
`manifest.length===0` 直接断言 "no prototypes yet"。

## 3. 面板可编辑面物化（materialize）

### 为什么是服务端复合端点

重烤（parseSvelte + planPage）只在服务端有；两条独立 admit 有非法中间态
（tree update 先落 → 投影产出 ` disabled={}` 编译不过、且无门禁窗口）。
原子性由 `commitTransaction`（rollback 策略）保证：tree update（重烤
chunks/holes）+ 事务内 text insert（`fork.getText(containerKey)` 惰性建
容器灌洞文本，kernel.ts:2314 既有语义）+ transactionCompileGate 在
candidate 上编译验证。**不用 `text create` op**（TransactionOp 无 create，
事务里的 create 被 admission 分流为独立 commit，非原子——调研实证）。

### 序列（bare bool 与 absent 同一条管道）

面板行（bare bool / absent 且类型可物化）→ `panel-collab.materialize
(prop, value)` POST `/__design__/api/collab/materialize` `{file,
componentId, prop, value, opId, syncCursor}` → 服务端：
1. `receiptFor(opId)` 幂等查重（commitTransaction 自身无幂等）；
2. `host.gate.runExclusive` 内：当前投影 → `materializePropText`（纯变换：
   bare bool 属性名后插 `={true}`；absent 在最后一个属性后插
   ` <prop>=<literal>`，string→quoted、bool/number→expr）→ `planPage`
   重烤 → 组 ops（tree update + 新洞的 text insert）→ `commitTransaction`
   （compile gate 含 prop-expr 白名单修复）；
3. 收尾复用 handleAdmit 形态：`openOverrideSession('human')` +
   `driveProjection`（pushCurrentProjection 原子写回 + HMR）；
4. 面板重新 `/usage` + seed——物化后的 prop 成为普通 prop-expr/quoted
   缓冲，走既有 toggle/input 通道；取消勾选 = replace `true→false`
   （不删属性，buffer law）。

表达式 prop 依 `/usage` 附带的 `skipped` why 保持 readonly（面板有据可判）。

已知边界（记录在案）：usage 带 rest spread 的组件上物化 absent prop 为
显式属性会覆盖 spread 值——与提取器的 same-file 天花板同族，诚实降级
为后续提取器轮次处理。

### 附带修复

- `runtime/compile-gate.ts:86` how 白名单补 `'prop-expr'`（当前含
  prop-expr 洞的页面在事务门被误判「无 page」跳过编译检查）。
- `resync.ts` AttributeNode 接口补 `start/end`（变换需要属性偏移）。

## 4. 验证设计

- 探针回归：`.zcode/gate0/` 的 P0-P5 复现序列成为固定回归脚本
  （初始选中→帧内选中→caption 重选 ring 必须跟随→帧 resize 不得抢占）。
- GATE-0 walkthrough 全量重跑（真浏览器 34 断言 + W6 三向交错）。
- 包测试全量（`packages/design-tool && npm test`，基线 420）+
  新增：picker accept 规律的单测（jsdom/node 结构测试沿 selection.ts
  house style）、materialize 端到端（bare bool / absent / 幂等重试 /
  编译失败零效果 / 并发窗口）。
