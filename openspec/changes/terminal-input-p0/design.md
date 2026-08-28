# design — terminal-input-p0

> Orthogonal intents: (1) IME 组合输入语义；(2) 鼠标上报路由；
> (3) OSC 观测与剪贴板安全模型。Owner 盘点裁决 2026-08-28（P0）。
> 架构总法则（沿按键层先例）：**宿主集成骑扩展点，默认实现是参数**。

## D1. 输入事件优先级链（总纲，一次定死）

```
DOM 事件进入组件
  keydown  ─▶ onKeyDown(raw, 返回 true 即消费)        ← 已有
           ─▶ clipboard 默认层(可关)                   ← 已有
           ─▶ keyEncode → onData
  compositionstart/update ─▶ 本地 preedit 缓冲(不进 pty)
  compositionend          ─▶ 提交串 → paste gate → onData   ← 新
  mousedown/move/up/wheel ─▶ Shift 按住? ─▶ 本地选区/滚动
                           └─ tracking ≠ NONE 且 mouse 开?
                                └─▶ mouseEncode → onData    ← 新
  pty 输出 vtWrite
    ├─▶ render state（绘制，既有）
    └─▶ OSC parser（旁路观测，只读不改字节流）          ← 新
```

法则：任何新输入面**不得**绕过净化门直进 pty（IME 提交、剪贴板、
程序化 pasteText 同一 Gate）；任何默认行为必须有「关掉即全自定义」
的参数（mouse / clipboardWrite / clipboardReadFrom）。

## D2. IME 组合输入

- 组件 root `compositionstart/update/end`（canvas 无原生可编辑体，
  IME 面板挂在 tabindex=0 的 root 上是标准做法——xterm 同款）。
- `compositionupdate`：串存 `preedit` state（不进 pty）；绘制层在
  光标 cell 起画下划 preedit 串（宽度按 ghostty 判定：`vtWrite` 一段
  零宽探测？否——直接以**预排宽度 = 每 grapheme 的 wcwidth 估算**会
  引入第二事实源。V1 简化：preedit 只画在光标位置右侧、超网格截断，
  不参与 cell 语义（不推进光标、不改 pty），ESC 取消清空。）
- `compositionend`：`vt.pasteText(data)`（净化门路径）。
- composition 期间 keydown 忽略（除 raw 层返回 true 的场景）。

## D3. 鼠标上报

ABI 实测（type_json）：
- `GhosttyMouseEvent`（opaque；set_action/set_button/clear_button/
  set_mods/set_position；action=PRESS/RELEASE/MOTION；button=
  LEFT/RIGHT/MIDDLE/4..11；position=f32 像素坐标）。
- `GhosttyMouseEncoder`（opaque；setopt：EVENT/FORMAT/SIZE/
  ANY_BUTTON_PRESSED/TRACK_LAST_CELL；FORMAT=X10/UTF8/SGR/URXVT/
  SGR_PIXELS；encode(event, buf…)）。
- `setopt_from_terminal(encoder, term)` 同 key encoder——格式与
  模式跟随 pty 实时协商。
- `GhosttyTerminalData.MOUSE_TRACKING` → NONE/X10/NORMAL/BUTTON/ANY。

绑定面（冻结）：
```ts
GhosttyVT 增：
  readMouseTracking(): 'none'|'x10'|'normal'|'button'|'any';
  mouseEncode(e: {
    action: 'press'|'release'|'motion';
    button?: 'left'|'right'|'middle'|'four'|'five';
    x: number; y: number;        // cell 坐标（1-based，编码器内部换算）
    pixel?: boolean;             // SGR_PIXELS 时传像素
    mods?: { shift? ctrl? alt? meta? };
    motionBetween?: boolean;     // MOTION 且 ANY_BUTTON_PRESSED
  }): Uint8Array;
  onMouseTrackingChange(h): IDisposable;   // vtWrite 后检测翻转
门面 Terminal 增：mouseEncode 透传 + onMouseTrackingChange。
```

