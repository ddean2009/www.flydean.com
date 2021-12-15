dart系列之:dart中的安全特性null safety

[toc]

# 简介

在Dart 2.12中引入了null safety的新特性，也就是说dart程序中默认类型都是非空的，除非你显示告诉编译器，这个类型可以为空。

看起来是一个小小的改动，但是这个小小的改动导致了很多Dart包的大版本升级，从而导致使用Dart2.12之前的版本跟使用dart2.12之后的版本完全就是两个不同的世界。

真的这么奇妙吗？一起来看看Dart 2.12 null safety的特性吧。

# Non-nullable类型

在感受Non-nullable类型之前，我们先看一段代码：

```
void main(){
  String name;
  print('name is $name.');
}
```

代码很简单，我们定义了一个String类型的name字符串，然后在print语句中打印它。

如果你是在dart 2.12版本之前，那么是没有问题的。

但是到了2.12，则会报错：

```
The non-nullable local variable 'name' must be assigned before it can be used.

Try giving it an initializer expression, or ensure that it's assigned on every execution path.
```

意思就是说，name是非空的，你必须要给他赋个值。

通过强制不为空，保证了代码的安全性，非常好用。

那么如果name就可以为空怎么处理呢？

别急，我们可以给可以为空的类型后面加上?即可：

```
void main(){
  String? name;
  print('name is $name.');
}
```

# Nullable List Of Strings 和 List Of Nullable Strings

假如我们要创建一个List，list里面包含的是String，则可以这样创建：

```
List<String> aListOfStrings = ['one', 'two', 'three'];
```

在dart 2.12中，非空检查也被用到了泛型中，所以，默认情况下List中的String也不能为空，如果非要为空，则需要这样写：

```
List<String?> aListOfNullableStrings = ['one', null, 'three'];
```

对于list本身来说，它也是不能为空的，如果要为空，则需要这样写：

```
List<String>? aNullableListOfStrings;
```

# !操作符

如果你认为某个对象在使用的时候确定不是null，那么可以在表达式后面添加！，如下所示：

```
  String? word;
  word = aListOfNullableStrings.first;
  print(word!.length);
```

# late关键字

有时候，我们知道某个对象一定不是空，但是目前来说，并不能立刻对其进行赋值，这时候就需要使用到late关键字。

下面是一个用到late的例子：

```
class Team {
  late final Coach coach;
}

class Coach {
  late final Team team;
}

void main() {
  final myTeam = Team();
  final myCoach = Coach();
  myTeam.coach = myCoach;
  myCoach.team = myTeam;

  print('All done!');
}
```

上面的代码中，我们有两个类互相引用，但是两个类都是不为空的，如果不使用late，则会编译失败。

使用late就可以在后面合适的时候对类中的属性进行初始化，从而保证代码的运行。

# 总结

以上就是dart 2.12中新增加的null safety的使用。



