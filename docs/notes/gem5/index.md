# gem5手册

> 面向 **完全没接触过 gem5** 的读者。目标不是“知道 gem5 是什么”，而是 **能在自己机器上把它编译出来、跑起来、看懂输出、改配置、加缓存、写一个最小 SimObject、会用调试输出、理解事件驱动，并知道 Ruby/SLICC 该怎么入门**。  
> 参考来源：gem5 官方 *Learning gem5* 教程与对应 Markdown 源文件。  
> 官方文档入口：<https://www.gem5.org/documentation/learning_gem5/introduction/>  
> 官方仓库：<https://github.com/gem5/gem5>

---

## 0. 先说结论：新手应该怎么学 gem5

如果你第一次接触 gem5，不要一上来就冲 Ruby、协议状态机、全系统启动。更合理的顺序是：

1. **先把 gem5 编译成功**
2. **先跑通一个最小例子**
3. **学会看 `m5out/config.ini` 和 `m5out/stats.txt`**
4. **理解 Python 配置脚本到底在干什么**
5. **自己加 L1/L2 cache**
6. **写一个最小自定义 SimObject**
7. **学 debug flags、事件、参数传递**
8. **再去碰 memory object / simple cache**
9. **最后再看 Ruby / SLICC**

如果你现在目标是“看完以后就会用”，那最重要的是两件事：

- **每一步都要有能直接复制运行的命令**
- **每次运行之后都要知道该看什么文件、什么输出才算成功**

---

## 1. gem5 到底是什么

gem5 本质上是一个：

- **模块化**
- **离散事件驱动**
- **可扩展**
- **面向计算机体系结构研究**

的模拟平台。

它最常见的工作流不是 GUI，而是：

- 用 **Python 配置脚本** 组装系统
- 用 **C++** 扩展模型
- 用 **SLICC** 写 Ruby 一致性协议
- 运行 gem5
- 看 `config.ini`、`stats.txt`、debug 输出
- 修改，再跑，再分析

你可以粗略把 gem5 分成三层：

- **Python**：描述“我要模拟一台什么机器”
- **C++**：描述“机器内部组件如何工作”
- **SLICC**：描述“Ruby 协议状态机如何工作”

---

## 2. Ubuntu 上准备环境

### 2.1 安装依赖

推荐直接执行：

```bash
sudo apt update
sudo apt install -y \
    build-essential \
    git \
    m4 \
    scons \
    zlib1g zlib1g-dev \
    libprotobuf-dev protobuf-compiler libprotoc-dev \
    libgoogle-perftools-dev \
    python3 python3-dev
```

### 2.2 这些包是干什么的

- `build-essential`：GCC/G++ 等编译环境
- `git`：拉 gem5 源码
- `m4`：部分构建流程会用到
- `scons`：gem5 的主构建工具
- `zlib1g-dev`：压缩相关依赖
- `protobuf-*`：trace / protobuf 支持
- `python3-dev`：嵌入式 Python 构建所需

### 2.3 检查版本

```bash
gcc --version
g++ --version
python3 --version
scons --version
```

建议至少满足：

- GCC：10+
- Python：3.6+
- SCons：3.0+

---

## 3. 拉取源码并进入目录

```bash
cd ~
git clone https://github.com/gem5/gem5
cd gem5
```

你现在最需要认识的目录：

- `SConstruct`：SCons 构建入口
- `configs/`：配置脚本
- `src/`：gem5 源码
- `build/`：编译输出目录
- `tests/`：测试程序
- `build_opts/`：预定义构建选项

---

## 4. 第一次编译 gem5

### 4.1 推荐命令

```bash
python3 `which scons` build/ALL/gem5.opt -j$(nproc)
```

如果你机器配置一般，也可以：

```bash
python3 `which scons` build/ALL/gem5.opt -j8
```

### 4.2 这条命令是什么意思

- `python3 \`which scons\``：明确用 Python 3 调用 SCons
- `build/ALL/gem5.opt`：构建目标
- `ALL`：包含所有 ISA，通常也方便后续实验
- `gem5.opt`：优化版，保留调试符号，日常最常用
- `-j...`：并行编译线程数

### 4.3 成功标志

编译成功后，重点看：

```bash
ls -l build/ALL/gem5.opt
```

如果文件存在，说明成功。

你也会在终端里看到类似：

