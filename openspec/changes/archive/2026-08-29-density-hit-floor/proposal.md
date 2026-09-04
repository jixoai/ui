# proposal — density hit-floor

> 原始需求（Owner，2026-08-29）："先用 prototype 做两个版本对比 hit 地板策略……我确认了，直接彻底跟字就行，这尺寸在移动端也足够用。不过 design-system 的底层法则仍然存在，只不过我们可以把阈值下调。"

## WHY

input.html「Density and tokens」demo 几乎不可见密度差异。诊断 + 双策略原型（触屏保底 / 彻底跟字）实测后，Owner 裁定：

1. **hit 地板法则保留，阈值 11U(44px) → 7U(28px)**。密度视觉完全跟字（xs=28px 在移动端够用，仍高于 WCAG 2.5.8 AA 的 24px 通道地板）；max() 公式留作未来调尺的护栏，当前 row-min（28/32/40/48）下永不触发。
2. **指针媒体查询分流（pointer: fine/coarse）被否决**——不留运行时分流，开发者选了 xs 就是真的小。

## WHAT（实现边界）

- `--jx-hit-floor: calc(var(--jx-unit) * 7)` + 四个 hit-min 别名改引 floor token（theme sheet）。
- 原型复现的 36px 暗地板根因：`:not(.no-jx-pure, …)` 的参数特异性把 element 默认法则推到 (0,1,1)，压过一切组件类——九个法则的 opt-out 统一包成 `:where(:not(…))` 归零特异性。
- control-lane 法则补 `padding: 0`（lane 无铬铁律，防 element 默认 padding-block 泄漏）。
- `.jx-label`/`.jx-error` 改消费 `--jx-text-secondary`（density-adoption §3 的既有规范，实现欠账）。

## IMPACT

- 交互控制高度：44/44/44/48 → **28/32/40/48**（全线随字）。
- 文档 31 处 TokenTable、tokens 页、chip 注释、specs 两处规范文本同步。
- chrome-density-tier（站点导航 32px band）为独立裁定，不受影响。
