---
sidebar_position: 1
---

# java集合面试问题(二)

### 34. 什么是IdentityHashMap？

**回答：**
IdentityHashMap是java.util包中提供的一个实现Map接口的类，它使用引用的身份（内存地址）而不是equals方法来判断键的相等性。这意味着只有当两个键的引用是同一个对象时，它们才被认为是相等的。

这在某些情况下很有用，例如需要精确地根据对象的身份进行键值存储。

**代码示例：**
```
IdentityHashMap<String, Integer> identityMap = new IdentityHashMap<>();
String key1 = new String("key");
String key2 = new String("key");
identityMap.put(key1, 1);

// key2不等于key1，所以不会被视为相等的键
identityMap.get(key2); // 输出null
```

### 35. 什么是Collections类的checkedXXX方法？

**回答：**
java.util.Collections类提供了一系列用于创建类型安全（typed-safe）的集合的方法，它们称为checkedXXX方法。这些方法可以帮助你确保向集合中添加的元素类型是

正确的，从而在运行时避免类型转换错误。

**代码示例：**
```
List<String> stringList = new ArrayList<>();
List checkedList = Collections.checkedList(stringList, String.class);

// 现在只能添加String类型的元素到checkedList
```

### 36. 什么是CopyOnWriteArrayList和CopyOnWriteArraySet？

**回答：**
CopyOnWriteArrayList和CopyOnWriteArraySet都是并发集合，属于java.util.concurrent包。它们通过使用一种特殊的写时复制（Copy-On-Write）策略来实现高并发的读操作。

- **CopyOnWriteArrayList：** 是线程安全的List实现，适用于读多写少的场景。在修改操作（添加、删除元素）时，它会复制一份原始数组，并进行修改，从而保证读取操作的线程安全性。
- **CopyOnWriteArraySet：** 是线程安全的Set实现，它基于CopyOnWriteArrayList实现，拥有类似的特性。

这些集合对于读多写少的情况提供了一种高效的解决方案。

**代码示例：**
```
CopyOnWriteArrayList<String> copyOnWriteList = new CopyOnWriteArrayList<>();
CopyOnWriteArraySet<Integer> copyOnWriteSet = new CopyOnWriteArraySet<>();

// 在多线程环境中使用copyOnWriteList和copyOnWriteSet
```

### 37. 什么是Collections类的disjoint()方法？

**回答：**
Collections.disjoint()方法是用于检查两个集合是否没有共同元素的。如果两个集合没有交集，即它们之间没有共同的元素，该方法返回true，否则返回false。

**代码示例：**
```
List<Integer> list1 = Arrays.asList(1, 2, 3);
List<Integer> list2 = Arrays.asList(4, 5, 6);

boolean noCommonElements = Collections.disjoint(list1, list2);
System.out.println(noCommonElements); // 输出 true
```

### 38. 什么是Collections类的reverseOrder()方法？

**回答：**
Collections.reverseOrder()方法返回一个逆序的比较器，用于对元素进行逆序排序。通常与Collections.sort()方法一起使用，可以实现对集合中元素的逆序排列。

**代码示例：**
```
List<Integer> numbers = Arrays.asList(5, 2, 8, 1);

Collections.sort(numbers, Collections.reverseOrder());
```

### 39. 什么是Collections类的singletonXXX()方法？

**回答：**
Collections.singletonXXX()方法用于创建只包含一个元素的不可修改集合。这种集合在内部实现上更加紧凑，适用于只包含单个元素的场景。

**代码示例：**
```
Set<String> singletonSet = Collections.singleton("Hello");

List<Integer> singletonList = Collections.singletonList(42);
```

### 40. 什么是Collections类的emptyXXX()方法？

**回答：**
Collections.emptyXXX()方法用于创建一个空的不可修改集合，如emptyList()、emptySet()和emptyMap()。这些集合在不需要存储元素时很有用，可以避免创建不必要的实例。

**代码示例：**
```
List<String> emptyList = Collections.emptyList();
Set<Integer> emptySet = Collections.emptySet();
Map<String, Integer> emptyMap = Collections.emptyMap();
```

### 41. 什么是ConcurrentHashMap？

**回答：**
ConcurrentHashMap是java.util.concurrent包中提供的并发哈希映射实现，它允许多个线程同时读取和写入映射，而不会引发并发冲突。ConcurrentHashMap的设计使得它在高并发情况下表现优异。

它通过将映射分成一些段（Segments），每个段相当于一个小的哈希表，从而实现了并发的写操作。不同的段可以由不同的线程同时操作，从而减少了锁的争用。