```txt
[    LINK]  -> ALL/gem5.opt
scons: done building targets.
```

---

## 5. 三种常见 gem5 二进制

### `gem5.debug`
- 无优化
- 调试最方便
- 很慢

### `gem5.opt`
- 开启优化
- 保留调试符号
- **最推荐日常使用**

### `gem5.fast`
- 性能最好
- 调试最差
- 适合模型稳定以后跑大量实验

**新手默认使用 `gem5.opt`。**

---

## 6. 常见编译问题与处理

### 6.1 GCC 太旧

检查：

```bash
g++ --version
```

如果版本太旧，就升级系统编译器。

---

### 6.2 Python 找错

建议始终用：

```bash
python3 `which scons` build/ALL/gem5.opt -j$(nproc)
```

不要偷懒直接 `scons ...`，否则环境不一致时会出问题。

---

### 6.3 protobuf 报错

先清理后重编：

```bash
python3 `which scons` --clean
rm -rf build/
python3 `which scons` build/ALL/gem5.opt -j$(nproc)
```

---

### 6.4 缺 `m4`

```bash
sudo apt install -y m4
```

---

## 7. 第一个能跑的 gem5：官方 Demo Board

> 这一步的目标是：**确认你的 gem5 能跑起来**。

创建脚本：

```bash
mkdir -p configs/tutorial/part1
cat > configs/tutorial/part1/simple.py <<'PY'
from gem5.prebuilt.demo.x86_demo_board import X86DemoBoard
from gem5.resources.resource import obtain_resource
from gem5.simulate.simulator import Simulator

board = X86DemoBoard()

board.set_workload(
    obtain_resource("x86-ubuntu-24.04-boot-no-systemd")
)

sim = Simulator(board)
sim.run(20_000_000_000)  # 20 billion ticks = 20 ms
PY
```

运行：

```bash
./build/ALL/gem5.opt configs/tutorial/part1/simple.py
```

### 7.1 这段代码在做什么

- `X86DemoBoard()`：创建一台预置好的 x86 demo 系统
- `obtain_resource(...)`：下载 workload 所需资源
- `Simulator(board)`：创建模拟器
- `sim.run(...)`：运行指定 tick 数

### 7.2 你会看到什么输出

典型输出里会有：

```txt
gem5 Simulator System.
...
info: Entering event queue @ 0. Starting simulation...
```

### 7.3 warning 正不正常

非常正常。比如：

- demo board 只是演示用途
- 某些 DRAM 容量 warning
- 某些 x86 指令 warning
- legacy stat warning

先学会分辨：

- `warn:`：通常还能继续
- `fatal:` / `panic:`：必须处理

---

## 8. 第二个能跑的 gem5：自己搭一个最小系统

> 这是最关键的入门步骤。你必须理解：**gem5 的本质是用 Python 配置脚本拼装 SimObject。**

创建最小脚本：

```bash
cat > configs/tutorial/part1/simple_classic.py <<'PY'
import m5
from m5.objects import *

system = System()

# 时钟域
system.clk_domain = SrcClockDomain()
system.clk_domain.clock = '1GHz'
system.clk_domain.voltage_domain = VoltageDomain()

# 内存模式与地址空间
system.mem_mode = 'timing'
system.mem_ranges = [AddrRange('512MB')]

# CPU
system.cpu = X86TimingSimpleCPU()

# 系统总线
system.membus = SystemXBar()

# CPU 连接到总线
system.cpu.icache_port = system.membus.cpu_side_ports
system.cpu.dcache_port = system.membus.cpu_side_ports

# x86 中断控制器
system.cpu.createInterruptController()
system.cpu.interrupts[0].pio = system.membus.mem_side_ports
system.cpu.interrupts[0].int_requestor = system.membus.cpu_side_ports
system.cpu.interrupts[0].int_responder = system.membus.mem_side_ports

# 内存控制器
system.mem_ctrl = DDR3_1600_8x8()
system.mem_ctrl.range = system.mem_ranges[0]
system.mem_ctrl.port = system.membus.mem_side_ports

# system port
system.system_port = system.membus.cpu_side_ports

# 工作负载
process = Process()
process.cmd = ['tests/test-progs/hello/bin/x86/linux/hello']
system.cpu.workload = process
system.cpu.createThreads()

root = Root(full_system=False, system=system)
m5.instantiate()

print('Beginning simulation!')
exit_event = m5.simulate()
print('Exiting @ tick {} because {}'.format(m5.curTick(), exit_event.getCause()))
PY
```

