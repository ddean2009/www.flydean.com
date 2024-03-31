杰哥教你面试之一百问系列:java集合

[toc]

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

### 67. 什么是Arrays类的toString()方法？

**回答：**
Arrays.toString()方法是java.util包中的一个静态方法，用于将数组转换为字符串表示形式。该方法会按照数组的顺序将元素转换为字符串，并用逗号分隔，然后放在方括号内。

**代码示例：**
```
int[] array = {1, 2, 3};
String arrayString = Arrays.toString(array); // 返回 "[1, 2, 3]"
```

### 68. 什么是Arrays类的deepEquals()方法？

**回答：**
Arrays.deepEquals()方法是java.util包中的一个静态方法，用于比较多维数组的内容是否相等。它会递归比较数组的元素，如果多维数组的内容完全相同，则返回true，否则返回false。

**代码示例：**
```
int[][] array1 = {{1, 2}, {3, 4}};
int[][] array2 = {{1, 2}, {3, 4}};

boolean areEqual = Arrays.deepEquals(array1, array2); // 返回 true
```

### 69. 什么是System.arraycopy()方法？

**回答：**
System.arraycopy()方法是Java中的一个静态方法，用于在数组之间进行元素的复制。它可以将一个数组的一部分或全部元素复制到另一个数组中，并且可以在目标数组的指定位置开始放置复制的元素。

**代码示例：**
```
int[] source = {1, 2, 3, 4, 5};
int[] target = new int[5];

System.arraycopy(source, 1, target, 2, 3); // 将 source[1] 到 source[3] 复制到 target[2] 到 target[4]
```

### 70. 什么是Arrays类的fill()方法？

**回答：**
Arrays.fill()方法是java.util包中的一个静态方法，用于将指定的值填充到数组的所有元素中。这可以在初始化数组或清除数组内容时很有用。

**代码示例：**
```
int[] array = new int[5];
Arrays.fill(array, 42); // 将数组的所有元素填充为 42
```

### 71. 什么是Arrays类的stream()方法？

**回答：**
Arrays.stream()方法是java.util包中的一个静态方法，用于将数组转换为一个流（Stream）对象。通过将数组转换为流，你可以利用流的各种操作来处理数组中的元素。

**代码示例：**
```
int[] array = {1, 2, 3, 4, 5};
IntStream stream = Arrays.stream(array); // 将数组转换为 IntStream 流
```

### 72. 什么是Arrays类的parallelSort()方法？

**回答：**
Arrays.parallelSort()方法是java.util包中的一个静态方法，用于对数组元素进行并行排序。与普通的Arrays.sort()方法相比，parallelSort()方法会在多个线程上并行执行排序操作，从而加快排序速度。

**代码示例：**
```
int[] array = {5, 2, 8, 1, 3};
Arrays.parallelSort(array); // 并行排序数组
```

### 73. 什么是Arrays类的mismatch()方法？

**回答：**
Arrays.mismatch()方法是java.util包中的一个静态方法，用于查找两个数组中第一个不匹配的元素的索引。如果数组完全相等，则返回-1。

**代码示例：**
```
int[] array1 = {1, 2, 3, 4, 5};
int[] array2 = {1, 2, 3, 6, 7};

int mismatchIndex = Arrays.mismatch(array1, array2); // 返回 3
```

### 74. 什么是Collections类的frequency()方法？

**回答：**
Collections.frequency()方法是java.util包中的一个静态方法，用于计算集合中指定元素出现的次数。

**代码示例：**
```
List<String> list = Arrays.asList("apple", "banana", "apple", "orange");
int frequency = Collections.frequency(list, "apple"); // 返回 2
```

### 75. 什么是Collections类的disjoint()方法？

**回答：**
Collections.disjoint()方法是java.util包中的一个静态方法，用于判断两个集合是否没有共同的元素。如果两个集合没有共同的元素，则返回true，否则返回false。

**代码示例：**
```
List<Integer> list1 = Arrays.asList(1, 2, 3);
List<Integer> list2 = Arrays.asList(4, 5, 6);

boolean areDisjoint = Collections.disjoint(list1, list2); // 返回 true
```

### 76. 什么是Collections类的reverse()方法？

**回答：**
Collections.reverse()方法是java.util包中的一个静态方法，用于反转集合中的元素顺序。

**代码示例：**
```
List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
Collections.reverse(list); // 将集合元素的顺序反转
```

### 77. 什么是Collections类的shuffle()方法？

**回答：**
Collections.shuffle()方法是java.util包中的一个静态方法，用于随机打乱集合中的元素顺序。

**代码示例：**
```
List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
Collections.shuffle(list); // 随机打乱集合元素的顺序
```

### 78. 什么是Collections类的min()和max()方法？

**回答：**
Collections.min()和Collections.max()方法是java.util包中的两个静态方法，用于找到集合中的最小和最大元素。

