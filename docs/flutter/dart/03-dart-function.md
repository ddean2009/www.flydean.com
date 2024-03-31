---
slug: /03-dart-function
---

# 3. dart语言中的函数

# 简介

函数是所有编程语言都有的内容，不管是面向对象还是面向过程，函数都是非常重要的一部分。dart中的函数和java中的函数有什么区别呢？

dart作为一种面向对象的编程语言，它的函数也是一个对象，用Function来表示。先看下函数的定义：

```
abstract class Function {
  
  external static apply(Function function, List<dynamic>? positionalArguments,
      [Map<Symbol, dynamic>? namedArguments]);

  int get hashCode;

  bool operator ==(Object other);
}
```

既然函数是一个对象，那么可以将函数赋值给对象,还可以将函数当做参数传递给其他的函数。

下面是一个简单的函数，由返回值，函数名称，参数和函数体来表示：

```
bool isStudent(int age){
    return age < 20;
    }
```

尽管dart建议我们指定函数的返回值类型，但是你也可以忽略返回值：

```
isStudent(int age){
    return age < 20;
    }
```

函数还有一个简写方式，如果函数体只有一条语句，那么可以使用=> 来替代括号：

```
isStudent(int age) => age < 20;
```

看起来更加简洁。

# 函数的参数

dart中的函数参数有普通参数，也有命名参数。

普通参数很好理解，那么什么是命名参数呢？

命名参数就是给参数传递的时候起了一个名字，这样函数在调用的时候，可以指定参数的名字，来赋值。

看一个函数参数和命名参数的例子：

```
bool calculator(int age , {int? size}){

}

```

可以这样调用：

```
calculator(15,size:10);
```

默认情况下命名参数是可选的，也就是说函数在调用的时候可以选择是否传递可选的参数。

如果必须要传递某个参数，那么可以将其设置为required.

除了命名参数之外，dart还有可选的位置参数,就是将参数放在[]中,如下所示：

```
String say(String from, String msg, [String? device]) {
  var result = '$from says $msg';
  if (device != null) {
    result = '$result with a $device';
  }
  return result;
}
```

上面的函数在调用的时候，可以只传入普通参数，也可以额外的传入可选的位置参数,如下：

```
say('Bob', 'Howdy');
say('Bob', 'Howdy', 'smoke signal');
```

dart中的参数还可以设置默认值，如下：

```
String say(String from='mack', String msg, [String? device='ios']) {
  ...
}
```

# main函数

dart中main函数是应用程序的启动入口，main()是一个特殊的函数，他是没有返回值的带有可选List<String>参数的函数，如下所示：

```
void main() {
  print('Hello, World!');
}
```

```
void main(List<String> arguments) {
  print(arguments);
}
```

# 匿名函数

大部分函数都是带有名字的，方便函数的调用。在某些情况下，函数也可以不带名字，这样的函数叫做匿名函数。

匿名函数就是没有名字的函数，如下所示：

```
([[Type] param1[, …]]) {
  codeBlock;
};
```

匿名函数通常用在不需要被其他场景调用的情况，比如遍历一个list：

```
const list = ['apples', 'bananas', 'oranges'];
list.forEach((item) {
  print('${list.indexOf(item)}: $item');
});
```

# 闭包

提到闭包，大家马上就会想到javascript，没错，除了javascript，dart中也可以构建闭包。

什么是闭包呢？简单点说就是函数的函数。也就是一个函数中定义的变量，在函数范围外被其他的函数所使用。

```
Function sum(int age1){
    return (int i) => age1 +i; 
}

void main() {
  var sum2 = sum(2);
  var result = sum2(5);
}
```

上例子中，sum传入的变量2，被在后续的sum2中使用。

# 函数的返回值

所有的函数都有返回值，如果没有显示返回的话，那么返回的就是null.

所以对下面的函数来说：

```
foo() {}

```
它的值是null，也就是说下面的表达式是true：

```
assert(foo() == null);
```

# 总结

以上，就是Dart中函数的定义了。