组件路由（冻结）：
- `mouse?: boolean`（默认 true；false = 强制本地行为，等同今日）。
- 事件序：mousedown/mousemove(按下态)/mouseup/wheel → 若
  `!mouse || shiftKey || tracking==='none'` → 本地（选区/滚动，现状）
  否则 → mouseEncode → onData。
- X10 特例（无 RELEASE 上报）：仅 PRESS 编码。
- 编码前每事件 `setopt_from_terminal`（格式跟随 pty）。

## D4. OSC 观测 + OSC 52 + 标题

ABI 实测：`GhosttyOscParser`（new/next/reset/end）+
`GhosttyOscCommand`（opaque；command_type → 枚举含
`CLIPBOARD_CONTENTS`/`CHANGE_WINDOW_TITLE`/…；command_data 按类型取
载荷）。CLIPBOARD_CONTENTS 的载荷形态（query? / base64 set? 剪贴板
选择器 c/p/…）**由实现批以真实 wasm 探针定案**（`printf
'\e]52;c;base64\a'` 喂 parser 读回），报告偏差。

绑定面（冻结）：
```ts
GhosttyVT 增：
  onOscCommand(h: (cmd: { type: string; payload?: … }) => void): IDisposable;
  // vtWrite 内部：写完 terminal 后同字节喂 osc parser，逐命令回调
  clipboardWriteMaxBytes(): number;   // TerminalData.CLIPBOARD_WRITE_MAX_BYTES
门面 Terminal 增：onTitleChange(h) —— 过滤 CHANGE_WINDOW_TITLE。
```

组件/安全模型（冻结）：
- `clipboardWrite?: boolean | { maxSize?: number }`（默认 true）：
  OSC 52 set → 解 base64 → 长度 ≤ min(maxSize?, wasm 上限) →
  `navigator.clipboard.writeText`；超限丢弃并 console.warn（点名
  上限）。
- `clipboardReadFrom?: boolean`（默认 **false**）：query 默认不回——
  安全模型与 xterm 一致（写放行、读需显式开）。开启时 query → 回
  `ESC]52;<sel>;base64\a`（仅文本剪贴板 c，经 write 通道回 pty）。
- `onTitleChange?: (title: string) => void` prop；docs demo 的窗口
  铬标题栏接它（vim/tmux 改名实时反映）。

## D5. 批次与文件集

| 批 | 文件集（独占） | 内容 |
| --- | --- | --- |
| A（绑定） | registry/files/lib/ghostty-vt.ts、apps/www/test/{mouse,osc}-probe.spec.ts（新）、ghostty-vt.spec.ts | mouseEncode/readMouseTracking/onMouseTrackingChange/OSC parser/onOscCommand/clipboardWriteMaxBytes + 真实 wasm 黄金测试（探针先行：OSC 52 载荷形态、SGR 字节序列） |
| B（组件） | registry/files/ui/ghostty-term/ghostty-term.svelte、apps/www/test/ghostty-term.spec.ts | IME 三事件、鼠标路由（Shift 旁通）、OSC 52 安全模型、onTitleChange、preedit 绘制 |
| C（页面/demo） | apps/www/src/routes/docs/components/ghostty-term.html、demo/pty-terminal/src/App.svelte | playground mouse 开关 + 标题栏接 onTitleChange + demo 复验脚本说明 |

镜像同步/manifest/registry docs 由 ZCode 落盘；batch 间接口以本
design 冻结值为准。

## D6. 风险

- OSC 52 载荷形态未实证（base64/选择器语义）——A 批探针先行，
  偏差报告后再定 B 批安全模型细节（上限/解码路径）。
- SGR_PIXELS 需要像素坐标——组件传 cell×cellSize，编码器 SIZE
  option 同步（探针确认换算归属）。
- IME 面板定位（iOS/Android 悬浮）V1 不做——桌面组合输入为主，
  移动端虚拟键盘属 P2。
- 鼠标上报与本地选区的事件竞争——Shift 旁通为唯一仲裁，行为
  对齐 xterm/ghostty 桌面版。
