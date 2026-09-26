# kernel-060-design-agent

## Why

内核 0.6.0（origin/main，58a65866 起的 539-commit 列车）完成两件大事：

1. **Tailwind 引擎退役**：站点 + registry 全面 tailwind→stylex；
   `verify-tailwindless` 把 `packages/design-tool/src/studio/studio-static.css`
   圈为 **PFINAL 冻结飞地**——全仓最后一个合法 tailwind 消费者。
2. **八轴样式属性**（universal-props.css，生成物 + schema 单源）：
   风格调控统一走 `--jx-<axis>-<alias>` 变量阶梯，不再依赖 className
   抽象解析；StyleX 引擎挂上伞形插件，transform 范围=kernel 树。

design agent（packages/design-tool）还骑在旧内核上：studio 构建仍用
@tailwindcss/vite + tailwind fan-in。Owner 指令（2026-09-27）：对接
0.6.0，更新 design agent，并把 design agent 产品线合并到 main、更新
官网（与 Codex 讨论用户接入路径与文档方案）。

## What Changes

1. **合并 origin/main 进 design-tool 分支**（479 commits 落差）：
   - 我方独占文件（settings 面板族、build-studio、gen-icon-set、
     server settings）零冲突；
   - 冲突面：registry tabs 孪生（main 的 scroll-run/打印投影 vs 我方
     indicatorEdge）、apps/www + registry vite 配置（我方六 glyph
     icons map 落回 main 的 tailwindless 形态）、icon-set 工件重生成。
2. **PFINAL 飞地退役**（对接 0.6.0 的实作核心）：
   - build-studio.mjs：插件矩阵对齐 main 站点形态——删
     @tailwindcss/vite，jixoai() 增 stylex lane（include =
     registry/files + apps/www/src/lib + studio 树）；
   - studio-static.css：tailwind fan-in（@import 'tailwindcss' +
     @source）换成 app.css 的 tailwindless 边界形态
     （$lib/jixoai.css + universal-props.css + jx-pure.css）；
   - verify-tailwindless.mjs：撤销 PFINAL 飞地特赦——
     @import 'tailwindcss' 全仓非法；
   - design-tool devDeps 去 @tailwindcss/vite，lockfile 刷新。
3. **门禁**：build:studio、探针 67 项（fresh home）、电池、
   verify:mirror、verify:icons、verify:tailwindless、
   verify:universal-props、verify:stylex-*（按改动面对照 AGENTS 表）。
4. **合并准备 + 官网**（与 Codex 讨论）：design agent 的用户接入
   路径（npm 包/CLI/registry 项）、官网文档结构（安装页/指南）、
   合并 PR 形态。

## Non-Goals

- 不重写 settings 面板的既有功能（r4-r7 成果原样骑新内核）。
- 不动 eight-axes 的 schema/生成器（消费方，非所有者）。
- 官网文案细节以 Codex 讨论结论为准，不抢跑。
