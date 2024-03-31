---
slug: /06-dart-class
---

# 6. dart类中的构造函数



# 简介

dart作为一种面向对象的语言，class是必不可少的。dart中所有的class,除了Null都继承自Object class。 要想使用dart中的类就要构造类的实例，在dart中，一个类的构造函数有两种方式，一起来看看吧。

# 传统的构造函数

和JAVA一样，dart中可以使用和class名称相同的函数作为其构造函数，这也是很多编程语言中首先的构造函数的创建方式，我们以Student类为例，来看看dart中的构造函数是怎么样的：

```
class Student {
  int age = 0;
  int id = 0;

  Point(int age, int id) {
    this.age = age;
    this.id = id;
  }
}
```

上面的this表示的是当前类的实例，对dart来说，this是可以忽略的，但是在上面的例子中，因为类变量的名字和构造函数传入参数的名字是一样的，所以需要加上this来进行区分。

上面的代码虽然很简单，但是写起来还是有太多的内容，下面是dart中的一种简写方式：

```
class Student {
  int age = 0;
  int id = 0;

  Student(this.age, this.id);
}
```

当然，你也可以不指定构造函数，这样的话dart会为你创建一个默认的无参的构造函数。

# 命名构造函数

dart和其他语言不同的地方是，还可以使用命名构造函数。命名构造函数的格式是ClassName.identifier，如下所示：

```

class Student {
  int age = 0;
  int id = 0;

  Student(this.age, this.id);

    Student.fromJson(Map data) {
    print('in Student');
  }
}
```

上面的Student.fromJson就是一个命名构造函数。可以使用该构造函数从Map中生成一个Student对象，有点像是java中的工厂方法。

# 构造函数的执行顺序

我们知道，dart中的类是可以继承的，那么对于dart中的子类来说，其构造函数的执行顺序是怎么样的呢？

如果不给dart类指定构造函数，那么dart会为类自动生成一个无参的构造函数，如果这个类是子类的话，则会自动调用父类的无参构造函数。

那么对应子类的构造函数来说，初始化的时候有三步：

1. 调用初始化列表 
2. 调用父类的构造函数
3. 调用自己的构造函数

在步骤2中，如果父类没有默认的无参构造函数，则需要手动指定具体父类的构造函数。怎么调用呢？可以直接在子类的构造函数后面使用：操作符接父类的构造函数，如下所示：

```
class Student {
  String? firstName;
  
  Student.fromJson(Map data) {
    print('in Student');
  }
}

class Jone extends Student {
  
  Jone.fromJson(Map data) : super.fromJson(data) {
    print('in Jone');
  }
}
```

理解了父类的构造函数之后，我们再看一下什么是初始化列表呢？

初始化列表就是在构造函数执行之前执行的代码，和调用父类的构造函数一样，也使用：操作符，如下所示：

```
Point.fromJson(Map<String, double> json)
    : x = json['x']!,
      y = json['y']! {
  print('In Point.fromJson(): ($x, $y)');
}
```

# 重定向构造函数

如果一个构造函数需要调用另外一个构造函数，而其本身并不进行任何变动，这可以使用重定向构造函数，重定向构造函数也使用：操作符，后面跟的是另外的构造函数：

```
class Point {
  double x, y;

  // 主构造函数
  Point(this.x, this.y);

  // 重定向构造函数
  Point.alongXAxis(double x) : this(x, 0);
}
```

# Constant构造函数

如果对象中的属性在创建之后，是不会变化的，则可以使用Constant构造函数， 也就是在构造函数前面加上const修饰符，初始化的所有属性都要以final来修饰：

```
class ImmutablePoint {
  static const ImmutablePoint origin = ImmutablePoint(0, 0);

  final double x, y;

  const ImmutablePoint(this.x, this.y);
}
```

# 工厂构造函数

默认情况下，dart类中的构造函数返回的是该类的新实例，但是我们在实际的应用中可能会对返回的对象做些选择，比如从缓存中返回已经存在的对象，或者返回该类具体的实现子类。

为了实现这样的功能，dart中专门有一个Factory关键字，使用Factory的构造函数叫做工厂构造函数。

```
class Student {
  final String name;

  static final Map<String, Student> _studentMap =
  <String, Student>{};

  factory Student(String name) {
    return _studentMap.putIfAbsent(
        name, () => Student._newStudent(name));
  }

  factory Student.fromJson(Map<String, Object> json) {
    return Student(json['name'].toString());
  }

  Student._newStudent(this.name);
}
```

> 注意，dart中只能有一个未命名的构造函数，对应命名函数来说，名字不能够重复，否则会报The default constructor is already defined异常。

上面的代码中，factory Student是一个未命名构造函数，而factory Student.fromJson则是一个命名构造函数。

所以如果你再给Student加一个未命名构造函数，如下：

```
Student(this.name);
```

则会报错。

那么问题来了，factory构造函数和普通构造函数到底有什么区别呢?

他们最大的区别就是普通构造函数是没有返回值的，而factory构造函数需要一个返回值。

# 总结

以上就是dart中各种构造函数，和使用过程中需要注意的问题。













