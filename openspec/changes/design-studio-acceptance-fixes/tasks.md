# tasks

## 1. indicator 单一真相源（picker.js）

- [x] 1.1 删除 applyHighlight/applyHover 幂等守卫；上报统一带
      `{kind, frameName, payload, origin}`
- [x] 1.2 宿主 accept 单入口：hover 最后事件赢；selected pick 总赢并换
      owner、refresh 仅 owner；null 仅 owner 清（纯决策核
      resolveRingUpdate 导出 + 4 组结构化单测）
- [x] 1.3 跟随面收敛为每帧对齐循环（rAF + 变化检测，静止零开销、
      无目标零调度）——取代 RO/MO/scroll/resize 四类事件组合；
      宿主对 frame-owned ring 以自有 iframe 度量重挂（frameBox 保持）
- [x] 1.4 shell selection 恢复后经 DOWN seam 驱动 pick（ring 重建；
      loading 线实现：restoreDrive + freshness 总线 + stamp 就绪门）
- [x] 1.5 规律结构化单测（picker.test.ts +4，含 P3 序列回归锚）

## 2. canvas loading 双拍

- [x] 2.1 stage-view：iframe onload 拍一（壳就绪）；sheet 非 null 拍二；
      `sheet===null && src` 期间蓝图 skeleton + 双拍标注
      （stage-loading.test.ts 11 条 source-law）
- [x] 2.2 shell：manifest 首拉完成前 loading 行，区分 no-data 空态

## 3. 面板可编辑面物化

- [x] 3.1 compile-gate how 白名单补 `prop-expr`（+门禁真栈回归测试）
- [x] 3.2 resync AttributeNode 补 start/end；treeUpdateEnvelope export
- [x] 3.3 prop-materialize 纯变换 + 服务端编排（runExclusive +
      commitTransaction rollback + transactionCompileGate）
- [x] 3.4 collab-api：materialize 路由（receiptFor 幂等 + 收尾
      driveProjection）；usage 响应附 skipped
- [x] 3.5 panel-collab.materialize + property-panel 可物化行渲染 +
      seed 重入
- [x] 3.6 端到端测试 +22（bare bool / absent string·bool / opId 重试
      幂等 / 编译失败零效果 / 既有 cursor 不失锚）

## 4. 验证与收口

- [x] 4.1 探针回归固化（.zcode/gate0/indicator-regression.mjs，
      10/10：P3 重选跟随、迟到上报免疫、BCR 尺寸跟随、宿主平移重挂）
- [x] 4.2 GATE-0 walkthrough 全量重跑 34/34（2026-09-17，5193）
- [x] 4.3 包测试全量 457/457（基线 420 → +11 loading +22 materialize
      +4 规律）
- [x] 4.4 子代理对抗复核（7.5→阻塞 B1/B2 + 建议 R1-R8 全部处置）+
      提交（447f76e2，23 文件 +2631/-291）
