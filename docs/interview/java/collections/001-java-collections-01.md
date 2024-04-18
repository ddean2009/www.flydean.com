---
sidebar_position: 0
slug: /003-java-collections
---

# java集合面试问题(一)


集合是我们在java中经常会用到的东西，熟悉了集合我们就熟悉了java。当面试官在Java面试中涉及到Java集合的问题时，通常会涉及到集合的概念、类型、常见操作、性能等方面的内容。

### 1. 什么是Java集合？请简要介绍一下集合框架。

**回答：**
Java集合是用于存储、管理和操作一组对象的类和接口的集合。集合框架提供了多种不同类型的集合实现，以满足不同的需求，包括列表、集合、映射等。集合框架位于java.util包下，它提供了一组接口和类，用于存储和操作对象，使得数据处理更加方便和高效。

### 2. Java集合框架主要分为哪几种类型？

**回答：**
Java集合框架主要分为以下三种类型：
- **List（列表）：** 有序集合，允许重复元素。常见实现类有ArrayList、LinkedList等。
- **Set（集合）：** 无序集合，不允许重复元素。常见实现类有HashSet、TreeSet等。
- **Map（映射）：** 键值对映射，每个键只能对应一个值。常见实现类有HashMap、TreeMap等。

### 3. 什么是迭代器（Iterator）？它的作用是什么？

**回答：**
迭代器是集合框架中的一个接口，用于遍历集合中的元素。它提供了一种统一的方式来访问集合中的元素，而不需要关心集合的具体实现。通过迭代器，可以按顺序逐个访问集合中的元素，而不需要暴露集合内部的结构。

**代码示例：**
```
List<String> list = new ArrayList<>();
list.add("Apple");
list.add("Banana");
list.add("Orange");

Iterator<String> iterator = list.iterator();
while (iterator.hasNext()) {
    String fruit = iterator.next();
    System.out.println(fruit);
}
```

### 4. ArrayList和LinkedList有什么区别？它们何时适用？

**回答：**
- **ArrayList：** 基于动态数组实现，适用于随机访问和读取操作较多的场景。插入和删除元素需要移动元素位置，因此在频繁的插入和删除操作时效率相对较低。
- **LinkedList：** 基于双向链表实现，适用于频繁的插入和删除操作，因为在链表中插入和删除元素只需要修改相邻节点的指针，效率较高。但随机访问较慢。

选择哪种集合取决于具体的使用场景和操作频率。

### 5. HashMap和HashTable有什么区别？

**回答：**
- **HashMap：** 允许使用null键和null值，不是线程安全的（非同步），在大多数情况下性能较好。
- **HashTable：** 不允许使用null键和null值，是线程安全的（同步），性能相对较差。

由于HashTable的同步性能开销较大，一般在单线程环境下使用HashMap，而在多线程环境下可以使用ConcurrentHashMap来替代HashTable。

### 6. 什么是ConcurrentModificationException？它是如何引起的，如何避免？

**回答：**
ConcurrentModificationException是在使用迭代器遍历集合时，如果在遍历过程中修改了集合的结构（如增加或删除元素），就会抛出的异常。这是因为迭代器在遍历过程中会使用一个计数器来检测集合是否被修改。

避免这个异常的常见方法是使用迭代器的删除方法来进行元素的删除，而不是直接在集合上使用删除操作。

**代码示例：**
```
List<Integer> numbers = new ArrayList<>();
numbers.add(1);
numbers.add(2);
numbers.add(3);

Iterator<Integer> iterator = numbers.iterator();
while (iterator.hasNext()) {
    Integer number = iterator.next();
    if (number == 2) {
        iterator.remove(); // 正确的删除方式，不会抛出ConcurrentModificationException
    }
}
```

### 7. 什么是equals()和hashCode()方法？为什么它们在集合中很重要？

**回答：**
- **equals()：** 是Object类中定义的方法，用于比较两个对象是否相等。在集合中，比如HashSet和HashMap，用于判断两个元素是否相等。
- **hashCode()：** 也是Object类中定义的方法，返回对象的哈希码值。在集合中，比如HashMap，用于确定对象在集合中的存储位置。

在使用集合框架中的HashSet和HashMap等需要根据元素的相等性进行查找和存储的容器中，正确实现equals()和hashCode()方法是非常重要的，以确保元素的一致性和正确性。

