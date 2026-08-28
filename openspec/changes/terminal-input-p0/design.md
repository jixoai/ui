# design — terminal-input-p0

> Orthogonal intents: (1) IME 组合输入语义；(2) 鼠标上报路由；
> (3) OSC 观测与剪贴板安全模型。Owner 盘点裁决 2026-08-28（P0）。
> 架构总法则（沿按键层先例）：**宿主集成骑扩展点，默认实现是参数**。
> ABI 事实出处惯例（self-review 反馈）：design 引用的 type_json 事实
> 由 A 批以 mouse-probe/osc-probe spec 落盘（selection-probe 先例），
> 冻结接口的每条 ABI 断言最终都有已提交的探针对应。

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

- **隐藏 textarea 伴生元素**（self-review B3 修正：xterm/ace/monaco
  的 IME 方案都是隐藏 textarea，非可编辑 div 上浏览器通常不激活组合
  ——root div 方案在真浏览器会哑火）：root 内挂
  `<textarea aria-hidden class="sr-only">`，composition 三事件挂它，
  预聚焦跟随 root focus；root 上的 keydown 语义不变。
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
    button?: 'left'|'right'|'middle'|'four'|'five';  // 6..11 留 P2
    x: number; y: number;        // 像素坐标（ABI 实测：GhosttyMouseEvent
                                 // .position 为 f32 px，无 cell 入口）
    mods?: { shift? ctrl? alt? meta? };
    motionBetween?: boolean;     // MOTION 且 ANY_BUTTON_PRESSED
  }, cellSize?: { w: number; h: number }): Uint8Array;
  // cellSize 供 encoder SIZE option（换算归属 A 批探针定案；冻结的
  // 只是签名形状——self-review B1：不存在「cell 入、内部换算」入口）
  onMouseTrackingChange(h): IDisposable;   // vtWrite 后检测翻转
门面 Terminal 增：mouseEncode（**mirror handleKey 语义：返回字节
并 replay 到 onData**，latin1 通道对 mouse 字节 byte-safe）+
onMouseTrackingChange（disposable）。
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
  OSC 52 set → **长度检查在解码之前**（防 oversized base64 解码
  DoS）→ base64 解码（失败 → 丢弃 + 点名 warn，勿 throw）→ 选择器
  只认 `c`/空 → `navigator.clipboard.writeText`；超限丢弃 + 点名
  上限 warn。空载荷 = 清剪贴板（xterm 语义）V1 显式不做，丢弃。
- `clipboardReadFrom?: boolean`（默认 **false**）：query 默认不回——
  安全模型与 xterm 一致（写放行、读需显式开）。开启时 query → 回
  `ESC]52;c;base64\a`（仅文本剪贴板，**经 onData 输入通道回 pty——
  与 keyEncode/paste 同路；严禁注入 write/vtWrite**：响应本身是
  OSC 52 set 形态，注入 write 会被自家旁路 parser 重新摄入、程序
  永远收不到且剪贴板被无谓重写——self-review B2 近事故修正）。
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
- cell↔像素换算归属（编码器 SIZE vs 宿主乘法）A 批探针定案；组件
  持有 cell 度量，绑定持有编码器入参——签名按「像素入 + 可选
  cellSize」冻结，探针只决定内部用法。
- OSC parser 流语义（self-review B4）：混合流容错、跨 vtWrite 的
  序列切分（parser 状态跨 feed 保持与否、reset/end 生命周期）、
  未完结序列缓冲——A 批探针定案，配「同一 OSC 52 拆两个 vtWrite」
  黄金用例。
- IME 面板定位（iOS/Android 悬浮）V1 不做——桌面组合输入为主，
  移动端虚拟键盘属 P2。
- 鼠标上报与本地选区的事件竞争——Shift 旁通为唯一仲裁，行为
  对齐 xterm/ghostty 桌面版。
