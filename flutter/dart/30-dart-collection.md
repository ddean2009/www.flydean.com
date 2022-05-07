dart系列之:集合使用最佳实践

[toc]

# 简介

dart中有四种集合，分别是Set，List，Map和queues。这些集合在使用中需要注意些什么呢？什么样的使用才是最好的使用方法呢?一起来看看吧。

# 使用字面量创建集合

对于常用的Set,Map和List三个集合来说，他们是有自己的无参构造函数的：

```
  factory Set() = LinkedHashSet<E>;
  external factory Map();

  @Deprecated("Use a list literal, [], or the List.filled constructor instead")
  external factory List([int? length]);
```

可以看到Set和Map是可以使用构造函数的。但是对于List来说，无参的构造函数已经不推荐使用了。

对于Set和Map来说，可以这样构造：

```
var studentMap = Map<String, Student>();
var ages = Set<int>();
```

但是dart官方推荐直接使用字面量来创建这些集合，如下所示：

```
var studentMap = <String, Student>{};
var ages = <int>{};
```

为什么呢？这是因为dart中的字面量集合是非常强大的。可以通过扩展运算符,if和for语句对集合进行构造和扩展，如下所示：

```
var studentList = [
  ...list1,
  student1,
  ...?list2,
  for (var name in list3)
    if (name.endsWith('jack'))
      name.replaceAll('jack', 'mark')
];
```

# 不要使用.length来判断集合是否为空

对应dart的可遍历集合来说，这些集合并没有存储集合的长度信息，所以如果你调用集合的.length方法，可能会导致集合的遍历，从而影响性能。

> 注意Set和List是可遍历的，而Map是不可遍历的。

所以，我们需要调用集合的.isEmpty 和 .isNotEmpty方法来判断集合是否为空，这样速度更快。

```
if (studentList.isEmpty) print('it is empty');
if (studentList.isNotEmpty) print('it is not empty');
```

# 可遍历对象的遍历

对应Set和List这两个可遍历的集合来说，有两种遍历方法，可以通过调用forEach() 方法或者for-in来进行遍历，如下所示：

```
for (final student in studentList) {
  ...
}
```

```
studentList.forEach((student) {
  ...
});
```

这两种方法中，dart推荐使用for in的写法。

当然，如果你想将现有的function应用在集合中的每个元素中，forEach也是可以的：

```
studentList.forEach(print);
```

> 注意，因为Map是不可遍历的，所以上面的规则对Map并不适用。

# List.from和iterable.toList

可遍历对象可以通过调用toList将其转换成为List，同样的List.from也可以将可遍历对象转换成为List。

那么两者有什么区别呢？

```
var list1 = iterable.toList();
var list2 = List.from(iterable);
```

两者的区别是iterable.toList并不会改变list中数据的类型，而List.from会. 举个例子：

```
// Creates a List<String>:
var studentList = ['jack', 'mark', 'alen'];

// Prints "List<String>":
print(studentList.toList().runtimeType);

// Prints "List<dynamic>":
print(List.from(studentList).runtimeType);
```

当然，你也可以使用List<T>.from来强制对创建出来的List进行类型转换。

```
List<String>.from(studentList)
```

# where和whereType

对于可遍历对象来说，两个过滤集合中元素的方法，他们是where和whereType。

比如，我们需要过滤List中的字符串，则可以这样写：

```
var studentList = ['jack', 'ma', 18, 31];
var students1 = studentList.where((e) => e is String);
var students2 = studentList.whereType<String>();
```

看上去两者没有太大的区别，都可以得到应有的结果。但是两者事实上还是有区别的，因为对应where来说，返回的是一个`Iterable<Object>`,所以上面的例子中，如果我们真的需要返回String，还需要对返回结果进行cast

```
var students1 = studentList.where((e) => e is String).cast<String>();;
```

所以，如果你要返回特定的对象时候，记得使用whereType。

# 避免使用cast

cast通常用来对集合中的元素进行类型转换操作，但是cast的性能比较低，所以在万不得已的情况下，一定要避免使用cast。

那么如果不使用cast，我们怎么对类型进行转换呢？

一个基本的原则就是在构建集合的时候提前进行类型转换，而不是在构建集合之后再进行整体的cast。

比如下面的例子从一个dynamic类型的List转换成为int类型的List，那么我们可以在调用List.from方法的时候进行类型转换：

```
var stuff = <dynamic>[1, 2];
var ints = List<int>.from(stuff);
```

如果是map的话，可以这样操作：

```
var stuff = <dynamic>[1, 2];
var reciprocals = stuff.map<double>((n) => 1 / n);
```

比如我们需要构建一个int的List，那么在创建之初就可以指定List的内部类型，然后再对其添加元素：

```
List<int> singletonList(int value) {
  var list = <int>[];
  list.add(value);
  return list;
}
```

# 总结

以上就是dart中的集合使用最佳实践。