### 8. 什么是Comparable和Comparator接口？

**回答：**
- **Comparable接口：** 定义在对象上的自然排序方式，使对象可以与其他对象进行比较。实现了Comparable接口的类可以使用compareTo()方法来实现比较逻辑。
- **Comparator接口：** 是一个用于比较两个对象的定制排序接口，可以在不修改对象类的情况下实现多种不同的比较逻辑。

实现了

Comparable接口的类可以直接使用Collections.sort()进行排序，而使用Comparator接口可以在需要的地方提供定制的比较逻辑。

**代码示例：**
```
class Person implements Comparable<Person> {
    private String name;
    private int age;

    // Constructors, getters, setters

    @Override
    public int compareTo(Person otherPerson) {
        return Integer.compare(this.age, otherPerson.age);
    }
}

List<Person> people = new ArrayList<>();
// Add people to the list
Collections.sort(people); // 使用自然排序

// 使用Comparator进行定制排序
Comparator<Person> ageComparator = Comparator.comparingInt(Person::getAge);
Collections.sort(people, ageComparator);
```

### 9. 什么是同步集合（Synchronized Collections）？它们在什么情况下使用？

**回答：**
同步集合是指对于多线程环境，提供了线程安全的操作的集合类。在并发访问的情况下，普通的集合类可能会引发线程安全问题，因此Java提供了诸如Collections.synchronizedList、Collections.synchronizedSet等方法来返回同步版本的集合。

**代码示例：**
```
List<String> synchronizedList = Collections.synchronizedList(new ArrayList<>());
Set<Integer> synchronizedSet = Collections.synchronizedSet(new HashSet<>());

// 在多线程环境中使用同步集合
```

### 10. 什么是并发集合（Concurrent Collections）？它们的作用是什么？

**回答：**
并发集合是指专为多线程并发操作而设计的集合类，能够提供更高的并发性能。java.util.concurrent包提供了许多并发集合，如ConcurrentHashMap、ConcurrentSkipListMap、ConcurrentLinkedQueue等。

这些集合通过使用不同的并发控制策略，允许多个线程同时访问和修改集合，而不需要显式的同步控制。这对于高并发的应用场景非常有用。

**代码示例：**
```
ConcurrentHashMap<String, Integer> concurrentMap = new ConcurrentHashMap<>();
concurrentMap.put("one", 1);
concurrentMap.put("two", 2);

// 在多线程环境中安全地进行操作
```

### 11. 什么是Fail-Fast和Fail-Safe迭代器？

**回答：**
- **Fail-Fast迭代器：** 当集合在迭代过程中被修改（增加、删除元素）时，会立即抛出ConcurrentModificationException，以避免在并发环境中出现潜在的问题。这种迭代器主要用于在迭代过程中检测集合的非法修改。

- **Fail-Safe迭代器：** 迭代器会复制原始集合的数据，在迭代过程中允许对集合进行修改，但不会影响正在进行的迭代过程。这种迭代器适用于需要在迭代过程中允许修改集合的情况，如并发环境。

Java集合框架中的CopyOnWriteArrayList和CopyOnWriteArraySet就是Fail-Safe集合的例子。

### 12. Java集合框架中的主要接口有哪些？

**回答：**
主要的集合接口包括：
- Collection：表示一组对象，包括List和Set。
- List：有序集合，可以包含重复元素，常见的实现有ArrayList、LinkedList等。
- Set：无序集合，不允许重复元素，常见的实现有HashSet、TreeSet等。
- Map：键值对映射，每个键只能对应一个值，常见的实现有HashMap、TreeMap等。

### 13. 什么是WeakHashMap？

**回答：**
WeakHashMap是java.util包中提供的一种特殊的Map实现，它的键是弱引用（WeakReference）。这意味着当某个键不再被程序中的其他部分引用时，它可以被垃圾回收器回收，即使这个键在WeakHashMap中。

WeakHashMap常用于需要将对象与相关的附加信息关联起来，但又不想妨碍垃圾回收过程的场景。典型的应用是缓存和资源管理。

**代码示例：**
```
WeakHashMap<Key, Value> weakMap = new WeakHashMap<>();
Key key = new Key(); // 仅被weakMap引用
Value value = new Value(); // 与key相关的值
weakMap.put(key, value);

// 当key不再被其他部分引用，垃圾回收时，weakMap中的对应条目会被移除
```

