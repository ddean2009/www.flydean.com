Spring Boot 3.0横空出世，快来看看是不是该升级了

[toc]

# 简介

Spring boot 3.0于2022年11月正式发布了，这次的发布对于我们普通程序员的影响有多少呢？我们是不是需要考虑立马升级到Spring Boot3.0呢？

别急，看完这篇文章再来做决定也不迟。

# 对JAVA17和JAVA19的支持

相信很多小伙伴到现在还是使用得是JDK8，但是JDK8已经发布很多年了，随着oracle加速JDK版本的发布，现在每半年发布一次，目前最新的JDK版本已经到了19了。其中JDK11和JDK17是LTS版本，也就是说我们常说的稳定版本。

鉴于JDK17带来的很多新特性，Spring boot的最低JDK版本支持已经提升到了JDK17，如果你还在使用JDK8或者JDK11的话，那么首先需要把JDK版本升级到17才能够使用Spring Boot 3.0。

很多小伙伴可能不是很清楚JDK17到底有些什么新的特性或者功能，这里再给大家详细介绍一下。

## record

首先是在JDK14的时候引入了record这个关键词，Record是一种轻量级的class，可以看做是数据结构体。和scala中的case有点相似。

举个自定义User的例子看一下Record是怎么用的：

~~~
public record Address(
        String addressName,
        String city
) {
}
~~~

~~~
public record CustUser(
        String firstName,
        String lastName,
        Address address,
        int age
) {}
~~~

上面我们定义了两个类，CustUser和Address。CustUser中引用了Address。

Record和普通的类的区别就在于Record多了一个括号括起来的定义的字段。

Record类默认是final的，里面的字段默认是private final的。

要想知道Record到底是怎么工作的，我们可以使用javap来对编译好的class文件反编译，运行javap CustUser，可以得到下面的结果：

~~~
警告: 二进制文件CustUser包含com.flydean.records.CustUser
Compiled from "CustUser.java"
public final class com.flydean.records.CustUser extends java.lang.Record {
  public com.flydean.records.CustUser(java.lang.String, java.lang.String, com.flydean.records.Address, int);
  public java.lang.String toString();
  public final int hashCode();
  public final boolean equals(java.lang.Object);
  public java.lang.String firstName();
  public java.lang.String lastName();
  public com.flydean.records.Address address();
  public int age();
}

~~~

上面可以看到final class CustUser继承自java.lang.Record。

并且自动添加了默认带有所有字段的构造函数。各个自动的获取方法，并实现了toString，hashCode和equals方法。

天啦，太完美了，我们想要的它居然都有。

如果上面的javap还不是很清楚的话，大家可以借助IDE的反编译功能，打开CustUser.class文件看一看：

~~~
public final class CustUser extends java.lang.Record {
    private final java.lang.String firstName;
    private final java.lang.String lastName;
    private final com.flydean.records.Address address;
    private final int age;

    public CustUser(java.lang.String firstName, java.lang.String lastName, com.flydean.records.Address address, int age) { /* compiled code */ }

    public java.lang.String toString() { /* compiled code */ }

    public final int hashCode() { /* compiled code */ }

    public final boolean equals(java.lang.Object o) { /* compiled code */ }

    public java.lang.String firstName() { /* compiled code */ }

    public java.lang.String lastName() { /* compiled code */ }

    public com.flydean.records.Address address() { /* compiled code */ }

    public int age() { /* compiled code */ }
}
~~~

> 注意，上面的反编译我们可以看到，record中的所有字段都是final的，只能在初始化的时候设置。并且方法里面也没有提供其他可以改变字段内容的方法。

## Text Blocks

Text Blocks是在JDK13中以第一次预览版本引入的。现在在JDK14中是第二次预览版本 JEP 368: Text Blocks。

在我们日常的工作中，有时候需要用到一大段的字符串，这些字符串需要换行，需要排版，需要转义。在一个文本编辑器中，这当然是非常容易的事情。但是在java代码中，就是一个噩梦了。

虽然IDE可以自动帮我们加上换行甚至可以对字符串进行拼接。但在java程序眼中，添加的诸多额外的代码破坏了代码的美感。是任何一个有洁癖的程序员都无法忍受的。

怎么办？ Text Blocks就是来解救大家的。

我们先来个直观的例子，然后再分析Text Blocks的特点。

还是举HTML的例子,如果我们想要打印出带缩减，有格式的html，传统方法可以这样做：

~~~
String html = "<html>\n" +
              "    <body>\n" +
              "        <p>Hello, world</p>\n" +
              "    </body>\n" +
              "</html>\n";
~~~

上面的代码看着特别别扭，让我们看看用文本块方式怎么做：

~~~
String html = """
              <html>
                  <body>
                      <p>Hello, world</p>
                  </body>
              </html>
              """;
