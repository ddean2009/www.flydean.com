---
slug: /Java-Thread-Affinity
---

# 1. java高级用法之:绑定CPU的线程Thread-Affinity



# 简介

在现代计算机系统中，可以有多个CPU，每个CPU又可以有多核。为了充分利用现代CPU的功能，JAVA中引入了多线程，不同的线程可以同时在不同CPU或者不同CPU核中运行。但是对于JAVA程序猿来说创建多少线程是可以自己控制的，但是线程到底运行在哪个CPU上，则是一个黑盒子，一般来说很难得知。

但是如果是不同CPU核对同一线程进行调度，则可能会出现CPU切换造成的性能损失。一般情况下这种损失是比较小的，但是如果你的程序特别在意这种CPU切换带来的损耗，那么可以试试今天要讲的Java Thread Affinity.

# Java Thread Affinity简介

java thread Affinity是用来将JAVA代码中的线程绑定到CPU特定的核上，用来提升程序运行的性能。

很显然，要想和底层的CPU进行交互，java thread Affinity一定会用到JAVA和native方法进行交互的方法，JNI虽然是JAVA官方的JAVA和native方法进行交互的方法，但是JNI在使用起来比较繁琐。所以java thread Affinity实际使用的是JNA，JNA是在JNI的基础上进行改良的一种和native方法进行交互的库。

先来介绍CPU中几个概念，分别是CPU，CPU socket和CPU core。

首先是CPU，CPU的全称就是central processing unit,又叫做中央处理器,就是用来进行任务处理的关键核心。

那么什么是CPU socket呢？所谓socket就是插CPU的插槽，如果组装过台式机的同学应该都知道,CPU就是安装在Socket上的。

CPU Core指的是CPU中的核数，在很久之前CPU都是单核的，但是随着多核技术的发展，一个CPU中可以包含多个核，而CPU中的核就是真正的进行业务处理的单元。

如果你是在linux机子上，那么可以通过使用lscpu命令来查看系统的CPU情况，如下所示：

```
Architecture:          x86_64
CPU op-mode(s):        32-bit, 64-bit
Byte Order:            Little Endian
CPU(s):                1
On-line CPU(s) list:   0
Thread(s) per core:    1
Core(s) per socket:    1
Socket(s):             1
NUMA node(s):          1
Vendor ID:             GenuineIntel
CPU family:            6
Model:                 94
Model name:            Intel(R) Xeon(R) Gold 6148 CPU @ 2.40GHz
Stepping:              3
CPU MHz:               2400.000
BogoMIPS:              4800.00
Hypervisor vendor:     KVM
Virtualization type:   full
L1d cache:             32K
L1i cache:             32K
L2 cache:              4096K
L3 cache:              28160K
NUMA node0 CPU(s):     0
Flags:                 fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ss syscall nx pdpe1gb rdtscp lm constant_tsc rep_good nopl eagerfpu pni pclmulqdq ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand hypervisor lahf_lm abm 3dnowprefetch invpcid_single fsgsbase bmi1 hle avx2 smep bmi2 erms invpcid rtm mpx avx512f avx512dq rdseed adx smap avx512cd avx512bw avx512vl xsaveopt xsavec xgetbv1 arat
```

从上面的输出我们可以看到，这个服务器有一个socket，每个socket有一个core，每个core可以同时处理1个线程。

这些CPU的信息可以称为CPU layout。在linux中CPU的layout信息是存放在/proc/cpuinfo中的。

在Java Thread Affinity中有一个CpuLayout接口用来和这些信息进行对应：

```
public interface CpuLayout {
    
    int cpus();

    int sockets();

    int coresPerSocket();

    int threadsPerCore();

    int socketId(int cpuId);

    int coreId(int cpuId);

    int threadId(int cpuId);
}
```

根据CPU layout的信息， AffinityStrategies提供了一些基本的Affinity策略，用来安排不同的thread之间的分布关系，主要有下面几种：

```
    SAME_CORE - 运行在同一个core中。
    SAME_SOCKET - 运行在同一个socket中，但是不在同一个core上。
    DIFFERENT_SOCKET - 运行在不同的socket中
    DIFFERENT_CORE - 运行在不同的core上
    ANY - 任何情况都可以

```

这些策略也都是根据CpuLayout的socketId和coreId来进行区分的，我们以SAME_CORE为例，按下它的具体实现：

```
SAME_CORE {
        @Override
        public boolean matches(int cpuId, int cpuId2) {
            CpuLayout cpuLayout = AffinityLock.cpuLayout();
            return cpuLayout.socketId(cpuId) == cpuLayout.socketId(cpuId2) &&
                    cpuLayout.coreId(cpuId) == cpuLayout.coreId(cpuId2);
        }
    }
```

Affinity策略可以有顺序，在前面的策略会首先匹配，如果匹配不上则会选择第二策略，依此类推。

# AffinityLock的使用