**代码示例：**
```
ConcurrentHashMap<String, Integer> concurrentMap = new ConcurrentHashMap<>();
concurrentMap.put("one", 1);
concurrentMap.put("two", 2);

int value = concurrentMap.get("one");
```

### 42. 什么是Spliterator？

**回答：**
Spliterator是Java 8引入的一个用于遍历和拆分元素序列的接口，它是“分割迭代器”（Split Iterator）的缩写。Spliterator可以用于支持并行迭代操作，将数据源拆分为多个部分，以便多个线程并行处理。

Spliterator被广泛应用于支持新的Stream API和并行流。

**代码示例：**
```
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

Spliterator<Integer> spliterator = numbers.spliterator();

// 并行迭代
spliterator.forEachRemaining(System.out::println);
```

### 43. 什么是Set接口的特点？

**回答：**
Set接口是java.util包中的一个接口，表示不允许包含重复元素的集合。Set的主要特点包括：

- 不允许重复元素：集合中的元素是唯一的，不能有重复。
- 无序性：Set通常不保证元素的特定顺序。实际的顺序可能会随着时间的推移发生变化。
- 没有索引：Set不支持通过索引访问元素，因为它没有定义特定的顺序。

常用的Set实现包括HashSet、LinkedHashSet和TreeSet。

### 44. 什么是NavigableSet接口？

**回答：**
NavigableSet接口是java.util包中的一个扩展自SortedSet接口的子接口，它提供了一系列用于导航和搜索元素的方法。NavigableSet的主要特点包括：

- 提供了用于搜索最小和最大元素的方法。
- 提供了用于搜索给定元素的方法，或搜索大于或小于给定元素的元素。
- 可以获取前一个和后一个元素。

TreeSet是NavigableSet接口的一个常见实现。

### 45. 什么是BlockingQueue？

**回答：**
BlockingQueue是java.util.concurrent包中的一个接口，它是一个支持线程安全的生产者-消费者模式的队列。BlockingQueue提供了阻塞操作，当队列为空或满时，读取和写入操作会被阻塞，直到满足条件。

BlockingQueue在多线程应用中很有用，用于实现并发的生产者和消费者线程。

**代码示例：**
```
BlockingQueue<Integer> blockingQueue = new LinkedBlockingQueue<>();

// 生产者线程
blockingQueue.put(1);

// 消费者线程
int value = blockingQueue.take();
```

### 46. 什么是Deque接口？

**回答：**
Deque接口（Double Ended Queue的缩写）是java.util包中的一个接口，代表双向队列。Deque允许你在队列的两端插入和删除元素，可以作为队列和栈的混合使用。

Deque提供了一系列用于在队列的头部和尾部进行操作的方法，如addFirst()、addLast()、removeFirst()、removeLast()等。

**代码示例：**
```
Deque<String> deque = new LinkedList<>();
deque.addLast("Alice");
deque.addLast("Bob");
deque.addFirst("Charlie");

String first = deque.removeFirst(); // 输出 Charlie
```

### 47. 什么是BlockingDeque接口？

**回答：**
BlockingDeque接口是java.util.concurrent包中的一个接口，是Deque的扩展，它结合了Deque的双向队列特性和BlockingQueue的阻塞特性。BlockingDeque允许在队列两端插入和删除元素，并且在队列为空或满时提供阻塞操作。

BlockingDeque适用于需要高并发的双向队列场景，例如生产者-消费者模式。

### 48. 什么是EnumMap和EnumSet？

**回答：**
- **EnumMap：** EnumMap是java.util包中的一个实现了Map接口的类，专门用于枚举类型作为键的情况。它的键必须来自同一个枚举类，这使得它在具有枚举键的情况下效率更高。
- **EnumSet：** EnumSet是java.util包中的一个实现了Set接口的类，专门用于枚举类型的集合。EnumSet中的元素必须来自同一个枚举类，它使用位向量来实现高效的存储和操作。

这两个类都是针对枚举类型数据的高效实现。

**代码示例：**
```
enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

EnumMap<Day, String> activities = new EnumMap<>(Day.class);
activities.put(Day.MONDAY, "Working");
activities.put(Day.FRIDAY, "Partying");

EnumSet<Day> weekend = EnumSet.of(Day.SATURDAY, Day.SUNDAY);
```

### 49. 什么是IdentityHashMap？

**回答：**
IdentityHashMap是java.util包中的一个实现了Map接口的类，与普通的HashMap不同，它使用引用的身份（内存地址）而不是equals方法来判断键的相等性。这意味着只有当两个键的引用是同一个对象时，它们才被认为是相等的。

