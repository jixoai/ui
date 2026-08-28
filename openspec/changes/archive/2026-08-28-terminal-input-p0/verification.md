# verification — terminal-input-p0

> 证据汇总（2026-08-28）。评审轨迹：change r0→r6 冻结 8.4/10（新流程：
> 子代理自审循环 + codex 终审）；实现自审 8.5 → codex 复核 6.5（四阻塞）
> → 修复 → 复验 **8.5/10 零阻塞通过**。

## 测试

| Suite | 结果 |
| --- | --- |
| www 全量 | **685/685**（56 files：组件 54、vt 32、mouse-probe 13、osc-probe 17、门面/探针余量） |
| vite-plugin | 64/64（含 REQUIRED_EXPORTS +mouse 族 13 项后的 probe 面） |
| svelte-check | 255 = main 基线（增量 0） |
| openspec strict / mirror --check / diff --check | GREEN |

## 探针定案（Batch A，证据锁进 osc-probe/mouse-probe.spec.ts）

- OSC 52 三路线：OPT 回调**三重证伪**（wasm 零 imports / table.set 拒 JS
  函数 / 无 WebAssembly.Function）；parser 有 type 无载荷通道；
  **宿主扫描状态机胜出**（abort 重同步、跨 chunk 重组、4MiB raw 缓冲）。
- title：terminal_get(TITLE) GhosttyString 单次直读。
- mouse：MOUSE_TRACKING 为 bool；**SIZE 对所有格式必传**（无 SIZE 一切
  位置判出视口）；motionBetween 严格映射（宽语义产生钳制幽灵点击）。

## 实现要点

- 绑定：+536 行（事件 registry、扫描器、编码编组），门面透传。
- 组件：IME 隐藏 textarea 停靠（keydown 冒泡零冲突 + 逆向时序再停靠
  B1 修复）、鼠标路由（**会话锁配对**：press 拥有模态、离面发配对
  RELEASE、Shift 旁通）、OSC 52 四限额（encoded-before-decode / 绑定层
  4MiB observer / decoded 双保险 / query 回包 cap + alive 守卫）、
  onTitleChange。
- 页面：mouse reporting 开关、窗口铬标题接 OSC 0、PlayHelp 安全模型说明。

## 浏览器实测（playwright，built site on 8792）

- OSC 0 标题落进窗口铬（"interactive shell — 85×17"）；
- mouse reporting 开关就位；键盘路径穿过 textarea 停靠完好（color 命令
  执行）；零页面错误。

## 已知边界（如实）

- IME 真输入法（系统级）需 Owner 实机验收；jsdom 与合成事件已全绿。
- 非阻塞打磨项备案：DCS 内嵌 OSC 52 的保真度 nit、tracking 关闭后
  mouseup 微边界、set 路径 clipboard 静默不对称、facade aria-hidden
  的 AT 可达性裁量（root 为语义面的冻结裁决）。