接下来我们看下Affinity的具体使用,首先是获得一个CPU的lock,在JAVA7之前，我们可以这样写：

```
AffinityLock al = AffinityLock.acquireLock();
try {
     // do some work locked to a CPU.
} finally {
     al.release();
}
```

在JAVA7之后，可以这样写：

```
try (AffinityLock al = AffinityLock.acquireLock()) {
    // do some work while locked to a CPU.
}
```

acquireLock方法可以为线程获得任何可用的cpu。这个是一个粗粒度的lock。如果想要获得细粒度的core，可以用acquireCore:

```
try (AffinityLock al = AffinityLock.acquireCore()) {
    // do some work while locked to a CPU.
}
```

acquireLock还有一个bind参数，表示是否将当前的线程绑定到获得的cpu lock上，如果bind参数=true，那么当前的thread会在acquireLock中获得的CPU上运行。如果bind参数=false，表示acquireLock会在未来的某个时候进行bind。


上面我们提到了AffinityStrategy，这个AffinityStrategy可以作为acquireLock的参数使用：

```
    public AffinityLock acquireLock(AffinityStrategy... strategies) {
        return acquireLock(false, cpuId, strategies);
    }
```

通过调用当前AffinityLock的acquireLock方法，可以为当前的线程分配和之前的lock策略相关的AffinityLock。

AffinityLock还提供了一个dumpLocks方法，用来查看当前CPU和thread的绑定状态。我们举个例子：

```
private static final ExecutorService ES = Executors.newFixedThreadPool(4,
           new AffinityThreadFactory("bg", SAME_CORE, DIFFERENT_SOCKET, ANY));

for (int i = 0; i < 12; i++)
            ES.submit(new Callable<Void>() {
                @Override
                public Void call() throws InterruptedException {
                    Thread.sleep(100);
                    return null;
                }
            });
        Thread.sleep(200);
        System.out.println("\nThe assignment of CPUs is\n" + AffinityLock.dumpLocks());
        ES.shutdown();
        ES.awaitTermination(1, TimeUnit.SECONDS);
```

上面的代码中，我们创建了一个4个线程的线程池，对应的ThreadFactory是AffinityThreadFactory，给线程池起名bg，并且分配了3个AffinityStrategy。 意思是首先分配到同一个core上，然后到不同的socket上，最后是任何可用的CPU。

然后具体执行的过程中，我们提交了12个线程，但是我们的Thread pool最多只有4个线程，可以预见， AffinityLock.dumpLocks方法返回的结果中只有4个线程会绑定CPU，一起来看看：

```
The assignment of CPUs is
0: CPU not available
1: Reserved for this application
2: Reserved for this application
3: Reserved for this application
4: Thread[bg-4,5,main] alive=true
5: Thread[bg-3,5,main] alive=true
6: Thread[bg-2,5,main] alive=true
7: Thread[bg,5,main] alive=true
```

从输出结果可以看到，CPU0是不可用的。其他7个CPU是可用的，但是只绑定了4个线程，这和我们之前的分析是匹配的。

接下来，我们把AffinityThreadFactory的AffinityStrategy修改一下，如下所示：

```
new AffinityThreadFactory("bg", SAME_CORE)
```

表示线程只会绑定到同一个core中，因为在当前的硬件中，一个core同时只能支持一个线程的绑定，所以可以预见最后的结果只会绑定一个线程,运行结果如下：

```
The assignment of CPUs is
0: CPU not available
1: Reserved for this application
2: Reserved for this application
3: Reserved for this application
4: Reserved for this application
5: Reserved for this application
6: Reserved for this application
7: Thread[bg,5,main] alive=true
```

可以看到只有第一个线程绑定了CPU，和之前的分析相匹配。

# 使用API直接分配CPU

上面我们提到的AffinityLock的acquireLock方法其实还可以接受一个CPU id参数，直接用来获得传入CPU id的lock。这样后续线程就可以在指定的CPU上运行。

```
    public static AffinityLock acquireLock(int cpuId) {
        return acquireLock(true, cpuId, AffinityStrategies.ANY);
    }
```

实时上这种Affinity是存放在BitSet中的，BitSet的index就是cpu的id，对应的value就是是否获得锁。

先看下setAffinity方法的定义：

```
    public static void setAffinity(int cpu) {
        BitSet affinity = new BitSet(Runtime.getRuntime().availableProcessors());
        affinity.set(cpu);
        setAffinity(affinity);
    }
```

再看下setAffinity的使用：

```
long currentAffinity = AffinitySupport.getAffinity();
Affinity.setAffinity(1L << 5); // lock to CPU 5.
```

> 注意，因为BitSet底层是用Long来进行数据存储的，所以这里的index是bit index，所以我们需要对十进制的CPU index进行转换。

# 总结

Java Thread Affinity可以从JAVA代码中对程序中Thread使用的CPU进行控制，非常强大，大家可以运用起来。














