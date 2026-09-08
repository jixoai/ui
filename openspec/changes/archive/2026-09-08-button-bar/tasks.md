# Tasks

- [x] 1. `registry/files/ui/button-bar/`：`button-bar.svelte`（zone 双轴
       provider + 单行/单列 flex utilities）、`button-bar-defaults.svelte.ts`
       （paint slot own ghost + density slot）、`index.ts`（barrel）
- [x] 2. `registry.json` 新 item（meta.group=general、依赖边）；
       `scripts/context-coverage.config.json` frozenAvailability +
       button-bar（proxy family）
- [x] 3. docs 页 `registry/files/routes/docs/components/button-bar.html/`
       （STAGED skeleton + canvas playground + ButtonGroup/DialogFooter
       边界记档）
- [x] 4. 双树镜像（apps/www/src/lib/ui/button-bar/ + routes 页）；
       mirror manifest 再生成；`button-bar.meta.ts` 生成
- [x] 5. 测试：`apps/www/test/button-bar.spec.ts` + fixtures host
       （Defaults 面 / 惰性律 / ghost+flat 默认 / explicit-wins /
       inherit-then-provide / 嵌套 ButtonGroup / 布局 utilities /
       rest 透传）
- [x] 6. 门禁：vitest 定向 + `verify:context` + `verify:mirror` +
       `verify:meta` + `test:types` + docs-structure 快照
       （general:14→15）+ `verify:docs`（构建后）
- [x] 7. 视觉验收：dev server + vision 子代理截图（ghost/flat/gap/
       纵向 stretch/between/嵌套 cluster 无 shadow）
- [x] 8. spec 收尾：component-authoring ADDED Requirement（the
       button-bar action lane）；子代理复核结论处理


---

## RETIRED (2026-09-09, card-surface-kernel)

ButtonBar lived one day. The structural kernel law retired it: zone
belongs to the action bands (the band skeleton carries the scope),
loose-row layout belongs to utilities — a component exists to carry a
law, not a convenience, and ButtonBar had none of its own. See
openspec/changes/2026-09-09-card-surface-kernel/design.md §2 for the
full ruling. This archive is frozen history — the deletion itself
lives in the 2026-09-09 change.