运行：

```bash
./build/ALL/gem5.opt configs/tutorial/part1/simple_classic.py
```

---

## 9. 这份最小配置脚本怎么理解

### 9.1 `system = System()`

这是整台模拟机器的根对象。

---

### 9.2 时钟域

```python
system.clk_domain = SrcClockDomain()
system.clk_domain.clock = '1GHz'
system.clk_domain.voltage_domain = VoltageDomain()
```

表示：

- 系统时钟 1GHz
- 使用默认电压域

---

### 9.3 内存模式

```python
system.mem_mode = 'timing'
```

常见模式：

- `timing`：考虑时序，做实验最常用
- `atomic`：更快，但不是严肃 timing 实验模式
- `functional`：功能访问，不考虑时序

**新手请优先用 `timing`。**

---

### 9.4 CPU 模型

```python
system.cpu = X86TimingSimpleCPU()
```

这表示：

- ISA：x86
- CPU 模型：TimingSimpleCPU

推荐理解顺序：

- `TimingSimpleCPU`：最适合入门
- `MinorCPU`：适合学习流水线
- `O3CPU`：适合做更复杂微结构研究

---

### 9.5 总线与端口连接

```python
system.membus = SystemXBar()
system.cpu.icache_port = system.membus.cpu_side_ports
system.cpu.dcache_port = system.membus.cpu_side_ports
```

意思是：

- 建一个系统总线
- CPU 的 I/D 端口都接到这条总线上

这里还没有显式 cache，所以它是最简系统。

---

### 9.6 x86 中断控制器

```python
system.cpu.createInterruptController()
```

x86 配置里这一段很常见，后面 ARM / RISC-V 的写法不一定一样。

结论：**不同 ISA 的配置不能只换一个 binary 就完事。**

---

### 9.7 工作负载

```python
process = Process()
process.cmd = ['tests/test-progs/hello/bin/x86/linux/hello']
```

这表示 SE 模式下跑一个 hello 程序。

---

## 10. 跑完后必须学会看 `m5out`

默认输出目录是：

```bash
m5out/
```

重点文件：

- `m5out/config.ini`
- `m5out/config.json`
- `m5out/stats.txt`

你必须养成习惯：

```bash
less m5out/config.ini
less m5out/stats.txt
```

---

## 11. `config.ini` 为什么最重要

`config.ini` 是 **最终实际被实例化出来的系统配置快照**。

也就是说：

> 你“以为脚本写了什么”不重要，真正生效了什么，以 `config.ini` 为准。

### 推荐检查命令

```bash
grep -n "type=" m5out/config.ini | head
grep -n "cpu" m5out/config.ini | head -20
grep -n "clock" m5out/config.ini | head -20
grep -n "cache" m5out/config.ini | head -40
```

### 一个典型误区

你以为自己设置了 cache size：

```bash
--l1d_size=64kB
```

但如果脚本根本没创建 cache，这个参数可能完全没起作用。

所以一定要看 `config.ini`。

---

## 12. `stats.txt` 怎么看

先看这些全局统计：

```bash
grep -E "simTicks|simInsts|hostSeconds|hostInstRate" m5out/stats.txt
```

常见字段：

- `simTicks`：模拟经过的 tick
- `simInsts`：提交的指令数
- `hostSeconds`：宿主机真实运行时间
- `hostInstRate`：宿主机每秒模拟多少指令

### 如果你加了 cache

可以搜 miss/hit：

```bash
grep -Ei "cache.*miss|cache.*hit" m5out/stats.txt | head -40
```

---

## 13. 使用 gem5 自带默认脚本：快，但别盲信

经典写法：

```bash
build/X86/gem5.opt configs/example/se.py \
    --cmd=tests/test-progs/hello/bin/x86/linux/hello
```

### 改成 timing CPU

```bash
build/X86/gem5.opt configs/example/se.py \
    --cmd=tests/test-progs/hello/bin/x86/linux/hello \
    --cpu-type=TimingSimpleCPU
```

### 加 L1 cache

```bash
build/X86/gem5.opt configs/example/se.py \
    --cmd=tests/test-progs/hello/bin/x86/linux/hello \
    --cpu-type=TimingSimpleCPU \
    --caches \
    --l1d_size=64kB \
    --l1i_size=16kB
```

