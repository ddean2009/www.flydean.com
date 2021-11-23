dart系列之:在dart中使用集合

[toc]

# 简介

dart中的集合有三个，分别是list，set和map。dart在dart:core包中提供了对于这三种集合非常有用的方法，一起来看看吧。

# List的使用

首先是list的创建,可以创建空的list或者带值的list：

```
var emptyList =[];

var nameList = ['jack','mac'];

```

使用List的构造函数来创建：

```
var nameList = List.filled(2, 'max');
```

向list中添加元素或者list：

```
nameList.add('tony');
nameList.addAll(['lili', 'bruce']);
```

删除元素：

```
nameList.removeAt(0);
nameList.clear();
```

dart提供了list的排序方法sort()，sort可以接一个比较的函数，用来表示谁在前谁在后：

```
var names = ['jack', 'tony', 'max'];

fruits.sort((a, b) => a.compareTo(b));
```

list中还可以使用泛型，表示list中固定的类型：

```
var names = <String>[];

names.add('jack');
```

# Set的使用

Set表示的是不重复的元素的集合。但是set和list不同的是set是无序的，所以你不能用index来定位set中的元素。

来看下set的基本用法：

```
//创建一个空的set
var names = <String>{};

// 添加新的元素
names.addAll(['jack', 'tony', 'max']);

//删除元素

names.remove('jack');
```

或者使用Set的构造函数来构造Set：

```
var names = Set.from(['jack', 'tony', 'max']);
```

判断集合中元素是否存在：

```
assert(names.contains('jack'));

assert(names.containsAll(['jack', 'tony']));
```

set还有一个intersection的操作，用来求两个set的交集：

```
var name1 = Set<String>();
name1.addAll(['jack', 'tony', 'max']);

var name2 = Set.from(['tony', 'bily']);
var intersection = name1.intersection(name2);
```

# Map的使用

Map是一种key，value的数据类型,也是一种在程序中非常常见的数据类型。

先看下怎么创建Map：

```
// 创建map
var studentMap = {
  'name': 'jack',
  'age': '18',
  'class': 'class one'
};


var teacherMap = Map();

var teacherMap2 = Map<String, String>();
```

添加和删除：

```
  var studentMap =Map();
  studentMap.putIfAbsent('name', ()=>'jack');
  studentMap.remove('name');
```

判断map中是否包含某个key可以使用containsKey()：

```
assert(studentMap.containsKey('name'));
```

# 常见的集合方法

集合中最常见的方法就是判断集合是否为空：

```
assert(studentMap.isEmpty);
assert(studentMap.isNotEmpty);
```

如果想对集合中的每个元素都进行某个函数操作，则可以使用forEach():

```
var names = ['jack', 'bob', 'tom'];

names.forEach((name) => print('the name is $name'));

var nameMap = {};

nameMap.forEach((k, v) {
});

```

如果是可遍历对象，则有一个map方法，map方法会返回一个新的对象：

```
var names = ['jack', 'bob', 'mark'];

var names2 = names.map((name) => name.toUpperCase());
```

> 注意，map返回的是一个Iterable,它是延时计算的，只有被使用的时候才会进行计算。

如果你想立即计算的话，则可以使用map().toList() 或者 map().toSet():

```
var names2 =
    names.map((name) => name.toUpperCase()).toList();
```

可遍历对象还可以进行条件选择。比如使用where()来获得所有匹配的对象，使用any()来判断集合中是否有匹配的对象，使用every()来判断集合中是否全部匹配。

```
var names = ['jack', 'bob', 'max'];

bool hasJack(String name) =>
    name == 'jack';

var seleteJack =
    names.where((name) => hasJack(name));

assert(names.any(hasJack));

assert(!names.every(hasJack));
```

# 总结

集合是在程序编写过程中非常常用的一种类型，大家一定要熟练掌握。














