---
title: NeoMem: Hardware/Software Co-Design for CXL-Native Memory Tiering
authors: Zhe Zhou, Yiqi Chen, Tao Zhang, Yang Wang, Ran Shu, Shuotao Xu, Peng Cheng, Lei Qu, Yongqiang Xiong, Jie Zhang, Guangyu Sun
year: 2024
venue: MICRO 2024
tags:
  - CXL
  - tiered memory
  - memory profiling
  - hardware-software co-design
  - page migration
status: published
---

# NeoMem: Hardware/Software Co-Design for CXL-Native Memory Tiering

> [论文链接](https://arxiv.org/abs/2403.18702)

## 一句话总结
NeoMem 的核心贡献是把 **分层内存中的热页检测从 CPU/OS 侧搬到 CXL 设备侧控制器**，通过一个叫 **NeoProf** 的硬件 profiler 直接观测访问 CXL 内存的 LLC miss，从而绕开传统 PTE 扫描、hint-fault 和 PMU sampling 的分辨率/开销瓶颈，再配合内核侧迁移策略实现更高效的 CXL-native memory tiering。

## 这篇论文在解决什么问题？
这篇论文要解决的是一个很现实的问题：**在 CXL-based tiered memory system 中，怎样及时、准确、低开销地找到应该被提升到快内存的热页？**

CXL 让服务器可以接入各种不同类型的内存，把系统变成“本地 DRAM + CXL memory”的异构分层内存结构。但一旦出现快慢层，系统就必须不断做 page migration：把真正关键的热页迁到快层，把冷页放回慢层。问题在于，现有 memory tiering 方案虽然已经很多，但真正限制它们上限的不是迁移机制本身，而是**热页检测方法太差**。

传统方法大概分三类：

- **PTE Scan**：扫页表 Access bit，开销高，而且一个扫描周期内每页只能看到“是否访问过一次”；
- **Hint-fault monitoring**：通过故意 poisoning PTE 让后续访问触发 fault，分辨率更高，但 page fault 成本很大；
- **PMU/PEBS sampling**：能看到 LLC miss，但只能低频采样，而且强依赖特定 CPU 平台。

作者的判断很明确：**CXL memory tiering 的真正瓶颈，是 OS/CPU 侧缺少高分辨率、低开销、cache-aware 的 memory profiling 手段。**

所以 NeoMem 不是在旧方案上做一点 policy 调参，而是试图从 profiling 路径本身重构：既然 CXL memory 自带 device-side controller，那为什么不把 profiling 功能直接放到设备侧？

## 背景 / 为什么这个问题重要？
CXL 出现后，服务器内存扩展的方式发生了变化。过去 CPU-attached DRAM 是主流，内存控制器嵌在主机一侧；而 CXL 让 memory expansion 变成了一种更松耦合的设备化能力。这样做的好处很明显：

- 可以按容量、带宽、成本自由组合不同介质；
- 可以更方便地扩展内存池；
- 对 memory disaggregation、分层内存和异构内存组织都很有吸引力。

但坏处同样明显：**CXL memory 比本地 DRAM 慢得多。** 论文在真实 FPGA-based CXL 平台上测到的数字是，大约 **430ns** 的访问延迟，约为本地 DRAM 的 **3.6×**。而且如果 CXL 设备进一步采用更慢的介质（比如 PCM/ReRAM），延迟差距还会更大。

在这种前提下，内存管理最关键的一点就不再只是“扩了多少容量”，而是：

> **能否把真正高价值的页留在快层，把不重要的页留在慢层。**

而要做到这一点，就必须有一个足够好的“热页观察窗口”。如果观察方法自己就低分辨率、高开销、或者只能看到 TLB 级现象而看不到真实 LLC miss，那么后面的迁移策略再精巧，也会建立在很差的输入上。

这也是 NeoMem 这篇论文最重要的视角：**memory tiering 的上限，往往由 profiling 能力决定。**

## 核心思路
NeoMem 的整体设计可以概括成一句话：

> **把 memory profiling 从 CPU/OS 一侧下沉到 CXL memory device 的 controller 里。**

具体来说，它是一个硬件/软件协同方案：

- **硬件侧**：在 CXL device-side controller 中加入一个专门的 profiler，叫 **NeoProf**；
- **软件侧**：Linux 内核里实现驱动、守护进程和迁移策略，让 OS 周期性读取 NeoProf 的统计结果，再用这些信息做热页提升和冷页回收。

这个思路其实很“CXL-native”：它不是把 CXL memory 当成另一个更慢的 NUMA node 然后硬套传统方法，而是正视 CXL 设备“有自己控制器”这件事，并利用这个设备侧观察点来做 profiling。

论文把理想 profiling 机制的目标归纳成五个：

1. 高时间/空间分辨率；
2. 低 CPU 开销；
3. cache-aware，只看真正 LLC miss；
4. 跨 CPU 平台通用；
5. 不只看 page hotness，还能看带宽、读写比、频率分布等运行时信息。

NeoMem 的设计就是围绕这五个目标展开的。

## 关键机制 / 方法细节

### 1. 设备侧 profiler：NeoProf
NeoProf 是整篇论文最核心的技术点。它被集成进 CXL memory 的 controller 里，直接 snoop 发往 CXL memory 的访问请求。这样做有几个很关键的好处：

- **它天然看到的是“真正落到 CXL memory 的访问”**，也就是更接近 LLC miss 后的真实慢层访问；
- 不需要 CPU 用额外 cycle 做 profiling；
- 不依赖 Intel PEBS/AMD IBS 这类 vendor-specific PMU 机制；
- 可以与 host CPU 解耦，只要平台支持 CXL，就能接入。

NeoProf 不只是一个“热页计数器”，它还会顺手统计很多运行时信息：

- page hotness
- 带宽利用率
- 读/写比例
- 访问频率分布

这些都可以给 OS 侧的迁移 aggressiveness 提供依据。

从体系结构角度看，这是 NeoMem 最值得注意的地方：它不是简单增强 page classifier，而是把 profiling 变成了 **memory-side observability primitive**。

### 2. 为什么传统方法不够好
作者对现有 profiling 路径做了比较系统的批评。

#### PTE-scan 的问题
PTE 扫描最大的问题是：

- 时间分辨率低；
- 空间分辨率和开销之间必须做很差的 tradeoff；
- 一次 epoch 里每页只能知道“被访问过没”，很难高精度识别访问频繁页。

对大内存系统来说，光扫描 page table 本身就会消耗明显时间。你想提高分辨率，就得更频繁扫描；想降低开销，就得降低分辨率或只抽样一部分区域。

#### Hint-fault 的问题
Hint-fault 的优点是响应更即时，但代价是：

- 每次“探测”都要制造 fault；
- 频繁 fault 带来的 CPU 开销非常显著；
- 它追踪的是 PTE/TLB 级信号，并不一定等价于真正的慢层 LLC miss。

#### PMU sampling 的问题
PEBS/PMU sampling 能直接看到 LLC miss，这一点比前两类强。但它的局限在于：

- 为了控制开销，采样率不敢太高；
- 采样频率一低，热页 recall 就会受损；
- 还高度依赖具体 CPU 平台，通用性差。

NeoMem 的设计基本可以理解成：**把“低开销 + 高分辨率 + cache-aware + 跨平台”这几个传统上难以同时满足的目标，转移到设备侧来统一解决。**

### 3. Hot page detector：基于 Sketch 的检测器
如果 NeoProf 真要监控所有 page 访问，另一个问题马上出现：怎么存这些统计？

论文里举了一个很典型的 straw-man：如果你有一个 512GB CXL memory expander，以 4KB page 粒度算，大约有 **1.28 亿个页**。如果每页配一个 32-bit counter，单是计数器存储就要 **512MB**，完全不可接受。更别说每次访问都更新它们的带宽开销。

所以 NeoProf 没有走 per-page exact counter 这条路，而是采用了 **Count-Min Sketch** 这种近似频率估计结构，并做了两类增强：

- 用 hot page filtering 机制减少重复；
- 用 error-bound control 控制检测误差。

这一步的设计很关键，因为它体现了论文的工程成熟度：作者不是只说“把 profiling 搬到设备侧”，而是认真面对了设备侧最现实的问题——**状态空间太大，不能精确存每页计数。**

Sketch 方案本质上是在用少量硬件状态换一个近似但可用的 hot-page detector。对 memory tiering 来说，这是合理的，因为你并不需要每页的绝对精确计数，而是需要一个足够可靠、足够及时的 top hot pages 近似排序。

### 4. OS 侧配合：driver + daemon + migration policy
硬件只负责 profiling，页迁移决策仍然在 OS 侧完成。NeoMem 在 Linux 内核里做了几件事：

- 驱动通过 MMIO 与 NeoProf 通信；
- 守护进程周期性读取 NeoProf 的统计结果；
- 根据 policy 做 hot page promotion；
- 冷页检测则继续借助 Linux 里成熟的 **LRU 2Q** 机制。

这是一种很务实的分工：

- **热页检测** 最难、最耗 CPU，就下沉到设备侧；
- **冷页回收** 不需要同样高的检测精度，继续复用 OS 现有机制就够。

这说明作者并没有为了“全都自己做”而重写一切，而是只把最痛的瓶颈剥离出来，这也是比较典型的系统论文里成熟的“最小重构”思路。

### 5. NeoMem 真正“native”的地方
论文把 NeoMem 称为 **CXL-native**，我认为这个说法不是噱头，而是有技术含义的。

很多 CXL memory 工作其实还是在把它当作“更慢的远端内存”，然后用传统 NUMA-tiering 手段去适配。但 NeoMem 不一样，它真正利用了 CXL 架构里一个以前不太被充分利用的特点：

- CXL memory 不像 DDR 那样完全由 host memory controller 统一支配；
- 它天然有 **device-side controller**；
- 既然如此，profiling、统计甚至更丰富的 memory-side management 功能，就有机会向设备侧演进。

这让 NeoMem 不只是一个“更好的 hot-page detector”，而是一个关于 **CXL memory observability should move to the device side** 的体系结构主张。

## 实验与结果
实验部分的一个亮点是：作者不是只做 NUMA 仿真或 trace replay，而是在 **真实 FPGA-based CXL memory platform** 上实现了 NeoMem，并结合 Linux kernel v6.3 做了原型验证。

论文的核心结果包括：

- 对比多种现有 memory tiering 方案；
- 在 8 个代表性 benchmark 上测试；
- 在真实平台上，NeoMem 取得了 **32% 到 67% 的几何平均加速**。

这个幅度是很有说服力的，尤其考虑到这不是“给一个更快设备”带来的被动收益，而是 purely 来自更好的 profiling 和 migration decision。

不过这里也要冷静一点解读：

- 论文是在特定 FPGA-based CXL prototype 上完成的；
- 这个 prototype 的 latency 本身比很多仿真假设更高（作者测到约 430ns）；
- 所以 NeoMem 在这种“慢层更慢”的情况下，收益会相对更容易放大。

换句话说，它的结果是强的，但你不能简单把这个数字一比一外推到所有未来 CXL 平台。

## 这篇论文真正的贡献
我认为 NeoMem 的贡献主要有四层。

### 贡献 1：准确识别了 memory tiering 的真正瓶颈
很多人会把问题表述成“page migration policy 不够聪明”，但 NeoMem 更进一步指出：

> **真正决定 policy 上限的是 profiling 路径。**

如果热页检测本身就低分辨率、高开销、观测信号又不对，那么后面的策略改再多也救不回来。这是非常重要的重新定位。

### 贡献 2：提出了 device-side profiling 这一条新路径
NeoMem 把 profiling 移到 CXL controller 侧，这是这篇工作最有原创性的地方。它体现了一种很重要的系统设计思路：

- 不是一味在 OS 里优化；
- 而是利用新硬件架构带来的新观察点，重构软件设计。

### 贡献 3：让 profiling 更接近“真实慢层访问”
PTE/TLB 级信号和真正的 LLC miss / CXL access 之间有语义鸿沟。NeoMem 的一大价值就在于缩短了这个鸿沟：NeoProf 看到的是更接近真实慢层访问的请求，从而让 page classification 更可靠。

### 贡献 4：证明硬件/软件协同在 CXL memory management 上是可行的
NeoMem 的成果告诉我们，CXL 场景下值得认真考虑的不是“CPU 侧如何继续做所有事情”，而是：

- 哪些管理功能应该继续留在 OS；
- 哪些观察与统计功能更适合下沉到设备控制器。

这对未来 CXL-native 系统软件是很有启发的。

## 局限与问题
这篇论文很强，但也有明显边界。

### 1. 它本质上还是 hotness-first，而不是 cost/criticality-first
这是我认为 NeoMem 和后来的 PACT 最大的差异之一。

NeoMem 的核心还是高效地检测“热页”，然后促进热页提升。虽然它把 profiling 做得很好，但其决策核心仍然主要基于 **frequency / hotness**。它确实把“看得准”这件事做强了，但并没有彻底跳到“性能关键性 first”的范式。

这意味着：

- NeoMem 更像 hotness-based tiering 的强化版；
- 而不是像 PACT 那样直接重写目标函数。

### 2. 需要设备侧硬件改造
NeoProf 不是零成本能力，它需要：

- CXL device-side controller 可编程/可扩展；
- 接入额外硬件逻辑；
- 有 MMIO 命令接口与 host 交互。

这在研究原型里合理，但在商用生态里，意味着硬件厂商和系统软件要一起配合，落地门槛并不低。

### 3. 对多样化工作负载是否足够稳，还需要更长时间验证
NeoMem 用了 8 个 benchmark，已经不差，但如果放到更复杂的真实数据中心环境里，还要继续看：

- 多租户情况下的热度波动；
- 更大页/hugepage 场景；
- 与 NUMA balancing、OS reclaim 等机制的交互；
- 长时间运行下的误差积累与 policy 稳定性。

### 4. 它没有触及“criticality”这一层
这不是说 NeoMem 不好，而是说它解决的是“高分辨率热页检测”，还没有解决“哪些热页真的最影响性能”这个更进一步的问题。所以如果把 NeoMem 和 PACT 放在一条线上看，NeoMem 更像是在 profiling 能力上开路，而 PACT 则在目标函数层面继续推进。

## 和相关工作的关系
### 与传统 PTE-scan / hint-fault / PMU 方案相比
NeoMem 的优势很明确：

- 更高分辨率；
- 更低 CPU 开销；
- 更接近真实 LLC miss；
- 更不依赖某个 CPU vendor 的 profiling 能力。

### 与 NUMA-style memory tiering 相比
传统 NUMA-tiering 方案基本还是 host-centric 的。NeoMem 则证明了，到了 CXL 时代，**memory-side management** 值得成为一个新的研究方向。

### 与 PACT 这类后续工作相比
如果把两者放一起看，会很有意思：

- **NeoMem**：先把 profiling 做对、做细、做低开销；
- **PACT**：再进一步质疑“hotness 是否足够”，转向 criticality-first。

所以我会把 NeoMem 看成是一个重要台阶：它先解决“怎么观察”，然后后续工作才有空间去讨论“观察到以后该优化什么”。

## 对研究者的启发
### 启发 1：CXL 时代，设备侧 controller 不是被动部件
NeoMem 最重要的研究启发之一，是把 CXL device-side controller 从“协议执行器”提升成“系统软件协同点”。未来不仅 profiling，也许 prefetch、compression、integrity metadata management、甚至部分 placement hint 都可以往这一侧延伸。

### 启发 2：观测点决定优化上限
如果你只能从 OS 页表侧看世界，那你就很难精准控制 CXL tiering。NeoMem 提醒我们：**在系统设计里，观测点本身就是一等资源。**

### 启发 3：不要把 CXL memory 只当成“更慢的 NUMA”
如果只是这么理解，很多设计空间都会被忽略。CXL 带来的新控制器、新协议层和新设备边界，本身就是新的优化机会。

## 我的评价
我对 NeoMem 的评价是：**这是一篇方向感很强、工程味也很足的 CXL tiering 论文。**

它最强的地方不在于提出了一个花哨的策略，而在于它很扎实地识别出：

- memory tiering 的输入观测层本身已经成了瓶颈；
- 继续围绕 CPU/OS 侧做 profiling 小修小补，很难再有根本性提升；
- 设备侧 profiling 才是 CXL-native 方案真正值得探索的方向。

如果要说它的不足，我会认为它还停留在 **hotness-first** 范式里，没有进一步回答“热页里谁更关键”这个问题。但这不影响它作为一篇 **CXL memory management 方向很值得读的工作** 的价值。

## 适合继续追的问题
1. 如果把 NeoProf 的 profiling 信息与 **criticality model** 结合，会不会比单纯 hotness 更强？
2. NeoProf 这类 device-side profiler 是否可以扩展到：
   - 带宽拥塞感知
   - prefetch feedback
   - 访问模式分类
   - 安全/完整性元数据观察？
3. NeoMem 的设计在多租户和 memory pooling 场景中如何演化？
4. 如果未来 CXL memory 不只是“慢层”，而是包含多类设备，NeoProf 的统计抽象是否仍然足够？
5. 在真实商用 CXL 设备里，硬件厂商是否愿意提供这样的 profiling primitive？

## Takeaway
NeoMem 最重要的意义，不只是又做出了一个更快的 page migration policy，而是把 CXL memory tiering 的观察点从 CPU/OS 侧移到了设备控制器侧，证明了 **device-side profiling** 能成为 CXL-native memory management 的关键能力。即便它仍属于 hotness-first 路线，这篇论文依然是理解“为什么 CXL 时代的 tiering 需要硬件/软件协同”时非常值得读的一篇代表性工作。
