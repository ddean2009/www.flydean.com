dart系列之:dart类中的泛型

[toc]

# 简介

熟悉JAVA的朋友可能知道，JAVA在8中引入了泛型的概念。什么是泛型呢？泛型就是一种通用的类型格式，一般用在集合中，用来指定该集合中应该存储的对象格式。

有了泛型可以简化我们的编程，并且可以减少错误的产生，非常的方便。

dart语言中也有泛型。一起来看看吧。

# 为什么要用泛型

使用泛型的主要目的是保证类型安全，比如我们有一个List，然后只希望List中保存String类型，那么在dart中可以这样指定：

```
var stringList = <String>[];
stringList.addAll(['jack ma', 'tony ma']);
stringList.add(18); // 报错
```

那么在使用的过程中，只能向stringList中添加字符串，如果向其添加数字，则会报错，从而保证List中类型的一致性。

巧妙的使用泛型还能够减少我们的代码量，因为泛型可以代表一类通用的类型。

比如，在学校中，我们有寝室，寝室是有男女之分的，那么对应男生来说有这样的定义：

```
abstract class BoyRoom {
    Boy getByName(String name);
}
```

对于女生来说有这样的定义：

```
abstract class GirlRoom{
    Girl getByname(String name);
}
```

事实上，两者本质上没太大区别，只是参数或者返回值的类型发生了变化，那么我们可以这样写：

```
abstract class Room<T>{
    T getByname(String name);
}
```

从而简化了代码的使用。

# 怎么使用泛型

泛型一般使用大写的单个字符来表示，通常来说是E, T, S, K 和 V等。

泛型最常见的使用地方是集合中，比如List, set 和 map中：

```
var listExample = <String>['jack ma', 'tony ma'];
var setExamples = <String>{'jack ma', 'tony ma'};
var mapExamples = <String, String>{
  'name1': 'jack ma',
  'name2': 'tony ma',
};
```

泛型还可以用在这些集合类的构造函数中，如下：

```
var stringMap = Map<String, String>();
```

表示构造出来的集合中，应该包含对应的类型。

## 类型擦除

虽然JAVA中也有泛型，但是JAVA中的泛型有一个类型擦除的特点。什么时候类型擦除呢？类型擦除就是指泛型指定的类型，只在编译的时候生效，而在运行时是没有泛型的概念的。

对于一个List<String> 来说，JAVA在运行时，只能判断对象是不是List，而不能判断对象是不是List<String>。

dart就和java不一样了，dart在运行时能够携带类型信息，也就是说，在dart中可以判断一个对象是不是List<String>。

```
var stringList = <String>[];
stringList.addAll(['jack ma', 'tony ma']);
print(names is List<String>); // true
```

## 泛型的继承

使用泛型的目的是限制参数的类型，所以我们通常会指定泛型的父类，以限制泛型的类型范围:

```
class Room<T extends Student> {

}

class Boy extends Student {...}
```

在使用的过程中，可以传入Student本身，也可以传入Student的子类Boy，还可以不传：


```
var student = Room<Student>();
var boy = Room<Boy>();
var studentDefault = Room();
```

## 泛型方法

dart中的泛型除了可以用在class中以外，还可以用在方法中：

```
T doSomething<T>(List<T> list) {
  T result = list[0];
  return result;
}
```

方法中指定的泛型可以用在返回类型、参数和方法中的本地变量类型中。

# 总结

以上就是dart中泛型和其使用的介绍。










