# Verification

## 门禁

1. `cd apps/www && pnpm test` — 全绿（含新增 RTL/steps/toast/pblur/range 用例）
2. `cd packages/css-laws && pnpm test` + `npx tsx src/build.ts --check` — 全绿（marker 新鲜度含 range-mount）
3. `node scripts/gen-mirror-manifest.mjs --check` — 镜像 GREEN
4. `pnpm build && pnpm verify:docs` — 文档骨架 GREEN
5. `pnpm verify:all` 一次全量
6. 视觉：`node scripts/capture-baseline.mjs compare after-review-r3`（触及页面；浮层/巨型 toast/well 二清/hero 终端为预期 CHANGED 项，进 allowlist）

## 关键回归探针（人工/脚本）

- 浮层 P0：toast.html 工作台按钮真实 click 可达（elementFromPoint 命中按钮）；toast 卡片高度 ~内容高
- RTL tabs：dir=rtl 下 chevron 按侧显隐、veil 闭合侧不绘制、ramp 不整带消失
- navmenu：同文档 VT 期间指示器直接落位（morph 承载运动），VT 后 WAAPI 恢复
- timeline animation=scroll：脊柱非零尺寸、端帽正确
- range RTL：value=10 填充 ≈10% 且在右侧