~~~

是不是清爽很多，想要立即给文本块点个赞。

别慌点赞，我们还有更多的东西要讨论。

可能有人又有问题了，文本块好用是好用，你这输出结果中，字段前面的空格都去哪了了呀？

这里就要介绍这个概念了：英文名字叫Indentation，中文我把它翻译为编排。

再看一下上面的代码，这一次我们把代码前面的空格以点来表示：

~~~
String html = """
..............<html>
..............    <body>
..............        <p>Hello, world</p>
..............    </body>
..............</html>
..............""";
~~~

Indentation的规则就是以最下面的“”“为界，对每一行都移除相同数量的空格。

上面的代码输出：

~~~
<html>
    <body>
        <p>Hello, world</p>
    </body>
</html>
~~~

上面的例子，最下面的”“”刚好在最左边的位置，如果把“”“向右移动4个空格会发生什么呢？

~~~
String html = """
..............<html>
..............    <body>
..............        <p>Hello, world</p>
..............    </body>
..............</html>
..................""";
~~~

输出结果：

~~~java
<html>
    <body>
        <p>Hello, world</p>
    </body>
</html>
~~~

我们看到输出结果是不变的，这样我们又得到一条结论：如果”“”向右移动，则以text block中最左的那一行记录为准。

如果我们把“”“向左移动四位，就会发现最终的输出结果每行前面都有四个空格。

这个功能是和String添加的新的String::stripIndent()对应的。

## Switch Expressions

switch的新特性可是源远流长，早在JDK 12就以预览功能被引入了，最终在JDK 14成为了正式版本的功能：JEP 361: Switch Expressions (Standard)。

其实Switch新增的功能有两个，一个就是可以连写case，一个就是switch可以带返回值了。

先看一个老版本的例子：

~~~
    @Test
    public void useOldSwitch(){
        switch (MONDAY) {
            case MONDAY:
            case FRIDAY:
            case SUNDAY:
                System.out.println(6);
                break;
            case TUESDAY:
                System.out.println(7);
                break;
            case THURSDAY:
            case SATURDAY:
                System.out.println(8);
                break;
            case WEDNESDAY:
                System.out.println(9);
                break;
        }
    }
~~~

上面的例子中，我们想要匹配所有的星期，然后打印出相应的结果。写了很多个case语句，不美观。

再看一下新版本的例子：

~~~
    @Test
    public void useNewSwitch(){
        switch (MONDAY) {
            case MONDAY, FRIDAY, SUNDAY -> System.out.println(6);
            case TUESDAY                -> System.out.println(7);
            case THURSDAY, SATURDAY     -> System.out.println(8);
            case WEDNESDAY              -> System.out.println(9);
        }
    }
~~~

一个漂亮的连写，将一切都带走。 

> 注意这里switch语句没有返回值，所以并不需要default语句。

考虑一个在switch中赋值的情况：

~~~
    @Test
    public void oldSwitchWithReturnValue(){
        int numLetters;
        switch (MONDAY) {
            case MONDAY:
            case FRIDAY:
            case SUNDAY:
                numLetters = 6;
                break;
            case TUESDAY:
                numLetters = 7;
                break;
            case THURSDAY:
            case SATURDAY:
                numLetters = 8;
                break;
            case WEDNESDAY:
                numLetters = 9;
                break;
            default:
                throw new IllegalStateException("这天没发见人！");
        }
    }
~~~

传统方式我们需要定义一个局部变量，并在case中给这个局部变量赋值。

我们看下怎么使用新版的switch替换：

~~~
    @Test
    public void newSwitchWithReturnValue(){
        int numLetters = switch (MONDAY) {
            case MONDAY, FRIDAY, SUNDAY -> 6;
            case TUESDAY                -> 7;
            case THURSDAY, SATURDAY     -> 8;
            case WEDNESDAY              -> 9;
            default -> throw new IllegalStateException("这天没发见人!");
        };
    }
~~~

是不是非常简单。

> 注意，这里需要一个default操作，否则会报编译错误。因为可能存在未遍历的值。


上面的switch返回值的情况，如果case后面的表达式比较复杂，那么就需要使用大括号来围起来。这种情况我们需要使用到yield来返回要返回的值。

~~~
    @Test
    public void withYield(){
        int result = switch (MONDAY) {
            case MONDAY: {
                yield 1;
            }
            case TUESDAY: {
                yield 2;
            }
            default: {
                System.out.println("不是MONDAY，也不是TUESDAY！");
                yield 0;
            }
        };
    }
~~~

## instanceof模式匹配

怎么理解呢？

我们先举个历史版本中使用instanceof的例子。

假如我们是动物园的管理员，动物园里面有Girraffe和Hippo两种动物。