### 14. 什么是HashCode和Equals的约定？

**回答：**
hashCode和equals方法在集合框架中有一些约定：
- 如果两个对象通过equals方法相等，它们的hashCode值必须相等。
- 如果两个对象的hashCode值相等，它们不一定通过equals方法相等，但是在HashMap等集合中，相等的哈希码会增加链表的长度，影响性能，因此最好保持一致性。

为了符合这些约定，当你在自定义类中重写equals方法时，也应该重写hashCode方法，以保证对象在集合中的正确行为和性能。

**代码示例：**
```
class Student {
    private int id;
    private String name;

    // Constructors, getters, setters

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Student student = (Student) o;
        return id == student.id && Objects.equals(name, student.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }
}
```

### 15. 什么是IdentityHashMap？

**回答：**
IdentityHashMap是一个特殊的Map实现，它在比较键和值的相等性时使用的是引用的身份（内存地址）而不是通过equals方法。这使得它可以区分不同引用指向的相同内容的情况。

IdentityHashMap适用于需要基于对象引用身份而不是内容来存储键值对的场景。

**代码示例：**
```
IdentityHashMap<String, Integer> identityMap = new IdentityHashMap<>();
String key1 = new String("key");
String key2 = new String("key");
identityMap.put(key1, 1);
identityMap.put(key2, 2);

System.out.println(identityMap.size()); // 输出 2，因为两个键在引用上不同
```

### 16. 什么是EnumSet和EnumMap？

**回答：**
- **EnumSet：** 是java.util包中的一个专门为枚举类型设计的集合类。它基于位向量实现，适用于枚举类型的快速集合操作，非常高效。
- **EnumMap：** 也是java.util包中的一个专门为枚举类型设计的Map实现。它的键必须是同一个枚举类的枚举值，提供了非常高效的枚举键值对存储和查找操作。

这两个类在处理枚举类型数据时非常有用，因为它们针对枚举类型做了特殊的优化。

**代码示例：**
```
enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

EnumSet<Day> weekdays = EnumSet.range(Day.MONDAY, Day.FRIDAY);
EnumMap<Day, String> activities = new EnumMap<>(Day.class);
activities.put(Day.MONDAY, "Working");
activities.put(Day.FRIDAY, "Partying");
```

### 17. 什么是Collections类的实用方法？

**回答：**
java.util.Collections类提供了一系列静态实用方法，用于操作集合。这些方法包括排序、查找、替换等，它们可以用于各种不同的集合实现。

**代码示例：**
```
List<Integer> numbers = new ArrayList<>();
numbers.add(5);
numbers.add(2);
numbers.add(8);

Collections.sort(numbers); // 对列表进行排序

int index = Collections.binarySearch(numbers, 5); // 二分查找
```

### 18. 什么是Collections类的不可修改视图（Unmodifiable Views）？

**回答：**
Collections.unmodifiableXXX()方法可以返回一个不可修改的视图，用于对现有集合进行封装，使其不允许进行修改操作。这在需要将集合传递给其他部分，但又不希望这些部分能够修改集合时非常有用。

**代码示例：**
```
List<String> originalList = new ArrayList<>();
originalList.add("Apple");
originalList.add("Banana");

List<String> unmodifiableList = Collections.unmodifiableList(originalList);

// 试图修改unmodifiableList会引发UnsupportedOperationException
```

### 19. 什么是Collections类的同步方法？

**回答：**
java.util.Collections类提供了一些静态方法，用于返回线程安全的集合。这些方法在需要保证多线程环境下集合的安全访问时非常有用。常见的同步方法包括Collections.synchronizedList、Collections.synchronizedSet和Collections.synchronizedMap等。

**代码示例：**
```
List<String> synchronizedList = Collections.synchronizedList(new ArrayList<>());
Set<Integer> synchronizedSet = Collections.synchronizedSet(new HashSet<>());
Map<String, Integer> synchronizedMap = Collections.synchronizedMap(new HashMap<>());
```

### 20. 什么是ListIterator？

**回答：**
ListIterator是List接口提供的一个特殊迭代器，除了具有普通迭代器的功能外，它还可以在迭代过程中向列表中插入、删除元素。ListIterator允许双向遍历（向前和向后），并提供了更多的操作。

