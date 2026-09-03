# Tasks: ontology-r1-contract-markers

- [ ] 1. SectionCard props：`role`（默认 'section'，总发射 data-role）/
      `ordering`（可选，传入才发射 data-ordering）；类型为七原语/四序
      并集（强类型，无 any）
- [ ] 2. CodeCard figure 根发射 `data-kind="code"`（kind registry 首项）
- [ ] 3. search-corpus.mjs declared-mode：data-kind 赢过标签形状；
      heading 的最近 [data-jx-section] 祖先 → role/ordering/summary
      （header 区最后一个 p）读自声明；未标记路径行为不变
- [ ] 4. corpus schema：sections[].role / sections[].ordering 上线
      （开放枚举、加性变更）
- [ ] 5. 夹具门：search-corpus.spec.ts 扩展——declared 页逐字段保真
      （role/ordering/summary/kind/lang/label）+ 回退页逐字段等价
- [ ] 6. 镜像同步（section-card / code-card / search-corpus）+ 清单
      重生成 + dist 重建（corpus 重生）
- [ ] 7. 全量门禁：vitest 全绿、mirror GREEN、payload parity、
      verify-print 32/32（打印侧零改动预期）
