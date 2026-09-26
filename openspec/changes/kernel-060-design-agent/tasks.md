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
- [ ] T6 电池全绿 + 迁移提交推送
- [ ] T7 Codex 讨论：design agent 用户接入路径 + 官网文档方案
- [ ] T8 官网落地 + 合并 PR + 汇报