IdentityHashMap在需要精确比较对象引用时很有用，它不考虑对象的内容，只关注对象的内存地址。

**代码示例：**
```
IdentityHashMap<String, Integer> identityMap = new IdentityHashMap<>();
String key1 = new String("key");
String key2 = new String("key");
identityMap.put(key1, 1);

// key2不等于key1，所以不会被视为相等的键
identityMap.get(key2); // 输出 null
```

### 50. 什么是Queue接口？

**回答：**
Queue接口是java.util包中的一个接口，代表队列数据结构。队列通常按照“先进先出”（FIFO，First-In-First-Out）的原则，也就是最早进入队列的元素最先被移出。

Queue接口提供了一系列用于在队列的尾部添加元素、在队列的头部移除元素的方法，以及一些用于检查队列状态的方法。

常用的Queue实现包括LinkedList、ArrayDeque和PriorityQueue。

### 51. 什么是Map接口的特点？

**回答：**
Map接口是java.util包中的一个接口，用于表示键值对的映射。Map的主要特点包括：

- 键唯一：每个键只能对应一个值，不允许重复的键。
- 可以通过键来获取值：通过键可以找到对应的值。
- 无序性：Map通常不保证元素的特定顺序。实际的顺序可能会随着时间的推移发生变化。

Map接口的常见实现包括HashMap、LinkedHashMap、TreeMap等。

### 52. 什么是NavigableMap接口？

**回答：**
NavigableMap接口是java.util包中的一个扩展自SortedMap接口的子接口，它提供了一系列用于导航和搜索键的方法。NavigableMap的主要特点包括：

- 提供了用于搜索最小和最大键的方法。
- 提供了用于搜索给定键的方法，或搜索大于或小于给定键的键。
- 可以获取前一个和后一个键。

TreeMap是NavigableMap接口的一个常见实现。

### 53. 什么是EnumMap？

**回答：**
EnumMap是java.util包中的一个实现了Map接口的类，专门用于枚举类型作为键的情况。EnumMap的键必须来自同一个枚举类，这使得它在具有枚举键的情况下效率更高。

EnumMap内部使用数组来表示

映射，因此具有较高的访问速度。

**代码示例：**
```
enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

EnumMap<Day, String> activities = new EnumMap<>(Day.class);
activities.put(Day.MONDAY, "Working");
activities.put(Day.FRIDAY, "Partying");
```

### 54. 什么是WeakHashMap？

**回答：**
WeakHashMap是java.util包中的一个实现了Map接口的类，它是一种特殊的Map，其中的键是“弱键”（Weak Key）。这意味着如果某个键不再被其他部分引用，它会被垃圾回收器回收，即使它还存在于WeakHashMap中。

WeakHashMap常用于在没有其他强引用时临时保存对象的映射。

**代码示例：**
```
WeakHashMap<Key, Value> weakHashMap = new WeakHashMap<>();
Key key = new Key();
Value value = new Value();
weakHashMap.put(key, value);

// 当key不再被强引用时，它会被垃圾回收，对应的映射也会被移除
```

### 55. 什么是PriorityQueue？

**回答：**
PriorityQueue是java.util包中的一个实现了Queue接口的类，它是一个优先级队列，根据元素的优先级进行排列。默认情况下，PriorityQueue使用元素的自然顺序或提供的比较器来确定元素的优先级。

PriorityQueue的实现基于堆数据结构，它保证了队列中最高优先级的元素总是位于队列的头部。

**代码示例：**
```
PriorityQueue<Integer> priorityQueue = new PriorityQueue<>();
priorityQueue.add(5);
priorityQueue.add(3);
priorityQueue.add(7);

int highestPriority = priorityQueue.poll(); // 输出 3
```

### 56. 什么是Hashtable？

**回答：**
Hashtable是java.util包中的一个古老的实现了Map接口的类，它提供了一种使用键-值对存储数据的方式。Hashtable在功能上与HashMap类似，但是它是线程安全的，即多个线程可以同时操作一个Hashtable实例而不会引发并发问题。

然而，由于它是基于同步方法实现的，因此在多线程环境下性能相对较差。在Java 5之后，更推荐使用ConcurrentHashMap来获得更好的并发性能。

**代码示例：**
```
Hashtable<String, Integer> hashtable = new Hashtable<>();
hashtable.put("one", 1);
hashtable.put("two", 2);

int value = hashtable.get("one");
```

### 57. 什么是WeakReference、SoftReference和PhantomReference？

**回答：**
这些是Java中用于内存管理的引用类型：

