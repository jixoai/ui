# betlang wasm 探测实证 — 2026-09-07

Owner 门禁：wasm ≤ 100 KiB 可用；否则退 linguist heuristics 或转非默认
detector。本档案记录构建序列、尺寸矩阵、功能实测与通道结论（全文
KiB=1024B 口径，不使用 KB）。

## 源

- repo: https://github.com/DioxusLabs/betlang（MIT），clone @ HEAD
  (shallow, 2026-09-07)——**探针快照可复现口径（r3-N3）**：不可变
  来源为 crates.io `betlang-0.1.1` tarball（最终发行物 CI 以
  `cargo build --locked --offline` 从钉死版本构建，crate checksum +
  git commit 一并记入 ARTIFACT.md；探针的 git HEAD 仅溯源用）；
  工具链：rustup stable-aarch64-apple-darwin / rustc 1.98.0
  (88d9e12a 2026-08-18) / Homebrew rust 不带 wasm32 std（构建必须
  rustup 工具链）
- 模型：内嵌 `assets/magika/source-student-q4.bin` **47,840 字节（46.72 KiB）**
  （sha256 8493d2d3757572c8661141e414b1c0755aa08d4c4e5382dfbbc6b73b02d89083（README 声明，最终发行物门禁实测复核）），架构
  wordseq-b1024-k3-m2048-tiny-3conv-hidden
- 输出：48 标签（asm…yaml），held-out `test_fs_accuracy=0.942`
  macro_recall=0.940；概率经校准（歧义输入报分裂分）
- 依赖：`fearless_simd 0.4.1`（SIMD 抽象，wasm32 走 simd128/fallback
  双路径）——纯库，无 wasm-bindgen

## 构建序列（可复现）

```sh
# 可复现构建序列（r8-B1：以下脚本已逐行实际执行，输出为真实记录；
# tarball 是唯一构建输入，Git HEAD 从不参与——Git 快照仅作历史溯源
# 记于本档开头）：
set -e; W0=$(mktemp -d /tmp/betlang-repro.XXXX) && cd $W0   # r9-N2：mktemp，不 rm 固定目录
curl -sL https://static.crates.io/crates/betlang/betlang-0.1.1.crate -o betlang.crate
shasum -a 256 betlang.crate
# → 5f89b0929539eaee70109704ae4e345df438be6ab02e4dc8ac060e05098ad1b7（sparse index cksum 一致 CKSUM-OK；yanked=false）
tar -xzf betlang.crate && mv betlang-0.1.1 betlang-probe
rg -A1 'name = "fearless_simd"' betlang-probe/Cargo.lock   # → 0.4.0（betlang 自锁值）
cargo new --lib wasm-probe && cd wasm-probe
cat > Cargo.toml <<'TOML'
[package]
name = "betlang-wasm-probe"
version = "0.0.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
betlang = { path = "../betlang-probe" }
# 钉 betlang 自锁值——fresh lock 会解析 0.4.1（漂移源，r8 实测差异）
fearless_simd = "=0.4.0"

[profile.release]
opt-level = "z"
lto = true
panic = "abort"
strip = true
codegen-units = 1
TOML
cat > src/lib.rs <<'RS'
#[no_mangle]
pub extern "C" fn probe_detect(code: *const u8, len: usize) -> i32 {
    let bytes = unsafe { std::slice::from_raw_parts(code, len) };
    let detection = betlang::detect(bytes);
    match detection.language() { Some(l) => l as i32, None => -1 }
}
RS
~/.cargo/bin/cargo generate-lockfile   # → fearless_simd 0.4.0 锁定
# Homebrew rust 无 wasm32 std：显式 rustup 工具链 rustc（坑记于下节）
RUSTC=$HOME/.rustup/toolchains/stable-aarch64-apple-darwin/bin/rustc \
  ~/.cargo/bin/cargo build --release --target wasm32-unknown-unknown --locked
# → Finished `release` profile [optimized] target(s) in 2.48s
W=target/wasm32-unknown-unknown/release/betlang_wasm_probe.wasm
stat -f%z $W   # → 100131（97.79 KiB；见下"确定性"段——两次运行 100111/100131）
shasum -a 256 $W   # → 5495267642e070a56f0f8525107ab6a66666ee20021e9f953bc22632dd4d2326
node -e "…gzipSync(b,{level:9}).length"   # → 58499（57.13 KiB）
rustc -Vv   # rustc 1.98.0 (88d9e12ae 2026-08-18) / commit 88d9e12ae178fab0fb5cc050a94da85685d449ea / host aarch64-apple-darwin
cargo -V    # cargo 1.98.0 (797e8a9bc 2026-08-05)
```

