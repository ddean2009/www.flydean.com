---
title: java基础面试问题(三)
---

# IO流 

## java 中 IO 流分为几种?

> 按照流的流向分，可以分为输入流和输出流；
>
> 按照操作单元划分，可以划分为字节流和字符流；
> 按照流的角色划分为节点流和处理流。
>
> InputStream/Reader:
> 所有的输入流的基类，前者是字节输入流，后者是字符输入流。
>
> OutputStream/Writer:
> 所有输出流的基类，前者是字节输出流，后者是字符输出流。

按操作方式分类：

![img](https://img-service.csdnimg.cn/img_convert/35bce0133db7509d2d537d803b06c573.png)

按操作对象分类：

![img](https://img-service.csdnimg.cn/img_convert/fd2857b32fd7bd9cafa4972c044d5acc.png)

## BIO,NIO,AIO 有什么区别?

> 简答
>
> BIO：Block IO 同步阻塞式 IO，就是我们平常使用的传统IO，它的特点是模式简单使用方便，并发处理能力低。
> 
>NIO：Non IO 同步非阻塞 IO，是传统 IO 的升级，客户端和服务器端通过Channel（通道） 通讯，实现了多路复用。
> 
> AIO：Asynchronous IO 是 NIO 的升级，也叫 NIO2，实现了异步非堵塞 IO，异步 IO 的操作基于事件和回调机制。
>
> 
> 
>详细回答
> 
>**BIO (Blocking I/O):**
> 同步阻塞I/O模式，数据的读取写入必须阻塞在一个线程内等待其完成。在活动连接数不是特别高（小于单机1000）的情况下，这种模型是比较不错的，可以让每一个连接专注于自己的 I/O。
> 
>并且编程模型简单，也不用过多考虑系统的过载、限流等问题。线程池本身就是一个天然的漏斗，可以缓冲一些系统处理不了的连接或请求。但是，当面对十万甚至百万级连接的时候，传统的 BIO模型是无能为力的。因此，我们需要一种更高效的 I/O处理模型来应对更高的并发量。
> 
> 
> 
>**NIO (New I/O):** NIO是一种同步非阻塞的I/O模型，在Java 1.4中引入了NIO框架，对应java.nio 包，提供了 Channel ,Selector，Buffer等抽象。NIO中的N可以理解为Non-blocking，不单纯是New。它支持面向缓冲的，基于通道的I/O操作方法。
> NIO提供了与传统BIO模型中的Socket和ServerSocket相对应的SocketChannel和ServerSocketChannel两种不同的套接字通道实现,两种通道都支持阻塞和非阻塞两种模式。
> 
> 阻塞模式使用就像传统中的支持一样，比较简单，但是性能和可靠性都不好；非阻塞模式正好与之相反。对于低负载、低并发的应用程序，可以使用同步阻塞I/O来提升开发速率和更好的维护性；对于高负载、高并发的（网络）应用，应使用 NIO的非阻塞模式来开发
> 
>
> 
> **AIO (Asynchronous I/O):** AIO 也就是 NIO 2。在Java 7 中引入了 NIO 的改进版 NIO 2,它是异步非阻塞的IO模型。异步 IO是基于事件和回调机制实现的，也就是应用操作之后会直接返回，不会堵塞在那里，当后台处理完成，操作系统会通知相应的线程进行后续的操作。
> 
> AIO是异步IO的缩写，虽然 NIO 在网络操作中，提供了非阻塞的方法，但是NIO的IO行为还是同步的。对于 NIO 来说，我们的业务线程是在 IO 操作准备好时，得到通知，接着就由这个线程自行进行 IO操作，IO操作本身是同步的。

## Files的常用方法都有哪些？

> Files.exists()：检测文件路径是否存在。
>
> Files.createFile()：创建文件。
>
> Files.createDirectory()：创建文件夹。
>
> Files.delete()：删除一个文件或目录。
>
> Files.copy()：复制文件。
>
> Files.move()：移动文件。
>
> Files.size()：查看文件个数。
>
> Files.read()：读取文件。
>
> Files. write()：写入文件。

# 反射 

## 什么是反射机制？

> JAVA反射机制是在运行状态中，对于任意一个类，都能够知道这个类的所有属性和方法；对于任意一个对象，都能够调用它的任意一个方法和属性；这种动态获取的信息以及动态调用对象的方法的功能称为java语言的反射机制。
>
> 
>
> 静态编译和动态编译
>
> 静态编译：在编译时确定类型，绑定对象
>
> 动态编译：运行时确定类型，绑定对象

## 反射机制优缺点

> **优点：** 运行期类型的判断，动态加载类，提高代码灵活度。
>
> **缺点：** 性能瓶颈：反射相当于一系列解释操作，通知 JVM 要做的事情，性能比直接的java代码要慢很多。

## 反射机制的应用场景有哪些？

> 反射是框架设计的灵魂。
>
> 在我们平时的项目开发过程中，基本上很少会直接使用到反射机制，但这不能说明反射机制没有用，实际上有很多设计、开发都与反射机制有关，例如模块化的开发，通过反射去调用对应的字节码；
>
> 动态代理设计模式也采用了反射机制，还有我们日常使用的Spring／Hibernate 等框架也大量使用到了反射机制。
>
> 举例：
>
> ①我们在使用JDBC连接数据库时使用Class.forName()通过反射加载数据库的驱动程序；
>
> ②Spring框架也用到很多反射机制，最经典的就是xml的配置模式。Spring 通过XML 配置模式装 载 Bean 的过程：1) 将程序内所有 XML 或 Properties配置文件加载入内存中;
> 2)Java类里面解析xml或properties里面的内容，得到对应实体类的字节码字符串以及相关的属性信息;
> 3)使用反射机制，根据这个字符串获得某个类的Class实例;
> 4)动态配置实例的属性

