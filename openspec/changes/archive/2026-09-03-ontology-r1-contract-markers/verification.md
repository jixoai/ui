# Verification (R1, 2026-09-03)

- **合同发射**：card-grid.spec.ts — SectionCard host 总发射
  `data-role="section"`（工厂默认即声明）、未声明不发射 data-ordering；
  code-card.spec.ts — figure 根 `data-kind="code"`。
- **declared-mode 保真**：search-corpus.spec.ts 新 describe 四用例 —
  declared 节（role=entry/ordering=alpha/摘要=标题块末 p，eyebrow 永不
  误收）；无摘要节诚实空串；default host 与裸 heading 双路并存；
  data-kind 开放枚举（code 形状无关 + math 直通）。
- **回退锁**：既有 fallback 夹具补 role/ordering 字段断言（unmarked
  页逐字节等价今日派生）。
- **线上语料**：根 build 重生 public/search/corpus.json — generator 2，
  865 节全部 role=section（全站 SectionCard 出厂即声明），摘要改从
  header 区读取；**顺手修正**：真实页 figcaption label 收割 0→222
  （旧直系 firstElement(figure,'pre') 看不见包装 div 里的 pre，figure
  从未被收割为根；declared 根上线后该盲区暴露并修正为后代查找）。
- **门禁**：vitest 1647/1647（112 文件，含 live convergence 对重建
  corpus 的全页 id 收敛）；verify-print 32/32；mirror GREEN
  （105 items / 373 pairs）；build:registry + blueprints 产物重建。
- **环境备注**：vite build 偶发 `.svelte-kit/output/server/manifest-full.js`
  ENOENT（增量状态损坏，重跑自愈；本次手动补过一次 output 骨架目录），
  与 R1 改动无关，未改动相关配置。
