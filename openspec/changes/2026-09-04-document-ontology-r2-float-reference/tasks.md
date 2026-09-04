# Tasks: document-ontology R2 — 浮+引

## 1. Section 编号树

- [ ] 1.1 numbering context 机件：域根计数 + 后代十进制树解析
      （DOM 顺序 = 显示货币；换序重排、id 不动）
- [ ] 1.2 `floatScope` kind 轴配置（默认全 chapter；document 连续
      例外；仅域级可声明）
- [ ] 1.3 现状门：未声明节的 DOM 逐字节等价测试
- [ ] 1.4 `data-number` 发射（R1 车道语法族）

## 2. Figure 家族（新 ui/figure/）

- [ ] 2.1 组件：kind 四值 + 图注槽 + 计数渲染 + `citedIn` 手动
      标注（头注释含反链缺口说明与回归条件）
- [ ] 2.2 收割发射：`data-jx-figure`/`data-number`/`data-cited-in`
- [ ] 2.3 测试：计数矩阵（kind×scope×域嵌套）+ citedIn 渲染/发射
- [ ] 2.4 镜像 + registry 登记 + manifest

## 3. Reference 家族（新 ui/reference/）

- [ ] 3.1 组件：`to` 寻址 + 目标自述解析（figure 按kind / 编号节
      §N / 无编号标题 / 缺失 id 响亮回退）+ children 逃生门
- [ ] 3.2 `data-ref-to` 发射（refids[] 正向面）
- [ ] 3.3 测试：解析矩阵四态 + 逃生门 + 响亮回退

## 4. 交叉门

- [ ] 4.1 「编号=显示货币」法则门（换序重排、id 不动——figure 与
      section 双夹具）
- [ ] 4.2 打印探针：编号在冻结捕获中原样在场，无重编号
- [ ] 4.3 docs 页（figure/reference 各一）+ 全量门禁（vitest/
      mirror/payload parity）

## 5. 收尾

- [ ] 5.1 specs delta（component-authoring 线词汇 + 收割合同字段）
- [ ] 5.2 verification 记录 + 归档准备
