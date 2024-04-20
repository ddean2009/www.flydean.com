# Java异常面试题

## 1. Error 和 Exception 区别是什么？

Error 类型的错误通常为虚拟机相关错误，如系统崩溃，内存不足，堆栈溢出等，编译器不会对这类错误进行检测，JAVA 应用程序也不应对这类错误进行捕获，一旦这类错误发生，通常应用程序会被终止，仅靠应用程序本身无法恢复；

Exception 类的错误是可以在应用程序中进行捕获并处理的，通常遇到这种错误，应对其进行处理，使应用程序可以继续正常运行。

## 2. 运行时异常和一般异常(受检异常)区别是什么？

运行时异常包括 RuntimeException 类及其子类，表示 JVM 在运行期间可能出现的异常。 Java 编译器不会检查运行时异常。

受检异常是Exception 中除 RuntimeException 及其子类之外的异常。 Java 编译器会检查受检异常。

**RuntimeException**异常和受检异常之间的区别：是否强制要求调用者必须处理此异常，如果强 制要求调用者必须进行处理，那么就使用受检异常，否则就选择非受检异常

(RuntimeException)。一般来讲，如果没有特殊的要求，我们建议使用RuntimeException异常。

## 3. JVM 是如何处理异常的？

在一个方法中如果发生异常，这个方法会创建一个异常对象，并转交给JVM，该异常对象包含异常名称，异常描述以及异常发生时应用程序的状态。创建异常对象并转交给 JVM 的过程称为抛出异常。可能有一系列的方法调用，最终才进入抛出异常的方法，这一系列方法调用的有序列表叫做 调用栈。



JVM 会顺着调用栈去查找看是否有可以处理异常的代码，如果有，则调用异常处理代码。当 JVM 发现可以处理异常的代码时，会把发生的异常传递给它。如果 JVM 没有找到可以处理该异常的代码块，JVM 就会将该异常转交给默认的异常处理器（默认处理器为 JVM 的一部分），默认异常处理器打印出异常信息并终止应用程序。

## 4. throw 和 throws 的区别是什么？

Java 中的异常处理除了包括捕获异常和处理异常之外，还包括声明异常和拋出异常，可以通过throws 关键字在方法上声明该方法要拋出的异常，或者在方法内部通过 throw 拋出异常对象。

#### throws 关键字和 throw 关键字在使用上的几点区别如下：

throw 关键字用在方法内部，只能用于抛出一种异常，用来抛出方法或代码块中的异常，受查异常和非受查异常都可以被抛出。

throws 关键字用在方法声明上，可以抛出多个异常，用来标识该方法可能抛出的异常列表。

一个方法用 throws 标识了可能抛出的异常列表，调用该方法的方法中必须包含可处理异常的代码，否则也要在方法签名中用 throws 关键字声明相应的异常。

## 5. final、finally、finalize 有什么区别？

final可以修饰类、变量、方法，修饰类表示该类不能被继承、修饰方法表示该方法不能被重写、 修饰变量表示该变量是一个常量不能被重新赋值。

finally一般作用在try-catch代码块中，在处理异常的时候，通常我们将一定要执行的代码方法finally代码块中，表示不管是否出现异常，该代码块都会执行，一般用来存放一些关闭资源的代码。

finalize是一个方法，属于Object类的一个方法，而Object类是所有类的父类，Java中允许使用finalize()方法在垃圾收集器将对象从内存中清除出去之前做必要的清理工作。

## 6. NoClassDefFoundError 和 ClassNotFoundException区别？

NoClassDefFoundError 是一个 Error 类型的异常，是由 JVM 引起的，不应该尝试捕获这个异常。

引起该异常的原因是 JVM 或 ClassLoader 尝试加载某类时在内存中找不到该类的定义，该动作发生在运行期间，即编译时该类存在，但是在运行时却找不到了，可能是变异后被删除了等原因导致；

ClassNotFoundException 是一个受查异常，需要显式地使用 try-catch 对其进行捕获和处理，或在方法签名中用 throws 关键字进行声明。当使用Class.forName, ClassLoader.loadClass 或ClassLoader.findSystemClass动态加载类到内存的时候，通过传入的类路径参数没有找到该类，就会抛出该异常；

另一种抛出该异常的可能原因是某个类已经由一个类加载器加载至内存中，另一 个加载器又尝试去加载它。

## 7. try-catch-finally  中哪个部分可以省略？

答：catch 可以省略

#### 原因 

更为严格的说法其实是：try只适合处理运行时异常，try+catch适合处理运行时异常+普通异常。也就是说，如果你只用try去处理普通异常却不加以catch处理，编译是通不过的，因为编译器硬性规定，普通异常如果选择捕获，则必须用catch显示声明以便进一步处理。而运行时异常在编译时 没有如此规定，所以catch可以省略，你加上catch编译器也觉得无可厚非。

理论上，编译器看任何代码都不顺眼，都觉得可能有潜在的问题，所以你即使对所有代码加上try，代码在运行期时也只不过是在正常运行的基础上加一层皮。但是你一旦对一段代码加上try，  就等于显示地承诺编译器，对这段代码可能抛出的异常进行捕获而非向上抛出处理。如果是普通异常，编译器要求必须用catch捕获以便进一步处理；如果运行时异常，捕获然后丢弃并且+finally扫 尾处理，或者加上catch捕获以便进一步处理。

至于加上finally，则是在不管有没捕获异常，都要进行的“扫尾”处理。

## 8. try-catch-finally 中，如果 catch 中 return 了，finally 还会执行吗？

