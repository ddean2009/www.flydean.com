---
slug: /es8-shared-memory
---

# 10. 深入理解ES8的新特性SharedArrayBuffer

# 简介

ES8引入了SharedArrayBuffer和Atomics，通过共享内存来提升workers之间或者worker和主线程之间的消息传递速度。

本文将会详细的讲解SharedArrayBuffer和Atomics的实际应用。

# Worker和Shared memory

在nodejs中，引入了worker_threads模块，可以创建Worker. 而在浏览器端，可以通过web workers来使用Worker(）来创建新的worker。

这里我们主要关注一下浏览器端web worker的使用。

我们看一个常见的worker和主线程通信的例子，主线程：

~~~js
var w = new Worker("myworker.js")

w.postMessage("hi");     // send "hi" to the worker
w.onmessage = function (ev) {
  console.log(ev.data);  // prints "ho"
}
~~~

myworker的代码：

~~~js
onmessage = function (ev) {
  console.log(ev.data);  // prints "hi"
  postMessage("ho");     // sends "ho" back to the creator
}
~~~

我们通过postMessage来发送消息，通过onmessage来监听消息。

消息是拷贝之后，经过序列化之后进行传输的。在解析的时候又会进行反序列化，从而降低了消息传输的效率。

为了解决这个问题，引入了shared memory的概念。

我们可以通过SharedArrayBuffer来创建Shared memory。

考虑下上面的例子，我们可把消息用SharedArrayBuffer封装起来，从而达到内存共享的目的。

~~~js
//发送消息
var sab = new SharedArrayBuffer(1024);  // 1KiB shared memory
w.postMessage(sab)

//接收消息
var sab;
onmessage = function (ev) {
   sab = ev.data;  // 1KiB shared memory, the same memory as in the parent
}
~~~

上面的这个例子中，消息并没有进行序列化或者转换，都使用的是共享内存。

# ArrayBuffer和Typed Array

SharedArrayBuffer和ArrayBuffer一样是最底层的实现。为了方便程序员的使用，在SharedArrayBuffer和ArrayBuffer之上，提供了一些特定类型的Array。比如Int8Array，Int32Array等等。

这些Typed Array被称为views。

我们看一个实际的例子，如果我们想在主线程中创建10w个质数，然后在worker中获取这些质数该怎么做呢？

首先看下主线程：

~~~js
var sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 100000); // 100000 primes
var ia = new Int32Array(sab);  // ia.length == 100000
var primes = new PrimeGenerator();
for ( let i=0 ; i < ia.length ; i++ )
   ia[i] = primes.next();
w.postMessage(ia);
~~~

主线程中，我们使用了Int32Array封装了SharedArrayBuffer，然后用PrimeGenerator来生成prime，存储到Int32Array中。

下面是worker的接收：

~~~js
var ia;
onmessage = function (ev) {
  ia = ev.data;        // ia.length == 100000
  console.log(ia[37]); // prints 163, the 38th prime
}
~~~

# 并发的问题和Atomics

上面我们获取到了ia[37]的值。因为是共享的，所以任何能够访问到ia[37]的线程对该值的改变，都可能影响其他线程的读取操作。

比如我们给ia[37]重新赋值为123。虽然这个操作发生了，但是其他线程什么时候能够读取到这个数据是未知的，依赖于CPU的调度等等外部因素。

为了解决这个问题，ES8引入了Atomics,我们可以通过Atomics的store和load功能来修改和监控数据的变化：

~~~js
console.log(ia[37]);  // Prints 163, the 38th prime
Atomics.store(ia, 37, 123);
~~~

我们通过store方法来向Array中写入新的数据。

然后通过load来监听数据的变化：

~~~js
while (Atomics.load(ia, 37) == 163)
  ;
console.log(ia[37]);  // Prints 123
~~~

还记得java中的重排序吗？

在java中，虚拟机在不影响程序执行结果的情况下，会对java代码进行优化，甚至是重排序。最终导致在多线程并发环境中可能会出现问题。

在JS中也是一样，比如我们给ia分别赋值如下：

~~~js
ia[42] = 314159;  // was 191
ia[37] = 123456;  // was 163
~~~

按照程序的书写顺序，是先给42赋值，然后给37赋值。