**代码示例：**
```
List<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");
names.add("Charlie");

ListIterator<String> iterator = names.listIterator();
while (iterator.hasNext()) {
    String name = iterator.next();
    if (name.equals("Bob")) {
        iterator.add("David"); // 在Bob之后插入David
    }
}
```

### 21. 什么是Collections类的reverse()和shuffle()方法？

**回答：**
Collections.reverse()方法用于将一个List中的元素进行反转排序。Collections.shuffle()方法用于随机打乱一个List中的元素顺序。这两个方法在处理列表中的元素顺序时非常有用。

**代码示例：**
```
List<Integer> numbers = new ArrayList<>();
numbers.add(1);
numbers.add(2);
numbers.add(3);
numbers.add(4);

Collections.reverse(numbers); // 反转列表

Collections.shuffle(numbers); // 随机打乱列表
```

### 22. 什么是PriorityQueue？

**回答：**
PriorityQueue是一个基于优先级堆（heap）的队列实现，它可以根据元素的优先级进行排序。默认情况下，PriorityQueue是自然顺序排序，但你也可以通过提供自定义的Comparator来指定元素的排序方式。

**代码示例：**
```
PriorityQueue<Integer> priorityQueue = new PriorityQueue<>();
priorityQueue.add(5);
priorityQueue.add(2);
priorityQueue.add(8);

int highestPriority = priorityQueue.poll(); // 弹出具有最高优先级的元素
```

### 23. 什么是BitSet？

**回答：**
BitSet是一个用于存储位信息的集合类，它的每个元素只有两个可能的值：0和1。BitSet经常被用于处理位运算和标志位操作，例如在位图索引、压缩算法等领域。

**代码示例：**
```
BitSet bitSet = new BitSet(8); // 创建一个有8位的BitSet

bitSet.set(2); // 设置第2位为1
bitSet.set(5); // 设置第5位为1

boolean isSet = bitSet.get(2); // 获取第2位的值（true）
```

### 24. 什么是Arrays类的asList()方法？

**回答：**
Arrays.asList()方法是java.util.Arrays类提供的一个实用方法，用于将数组转换为List。注意，这个方法返回的List是固定大小的，不支持添加和删除操作，但可以使用set()方法修改元素。

**代码示例：**
```
String[] array = {"Apple", "Banana", "Orange"};
List<String> list = Arrays.asList(array);

list.set(1, "Pear"); // 修改数组中的元素
```

### 25. 什么是LinkedHashMap？

**回答：**
LinkedHashMap是java.util包中的一个实现了Map接口的类，它继承自HashMap，但是额外维护了键值对的插入顺序。这意味着当你遍历LinkedHashMap时，键值对的顺序与插入顺序一致。

LinkedHashMap适用于需要保持元素插入顺序的场景，同时也可以通过访问顺序模式来遍历元素。

**代码示例：**
```
LinkedHashMap<String, Integer> linkedHashMap = new LinkedHashMap<>();
linkedHashMap.put("one", 1);
linkedHashMap.put("two", 2);
linkedHashMap.put("three", 3);

// 遍历顺序与插入顺序一致
for (Map.Entry<String, Integer> entry : linkedHashMap.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}
```
### 26. 什么是Stream API？

**回答：**
Stream API是Java 8引入的一个功能强大的功能，它提供了一种处理集合数据的函数式编程方法。Stream允许你对集合中的元素进行一系列的操作，如过滤、映射、排序、归约等，以函数式的风格进行处理。

Stream API能够使代码更加简洁、清晰，并且在一些情况下可以提供更高效的并行处理。

**代码示例：**
```
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

int sum = numbers.stream()
                .filter(n -> n % 2 == 0)
                .mapToInt(Integer::intValue)
                .sum();
```

### 27. 什么是Lambda表达式？它在集合操作中的作用是什么？

**回答：**
Lambda表达式是Java 8引入的一种轻量级函数式编程特性，它允许你以更紧凑的方式传递匿名函数。在集合操作中，Lambda表达式可以用于传递操作的逻辑，如过滤、映射、排序等，使代码更加简洁、易读。

Lambda表达式能够帮助你将操作的焦点从“如何实现”转移到“要实现什么”，从而提高代码的可读性和可维护性。

**代码示例：**
```
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");

names.stream()
     .filter(name -> name.length() <= 4)
     .forEach(System.out::println);
```

### 28. 什么是Collectors类？