- **WeakReference（弱引用）：** 弱引用对象只有在垃圾回收时，当没有强引用指向它时，才会被回收。常用于实现缓存，以便在内存不足时释放一些不再需要的对象。
- **SoftReference（软引用）：** 软引用对象在内存不足时可能会被回收，但只有在内存真正紧张的情况下才会被回收。用于构建内存敏感的高速缓存。
- **PhantomReference（虚引用）：** 虚引用对象在任何时候都可能被垃圾回收。虚引用主要用于跟踪对象是否已经从内存中删除，但不能通过虚引用来获取对象本身。

这些引用类型有助于在特定场景下进行精细的内存管理。

### 58. 什么是Arrays类的asList()方法？

**回答：**
Arrays.asList()方法是java.util包中的一个静态方法，它可以将传递的一组元素转换为一个固定大小的List。这个List是一个视图，不支持增加或删除元素，但可以使用set方法修改元素的值。

**代码示例：**
```
List<String> list = Arrays.asList("one", "two", "three");
list.set(0, "modified"); // 修改第一个元素为 "modified"
```

### 59. 什么是Collections类的unmodifiableXXX()方法？

**回答：**
Collections.unmodifiableXXX()方法用于创建不可修改的集合，其中XXX可以是List、Set或Map。这些方法返回一个不可修改的视图，即原始集合不能被修改，但可以读取。

**代码示例：**
```
List<String> originalList = new ArrayList<>();
originalList.add("one");
originalList.add("two");

List<String> unmodifiableList = Collections.unmodifiableList(originalList);

// 尝试修改unmodifiableList会引发 UnsupportedOperationException
```

### 60. 什么是Collections类的singletonXXX()方法？

**回答：**
Collections.singletonXXX()方法用于创建只包含一个元素的不可修改集合，其中XXX可以是Set、List或Map。这种集合在内部实现上更加紧凑，适用于只包含单个元素的场景。

**代码示例：**
```
Set<String> singletonSet = Collections.singleton("Hello");
List<Integer> singletonList = Collections.singletonList(42);
```

### 61. 什么是Collections类的checkedXXX()方法？

**回答：**
Collections.checkedXXX()方法用于创建类型安全的集合，其中XXX可以是List、Set或Map。这些方法可以帮助你确保向集合中添加的元素类型是正确的，从而在运行时避免类型转换错误。

**代码示例：**
```
List<String> stringList = new ArrayList<>();
List checkedList = Collections.checkedList(stringList, String.class);

// 现在只能添加String类型的元素到checkedList
```

### 62. 什么是Arrays类的sort()方法？

**回答：**
Arrays.sort()方法是java.util包中的一个静态方法，用于对数组元素进行排序。它提供了多个重载方法，可以根据不同的排序规则进行排序。对于基本类型数组，使用Arrays.sort()可以实现快速的排序。

**代码示例：**
```
int[] numbers = {5, 2, 8, 1};
Arrays.sort(numbers); // 对数组进行排序
```

### 63. 什么是Arrays类的binarySearch()方法？

**回答：**
Arrays.binarySearch()方法是java.util包中的一个静态方法，用于在已排序的数组中执行二分查找。如果数组包含目标元素，则返回该元素的索引；否则返回一个负数值，表示目标元素应该插入的位置。

**代码示例：**
```
int[] numbers = {1, 2, 3, 5, 8};
int index = Arrays.binarySearch(numbers, 5); // 返回 3
```

### 64. 什么是Arrays类的copyOf()方法？

**回答：**
Arrays.copyOf()方法是java.util包中的一个静态方法，用于创建一个新数组，包含指定数组的一部分或全部元素。新数组的长度可以比原数组长或短。

**代码示例：**
```
int[] original = {1, 2, 3, 4, 5};
int[] copy = Arrays.copyOf(original, 3); // 新数组为 {1, 2, 3}
```

### 65. 什么是Arrays类的equals()方法？

**回答：**
Arrays.equals()方法是java.util包中的一个静态方法，用于比较两个数组是否相等。数组中的元素会逐个比较，如果数组长度相等且对应位置的元素也相等，则返回true，否则返回false。

**代码示例：**
```
int[] array1 = {1, 2, 3};
int[] array2 = {1, 2, 3};

boolean areEqual = Arrays.equals(array1, array2); // 返回 true
```

### 66. 什么是Arrays类的hashCode()方法？

**回答：**
Arrays.hashCode()方法是java.util包中的一个静态方法，用于计算数组的哈希码。数组的哈希码是基于数组的内容计算的，如果两个数组内容相同，它们的哈希码也会相同。

**代码示例：**
```
int[] array = {1, 2, 3};
int hashCode = Arrays.hashCode(array); // 返回数组的哈希码
```
