# jixoai/ui — 命令运行最佳实践（Owner 法令 2026-09-25）

本项目体量持续增长。**本地默认增量，全量只留给 CI 与发布关口**：

## 原则

1. **增量优先**：改动只触及哪些面，就只跑哪些门禁。跑之前先想清楚
   「这次改动会波及哪几类产物」。
2. **全量的两个合法时机**：CI（deploy.yml 每次 push 自带 verify:all，
   那是它的职责）；本地发布/合并关口（且一次即可，不反复跑）。
3. **生成物改动 = 门禁同步**：凡动了 `registry/files/**` 或组件源码，
   记得相应再生物产物（payload / meta / mirror manifest），否则 CI 会
   在 deploy 时用 verify:all 抓出来（v0.6.0 首次 deploy 三连挂的教训）。
4. **CWD 永远绝对路径先行**：跨 apps/registry/packages 的命令链，先
   `cd <repo-root 绝对路径>`，避免相对路径静默落空（实证多次）。

## 改动 → 门禁映射（本地定向命令）

| 改动面 | 定向命令（仓库根） |
| --- | --- |
| 文档页结构 / docs 路由 | `npm run verify:docs` |
| 单组件源（`lib/ui/**` 或孪生） | 对应组件测试（若有）+ `npm run gen:stylex-payload` 后 `node scripts/verify-stylex-payload.mjs` |
| 孪生树任何文件 | `npm run gen:mirror-manifest` 后 `npm run verify:mirror` |
| 组件 props/slots 签名 | `node scripts/component-metadata-gen.mjs <该组件 registry 源>`（verify:meta 会点名 stale 文件） |
| 打印/打印确定性相关 | `CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/verify-print.mjs` |
| 依赖边 / registry.json | `node scripts/verify-deps.mjs`（healed 条目按提示 `--update-baseline` 并人工核对 diff 恰为所报条目） |
| css-laws 法则 | `pnpm -C packages/css-laws test` |

## 全量（只在关口，一次）

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  npm run verify:all
```

CI 的 deploy.yml 在每次 push 到 main 时必然跑它——**本地不必抢跑**：
本地给「定向证据」，全量判定交给 CI；CI 红了再回来按点名修。

## 构建与预览

- 站点重建（唯一写者纪律：先杀自己的预览端口再 build，**绝不碰
  5230**）：`cd apps/www && npm run build`，然后
  `npx vite preview --port 5245 --strictPort`。
- 日常迭代不必整站重建：`npm run dev`（apps/www）+ 浏览器实测优先。
- svelte-check 是全量性质（无文件过滤）：**每整合轮至多一次**，基线
  对照而非清零目标（当前基线见 openspec 归档记录）。