**代码示例：**
```
List<Integer> list = Arrays.asList(3, 1, 4, 1, 5, 9, 2, 6);
int minValue = Collections.min(list); // 返回 1
int maxValue = Collections.max(list); // 返回 9
```

### 79. 什么是Collections类的addAll()方法？

**回答：**
Collections.addAll()方法是java.util包中的一个静态方法，用于将一组元素添加到集合中。这个方法接受一个目标集合和一组元素作为参数，并将这些元素添加到目标集合中。

**代码示例：**
```
List<String> list = new ArrayList<>();
Collections.addAll(list, "apple", "banana", "orange");
```

### 80. 什么是Collections类的synchronizedXXX()方法？

**回答：**
Collections.synchronizedXXX()方法是java.util包中的一系列静态方法，用于创建线程安全的集合，其中XXX可以是List、Set或Map。这些方法返回一个包装后的集合，可以在多线程环境下安全使用。

**代码示例：**
```
List<String> list = new ArrayList<>();
List<String> synchronizedList = Collections.synchronizedList(list);

// synchronizedList 可以在多线程环境下安全操作
```

### 81. 什么是Arrays类的spliterator()方法？

**回答：**
Arrays.spliterator()方法是java.util包中的一个静态方法，用于创建数组的分割迭代器（Spliterator）。分割迭代器可以将数组的元素划分为多个部分，以便进行并行处理。

**代码示例：**
```
int[] array = {1, 2, 3, 4, 5};
Spliterator.OfInt spliterator = Arrays.spliterator(array);

// 使用 spliterator 进行并行处理
```

### 82. 什么是Collections类的newSetFromMap()方法？

**回答：**
Collections.newSetFromMap()方法是java.util包中的一个静态方法，用于从现有的Map实例创建一个Set实例。这个Set实例的元素将与Map的键关联，因此只能包含唯一的元素。

**代码示例：**
```
Map<String, Boolean> map = new HashMap<>();
Set<String> set = Collections.newSetFromMap(map);

// set 中的元素将与 map 的键关联
```

### 83. 什么是Collections类的checkedMap()方法？

**回答：**
Collections.checkedMap()方法是java.util包中的一个静态方法，用于创建一个类型安全的Map，其中的键和值都需要符合特定的类型。这可以帮助你在编译时捕获类型错误。

**代码示例：**
```
Map<String, Integer> map = new HashMap<>();
Map checkedMap = Collections.checkedMap(map, String.class, Integer.class);

// 只能将符合类型的键值对添加到 checkedMap
```

### 84. 什么是Collections类的emptyXXX()方法？

**回答：**
Collections.emptyXXX()方法是java.util包中的一系列静态方法，用于创建空的集合，其中XXX可以是List、Set或Map。

**代码示例：**
```
List<String> emptyList = Collections.emptyList();
Set<Integer> emptySet = Collections.emptySet();
Map<String, Integer> emptyMap = Collections.emptyMap();
```

### 85. 什么是Collections类的singletonMap()方法？

**回答：**
Collections.singletonMap()方法是java.util包中的一个静态方法，用于创建只包含一个键值对的不可修改Map实例。

**代码示例：**
```
Map<String, Integer> singletonMap = Collections.singletonMap("key", 42);
```

### 86. 什么是Collections类的nCopies()方法？

**回答：**
Collections.nCopies()方法是java.util包中的一个静态方法，用于创建一个包含指定元素重复多次的不可修改的List实例。

**代码示例：**
```
List<String> copies = Collections.nCopies(3, "Hello");
// 创建一个包含 3 个 "Hello" 的 List
```

### 87. 什么是Collections类的reverseOrder()方法？

**回答：**
Collections.reverseOrder()方法是java.util包中的一个静态方法，用于获取一个比较器，该比较器按照元素的逆自然顺序进行比较。

**代码示例：**
```
List<Integer> list = Arrays.asList(5, 2, 8, 1, 3);
Collections.sort(list, Collections.reverseOrder()); // 按逆序排序
```

### 88. 什么是Collections类的rotate()方法？

**回答：**
Collections.rotate()方法是java.util包中的一个静态方法，用于循环移动集合中的元素。这个方法接受一个集合和一个距离参数，将集合中的元素循环移动指定的距离。

**代码示例：**
```
List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
Collections.rotate(list, 2); // 循环移动 2 个位置
```

### 89. 什么是Collections类的replaceAll()方法？

**回答：**
Collections.replaceAll()方法是java.util包中的一个静态方法，用于将集合中的所有旧值替换为新值。

**代码示例：**
```
List<String> list = new ArrayList<>(Arrays.asList("apple", "banana", "apple", "orange"));
Collections.replaceAll(list, "apple", "fruit");

// 将所有 "apple" 替换为 "fruit"
```

### 90. 什么是Collections类的singleton()方法？