### 验证 cache 真的存在

```bash
grep -n "dcache" m5out/config.ini | head
grep -n "icache" m5out/config.ini | head
```

如果看到对应对象，才算真的建出来。

---

## 14. 自己加 L1 / L2 cache

### 14.1 新建 `caches.py`

```bash
cat > configs/tutorial/part1/caches.py <<'PY'
from m5.objects import Cache

class L1Cache(Cache):
    assoc = 2
    tag_latency = 2
    data_latency = 2
    response_latency = 2
    mshrs = 4
    tgts_per_mshr = 20

    def connectCPU(self, cpu):
        raise NotImplementedError

    def connectBus(self, bus):
        self.mem_side = bus.cpu_side_ports

class L1ICache(L1Cache):
    size = '16kB'
    def connectCPU(self, cpu):
        self.cpu_side = cpu.icache_port

class L1DCache(L1Cache):
    size = '64kB'
    def connectCPU(self, cpu):
        self.cpu_side = cpu.dcache_port

class L2Cache(Cache):
    size = '256kB'
    assoc = 8
    tag_latency = 20
    data_latency = 20
    response_latency = 20
    mshrs = 20
    tgts_per_mshr = 12

    def connectCPUSideBus(self, bus):
        self.cpu_side = bus.mem_side_ports

    def connectMemSideBus(self, bus):
        self.mem_side = bus.cpu_side_ports
PY
```

### 14.2 新建带 cache 的脚本

```bash
cat > configs/tutorial/part1/simple_cache.py <<'PY'
import m5
from m5.objects import *
from caches import L1ICache, L1DCache, L2Cache

system = System()
system.clk_domain = SrcClockDomain()
system.clk_domain.clock = '1GHz'
system.clk_domain.voltage_domain = VoltageDomain()

system.mem_mode = 'timing'
system.mem_ranges = [AddrRange('512MB')]

system.cpu = X86TimingSimpleCPU()

system.l1i = L1ICache()
system.l1d = L1DCache()
system.l2bus = L2XBar()
system.l2cache = L2Cache()
system.membus = SystemXBar()

system.l1i.connectCPU(system.cpu)
system.l1d.connectCPU(system.cpu)

system.l1i.connectBus(system.l2bus)
system.l1d.connectBus(system.l2bus)

system.l2cache.connectCPUSideBus(system.l2bus)
system.l2cache.connectMemSideBus(system.membus)

system.cpu.createInterruptController()
system.cpu.interrupts[0].pio = system.membus.mem_side_ports
system.cpu.interrupts[0].int_requestor = system.membus.cpu_side_ports
system.cpu.interrupts[0].int_responder = system.membus.mem_side_ports

system.mem_ctrl = DDR3_1600_8x8()
system.mem_ctrl.range = system.mem_ranges[0]
system.mem_ctrl.port = system.membus.mem_side_ports

system.system_port = system.membus.cpu_side_ports

process = Process()
process.cmd = ['tests/test-progs/hello/bin/x86/linux/hello']
system.cpu.workload = process
system.cpu.createThreads()

root = Root(full_system=False, system=system)
m5.instantiate()

print('Beginning simulation!')
exit_event = m5.simulate()
print('Exiting @ tick {} because {}'.format(m5.curTick(), exit_event.getCause()))
PY
```

运行：

```bash
./build/ALL/gem5.opt configs/tutorial/part1/simple_cache.py
```

### 14.3 运行后检查 cache 是否真的存在

```bash
grep -n "\[system.l1i\]" m5out/config.ini
grep -n "\[system.l1d\]" m5out/config.ini
grep -n "\[system.l2cache\]" m5out/config.ini
```

---

## 15. 学会写最小 SimObject

> 这是从“会跑 gem5”走向“会改 gem5”的第一步。

### 15.1 建目录

```bash
mkdir -p src/learning_gem5/part2
```

### 15.2 Python 侧声明：`HelloObject.py`

```bash
cat > src/learning_gem5/part2/HelloObject.py <<'PY'
from m5.params import *
from m5.SimObject import SimObject

class HelloObject(SimObject):
    type = 'HelloObject'
    cxx_header = 'learning_gem5/part2/hello_object.hh'
PY
```

### 15.3 头文件：`hello_object.hh`