~~~
@Data
public class Girraffe {
    private String name;
}
~~~

~~~
@Data
public class Hippo {
    private String name;
}
~~~

为了简单起见，上面两种动物我们都之定义一个name属性。

接下来我们要对两种动物进行管理，传入一个动物，判断一下这个动物是不是上面两种动物之一，按照传统的办法，我们应该这样做：

~~~
    public void testZooOld(Object animal){
        if(animal instanceof Girraffe){
            Girraffe girraffe = (Girraffe) animal;
            log.info("girraffe name is {}",girraffe.getName());
        }else if(animal instanceof Hippo){
            Hippo hippo = (Hippo) animal;
            log.info("hippo name is {}",hippo.getName());
        }
        throw new IllegalArgumentException("对不起，该动物不是地球上的生物！");
    }
~~~

上面的代码中， 如果instanceof确认成功，我们还需要将对象进行转换，才能调用相应对象中的方法。

有了JDK 14，一切都变得容易了，我们看下最新的JDK 14的模式匹配怎么做：

~~~
    public void testZooNew(Object animal){
        if(animal instanceof Girraffe girraffe){
            log.info("name is {}",girraffe.getName());
        }else if(animal instanceof Hippo hippo){
            log.info("name is {}",hippo.getName());
        }
        throw new IllegalArgumentException("对不起，该动物不是地球上的生物！");
    }
~~~

注意instanceof的用法，通过instanceof的模式匹配，就不需要二次转换了。直接使用就可以了。并且模式匹配的对象还被限定了作用域范围，会更加安全。

## Sealed Classes and Interfaces

在Java中，类层次结构通过继承实现代码的重用，父类的方法可以被许多子类继承。

但是，类层次结构的目的并不总是重用代码。有时，其目的是对域中存在的各种可能性进行建模，例如图形库支持的形状类型或金融应用程序支持的贷款类型。

当以这种方式使用类层次结构时，我们可能需要限制子类集从而来简化建模。

因为我们引入了sealed class或interfaces，这些class或者interfaces只允许被指定的类或者interface进行扩展和实现。

举个例子：

~~~
package com.example.geometry;

public abstract sealed class Shape
    permits Circle, Rectangle, Square {...}
~~~

上面的例子中，我们指定了Shape只允许被Circle, Rectangle, Square来继承。

上面的例子中并没有指定类的包名，我们可以这样写：

~~~
package com.example.geometry;

public abstract sealed class Shape 
    permits com.example.polar.Circle,
            com.example.quad.Rectangle,
            com.example.quad.simple.Square {...}
~~~

# 迁移到Jakarta EE

除了下面一些spring依赖包的更新之外：

```
Spring Framework 6.0.

Spring AMQP 3.0.

Spring Batch 5.0.

Spring Data 2022.0.

Spring GraphQL 1.1.

Spring HATEOAS 2.0.

Spring Integration 6.0.

Spring Kafka 3.0.

Spring LDAP 3.0.

Spring REST Docs 3.0.

Spring Retry 2.0.

Spring Security 6.0 

Spring Session 3.0

Spring WS 4.0.
```

spring boot3最大的变化就是把Java EE 迁移到了Jakarta EE,也就是说我们需要把 javax.* 替换成为 jakarta.*。

举个例子HttpServletRequest需要从：

```
import javax.servlet.http.HttpServletRequest;
```

替换成为：

```
import jakarta.servlet.http.HttpServletRequest;
```

# GraalVM Native Image Support

Spring Boot3的一个非常大的功能点就是可以利用Spring的AOT技术，将spring boot的应用编译成为native的image，从而大大提升系统的运行效率。

比如，我们可以这样添加一个native的build profile：

```
<profiles>
    <profile>
        <id>native</id>
        <build>
            <plugins>
                <plugin>
                    <groupId>org.graalvm.buildtools</groupId>
                    <artifactId>native-maven-plugin</artifactId>
                    <executions>
                        <execution>
                            <id>build-native</id>
                            <goals>
                                <goal>compile-no-fork</goal>
                            </goals>
                            <phase>package</phase>
                        </execution>
                    </executions>
                </plugin>
            </plugins>
        </build>
    </profile>
</profiles>
```

然后运行下面的命令就可以把spring boot项目打包成native项目了：

```
mvn clean package -Pnative
```

# 对Micrometer的支持

在spring boot3中默认提供了对Micrometer 1.10的支持，spring boot会自动帮你配置一个ObservationRegistry的实例。

Micrometer可以用来收集应用程序各项指标数据，从而实现对应用程序的各种监控。

# 其他的一些改动

当然，除了上面的主要的变化之外，Spring boot3还提供了其他的一些小的调整，大家感兴趣的话可以亲自升级到spring boot3尝试一下。




