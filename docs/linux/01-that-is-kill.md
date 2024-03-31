linux系列之:告诉他，他根本不懂kill

[toc]

# 简介

和很多程序员打过交道，这些程序员可能熟知for遍历的好几种写法，但是却对写出来的程序部署的环境一无所知。我敢打赌，在spring boot出现之后，已经很少有程序员知道tomcat到底是怎么运行的了。对于他们来说，运行一个jar包就完事了。

工具的先进性确实带给我们很多便利，也提升了程序员的开发效率，同时也降低了程序员的进入门槛。今天想和大家一起讨论一下，linux中的kill命令到底是做什么用的。

可能很很多小伙伴第一次接触kill命令是同事告诉他，把进程kill掉。那么kill真的是用来杀进程的吗？

# 使用kill来杀死进程

先来看一个kill最基本，也是最常见的应用就是杀死进程。在杀死进程之前，我们需要找到这个进程ID。

一般情况下是使用ps命令找到这个进程ID。加入这个进程ID=54321。

那么接下来就可以使用kill 54321来杀死这个进程了。

更资深一点的同学，可能还会使用kill -9 54321来强制杀死这个进程。

有没有更深入的用法呢？有的，一起来看看。

# kill的深入用法

先看一下kill的命令参数到底有那些：

```
kill 
kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]
```

可以看到kill的参数是sig，也就是信号。也就是说kill的本质是向程序传递信号的。

如果使用 kill -l ，我们可以得到到底kill可以传递多少信号：

```
kill -l 
 1) SIGHUP       2) SIGINT       3) SIGQUIT      4) SIGILL       5) SIGTRAP
 6) SIGABRT      7) SIGBUS       8) SIGFPE       9) SIGKILL     10) SIGUSR1
11) SIGSEGV     12) SIGUSR2     13) SIGPIPE     14) SIGALRM     15) SIGTERM
16) SIGSTKFLT   17) SIGCHLD     18) SIGCONT     19) SIGSTOP     20) SIGTSTP
21) SIGTTIN     22) SIGTTOU     23) SIGURG      24) SIGXCPU     25) SIGXFSZ
26) SIGVTALRM   27) SIGPROF     28) SIGWINCH    29) SIGIO       30) SIGPWR
31) SIGSYS      34) SIGRTMIN    35) SIGRTMIN+1  36) SIGRTMIN+2  37) SIGRTMIN+3
38) SIGRTMIN+4  39) SIGRTMIN+5  40) SIGRTMIN+6  41) SIGRTMIN+7  42) SIGRTMIN+8
43) SIGRTMIN+9  44) SIGRTMIN+10 45) SIGRTMIN+11 46) SIGRTMIN+12 47) SIGRTMIN+13
48) SIGRTMIN+14 49) SIGRTMIN+15 50) SIGRTMAX-14 51) SIGRTMAX-13 52) SIGRTMAX-12
53) SIGRTMAX-11 54) SIGRTMAX-10 55) SIGRTMAX-9  56) SIGRTMAX-8  57) SIGRTMAX-7
58) SIGRTMAX-6  59) SIGRTMAX-5  60) SIGRTMAX-4  61) SIGRTMAX-3  62) SIGRTMAX-2
63) SIGRTMAX-1  64) SIGRTMAX
```

总共64个信号，可能不同的kill版本，信号有所不同，但是基本上都覆盖了常用的信号。

下面是一些常用信号的含义：

```
HUP     1    终端断线
INT       2    中断（同 Ctrl + C）
QUIT    3    退出（同 Ctrl + \）
TERM    15    终止
KILL      9    强制终止
CONT   18    继续（与STOP相反， fg/bg命令）
STOP    19    暂停（同 Ctrl + Z）
```

怎么看kill的版本呢？

```
/bin/kill --version
kill from util-linux 2.23.2
```

如果kill不传sig,那么将会传默认的sig=TERM，也就是15。所以上面的kill 54321和 kill -15 54321是等价的。

一般情况下，我们优先使用SIGTERM信号。这是因为当程序收到了SIGTERM信号之后，会做一些程序的清理操作，或者说是优雅的关闭。

如果传入kill -9 也就是SIGKILL，那么应用程序将无法捕捉这个信号，从而导致程序强制被关闭，有可能会照成一些异常情况，比如数据还没有保存，数据传输还没有结束等等。

> sig还有一个特殊值叫做0，如果传入0的话，那么并不会发送实际的信号，这个只是做异常检测用的。

pid就是process id，可以理解为是进程号。除了进程号之外，还可以传入一些特殊值，比如：


* 0 表示当前进程group的所有进程
* -1 表示所有PID>1的进程

还有一个特殊的pid=1，这个pid表示的是初始进程init，这个进程是不可被杀死的。

除了PID之外，我们看到kill还可以接受jobspec。job id可以使用jobs命令来列出。

# 僵尸进程和kill

上面讲到了pid=1的初始进程是不能被kill的。还有一种不能被kill的进程叫做僵尸进程。

僵尸进程是linux程序中一个非常独特的状态，它表示的是进程已经结束了，但是又还没有完全死亡，就像僵尸一样。

linux中的5大进程状态分别是：RUNNING：正在运行或等待运行状态，UNINTERRUPTABLE：不可中断阻塞状态，INTERRUPTABLE：可中断阻塞状态，STOPPED：挂起状态和ZOMBIE：僵尸状态。

那么什么是僵尸进程呢？

僵尸进程指的是程序在退出之后，该进程并不是马上消失的，而是会保留一个被称为僵尸的数据结构。这个数据结构很特殊，因为其没有内存空间，没有可执行的代码，当然也不可以被调度。它只是在进程列表中占有一个位置，记录了该进程退出时候的各种信息。

僵尸进程主要是保留进程退出的现场，供父进程或者系统管理员进行分析使用的，所以僵尸进程是交由父进程来进行收集和释放的。因为僵尸进程已经退出了，所以使用kill是没有用的，只能等待其父进程退出，才能真正的退出。

怎么查看僵尸进程呢？最简单的方法就是使用top命令：

```
top - 14:34:38 up 305 days,  4:23,  2 users,  load average: 0.20, 0.29, 0.47
Tasks:  93 total,   1 running,  92 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.0 us,  0.7 sy,  0.0 ni, 97.3 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
KiB Mem :  1882008 total,   525524 free,   311440 used,  1045044 buff/cache
KiB Swap:        0 total,        0 free,        0 used.  1382560 avail Mem 
```

上面的输出，我们可以看到里面有0个zombie。

# java thread dump

kill还有一个非常有用的地方就是生成java程序的thread dump，将当前java程序的线程信息dump出来，可以进行一些有用的分析，比如死锁分析等。

怎么对java进程做thread dump呢？很简单使用kill -3 命令即可：

```
kill -3 <pid>
```

从上面我们的介绍可以指定3代表的信号是SIGQUIT。这说明JVM内置了这个信号的捕捉，如果接收到了这个信号，则会dump当前的线程信息。

java thread dump在对java进行线程分析的时候非常有用。

# 总结

本文介绍了kill的深入用法和底层的工作原理，还介绍了kill的几个应用，希望下次有人再问你kill到底是什么的时候，大家都可以很自豪的告诉他！