## Java获取反射的三种方法

> 1.通过new对象实现反射机制 
>
> 2.通过路径实现反射机制
> 3.通过类名实现反射机制

```java
public  class  Student  { 
  private  int  id; String  name;
protected  boolean  sex; public  float  score;
}

public  class  Get  {
//获取反射机制三种方式
public  static  void  main(String[]  args)  throws  ClassNotFoundException  {
//方式一(通过建立对象)
Student stu = new Student(); 
Class  classobj1  =  stu.getClass();
System.out.println(classobj1.getName());
//方式二（所在通过路径-相对路径）
Class  classobj2  =  Class.forName("fanshe.Student"); 
System.out.println(classobj2.getName());
//方式三（通过类名）
Class  classobj3  =  Student.class; 
System.out.println(classobj3.getName());
}
}

```



# 常用API 

## String相关

### 字符型常量和字符串常量的区别 

1. 形式上: 

   字符常量是单引号引起的一个字符
   字符串常量是双引号引起的若干个字符

2. 含义上: 

   字符常量相当于一个整形值(ASCII值),可以参加表达式运算
   字符串常量代表一个地址值(该字符串在内存中存放位置)

3. 占内存大小 

   字符常量只占一个字节
   字符串常量占若干个字节(至少一个字符结束标志)

### 什么是字符串常量池？

> 字符串常量池位于堆内存中，专门用来存储字符串常量，可以提高内存的使用率，避免开辟多块空间存储相同的字符串，
>
> 在创建字符串时 JVM会首先检查字符串常量池，如果该字符串已经存在池中，则返回它的引用，如果不存在，则实例化一个字符串放到池中，并返回其引用。

### String 是最基本的数据类型吗

> 不是。Java 中的基本数据类型只有 8 个：
>
> byte、short、int、long、float、double、char、boolean；
>
> 除了基本类型（primitive type），剩下的都是引用类型（referencetype），Java 5 以后引入的枚举类型也算是一种比较特殊的引用类型。
>
> 
>
> 基本数据类型中用来描述文本数据的是 char，但是它只能表示单个字符，比如 'a','好'之类的，如果要描述一段文本，就需要用多个char类型的变量，也就是一个char 类型数组，比如"你好"就是长度为2的数组 char[]

