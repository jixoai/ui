# Proposal: adversarial-review — 今日波次（c958c68..HEAD）对抗审查、修复与法则落盘

## Why

Owner 指令（2026-09-02）：对 2026-09-01 的 33 提交波次做全面对抗审查
（vision + 通用子代理互攻，ZCode 主导整理推进，先不走 codex），并在
过程中补齐 specs、代码注释与最佳实践标准。审查发现问题后直接修复。

对抗审查实况：6 代码域 + 2 视觉域并行审查 → Round 2 交叉仲裁
（jsdom 探针、无头 Chromium 实测、SSR curl、像素采样）→ 终审表
（`.agents/audit/2026-09-02-adversarial-review/final-verdict.md`）。
产出：2×P0/P1 级（浮层点击护盾+巨型 toast 同根、RTL 状态机/ramp、
排队 toast 隐形死亡、VT capture 被 WAAPI 偷取、timeline 滚动脊柱零
尺寸、hero 终端卡压扁、well 层二扫遗漏、range 手抄第 4 挂载面），
另有 P2×~20、P3×~40，与 9 条证伪记录（对抗审查的负成果同样入档）。

## What Changes

### 1. 法则落盘（living specs，直接生效）

- `openspec/specs/design-tokens/spec.md`：
  - + the elevation grammar（五层 float/raise/lift/engrave/well、双轨
    命名、暗侧几何 parity、标记性 inset 豁免）
  - + the subtraction ink law（减色墨律：禁加黑、backdrop-filter 减色、
    mask 表几何、状态线/信号层的加法边界、cutout 已知限制）
- `openspec/specs/css-architecture/spec.md`：
  - + grid supplies stacking; position is for transient ink（含浮层
    指针透明法则 + align-content:start 防拉伸 + 豁免清单）
  - + the component-mount projection（生成法则的组件挂载面必须走
    marker 槽，禁手抄；有意分叉需具名裁决注释）
- `openspec/specs/component-authoring/spec.md`：
  - + the slot-vs-padding law（badge 方言通律 + icon-only 对称例外
    + input 壳方言同宗声明）

### 2. 修复批次（六批并行，文件集互不重叠）

批次 1 tabs 滚动契约（RTL 归一化、重盖印、RM veil 门控、stamp 写
放大、chevron 同源几何、指示器残留切片…）；批次 2 指示器引擎 +
progressive-blur（VT 感知 measure、WAAPI 中断快照、inline 隐形带、
迟挂载观察…）；批次 3 timeline/steps/separator（零尺寸脊柱、
of-type 化、aria-current、AT 状态可见、状态可辨性、fade 中灰…）；
批次 4 toast/alert/breadcrumb/浮层平面（P0 指针护盾+巨型 toast、
排队隐形死亡、幽灵退场、style 合并、aria-current 抹除…）；批次 5
原生控件+well 二清（六 picker 井态、:dir(rtl) 填充、第 4 挂载面
marker 化、刻度数学、form reset…）；批次 6 canvas/hero/kbd/系统层
（hero 终端压扁根因、词瀑布、echo 对比度、代码卡滚动、elevation
注释调和、死 token…）。registry.json 描述（separator/steps）由
ZCode 统一更新。

### 3. 后续独立 change（本 change 不含）

- toast v2（sonner 方言：折叠堆叠/hover 展开/滑动关闭/页面不可见
  暂停/view-transitions-to-dialog）——依赖本批次的浮层修复
- icons 文档页（语义词汇表 + 插件定制高级文档；含 pipette/palette
  命名漂移与 --jx-icon-check 词汇洞修复）
- 导航模糊过滤（fuzzysort 内核 + 顶栏二级面板/左栏同源）

## Impact

- 组件行为修复不改变公共 API（除 steps 显式 current 获得
  aria-current、StepsIndicator 错误信息具名化等 a11y 修正）。
- css-laws 新增 component-mount 投影是 build 契约扩展（向后兼容：
  无 marker 的组件不受影响）。
- 六 picker 触发器从 hover-lift 改为 well 井态是视觉变更（Owner
  裁决的自然延伸，「review 所有组件去实现统一」）。
