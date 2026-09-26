# kernel-060-design-agent — tasks

- [x] T1 侦察：origin/main = 0.6.0 列车（58a65866，539 commits：tailwind
      退役 / stylex lane / 八轴 universal-props / 110 页文档）；PFINAL
      飞地 = studio-static.css（全仓最后合法 tailwind 消费者）；冲突面
      仅 5 文件（tabs 孪生 ×2、icon-set 孪生 ×2、mirror-manifest）
- [x] T2 合并 origin/main（f78a1b4c）：tabs indicatorEdge 以 main 的
      stylex payload 形态重落（hostBorderInlineStart 逻辑边原子 + 几何
      rtl 裁决 + effect 依赖；默认 'end' 保持物理右原子零漂移）；
      icon-set 再生 58 icons；mirror-manifest 再生 795 对 GREEN；
      三处 vite/gen 配置的六 glyph icons map 自动合并保住
- [x] T3 PFINAL 飞地退役：
      - build-studio.mjs：删 @tailwindcss/vite，jixoai() 增 stylex
        lane（include = registry/files + apps/www/src/lib + studio 树）
      - studio-static.css：tailwind fan-in（@import 'tailwindcss' +
        @source×2）→ 0.6.0 三表 fan-in（$lib/jixoai.css +
        universal-props.css + jx-pure.css）+ 站点同款 base layer
      - create.ts（dev 画布管线）：同样换 stylex 矩阵（include =
        dirname(itemAliasBase) + libAliasBase + PACKAGE_DIR/src），
        删 TailwindViteModule/import/factory/plugins 位点
      - probe.ts：PLUGIN_SET 删 '@tailwindcss/vite'（vehicle 已卸载，
        旧判据导致 moduleRoot 判空——迁移后 build 立即暴露）
      - verify-tailwindless.mjs：撤 PFINAL 飞地特赦，全仓
        @import 'tailwindcss' 非法
      - design-tool devDeps 去 @tailwindcss/vite
- [x] T4 再生物同步：tabs.meta（props 12）+ gen:stylex-payload
      （113 items，buildId 刷新）+ icon-set + mirror-manifest
- [x] T5 门禁：build:studio 绿（bundle 零 tailwind 残留）、探针 67/67
      （fixture 重建：/tmp 清理丢了 catalog，api 枚举 openai-completions）
      verify:meta / stylex-payload / tailwindless / icons /
      universal-props 全 GREEN、vision 视觉等价 PASS（accent 品红为
      hue-runtime 330 基准，非回归）；电池进行中
- [x] T6 电池等效 617/617（collab-host 套件本地退出挂起 = main 侧
      句柄泄漏，全部测试本体绿；knowledge snapshot 随 148 项再生）；
      迁移提交 86fe14b1 推送
- [x] T7 Codex 复核 + 讨论（gpt-5.6-terra xhigh，read-only，约 40
      分钟）：综合 **7.0/10 不给发布级 GO**（运行时 8.5，扣在依赖/
      发布/验证闭环）。
      阻塞 1（tailwindcss devDep 漏删 + 双 npm lock 残留 23+ 条）
      ——已修（59c4a51a，lock 清零，pnpm-lock 本地态刷新）；
      阻塞 2（@jixoai/ui-design private 0.1.0 未发布、release.yml
      只发 CLI+plugin、npx 外部解析不了 design toolchain）——
      **Owner 拍板项**：公开发布 + 版本锁步 0.6.0 + dist-studio 进
      tarball + CLI 显式依赖；
      阻塞 3（tabs-indicator 66/67，tablist tabindex 断言）——
      对照实验实证 origin/main 原版组件同红，**main 侧既有**，
      非本分支引入（记录在案，上游修）。
      非阻塞清理：probe.tailwindContentRoots 死数据（留作宿主兼容
      读取）、注释类残留、staleness hash 不含 plugin 版本（建议项）
- [x] T8a 官网落地（第一批，按 Codex IA）：
      /docs/design-agent.html（产品页：what-it-is/60s quickstart
      含 availability 诚实注记/三 agent 模式表/design 工作区契约/
      八轴编辑机制/边界互链）；docs-route-model Sections 导航
      （install 之后）；svelte.config prerender + docs-structure
      exact-set 锁更新（12/12 绿）；build-site llms learning-path
      纳入 install+design-agent；install.html transitional 卡收口
      （0.6.0 迁移全量完成、TW4 前置退役、指向 design-agent）。
      www build 绿 + verify:docs staged GREEN
- [ ] T8b 新页 vision 快检 + 官网提交推送
- [ ] T9 合并 PR + 汇报（Owner 待拍板：公开发布/版本锁步/nested
      git 默认/dsh 首发口径）
