# design — density hit-floor

## 1. 尺规方程的变化

```text
旧  hitMin_d = max(rowMin_d, 11·U)     # 44px 触控优先钳制
新  hitMin_d = max(rowMin_d, --jx-hit-floor)   # floor = 7·U = 28px

floor 是护栏不是钳制：当前 rowMin（28/32/40/48）全部 ≥ 28px，
方程输出与 rowMin 完全一致。它的存在只有一个意义——未来有人把
row-floor 或 leading 调到 28px 以下时，级联会兜住 WCAG 2.5.8 AA
（24px 通道地板）的底线。
```

被否决的备选：`@media (pointer: fine/coarse)` 分流地板（原型 A 版）。
否决理由：Owner 裁定密度是纯视觉契约，开发者 opt-in 即生效；
触控安全不作为运行时分支，由 28px 静态护栏兜底。

## 2. 级联陷阱（原型顺带证明的第二个缺陷）

```text
旧  input:where(…types…):not(.no-jx-pure, .no-jx-pure *)
    └─ :not() 参数贡献 (0,1,0) → 整条选择器 (0,1,1)
    └─ 高于一切组件类 (0,1,0)：element 默认的 padding-block/border
       泄漏到无铬 lane 上（原型实测 shell 36px vs 读数 28px）

新  input:where(…types…):where(:not(.no-jx-pure, .no-jx-pure *))
    └─ :where() 包装语义不变（opt-out 照常排除），特异性归零
    └─ element 默认回落 (0,0,1)；组件类重新压制它
```

九处法则（input/checkbox/radio/range/textarea/select/color/switch
+ 手写 color standalone 规则）统一改写；control-lane base 补
`padding: 0` 作为纵深防御。

## 3. 教训

- 读数指标错误：原型读的是 `getComputedStyle().minHeight`（声明值），
  用户肉眼看到的是 `getBoundingClientRect()`（渲染值）——密度/几何
  验证必须量渲染值。
- `.jx-pure` face 会激活 bare-element 默认，组件 demo 一旦挂上该
  class，lane 的"无铬"假设必须由 lane 法则自己声明，不能靠级联缺席。
