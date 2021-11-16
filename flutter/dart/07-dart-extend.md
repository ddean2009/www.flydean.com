dart系列之:dart类的扩展

[toc]

# 简介

虽然dart中的类只能有一个父类，也就是单继承的，但是dart提供了mixin语法来绕过这样限制。

今天，和大家一起来探讨一下dart类中的继承。

# 使用extends

和JAVA一样，dart中可以定义一个父类，然后使用extends来继承他，得到一个子类，如下所示：

```
class Student{

}
class Boy extends Student{

}
```

在子类中，可以使用super关键词来调用父类的方法。

# 抽象类和接口

dart中除了继承普通类之外，还可以继承抽象类和实现接口。

抽象类是以abstract关键词修饰的class，如下所示：

```
abstract class Student{
    String getName();
}
```

抽象类中通常会有抽象方法，抽象方法需要在子类中进行实现。

当然抽象类中也可以有具体实现的方法，但是抽象类不可以被实例化，如果你想在抽象类中实例化对象，这可以使用之前我们提到的工厂构造函数。

和java不同的是，dart中并没有interface，他引入的是一个Implicit interfaces的概念。

对应每个对象来说，都隐式定义了一个包含类中所有方法和属性的接口。

一般来说，如果一个对象包含另外一个对象的结构和方法，但是他们之间的内容又是不一样的，则可以使用implements来隐式实现接口，如下所示：

```
class Student{

  String name;
  String get _name => name;
}

class Girl implements Student{
  @override
  String name;

  @override
  String get _name => "girls";
}
```

在dart中一个类可以implements多个接口。

上面的例子中，我们用到了@override注解，他表示子类对父类方法或者属性的重写。

在使用@override中，我们需要注意的是，子类对父类的实现会有下面几个限制：

1. 子类的实现方法的返回值，必须和父类返回值相同，或者是父类返回值的子类。
2. 子类的实现方法的参数，必须和父类方法参数相同，或者是父类参数的父类。
3. 子类方法的参数必须和父类的参数个数相同。

# mixins

虽然dart不支持多重继承，但是可以使用mixin来实现类似多重继承的功能。

要使用mixins，可以使用关键字with，如下所示：

```
class Boy extends Student with Person {
  // ···
  name='boy';
  myName();
}
```

在dart中mixin是一个特殊的类，使用关键词mixin来描述，mixin的类中，没有构造函数，如下所示：

```
mixin Person {
  String name='';

  void myName() {
      print('my name is:'+name);
  }
}
```

在mixin中可以定义有用的方法和属性，继承mixin的类可以重写对应的属性和方法，从而达到自定义的功能。

在mixin中我们也可以指定特定的类，也就是说只有特定的类才能够使用mixin，则可以使用关键词on,如下所示：

```
mixin Person on Boy{
  String name='';

  void myName() {
      print('my name is:'+name);
  }
}

```

# 总结

以上就是dart中继承的使用，dart中还可以继承方法，这是dart的高级应用，我们会在后续的文章中进行介绍，敬请期待。





