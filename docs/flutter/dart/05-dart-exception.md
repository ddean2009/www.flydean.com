---
slug: /05-dart-exception
---

# 5. dart语言中的异常



# 简介

Exception是程序中的异常情况，在JAVA中exception有checked Exception和unchecked Exception。那么在dart中的情况是不是一样的呢？一起来看看吧。

# Exception和Error

Dart中表示异常的类有两个，分别是Exception和Error。他们两个有什么区别呢？

Exception是由VM或者dart code中抛出的。

Exception主要用来表示用户程序编写过程中产生的异常,是可以定位到的可以解决的异常。通常来说Exception中包含了足够的信息来方便用户来定位异常点。

所以Exception通常是需要被catch的。但是和java不同的是，dart中所有的异常都是unchecked 异常，也就是说dart中的异常并不强制要求被捕获，是否捕获异常是由程序员自行决定的。

构造一个异常很简单，如下所示：

```
Exception("message")
```

但是dart并不推荐这样使用，因为这样构造的异常太过通用了，即使捕获到这样的异常，可以获得信息也比较少。所以dart推荐抛出自定义异常，也就是说根据业务需要去创建Exception对应的类，然后根据业务需要进行抛出。

dart中也有很多Exception的子类，比如FormatException来表示各种不同的异常情形。

同样的，在JAVA中也是这样推荐的，不要直接抛出Exception，而是根据业务需要抛出自定义的异常。

和JAVA一样，dart中的Error表示的是一个严重的错误，Error是应该在程序编写过程中需要避免的。

dart中的Error并不需要被捕获，因为发生了Error就表示程序出现了非常严重的错误，已经无法运行下去了。

所以Error是我们在程序编写过程中需要避免的。

# Throw和catch

如果程序产生了异常，则可以使用Throw语句将其抛出，然后在合适的地方使用catch进行捕获。

比如我们throw一个格式异常：

```
throw FormatException('这是一个格式异常');
```

但是在dart中，不仅仅可以throw Exception或者Error，任何一个Object都可以throw出去，如下所示:

```
throw "这是一个异常！";
```

抛出的异常可以使用catch来捕获：

```
try{
    do something
}catch(e){

}
```

dart也可以捕获特定的异常，这种情况用on语句来表示，如下：

```
try {
  someException();
} on OutOfIndexException {
  // 捕获特定的异常
  doSomething();
} on Exception catch (e) {
  // 捕获其他的Exception
  print('其他的异常: $e');
} catch (e) {
  // 处理剩下的异常
  print('剩下的异常： $e');
}
```

dart中的catch可以指定两个参数，第一个参数就是throw的异常，第二个参数是StackTrace对象：

```
try {
} catch (e, s) {
  print('异常信息： $e');
  print('堆栈信息： $s');
}
```

在处理完异常之后，如果想要再将其抛出，可以使用rethrow：

```
void doSomething(){
    try{
    }catch (e) {
    print('get exception');
    rethrow; // rethrow这个异常
  }
}
```

# Finally

和JAVA一样，dart中也有Finally，用来进行最终的处理。Finally会在所有的catch语句执行完毕之后执行：

```
try {
  doSomething();
} catch (e) {
  print('Error: $e'); 
} finally {
  cleanUpJob(); // 最后的清理工作
}
```

# 总结

以上就是dart中的异常和对异常的处理。






