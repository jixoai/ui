# Verification: context-plugin-system

## Unit（vitest）

- 排序与叠加全矩阵（见 tasks 3.1/3.4）；init skip 后 getContext
  为 null；filter 以 env.medium 动态开关插件；before/after 冻结
  入参下产出新值（不可变纪律）。
- density/medium：零插件路径与改造前逐位一致（全量既有套件 +
  微基准断言短路）。

## 门禁

- verify:all 全绿（既有 1071+ 用例零回归是本 change 的行为不变证明）。
- lib/context-plugin.svelte.ts 零 npm 依赖（bundle 探针同款扫描）。