**回答：**
Collections.singleton()方法是java.util包中的一个静态方法，用于创建一个只包含一个元素的不可修改Set实例。

**代码示例：**
```
Set<String> singletonSet = Collections.singleton("Hello");
```

### 91. 什么是Collections类的enumeration()方法？

**回答：**
Collections.enumeration()方法是java.util包中的一个静态方法，用于将指定集合转换为一个枚举（Enumeration）对象。枚举是一种旧的迭代方式，通常在遗留代码中使用。

**代码示例：**
```
List<String> list = Arrays.asList("apple", "banana", "orange");
Enumeration<String> enumeration = Collections.enumeration(list);
```

### 92. 什么是Collections类的indexOfSubList()和lastIndexOfSubList()方法？

**回答：**
Collections.indexOfSubList()和Collections.lastIndexOfSubList()方法是java.util包中的两个静态方法，用于在一个集合中查找另一个集合子列表的第一个和最后一个索引。

**代码示例：**
```
List<Integer> list = Arrays.asList(1, 2, 3, 4, 5, 2, 3);
List<Integer> sublist = Arrays.asList(2, 3);

int firstIndex = Collections.indexOfSubList(list, sublist); // 返回 1
int lastIndex = Collections.lastIndexOfSubList(list, sublist); // 返回 5
```

### 93. 什么是Collections类的newXXX()方法？

**回答：**
Collections.newXXX()方法是java.util包中的一系列静态方法，用于创建可修改的空集合，其中XXX可以是List、Set或Map。

**代码示例：**
```
List<String> newList = Collections.newLinkedList();
Set<Integer> newSet = Collections.newSetFromMap(new HashMap<>());
Map<String, Integer> newMap = Collections.newHashMap();
```

### 94. 什么是Collections类的checkedSortedMap()方法？

**回答：**
Collections.checkedSortedMap()方法是java.util包中的一个静态方法，用于创建一个类型安全的有序Map，其中的键和值都需要符合特定的类型。这可以帮助你在编译时捕获类型错误。

**代码示例：**
```
SortedMap<String, Integer> sortedMap = new TreeMap<>();
SortedMap checkedSortedMap = Collections.checkedSortedMap(sortedMap, String.class, Integer.class);

// 只能将符合类型的键值对添加到 checkedSortedMap
```

### 95. 什么是Collections类的emptyIterator()和emptyListIterator()方法？

**回答：**
Collections.emptyIterator()和Collections.emptyListIterator()方法是java.util包中的两个静态方法，用于创建空的迭代器（Iterator）和空的列表迭代器（ListIterator）实例。

**代码示例：**
```
Iterator<String> emptyIterator = Collections.emptyIterator();
ListIterator<Integer> emptyListIterator = Collections.emptyListIterator();
```

### 96. 什么是Collections类的fill()方法？

**回答：**
Collections.fill()方法是java.util包中的一个静态方法，用于将指定的值填充到列表中的所有元素。

**代码示例：**
```
List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
Collections.fill(list, 0); // 将列表的所有元素填充为 0
```

### 97. 什么是Collections类的unmodifiableCollection()方法？

**回答：**
Collections.unmodifiableCollection()方法是java.util包中的一个静态方法，用于创建不可修改的集合视图，其中的元素与原始集合相同，但不能进行增加、删除或修改操作。

**代码示例：**
```
List<String> list = new ArrayList<>(Arrays.asList("apple", "banana", "orange"));
Collection<String> unmodifiableCollection = Collections.unmodifiableCollection(list);

// 尝试修改 unmodifiableCollection 会引发 UnsupportedOperationException
```

### 98. 什么是Collections类的disjoint()方法？

**回答：**
Collections.disjoint()方法是java.util包中的一个静态方法，用于判断两个集合是否没有共同的元素。如果两个集合没有共同的元素，则返回true，否则返回false。

**代码示例：**
```
List<Integer> list1 = Arrays.asList(1, 2, 3);
List<Integer> list2 = Arrays.asList(4, 5, 6);

boolean areDisjoint = Collections.disjoint(list1, list2); // 返回 true
```

### 99. 什么是Collections类的singleton()方法？

**回答：**
Collections.singleton()方法是java.util包中的一个静态方法，用于创建只包含一个元素的不可修改Set实例。

**代码示例：**
```
Set<String> singletonSet = Collections.singleton("Hello");
```

### 100. 什么是Collections类的synchronizedCollection()方法？

**回答：**
Collections.synchronizedCollection()方法是java.util包中的一个静态方法，用于创建一个线程安全的集合，其中的元素与原始集合相同，但可以在多线程环境中安全操作。

**代码示例：**
```
List<String> list = new ArrayList<>();
Collection<String> synchronizedCollection = Collections.synchronizedCollection(list);

// synchronizedCollection 可以在多线程环境下安全操作
```
