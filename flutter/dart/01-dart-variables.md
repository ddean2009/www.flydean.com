dart系列之:dart语言中的变量

[toc]

# 简介

flutter是google在2015年dart开发者峰会上推出的一种开源的移动UI构建框架,使用flutter可以非常方便的编译成运行在原始android,ios,web等移动平台上的移动应用。

flutter是使用dart来编写的，最新的flutter版本是2.5.3,而最新的Dart语言版本是2.14。

本系列将会深入谈谈dart语言的用法和最佳实践，希望大家能够喜欢。

# dart中的变量

Dart语言吸取了java和javascript的精华，如果你是上述语言的开发者，那么会很容易迁移到dart语言上。我们先从一个语言最基本的变量开始，探讨dart语言的奥秘。

## 定义变量

Dart中定义变量和java，javascript中定义变量是一致的，如下所示：

```
var name = 'jack';
```

上面我们使用var表示name的类型是可以通过推断得到。在程序编写过程中，如果我们遇到某些变量并不知道其类型的时候，可以尝试使用var,让dart自行推断。

当然，我们也可以指定变量的类型，如上所示，可以指定name为String类型：

```
String name = 'jack';
```

在dart中，所有的变量都是Object，而每个对象都是一个Class的实例。包括数字、函数、null都是Object。所有的对象都继承自Object类。

所以上面的赋值也可以这样写：

```
Object name = 'jack';
```

## 变量的默认值

在dart中，未初始化的变量都有一个nullable类型的值，这个值的初始值是null。

和java中不一样的是，dart中所有的number的初始值也是null。这是因为dart中的number也是一个对象。

如果一个变量可以为null，那么在赋值的时候可以在变量类型后面加上?, 如下所示：

```
int? age;
```

对于类变量来说，只会在使用的时候进行初始化,这种初始化策略叫做延时初始化。

## Late变量

Late修饰符是在Dart 2.12引入的新特性。他可以表示变量需要被延时加载，或者表示一个不为空的变量会在后续被初始化。

我们可以这样使用：

```
late int age;

void main() {
  age = 18;
  print(age);
}

```

为什么用late呢？因为有时候Dart无法检查某些变量在使用之前是否被初始化了，但是如果你非常确定的话，使用late来修饰它即可。

另外，late修饰的变量只有在使用的时候才会被初始化，所以我们可以使用late来定义一些耗时、耗资源的操作。

## 常量

如果变量是不会变化的，那么这就不是变量了，而是常量。

常量可以用final或者const来修饰，final变量表示变量只会被赋值一次。

而const变量表示变量会在编译的时候被赋值，默认const也是final的。

如下所示：

```
final age = 18; 
final int age = 18;
```

```
const age = 20; 
```

如果const变量是class变量，那么将其设置为static。

constant还可以用来赋值，如下所示：

```
var age = const [];
final bar = const [];
const baz = []; // Equivalent to `const []`
```

上面的代码中，虽然age的值是const的，但是age本身并不是const，所以age是可以重新被赋值的：

```
foo = [18, 21, 23]; 
```

但是bar是final的，所以bar并不能被重新赋值。