### String有哪些特性

> 不变性：String 是只读字符串，是一个典型的 immutable 对象，对它进行任何操作，其实都是创建一个新的对象，再把引用指向该对象。不变模式的主要作用在于当一个对象需要被多线程共享并频繁访问时，可以保证数据的一致性。
> 
> 常量池优化：String对象创建之后，会在字符串常量池中进行缓存，如果下次创建同样的对象时，会直接返回缓存的引用。
>
> final：使用 final 来定义 String 类，表示 String类不能被继承，提高了系统的安全性。

### String为什么是不可变的吗？

> 简单来说就是String类利用了final修饰的char类型数组存储字符，源码如下图所以：

```java
/** The value is used for character storage. */ 
private final char value[];
```

### String真的是不可变的吗？

> 我觉得如果别人问这个问题的话，回答不可变就可以了。
> 下面只是给大家看两个有代表性的例子：

#### 1 String不可变但不代表引用不可以变 

```java
String  str  =  "Hello"; str  =  str  +  "  World";
System.out.println("str="  +  str);
```

> 结果： str=Hello World 解析：
>
> 实际上，原来String的内容是不变的，只是str由原来指向\"Hello\"的内存地址转为指向\"Hello World\"的内存地址而已，也就是说多开辟了一块内存区域给\"Hello
>World\"字符串。

#### 2.通过反射是可以修改所谓的"不可变"对象 

```java
//  创建字符串"Hello  World"，  并赋给引用s String  s  =  "Hello  World";

System.out.println("s  =  "  +  s);  //  Hello  World

//  获取String类中的value字段
Field  valueFieldOfString  =  String.class.getDeclaredField("value");

//  改变value属性的访问权限
valueFieldOfString.setAccessible(true);

//  获取s对象上的value属性的值
char[]  value  =  (char[])  valueFieldOfString.get(s);

//  改变value所引用的数组中的第5个字符
value[5]  =  '_';

System.out.println("s  =  "  +  s);  //  Hello_World
```



> 结果：
>
> s = Hello World s = Hello_World
>
> 解析：
>
> 用反射可以访问私有成员， 然后反射出String对象中的value属性，
> 进而改变通过获得的value引用改变数组的结构。但是一般我们不会这么做，这里只是简单提一下有这个东西。

### 是否可以继承 String 类

> String 类是 final 类，不可以被继承。

### String str=\"i\"与 String str=new String("i")一样吗？

> 不一样，因为内存的分配方式不一样。String str=\"i\"的方式，java虚拟机会将其分配到常量池中； 
>
> 而 String str=new String("i") 则会被分到堆内存中。

### String s = new String("xyz");创建了几个字符串对象

