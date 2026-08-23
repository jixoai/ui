# jx-pure r5 终验复核

评审日期：2026-08-24

范围：仅复核 r4 的 R4-1（indeterminate progress）和 R4-2（B12 escape hatch）修复，以及其声明关联的 registry/documentation；并行 first-paint 的 ToC/scaffold 改动不归因。

## A. 阻塞问题

**无。R4-1 与 R4-2 均关闭，可维持发布候选（RC）裁决。**

- **R4-1：关闭。** [jx-pure.css](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/theme/jx-pure.css:1320) 将 indeterminate 的 stripe 放在 `progress` 元素自身，Firefox `::-moz-progress-bar` 明确透明让位；[reduced-motion](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/theme/jx-pure.css:1474) 对元素和 Mozilla 伪元素分立 `animation: none`。实际 Chromium 中动画名称为 `jx-progress-slide`、状态 `running`；reduced-motion 下为 `none`。
- **R4-2：关闭。** [B12](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/theme/jx-pure.css:1426) 已在 `@layer components` 外，因此压过 Part A 的 unlayered class；checkbox/radio/summary 伪元素独立 `revert`/`content: none`。真实 demo 内 `.jx-input` 返回 `min-height: auto`、`padding: 1px 2px`，不再是 Part A 的 `40px` / `8px 12px`。

## B. 本轮质量评价

- 探针从 r4 的“规则被服务”升级为运行态证据：[verify](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/verify-jx-pure.mjs:151) 用 `getAnimations()` 验证运行，[reduced-motion probe](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/verify-jx-pure.mjs:277) 验证停放，并锁住 Part A 的逃生回退；两个 r4 漏检面均已补齐。
- 实跑 `node scripts/verify-jx-pure.mjs 5199` 全绿（31 个主检查 + 2 个 auto-dark + 7 个 reduced-motion，即 40/40）；`pnpm --dir apps/www test -- --run test/jx-pure-parity.spec.ts` 为 24 files / 327 tests 全绿。测试输出的 Svelte a11y/CSS 警告来自无关既有组件。
- `node scripts/gen-jx-auto-dark.mjs` 后双 CSS 副本一致，gzip 为 13,959B，低于 14,336B；`git diff --check` 和两个脚本语法检查通过。页面的 CustomElement summary 已准确说明 `?raw` 与 shadow `<style>` 节点。
- **非阻塞文案观察：** [registry.json](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry.json:306) 仍先说“system-follow needs the host's own 3-line bootstrap”，随后才给出 `.jx-auto-dark` 的零 JS 路径；与页面“bootstrap 是 JS 备选”的定性不完全一致。应收敛为 auto-dark 为 system-follow 主路、bootstrap 为显式 JS 切换备选，但不影响已验证运行时行为。
- Firefox/WebKit 实测矩阵与正式 typography token 仍按 Owner 明示排除，保留为非阻塞后续项。

## C. 综合评分

**9.1 / 10**（r4：8.6，+0.5；r3：9.0，+0.1）。两项曾经的公开运行时契约已由实际浏览器状态、reduced-motion 与 Part A 反压证据关闭，且生成/parity/体积链完整；扣分仅保留 registry 的非阻塞措辞歧义和 Owner 已排除的跨引擎验收债务。