**回答：**
java.util.stream.Collectors是Stream API中的一个工具类，提供了一组静态方法，用于将Stream中的元素收集到集合或其他数据结构中。它在Stream的最终操作中非常有用，可以用于汇总、分组、分区等操作。

Collectors类的方法可以帮助你以更简洁的方式对Stream的结果进行收集。

**代码示例：**
```
List<Person> people = // ... 获得一组人员数据

Map<String, List<Person>> peopleByCity = people.stream()
    .collect(Collectors.groupingBy(Person::getCity));
```

### 29. 什么是并行Stream？

**回答：**
并行Stream是指在多个线程中同时处理Stream中的元素的方式。Java 8引入的Stream API允许你通过调用parallel()方法将一个普通Stream转换为并行Stream。这在处理大量数据时，可以提高处理效率。

然而，要注意在使用并行Stream时，需要考虑到线程安全问题，以及在某些情况下可能的性能开销。

**代码示例：**
```
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

int sum = numbers.parallelStream()
                .filter(n -> n % 2 == 0)
                .mapToInt(Integer::intValue)
                .sum();
```

### 30. 什么是ConcurrentSkipListMap？

**回答：**
ConcurrentSkipListMap是一个java.util.concurrent包中提供的并发映射实现，它是基于跳表（Skip List）数据结构的。ConcurrentSkipListMap提供了高并发性能，适用于多线程环境下的并发访问。

跳表是一种有序数据结构，类似于平衡树，但具有更好的并发性能。

**代码示例：**
```
ConcurrentSkipListMap<String, Integer> skipListMap = new ConcurrentSkipListMap<>();
skipListMap.put("one", 1);
skipListMap.put("two", 2);

int value = skipListMap.get("two");
```

### 31. 什么是EnumSet和EnumMap？

**回答：**
- **EnumSet：** 是java.util包中为枚举类型设计的高效集合类，它基于位向量实现，适用于对枚举类型的元素进行存储和操作。因为枚举的取值是有限的，所以使用位向量可以提供高效的存储和访问。
- **EnumMap：** 是java.util包中为枚举类型设计的高效映射类，它的键必须是同一个枚举类的枚举值。EnumMap在内部使用数组来存储映射的键值对，因此具有高效的访问性能。

这两个类都是针对枚举类型数据的特定优化，可以提供高效的存储和操作。

**代码示例：**
```
enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

EnumSet<Day> weekend = EnumSet.of(Day.SATURDAY, Day.SUNDAY);

EnumMap<Day, String> activities = new EnumMap<>(Day.class);
activities.put(Day.MONDAY, "Working");
activities.put(Day.FRIDAY, "Partying");
```

### 32. 什么是WeakReference、SoftReference和PhantomReference？

**回答：**
这些是Java中的引用类型，用于在内存管理中控制对象的垃圾回收：

- **WeakReference（弱引用）：** 弱引用对象在垃圾回收时只有在内存不足时才会被回收。常用于构建缓存，当缓存中的对象不再被强引用时，可以被垃圾回收。
- **SoftReference（软引用）：** 软引用对象在内存不足时会被回收。用于实现缓存，但比弱引用更“持久”，有利于利用剩余内存。
- **PhantomReference（虚引用）：** 虚引用用于在对象被垃圾回收之前获得通知。虚引用对象在任何时候都可能被垃圾回收。

这些引用类型在一些特殊场景下，如内存敏感的缓存和资源释放，非常有用。

### 33. 什么是Comparator接口的自然排序和定制排序？

**回答：**
Comparator接口定义了用于对象排序的比较器。它有两种排序方式：

- **自然排序（Natural Ordering）：** 对于实现了Comparable接口的类，可以通过自然顺序进行排序。例如，整数和字符串已经实现了Comparable接口，所以它们可以使用自然排序进行排序。
- **定制排序（Custom Ordering）：** 当你需要对没有实现Comparable接口的类进行排序时，可以通过提供自定义的Comparator来指定排序规则。这样你可以在不修改类本身的情况下定义多种排序方式。

**代码示例：**
```
class Student {
    private String name;
    private int age;

    // Constructors, getters, setters
}

List<Student> students = // ... 获得一组学生数据

// 自然排序
Collections.sort(students);

// 定制排序
Comparator<Student> ageComparator = Comparator.comparingInt(Student::getAge);
Collections.sort(students, ageComparator);
```
