---
slug: /0001-java-do-you-know-list
---

# 4. 并发的List


java中有很多list，但是原生支持并发的并不多，我们在多线程的环境中如果想同时操作同一个list的时候，就涉及到了一个并发的过程，这时候我们就需要选择自带有并发属性的list，那么java中的并发list到底有哪些呢？今天要给大家介绍的是`ArrayList`、`CopyOnWriteArrayList`、`ConcurrentLinkedDeque`这几个。

## 各种list的优缺点

当涉及到并发编程时，不同的 List 实现具有各自的优点和缺点。下面是对 `ArrayList`、`CopyOnWriteArrayList`、`ConcurrentLinkedDeque` 的优缺点进行详细比较的描述：

**ArrayList:**

* 优点：
  - 简单易用：ArrayList 是 Java 中最基本的动态数组，易于理解和使用。
  - 高效的随机访问：由于内部基于数组实现，因此具有良好的随机访问性能。
* 缺点：
  - 非线程安全：ArrayList 不是线程安全的，当多个线程同时修改它时会出现竞态条件。
  - 需要外部同步：为了使 ArrayList 在多线程环境下安全，需要额外的同步措施，如使用 `Collections.synchronizedList`。

**CopyOnWriteArrayList:**

* 优点：
  - 线程安全：CopyOnWriteArrayList 是线程安全的，多个线程可以同时读取而不会出现问题。
  - 适用于读多写少的情况：由于写操作会复制整个数组，适用于读多写少的情况，例如日志记录。
* 缺点：
  - 写操作开销大：每次写操作都会复制整个列表，因此写操作的开销较大，不适合高频写入操作。
  - 数据不是实时的：由于写操作的复制过程，读操作可能会看到旧数据，因此不适用于需要实时数据的场景。

**ConcurrentLinkedDeque:**

* 优点：
  - 高并发：ConcurrentLinkedDeque 针对高并发读写进行了优化，适用于需要高并发处理的情况。
  - 低延迟：添加和删除操作的性能很好，不会导致锁争用。
* 缺点：
  - 不支持随机访问：ConcurrentLinkedDeque 不支持随机访问元素，因为它是一个双端队列，只能从队头和队尾进行操作。
  - 不适用于所有场景：不适合需要随机访问的场景，例如需要根据索引查找元素的情况。


总的来说，选择哪种 List 实现取决于您的具体需求。如果您需要高度并发且读写操作相对平衡，`ConcurrentLinkedDeque` 可能是更好的选择。如果您主要进行读操作且能够容忍写操作的开销，`CopyOnWriteArrayList` 是一个不错的选择。如果您只在单线程环境下操作，`ArrayList` 可能是更简单的选择，但需要注意同步问题。

## 他们的实现原理

理解这些并发 List 实现的原理对于正确使用它们非常重要。以下是这些 List 的实现原理：

**ArrayList:**

- 实现：`ArrayList` 基于动态数组实现。它内部维护一个对象数组，可以根据需要进行自动扩展。
- 原理：`ArrayList` 支持随机访问，因为可以通过索引直接访问元素。添加元素时，它会检查容量是否足够，如果不够，会创建一个更大的数组并将元素复制到新数组中。这可能导致内部数组的重新分配和复制，因此在多线程环境下需要额外的同步来确保线程安全。

**CopyOnWriteArrayList:**

- 实现：`CopyOnWriteArrayList` 也是基于数组实现的，但与普通的 `ArrayList` 不同，它在写操作时不直接修改现有数组，而是创建一个新的副本。
- 原理：读操作在不需要锁的情况下并发执行，因为它们始终访问当前的数组。写操作会复制当前数组的内容到一个新数组上，然后执行修改操作。这确保了读操作不受写操作的影响。虽然写操作需要额外的内存和复制，但读操作非常高效，适用于读多写少的场景。

**ConcurrentLinkedDeque:**

- 实现：`ConcurrentLinkedDeque` 是一个双端队列，它使用节点来连接元素。每个节点都包含一个元素和指向前一个和后一个节点的引用。
- 原理：在多线程环境下，`ConcurrentLinkedDeque` 使用CAS（比较并交换）操作来实现并发。添加元素时，它会在队头或队尾创建新的节点，然后通过CAS操作将新节点连接到队列中。删除元素时，会通过CAS来更改节点的引用，以确保线程安全。由于没有全局锁，`ConcurrentLinkedDeque` 允许高并发的添加和删除操作，但不支持随机访问。


总之，这些并发 List 的实现原理都是为了在多线程环境下提供高并发性能和线程安全。不同的实现方式适用于不同的使用场景。

## 使用举例

在多线程Java应用程序中，处理数据的并发访问是一个常见的挑战。这里将介绍四种支持并发的容器：`ArrayList`、`CopyOnWriteArrayList`、`ConcurrentLinkedDeque`的用法和代码实现。

**ArrayList**

**使用示例**

以下是一个使用ArrayList的示例：

```
List<String> arrayList = Collections.synchronizedList(new ArrayList<>());

// 添加元素
arrayList.add("元素1");
arrayList.add("元素2");

// 迭代元素
for (String element : arrayList) {
    System.out.println(element);
}
```

**CopyOnWriteArrayList**

**使用示例**

下面是一个使用CopyOnWriteArrayList的示例：

```
CopyOnWriteArrayList<String> copyOnWriteArrayList = new CopyOnWriteArrayList<>();

// 添加元素
copyOnWriteArrayList.add("元素1");
copyOnWriteArrayList.add("元素2");

// 迭代元素
for (String element : copyOnWriteArrayList) {
    System.out.println(element);
}
```

**ConcurrentLinkedDeque**

**使用示例**

ConcurrentLinkedDeque的使用示例如下：

```
ConcurrentLinkedDeque<String> concurrentLinkedDeque = new ConcurrentLinkedDeque<>();

// 添加元素
concurrentLinkedDeque.offer("元素1");
concurrentLinkedDeque.offer("元素2");

// 获取并移除元素
String element = concurrentLinkedDeque.poll();
System.out.println("取出元素：" + element);
```

**选择最适合您的容器**

在实际应用中，您应该根据需求选择最适合的容器。如果需要高并发的读取操作，可以考虑使用`CopyOnWriteArrayList`。如果需要高并发的添加和移除元素操作，可以使用`ConcurrentLinkedDeque`。最终，根据项目要求和性能需求来选择适当的容器。

## 总结

Java提供了多种支持并发的容器，如ArrayList、CopyOnWriteArrayList、ConcurrentLinkedDeque。了解它们的用法和性能特点对于编写高效的多线程程序至关重要。选择正确的容器可以显著提高应用程序的性能和可靠性。

> 更多内容请参考 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