答：会执行，在 return 前执行。

**注意**：在 finally 中改变返回值的做法是不好的，因为如果存在 finally 代码块，try中的 return 语句不会立马返回调用者，而是记录下返回值待 finally 代码块执行完毕之后再向调用者返回其值， 然后如果在 finally 中修改了返回值，就会返回修改后的值。显然，在 finally 中返回或者修改返回值会对程序造成很大的困扰，C#中直接用编译错误的方式来阻止程序员干这种龌龊的事情，Java 中也可以通过提升编译器的语法检查级别来产生警告或错误。

#### 代码示例1：

 

```java
public  static  int  getInt()  { 
  int  a  =  10;
try {
System.out.println(a  /  0);
a = 20;
}  catch  (ArithmeticException  e)  { 
  a = 30;
return a;
/*
* return a 在程序执行到这一步的时候，这里不是return a 而是 return 30；这个返回路径就形成了
*  但是呢，它发现后面还有finally，所以继续执行finally的内容，a=40
*  再次回到以前的路径,继续走return  30，形成返回路径之后，这里的a就不是a变量了，而是
常量30
*/
}  finally  {
a = 40;
}
return a;
}

```

执行结果：30

#### 代码示例2：

 

```java
public  static  int  getInt()  { int  a  =  10;
try {
System.out.println(a  /  0);
a = 20;
}  catch  (ArithmeticException  e)  { a = 30;
return a;
}  finally  {
a = 40;
//如果这样，就又重新形成了一条返回路径，由于只能通过1个return返回，所以这里直接返回40 return a;
}
}

```

执行结果：40

## 9. 类 ExampleA 继承 Exception，类 ExampleB 继承ExampleA。

有如下代码片断：

 

```java
try {
throw  new  ExampleB("b")
}  catch（ExampleA  e）{ System.out.println("ExampleA");
}  catch（Exception  e）{ System.out.println("Exception");
}

```

请问执行此段代码的输出是什么？

答：输出：ExampleA。（根据里氏代换原则[能使用父类型的地方一定能使用子类型]，抓取 ExampleA 类型异常的 catch 块能够抓住 try 块中抛出的 ExampleB 类型的异常） 

面试题:说出下面代码的运行结果。（此题的出处是《Java 编程思想》一书）

```java
class  Annoyance  extends  Exception  {
}
class Sneeze extends Annoyance {
}
class Human {
public  static  void  main(String[]  args) throws  Exception  {
try {
try {
throw  new  Sneeze();
} catch ( Annoyance a ) { System.out.println("Caught  Annoyance"); throw  a;
}
} catch ( Sneeze s ) { System.out.println("Caught  Sneeze"); return ;
}  finally  {
System.out.println("Hello  World!");
}
}
}

```

 

结果

```java
Caught Annoyance 
Caught Sneeze 
Hello  World! 
```

## 10. 常见的 RuntimeException 有哪些？

ClassCastException(类转换异常) 

IndexOutOfBoundsException(数组越界) 

NullPointerException(空指针)

ArrayStoreException(数据存储异常，操作数组时类型不一致)

还有IO操作的BufferOverflowException异常

## 11. Java常见异常有哪些

java.lang.IllegalAccessError：违法访问错误。当一个应用试图访问、修改某个类的域（Field)或 者调用其方法，但是又违反域或方法的可见性声明，则抛出该异常。java.lang.InstantiationError：实例化错误。当一个应用试图通过Java的new操作符构造一个抽象类或者接口时抛出该异常.                               java.lang.OutOfMemoryError：内存不足错误。当可用内存不足以让Java虚拟机分配给一个对象  时抛出该错误。                                       java.lang.StackOverflowError：堆栈溢出错误。当一个应用递归调用的层次太深而导致堆栈溢出  或者陷入死循环时抛出该错误。

java.lang.ClassCastException：类造型异常。假设有类A和B（A不是B的父类或子类），O是A的 实例，那么当强制将O构造为类B的实例时抛出该异常。该异常经常被称为强制类型转换异常。

java.lang.ClassNotFoundException：找不到类异常。当应用试图根据字符串形式的类名构造类， 而在遍历CLASSPAH之后找不到对应名称的class文件时，抛出该异常。java.lang.ArithmeticException：算术条件异常。譬如：整数除零等。

java.lang.ArrayIndexOutOfBoundsException：数组索引越界异常。当对数组的索引值为负数或大于等于数组大小时抛出。                      java.lang.IndexOutOfBoundsException：索引越界异常。当访问某个序列的索引值小于0或大于等于序列大小时，抛出该异常。                        java.lang.InstantiationException：实例化异常。当试图通过newInstance()方法创建某个类的实例，而该类是一个抽象类或接口时，抛出该异常。         java.lang.NoSuchFieldException：属性不存在异常。当访问某个类的不存在的属性时抛出该异常。                                          java.lang.NoSuchMethodException：方法不存在异常。当访问某个类的不存在的方法时抛出该异常。-                                            java.lang.NullPointerException：空指针异常。当应用试图在要求使用对象的地方使用了null时， 抛出该异常。譬如：调用null对象的实例方法、访问null对象的属性、计算null对象的长度、使用throw语句抛出null等等。                          

java.lang.NumberFormatException：数字格式异常。当试图将一个String转换为指定的数字类型，而该字符串确不满足数字类型要求的格式时，抛出该异常。java.lang.StringIndexOutOfBoundsException：字符串索引越界异常。当使用索引值访问某个字符串中的字符，而该索引值小于0或大于等于序列大小时，抛出该异常。