```bash
cat > src/learning_gem5/part2/hello_object.hh <<'CPP'
#ifndef __LEARNING_GEM5_HELLO_OBJECT_HH__
#define __LEARNING_GEM5_HELLO_OBJECT_HH__

#include "params/HelloObject.hh"
#include "sim/sim_object.hh"

namespace gem5
{

class HelloObject : public SimObject
{
  public:
    HelloObject(const HelloObjectParams &p);
    void startup() override;
};

} // namespace gem5

#endif
CPP
```

### 15.4 源文件：`hello_object.cc`

```bash
cat > src/learning_gem5/part2/hello_object.cc <<'CPP'
#include "learning_gem5/part2/hello_object.hh"

#include <iostream>

namespace gem5
{

HelloObject::HelloObject(const HelloObjectParams &p)
    : SimObject(p)
{
    std::cout << "HelloObject created!" << std::endl;
}

void
HelloObject::startup()
{
    std::cout << "HelloObject startup() called!" << std::endl;
}

} // namespace gem5
CPP
```

### 15.5 SConscript

```bash
cat > src/learning_gem5/part2/SConscript <<'PY'
Import('*')

SimObject('HelloObject.py', sim_objects=['HelloObject'])
Source('hello_object.cc')
PY
```

### 15.6 重新编译

```bash
python3 `which scons` build/ALL/gem5.opt -j$(nproc)
```

### 15.7 写一个测试脚本实例化它

```bash
cat > configs/tutorial/part2/hello_test.py <<'PY'
import m5
from m5.objects import *
from m5.objects.HelloObject import HelloObject

root = Root(full_system=False)
root.hello = HelloObject()

m5.instantiate()
print('Instantiated')
m5.simulate(1)
PY
```

运行：

```bash
mkdir -p configs/tutorial/part2
./build/ALL/gem5.opt configs/tutorial/part2/hello_test.py
```

如果成功，你应该能看到类似：

```txt
HelloObject created!
HelloObject startup() called!
```

---

## 16. 正确的调试方式：debug flags

不要到处 `printf`。gem5 推荐用 debug flags。

### 16.1 给对象加 debug flag

这部分官方示例更完整，但你先记住使用方式：

运行时加：

```bash
./build/ALL/gem5.opt --debug-flags=HelloObject configs/tutorial/part2/hello_test.py
```

如果你后面真的在 C++ 里接入了 debug flag，就可以只看该模块输出，而不是淹没在整个模拟器日志里。

### 16.2 新手建议

- 普通验证：先用 `std::cout`
- 稍复杂调试：改用 debug flags
- 大规模协议/内存系统调试：必须系统化使用 debug flags

---

## 17. 理解事件驱动：gem5 不是 while 循环模拟器

gem5 的核心执行模型是：**事件驱动**。

也就是说，很多事情不是“每拍都检查一次”，而是：

- 现在注册一个事件
- 未来某个 tick 到时再执行

### 17.1 你需要知道的最小结论

- `startup()`：可用于模拟开始时注册事件
- 组件的行为往往由 event queue 推动
- 如果不理解事件，后面写 SimObject 和 memory object 会很痛苦

所以：

> **gem5 的本质不是“顺序程序”，而是“时间轴上的事件系统”。**

---

## 18. 给 SimObject 加参数

你后面很快就会需要让对象“可配置”，而不是写死。

### 18.1 Python 侧加参数

```python
from m5.params import *
from m5.SimObject import SimObject

class HelloObject(SimObject):
    type = 'HelloObject'
    cxx_header = 'learning_gem5/part2/hello_object.hh'
    time_to_wait = Param.Latency('2ns', 'Time before firing event')
    number_of_fires = Param.Int(5, 'How many times to print')
```

### 18.2 在配置脚本里赋值

```python
root.hello = HelloObject(time_to_wait='5ns', number_of_fires=10)
```

### 18.3 为什么这很重要

因为真正有研究价值的模型必须：

- 可参数化
- 可复现实验条件
- 可批量 sweep 参数

---

## 19. 内存对象：你必须理解 port 和 packet

进入 memory object 之前，先记最重要的概念：

- **cpu_side port**：接上游请求
- **mem_side port**：往下游发请求
- **timing 请求**：最关键，做 timing 模拟要靠它
- **atomic 请求**：更快，但不是严肃 timing
- **functional 请求**：功能访问

如果你后面去写：

