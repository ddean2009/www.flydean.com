---
slug: /14-kqueue-epoll
---

# 14. 高级IO模型之kqueue和epoll

[toc]

# 简介

任何一个程序都离不开IO，有些是很明显的IO，比如文件的读写，也有一些是不明显的IO,比如网络数据的传输等。那么这些IO都有那些模式呢？我们在使用中应该如何选择呢？高级的IO模型kqueue和epoll是怎么工作的呢？一起来看看吧。

# block IO和nonblocking IO

大家先来了解一下IO模型中最简单的两个模型:阻塞IO和非阻塞IO。

比如我们有多个线程要从一个Socket server中读取数据，那么这个读取过程其实可以分成两个部分，第一部分是等待socket的数据准备完毕，第二部分是读取对应的数据进行业务处理。对于阻塞IO来说，它的工作流程是这样的：

1. 一个线程等待socket通道数据准备完毕。
2. 当数据准备完毕之后，线程进行程序处理。
3. 其他线程等待第一个线程结束之后，继续上述流程。

为什么叫做阻塞IO呢？这是因为当一个线程正在执行的过程中，其他线程只能等待,也就是说这个IO被阻塞了。

什么叫做非阻塞IO呢？

还是上面的例子，如果在非阻塞IO中它的工作流程是这样的：

1. 一个线程尝试读取socket的数据。
2. 如果socket中数据没有准备好，那么立即返回。
3. 线程继续尝试读取socket的数据。
4. 如果socket中的数据准备好了，那么这个线程继续执行后续的程序处理步骤。

为什么叫做非阻塞IO呢？这是因为线程如果查询到socket没有数据，就会立刻返回。并不会将这个socket的IO操作阻塞。

从上面的分析可以看到，虽然非阻塞IO不会阻塞Socket，但是因为它会一直轮询Socket，所以并不会释放Socket。

# IO多路复用和select

IO多路复用有很多种模型，select是最为常见的一种。实时不管是netty还是JAVA的NIO使用的都是select模型。

select模型是怎么工作的呢？

事实上select模型和非阻塞IO有点相似，不同的是select模型中有一个单独的线程专门用来检查socket中的数据是否就绪。如果发现数据已经就绪，select可以通过之前注册的事件处理器，选择通知具体的某一个数据处理线程。

这样的好处是虽然select这个线程本身是阻塞的，但是其他用来真正处理数据的线程却是非阻塞的。并且一个select线程其实可以用来监控多个socket连接，从而提高了IO的处理效率，因此select模型被应用在多个场合中。

为了更加详细的了解select的原理，我们来看一下unix下的select方法：

```
int select(int nfds, fd_set *readfds, fd_set *writefds, fd_set *errorfds, struct timeval *timeout);
```

先来解释一下这几个参数的含义，我们知道unix系统中，一切的对象都是文件，所以这里的fd表示的就是file descriptor ,也就是文件描述符。

fds表示的是 file descriptor sets，也就是文件描述符集合。

nfds是一个整数值，表示的是文件描述符集合中最大值+1.

readfds是要检查的文件读取的描述符集合。

writefds是要检查的文件写入的描述符集合。

errorfds是要检查的文件异常描述符集合。

timeout是超时时间，表示的是等待选择完成的最大间隔。 

其工作原理是轮询所有的file descriptors,然后找到要监控的那些文件描述符，

# poll

poll和select类很类似，只是描述fd集合的方式不同. poll主要是用在POSIX系统中。

# epoll

实时上，select和poll虽然都是多路复用IO，但是他们都有些缺点。而epoll和kqueue就是对他们的优化。

epoll是linux系统中的系统命令，可以将其看做是event poll。首次是在linux核心的2.5.44版本引入的。

主要用来监控多个file descriptors其中的IO是否ready。

对于传统的select和poll来说，因为需要不断的遍历所有的file descriptors，所以每一次的select的执行效率是O(n) ,但是对于epoll来说，这个时间可以提升到O(1)。

这是因为epoll会在具体的监控事件发生的时候触发通知，所以不需要使用像select这样的轮询，其效率会更高。

epoll 使用红黑树 (RB-tree) 数据结构来跟踪当前正在监视的所有文件描述符。

epoll有三个api函数:

```
int epoll_create1(int flags);
```

用来创建一个epoll对象，并且返回它的file descriptor。传入的flags可以用来控制epoll的表现。

```
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
```

这个方法用来对epoll进行控制，可以用来监控具体哪些file descriptor和哪些事件。

这里的op可以是ADD, MODIFY 或者 DELETE。

```
int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);
```

epoll_wait用来监听使用epoll_ctl方法注册的事件。

epoll提供了两种触发模式，分别是 edge-triggered 和 level-triggered。 

如果一个使用epoll注册的pipe收到了数据，那么调用epoll_wait将会返回，表示存在要读取的数据。但是在level-triggered模式下，只要管道的缓冲区包含要读取的数据，对 epoll_wait的调用将立即返回。但是在level-triggered模式下，epoll_wait 只会在新数据写入管道后返回。

# kqueue

kqueue和epoll一样，都是用来替换select和poll的。不同的是kqueue被用在FreeBSD,NetBSD, OpenBSD, DragonFly BSD, 和 macOS中。

kqueue 不仅能够处理文件描述符事件，还可以用于各种其他通知，例如文件修改监视、信号、异步 I/O 事件 (AIO)、子进程状态更改监视和支持纳秒级分辨率的计时器，此外kqueue提供了一种方式除了内核提供的事件之外，还可以使用用户定义的事件。

kqueue提供了两个API，第一个是构建kqueue：

```
int kqueue(void);
```

第二个是创建kevent:

```
int kevent(int kq, const struct kevent *changelist, int nchanges, struct kevent *eventlist, int nevents, const struct timespec *timeout);
```

kevent中的第一个参数是要注册的kqueue，changelist是要监视的事件列表，nchanges表示要监听事件的长度，eventlist是kevent返回的事件列表,nevents表示要返回事件列表的长度，最后一个参数是timeout。

除此之外，kqueue还有一个用来初始化kevent结构体的EV_SET宏：

```
EV_SET(&kev, ident, filter, flags, fflags, data, udata);
```
# epoll和kqueue的优势

epoll和kqueue之所以比select和poll更加高级， 是因为他们充分利用操作系统底层的功能，对于操作系统来说，数据什么时候ready是肯定知道的，通过向操作系统注册对应的事件，可以避免select的轮询操作，提升操作效率。

要注意的是，epoll和kqueue需要底层操作系统的支持,在使用的时候一定要注意对应的native libraries支持。