~~~js
console.log(ia[37]);
console.log(ia[42]);
~~~

但是因为重排序的原因，可能37的值变成123456之后，42的值还是原来的191。 

我们可以使用Atomics来解决这个问题，所有在Atomics.store之前的写操作，在Atomics.load发送变化之前都会发生。也就是说通过使用Atomics可以禁止重排序。

~~~js
ia[42] = 314159;  // was 191
Atomics.store(ia, 37, 123456);  // was 163

while (Atomics.load(ia, 37) == 163)
  ;
console.log(ia[37]);  // Will print 123456
console.log(ia[42]);  // Will print 314159
~~~

我们通过监测37的变化，如果发生了变化，则我们可以保证之前的42的修改已经发生。

同样的，我们知道在java中++操作并不是一个原子性操作，在JS中也一样。

在多线程环境中，我们需要使用Atomics的add方法来替代++操作，从而保证原子性。

> 注意，Atomics只适用于Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array or Uint32Array。

上面例子中，我们使用while循环来等待一个值的变化，虽然很简单，但是并不是很有效。

while循环会占用CPU资源，造成不必要的浪费。

为了解决这个问题，Atomics引入了wait和wake操作。

我们看一个应用：

~~~js
console.log(ia[37]);  // Prints 163
Atomics.store(ia, 37, 123456);
Atomics.wake(ia, 37, 1);
~~~

我们希望37的值变化之后通知监听在37上的一个数组。

~~~js
Atomics.wait(ia, 37, 163);
console.log(ia[37]);  // Prints 123456
~~~

当ia37的值是163的时候，线程等待在ia37上。直到被唤醒。

这就是一个典型的wait和notify的操作。

# 使用Atomics来创建lock

我们来使用SharedArrayBuffer和Atomics创建lock。

我们需要使用的是Atomics的CAS操作：

~~~js
    compareExchange(typedArray: Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array, index: number, expectedValue: number, replacementValue: number): number;
~~~

只有当typedArray[index]的值 = expectedValue 的时候，才会使用replacementValue来替换。 同时返回typedArray[index]的原值。

我们看下lock怎么实现：

~~~js
const UNLOCKED = 0;
const LOCKED_NO_WAITERS = 1;
const LOCKED_POSSIBLE_WAITERS = 2;

    lock() {
        const iab = this.iab;
        const stateIdx = this.ibase;
        var c;
        if ((c = Atomics.compareExchange(iab, stateIdx,
        UNLOCKED, LOCKED_NO_WAITERS)) !== UNLOCKED) {
            do {
                if (c === LOCKED_POSSIBLE_WAITERS
                || Atomics.compareExchange(iab, stateIdx,
                LOCKED_NO_WAITERS, LOCKED_POSSIBLE_WAITERS) !== UNLOCKED) {
                    Atomics.wait(iab, stateIdx,
                        LOCKED_POSSIBLE_WAITERS, Number.POSITIVE_INFINITY);
                }
            } while ((c = Atomics.compareExchange(iab, stateIdx,
            UNLOCKED, LOCKED_POSSIBLE_WAITERS)) !== UNLOCKED);
        }
    }
~~~

UNLOCKED表示目前没有上锁，LOCKED_NO_WAITERS表示已经上锁了，LOCKED_POSSIBLE_WAITERS表示上锁了，并且还有其他的worker在等待这个锁。

iab表示要上锁的SharedArrayBuffer，stateIdx是Array的index。

再看下tryLock和unlock:

~~~js

    tryLock() {
        const iab = this.iab;
        const stateIdx = this.ibase;
        return Atomics.compareExchange(iab, stateIdx, UNLOCKED, LOCKED_NO_WAITERS) === UNLOCKED;
    }

    unlock() {
        const iab = this.iab;
        const stateIdx = this.ibase;
        var v0 = Atomics.sub(iab, stateIdx, 1);
        // Wake up a waiter if there are any
        if (v0 !== LOCKED_NO_WAITERS) {
            Atomics.store(iab, stateIdx, UNLOCKED);
            Atomics.wake(iab, stateIdx, 1);
        }
    }
~~~

使用CAS我们实现了JS版本的lock。

当然，有了CAS，我们可以实现更加复杂的锁操作，感兴趣的朋友，可以自行探索。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！