- simple memory object
- simple cache
- 自定义互连组件

本质上都在做一件事：

> **处理 request / response packet 在不同 port 间的流动。**

---

## 20. simple cache 怎么学

官方后续章节会带你写一个 very small cache。你应该按这个思路学：

1. 先看 Python 侧参数声明
2. 再看 C++ 里端口定义
3. 再看 hit / miss 逻辑
4. 最后看 timing response 如何返回

如果你现在还没完全看懂，不要急。你先确保自己已经做到：

- 会写普通配置脚本
- 会写最小 SimObject
- 知道事件和参数怎么用

再去啃 simple cache，会轻松很多。

---

## 21. Ruby / SLICC：新手怎么入门才不会炸

Ruby 是 gem5 里更高级的内存系统和一致性建模部分。

### 21.1 Ruby 是什么

Ruby 提供：

- 更细致的 cache/memory 建模
- 一致性协议建模
- 网络模型

### 21.2 SLICC 是什么

SLICC 是一种描述协议状态机的语言，用来写：

- 状态
- 事件
- 动作
- 转移

### 21.3 为什么新手不要一上来就学 Ruby

因为你会同时面对：

- 协议语义
- 状态机
- 消息缓冲
- 网络
- 配置脚本
- 调试 trace

这非常容易直接劝退。

### 21.4 正确入门方式

顺序建议：

1. 先读 Ruby introduction
2. 再读 MSI 教学协议
3. 再看状态机声明
4. 再看 actions
5. 再看 transitions
6. 最后再跑 simple Ruby system

别反过来。

---

## 22. gem5 101 应该怎么用

`gem5 101` 更像课程作业，不是最适合零基础入门的主线。

但它很适合你在掌握基础后拿来练手：

- Homework 1：跑平台、看 stats
- Homework 2：改 ISA 指令
- Homework 3：看流水线与功能单元
- Homework 4：分支 vs 条件移动
- Homework 5：cache replacement policy
- Homework 6：更偏并行/多核/GPU

### 我的建议

如果你目标是“先会用 gem5”：

- 先学本文前 20 节
- 再拿 gem5 101 当练习题

---

## 23. 你现在应该会的事情（实操检查单）

如果你已经做到了下面这些，说明你是真的入门了，不是“看懂了概念”：

- [ ] 能在 Ubuntu 上安装依赖并编译出 `build/ALL/gem5.opt`
- [ ] 能运行官方 Demo Board 脚本
- [ ] 能写一个最小 classic 配置脚本
- [ ] 知道 `timing` 和 `atomic` 的区别
- [ ] 会看 `m5out/config.ini`
- [ ] 会看 `m5out/stats.txt`
- [ ] 会用 `configs/example/se.py` 跑 hello
- [ ] 知道为什么一定要检查 cache 是否真的建出来
- [ ] 能自己加 L1/L2 cache
- [ ] 能写一个最小 SimObject
- [ ] 知道参数是怎么从 Python 传到 C++ 的
- [ ] 知道 gem5 是事件驱动模拟器
- [ ] 知道 Ruby / SLICC 应该怎么开始学

---

## 24. 我给你的建议：下一步最值得做什么

如果你现在真的想把 gem5 学会，而不是只停留在“知道它能干嘛”，下一步最值得做的是：

### 路线 A：先把基础跑熟

按顺序完成：

1. `simple.py`
2. `simple_classic.py`
3. `simple_cache.py`
4. 比较有/无 cache 时 `stats.txt` 的差异

### 路线 B：开始改模型

按顺序完成：

1. 最小 `HelloObject`
2. 给它加参数
3. 给它加事件
4. 给它加 debug 输出

### 路线 C：准备进阶到 Ruby

前提是 A/B 都已经做过。

---

## 25. 总结

gem5 最难的地方，不是安装和命令本身，而是：

- 你到底在模拟什么
- 参数到底有没有生效
- 输出应该怎么看
- 模型内部到底怎么跑

所以正确的入门方式不是背命令，而是建立这个习惯：

> **写脚本 → 跑起来 → 看 `config.ini` → 看 `stats.txt` → 改参数 → 再验证**

如果你能把本文里的步骤都亲手跑一遍，你就已经不算“不会 gem5”了。

你会进入下一阶段：

- 能自己搭实验平台
- 能自己改简单模型
- 能开始做真正有研究意义的实验