**确定性实测（r9 关键发现，改变门禁语义）**：同一 fearless_simd
0.4.0 锁定、同一 profile，跨构建目录重跑字节**不等**（100,111 /
58,461→100,131 / 58,499，~20B 漂移——构建目录路径进入产物元数据）。
因此：**wasm sha256 的门禁语义 = as-shipped 完整性**（CI 一次构建、
哈希记入 ARTIFACT.md、verify 校验 npm 包内字节与记录一致），本地
重建只验 tarball cksum + 锁版本 + 尺寸预算带（观测带 100,055–
100,131 B，最坏距 98 KiB 预警线 221 B），**不做字节恒等断言**。

**观测带（tarball + 0.4.0，两次独立运行）**：raw 100,111–100,131 B
（97.75–97.79 KiB，距 98 KiB 预警线最坏 **221 B**、距 100 KiB 帽最坏
2,269 B）；gzip 58,427–58,499 B（距 70 KiB 帽 ≥13,181 B）。各次
sha256 为该次运行记录（d03e30e3…/54952676…），**canonical 哈希 =
CI 构建产物在 ARTIFACT.md 的记录值**（as-shipped 语义，见上）。
早前 git 快照探针（0.4.1：100,055/58,461/56d0243d…）仅作
comparison-only 历史对照，不入任何门禁。CI 的 ARTIFACT.md 记
crateChecksum（tarball cksum）、fearlessSimd 锁值与 cksum、
as-shipped wasm 三元组与工具链版本。

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

## 尺寸矩阵（comparison-only：git 快照源 + fearless_simd 0.4.1——
## 历史对照，不入门禁；正式观测带见上节）

| 绑定 | raw | gzip |
|---|---|---|
| 朴素探针（`format!("{l:?}")` 拖入 fmt 机器，默认 release） | 117,260 B = **114.5 KiB** | 64,332 B（62.8 KiB） |
| lean 探针（枚举序号返回 + opt-level=z + lto + panic=abort + strip） | 100,055 B（97.65 KiB） | 58,461 B（57.09 KiB） |

（本段为 git 快照源 + 0.4.1 的历史实测，comparison-only；正式口径
见"观测带"节）该次 sha256
`56d0243d271097e5517a936a508393e1f5fe11e34961f0e73f3b12f8b3182360`；
magic bytes `\0asm` 验证通过；gzip 为 Node zlib.gzipSync level 9。
门禁输入 = .wasm 字节本身（装载器 JS 与 tarball 不入预算，tarball
sha 仅完整性记录）。

其中 47,840 B（46.72 KiB）为内嵌模型（不可压缩权重，gzip 后仍占
大头）。真实绑定增加 wasm-bindgen 或手写装载器胶水：手写 ~40 行 JS
（线性内存 UTF-8 进出）不增 wasm 字节；wasm-bindgen 会使 raw 增约
3-8 KiB（可能越 100 KiB 帽）→ **design D4 裁决手写装载器**。

**双口径判定：raw 观测带 ≤ 98 KiB 预警线 ✓、gzip ≤ 70 KiB ✓ —— betlang 进
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
- → **无官方 wasm 通道**。裁决见 design D4：**冻结 A**——自建
  `@jixoai/betlang-wasm` npm 包（lockfile 供应链）。B（release 资产 +
  pin，ghostty 法则）**仅存本档历史评估记录，不构成本 change 的实现
  路径**。二进制不入 git 在冻结通道下成立。

## linguist 数据盘点（L1/L2 数据源 + B 方案储备）

- `lib/linguist/languages.yml`：165,390 B，**2,069 语言条目**
  （extensions / interpreters / aliases 字段为 L1/L2 表源）
- `lib/linguist/heuristics.yml`：40,624 B，**138 组扩展名歧义消解块**
  （Ruby 兼容正则 + named_patterns 复用；`.h`→C/C++/ObjC 类）——
  L1 排除表的来源；完整 JS 移植为 Non-Goal（design D6）
