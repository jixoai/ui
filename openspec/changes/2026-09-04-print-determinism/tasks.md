# Tasks: print-determinism

- [x] 1. P1 探针：页面内容盒挂 `container: jx-print-viewport / inline-size`
      对 paged.js 分页无扰动（真实浏览器实测）；产物视口 query 全量清单 +
      跨域表枚举；component-canvas 2 处 vh cap 清扫
- [x] 2. P2 print-viewport 模块：CSSOM 遍历（layer 路径感知、adopted
      stylesheets、style/link media 形态）；宽度特征改辖域（非宽度特征外层
      复合）；原件可逆禁用 + 同层合成注入；不可表达 → 封禁 + 大声日志
- [x] 3. P2 接缝：PrintDoc 挂载生效（standby 同激活）/ 卸载撤销全部副作用
      （零残留断言扩展）；性能计时记录
- [x] 4. P3 审计：窗口派生 stamp 清单（button-group wrap 等）按差分实测
      定冻结/重算
- [x] 5. P4 差分门禁：verify-print 双尺寸（800×600 vs 1600×1200）逐字节
      一致断言 + jsdom 变换单元套件
- [x] 6. P5 文档：docs 页"打印确定性最佳实践"节（三句话：可用/不建议打印
      存活面/为什么）进 corpus；design iframe 否决记录已入档
- [x] 7. 收尾：全量门禁（vitest / verify-print / mirror / build）+
      spec delta（print-pipeline 增确定性需求）+ 提交
