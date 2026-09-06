# betlang wasm 探测实证 — 2026-09-07

Owner 门禁：wasm ≤ 100KB 可用；否则退 linguist heuristics 或转非默认
detector。本档案记录构建序列、尺寸矩阵、功能实测与通道结论。

## 源

- repo: https://github.com/DioxusLabs/betlang（MIT），clone @ HEAD
  (shallow, 2026-09-07)，crate `betlang 0.1.1`
- 模型：内嵌 `assets/magika/source-student-q4.bin` **47,840 字节**
  （sha256 8493d2d3757572c8661141e414b1c0755aa08d4c4e5382dfbbc6b73b02d89083（README 声明，最终发行物门禁实测复核）），架构
  wordseq-b1024-k3-m2048-tiny-3conv-hidden
- 输出：48 标签（asm…yaml），held-out `test_fs_accuracy=0.942`
  macro_recall=0.940；概率经校准（歧义输入报分裂分）
- 依赖：`fearless_simd 0.4.1`（SIMD 抽象，wasm32 走 simd128/fallback
  双路径）——纯库，无 wasm-bindgen

## 构建序列（可复现）

```sh
git clone --depth 1 https://github.com/DioxusLabs/betlang /tmp/betlang-probe
cargo new --lib /tmp/betlang-wasm-probe   # crate-type cdylib
# deps: betlang = { path = "../betlang-probe" }
# profile.release: opt-level="z" lto=true panic="abort" strip=true codegen-units=1
# 导出：#[no_mangle] extern "C" fn probe_detect(*const u8, usize) -> i32（枚举序号，零 fmt 机器）
~/.cargo/bin/cargo build --release --target wasm32-unknown-unknown
```

**工具链坑**：Homebrew rust（PATH 首位）**不带 wasm32-unknown-unknown
std**，fearless_simd 编译报 E0463 "can't find crate for core"。须用
rustup 工具链（`~/.cargo/bin/cargo`，stable-aarch64-apple-darwin +
wasm32 target 已装）。CI 构建需显式 rustup 环境。

## 口径律（r1-B7）

所有预算与实测以 KiB=1024 字节精确计量；gzip 以 Node zlib.gzipSync
level 9 为冻结算法。下表 KB 字样一律读作 KiB。最终发行物（packages/
betlang-wasm 真实装载器导出 + 全 entry）在任务 4.1 复测验收，复测
记录（wasm sha256、tarball sha256、rustc/LLVM 版本、字节精确尺寸）
落 packages/betlang-wasm/ARTIFACT.md。

## 尺寸矩阵

| 绑定 | raw | gzip |
|---|---|---|
| 朴素探针（`format!("{l:?}")` 拖入 fmt 机器，默认 release） | 117,260 B = **114.5 KB** | 62.8 KB |
| lean 探针（枚举序号返回 + opt-level=z + lto + panic=abort + strip） | **97.7 KB** | **57.1 KB** |

其中 47.8KB 为内嵌模型（不可压缩权重，gzip 后仍占大头）。真实绑定
增加 wasm-bindgen 或手写装载器胶水：手写 ~40 行 JS（线性内存 UTF-8
进出）不增 wasm 字节；wasm-bindgen 会使 raw 增约 3-8KB（可能越
100KB 线）→ **design D4 裁决手写装载器**。

**双口径判定：raw 97.7 ≤ 100 ✓、gzip 57.1 ≤ 70 ✓ —— betlang 进
DLD L4 作默认统计层。**

## 功能实测（native host，8/8）

| 样本 | 检出 | 期望 |
|---|---|---|
| `fn main() { println!("hi"); }` | Rust | rust ✓ |
| `def add(a, b):\n    return a + b` | Python | python ✓ |
| `const x: number = 1;` | TypeScript | typescript ✓ |
| `{"name": "jixoai", "v": [1, 2]}` | Json | json ✓ |
| `package main…func main()` | Go | go ✓ |
| `#!/usr/bin/env python3\nimport sys` | Python | python ✓ |
| `SELECT * FROM users WHERE id = 1;` | Sql | sql ✓ |
| `<div class="x">hello</div>` | Html | html ✓ |

（短样本即中——README 混淆矩阵另示歧义输入报分裂分，DLD 取 top1 +
confidence 直传。）

## 通道结论

- npm `betlang@0.0.0`：**占位空包**（ISC，无依赖，1 版本），非官方
  wasm 发行；`betlang-wasm` 等名 404
- 上游 repo 无 wasm 构建脚本（playground 在 dioxus-code 仓库另行包装）
- → **无官方 wasm 通道**。裁决见 design D4：A 首选自建
  `@jixoai/betlang-wasm` npm 包（lockfile 供应链）；B 备选 release
  资产 + pin（ghostty 法则）。二进制不入 git 在两通道下均成立。

## linguist 数据盘点（L1/L2 数据源 + B 方案储备）

- `lib/linguist/languages.yml`：165,390 B，**2,069 语言条目**
  （extensions / interpreters / aliases 字段为 L1/L2 表源）
- `lib/linguist/heuristics.yml`：40,624 B，**138 组扩展名歧义消解块**
  （Ruby 兼容正则 + named_patterns 复用；`.h`→C/C++/ObjC 类）——
  L1 排除表的来源；完整 JS 移植为 Non-Goal（design D6）
