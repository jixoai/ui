# terminal-input-p0 — IME、鼠标上报与 OSC 52：输入面补完

## Why

ghostty-term 已过冻结验收与多轮 owner 迭代（光标/选区/xterm 门面/主题/
按键架构/滚动修复），但输入面留有三个真实用户立刻撞上的洞（owner 盘点
裁决 2026-08-28，P0 批）：

1. **IME 组合输入**：unipty demo 实测——`compositionend` 未处理，拼音
   输入丢字节（粘贴正常）。中文用户敲字即坏。
2. **鼠标上报**：wasm 的 mouse encoder 全格式弹药未接（X10/UTF8/SGR/
   URXVT/SGR_PIXELS + tracking 模式可读）。vim/htop/less 的鼠标模式
   （点击定位、滚轮翻历史）完全不可用。
3. **OSC 52**：程序侧剪贴板标准（vim/tmux/ssh 远程复制正道）未接。
   上游 OSC parser 明确暴露 `CLIPBOARD_CONTENTS` 命令，且预留
   `CLIPBOARD_WRITE_MAX_BYTES` 防护上限。

三项同属「wasm 有弹药、宿主接线」型工作，且共享同一条架构法则：
**宿主集成骑在扩展点上，默认实现只是参数**（owner 架构裁决 2026-08-28，
按键层已按此重构：onKeyDown 原始层 → clipboard 默认层 → keyEncode）。

## What Changes

- **IME 组合输入**（组件）：隐藏 textarea 伴生元素（xterm 方案）
  承接 `compositionstart/update/end`。
  V1 语义：组合中本地缓冲（不进 pty），`compositionend` 提交串经
  **净化门**入 pty（与 pasteText 同路）；组合期间在光标处绘制
  preedit 下划串（canvas 自绘，占位 cell 数按 ghostty 宽度判定）。
  raw 层一致性：`onKeyDown` 消费仍最高优先。
- **鼠标上报**（绑定 + 组件）：
  - 绑定：mouse encoder 面（PRESS/RELEASE/MOTION × 按钮 × 坐标；
    FORMAT/ANY_BUTTON/TRACK_LAST_CELL options）+ `readMouseTracking()`
    （TerminalData.MOUSE_TRACKING → NONE/X10/NORMAL/BUTTON/ANY）。
  - 组件：tracking ≠ NONE 时——click/drag/wheel 经 encoder → onData
    （pty 侧接管），本地选区/滚动让位；**Shift 按住 = 旁通上报**，
    强制走本地选区（行业惯例，vim 里也能选词复制）。tracking = NONE
    时行为与今日完全一致。`mouse?: boolean` prop 可整体关闭上报。
  - 门面：`Terminal.onMouseTrackingChange` 事件（disposable）+
    `mouseEncode(event)`。
- **OSC 52**（绑定 + 组件）：
  - 绑定：vtWrite 后并行喂 OSC parser；命令枚举面至少
    `CLIPBOARD_CONTENTS`（含 query 与 set 两型）+
    `CHANGE_WINDOW_TITLE`（顺手接：`onTitleChange` 事件，demo 标题栏
    实时显示 vim/tmux 改的标题）。
  - 组件：`clipboardWrite?: boolean | { maxSize?: number }`（默认开，
    上限取 wasm 的 CLIPBOARD_WRITE_MAX_BYTES 与配置的较小值）；
    set → `navigator.clipboard.writeText`；query 默认**禁用**（安全，
    显式 `clipboardReadFrom?: true` 才放行并只回文本）。跨设备安全
    模型照 xterm：写放行、读默认拒。
- **spec**：新能力 `terminal-input`（输入面法则：raw 层优先级链、
  净化门不可绕过、Shift 旁通、OSC 52 安全模型、IME 提交语义）。
- **demo/docs**：playground 增 `mouse reporting` 开关；unipty demo 复验
  （vim 鼠标点击定位、OSC 52 `printf '\e]52;c;...\a'`、IME）。

## Non-goals

矩形选区开关、scrollback UI、hyperlink 点击、addon 系统、搜索、
WebGL 渲染（P1/P2 盘点在案，另行 change）。

## Verification highlights

- 绑定：真实 wasm 黄金测试——mouseEncode 各格式字节序列（SGR
  `\x1b[<0;33;12M` 形态）、tracking 模式随 `\x1b[?1002h/l` 翻转、
  OSC 52 set/query 解析、标题变更事件。
- 组件：jsdom——compositionend 提交走净化门、Shift 旁通、tracking
  翻转时 wheel 路由切换、clipboardWrite 上限拒绝、onKeyDown 仍最高。
- 浏览器实测：docs playground + unipty demo（vim 点击定位、滚轮翻
  历史、OSC 52 写剪贴板、中文输入法提交）。
- 既有门禁全绿（增量 0 基线不变）。

## Codex

change 冻结评审 + 实现复核闭环（标准轮次；实现复核顺带覆盖冻结后
未复核的累积迭代 commits——光标/选区/门面/主题/按键/滚动）。