> 两个对象，一个是静态区的\"xyz\"，一个是用new创建在堆上的对象。
>
> String str1 = \"hello\"; //str1指向静态区 
>
> String str2 = new String(\"hello\"); //str2指向堆上的对象
>
> String str3 = \"hello\"; 
>
> String str4 = new String(\"hello\"); 
>
> System.out.println(str1.equals(str2));//true 
>
> System.out.println(str2.equals(str4)); //true
> System.out.println(str1 == str3); //true 
>
> System.out.println(str1 ==str2); //false 
>
> System.out.println(str2 == str4); //false
> System.out.println(str2 == \"hello\"); //false 
>
> str2 = str1;
> System.out.println(str2 == \"hello\"); //true

### 如何将字符串反转？

> 使用 StringBuilder 或者 stringBuffer 的 reverse() 方法。示例代码：
>
> ```java
> // StringBuffer reverse 
> StringBuffer stringBuffer = new StringBuffer(); 
> stringBuffer.append("abcdefg"); 
> System.out.println(stringBuffer.reverse()); // gfedcba 
> // StringBuilder reverse
> StringBuilder stringBuilder = new StringBuilder(); 
> stringBuilder.append("abcdefg"); 
> System.out.println(stringBuilder.reverse());
> // gfedcba
> ```
>
> 

### 数组有没有 length()方法？String 有没有 length()方法

> 数组没有 length()方法 ，有 length 的属性。String 有length()方法。
>
> JavaScript中，获得字符串的长度是通过 length 属性得到的，这一点容易和 Java 混淆。

### String 类的常用方法都有那些？

> indexOf()：返回指定字符的索引。 
>
> charAt()：返回指定索引处的字符。
> replace()：字符串替换。 
>
> trim()：去除字符串两端空白。
> split()：分割字符串，返回一个分割后的字符串数组。
>
> getBytes()：返回字符串的 byte 类型数组。
>
> length()：返回字符串长度。
> toLowerCase()：将字符串转成小写字母。
>
> toUpperCase()：将字符串转成大写字符。
>
> substring()：截取字符串。
>
> equals()：字符串比较。

### 在使用HashMap的时候，用 String做key有什么好处？

> HashMap 内部实现是通过 key 的 hashcode 来确定 value的存储位置，因为字符串是不可变的， 所以当创建字符串时，它的 hashcode 被缓存下来，不需要再次计算，所以相比于其他对象更快。
> 

### String和StringBuffer、StringBuilder的区别是什么？String为什么是不可变的

#### 可变性 

> String类中使用字符数组保存字符串，private final char value\[\]，所以string对象是不可变的。
>
> StringBuilder与StringBuffer都继承自AbstractStringBuilder类，在AbstractStringBuilder中也是使用字符数组保存字符串，char\[\] value，这两种对象都是可变的。

#### 线程安全性 

> String中的对象是不可变的，也就可以理解为常量，线程安全。
>
> AbstractStringBuilder是StringBuilder与StringBuffer的公共父类，定义了一些字符串的基本操作，如expandCapacity、append、insert、indexOf等公共方法。
>
> StringBuffer对方法加了同步锁或者对调用的方法加了同步锁，所以是线程安全的。
>
> StringBuilder并没有对方法进行加同步锁，所以是非线程安全的。

#### 性能 

> 每次对String类型进行改变的时候，都会生成一个新的String对象，然后将指针指向新的String对象。
>
> StringBuffer每次都会对StringBuffer对象本身进行操作，而不是生成新的对象并改变对象引用。
>
> 相同情况下使用StirngBuilder相比使用StringBuffer 仅能获得10%\~15%左右的性能提升，但却要冒多线程不安全的风险。

#### 对于三者使用的总结 

> 如果要操作少量的数据用 = String
>
> 单线程操作字符串缓冲区 下操作大量数据 = StringBuilder
>
> 多线程操作字符串缓冲区 下操作大量数据 = StringBuffer

## Date相关包装类相关 

### 自动装箱与拆箱

> **装箱**：将基本类型用它们对应的引用类型包装起来；
> **拆箱**：将包装类型转换为基本数据类型；

### int 和 Integer 有什么区别

> Java是一个近乎纯洁的面向对象编程语言，但是为了编程的方便还是引入了基本数据类型，但是为了能够将这些基本数据类型当成对象操作，Java为每一个基本数据类型都引入了对应的包装类型（wrapper class），int的包装类就是 Integer。
> 
> 从 Java 5开始引入了自动装箱/拆箱机制，使得二者可以相互转换。
> 
> Java 为每个原始类型提供了包装类型：
>
> 原始类型: boolean，char，byte，short，int，long，float，double
>
> 包装类型：Boolean，Character，Byte，Short，Integer，Long，Float，Double

### Integer a= 127 与 Integer b = 127相等吗

> 对于对象引用类型：==比较的是对象的内存地址。对于基本数据类型：==比较的是值。
