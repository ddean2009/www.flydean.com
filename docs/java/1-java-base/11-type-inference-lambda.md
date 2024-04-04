---
slug: /type-inference-lambda
---

# 11. Java中的类型推断和lambda表达式

# 简介

java是强类型的编程语言，每个java中使用到的变量都需要定义它的类型，否则会编译失败。强类型语言的好处就是可以尽可能的在编译期间就发现代码中可能出现的问题，从而减少在运行时出现问题的可能性。

相对的，强类型语言的缺点就是不那么的灵活多变，写起来比较冗余。

JDK8之前，java是不支持类型推断的，在JDK8中，引入了lambda表达式，从此类型推断产生了。

本文将会讲解类型推断在lambda表达式中的最佳实践和在使用中应该注意的事项。

> 更多内容请访问[www.flydean.com](http://www.flydean.com)

# 类型的显示使用

假如我们定义了一个CustUser类，并且其中有age和name两个属性：

~~~java
@Data
@AllArgsConstructor
public class CustUser {
    int age;
    String name;
}
~~~

看下我们怎么在Stream中显示使用类型：

~~~java
public static void testStream(){
        Stream.of(new CustUser(10,"alice"), new CustUser(20,"bluce"))
                .forEach( (CustUser custUser)-> System.out.println(custUser.name));
    }
~~~

上面的例子中，我们构建了一个CustUser类型的Stream，并在forEach方法中对CustUser进行处理。

forEach接收一个Consumer对象，Consumer需要实现void accept(T t)方法。因为Consumer函数接口，我们可以使用lambda表达式来替换。

这里，我们显示传入一个CustUser类型。代码编译是没有问题的，但是看起来复杂了点。接下来我们看下怎么在Stream中使用类型推断。

# Stream中的类型推断

上面的例子，我们可以改写成这样：

~~~java
public static void testInference(){
        Stream.of(new CustUser(10,"alice"), new CustUser(20,"bluce"))
                .forEach(custUser-> System.out.println(custUser.name));
    }
~~~

这里我们并没有定义custUser的类型，但是java可以从Stream中的类型推断出来。所以这样写是没有问题的，可以正常通过编译。

# 类型推断中变量名字的重要性

上面的例子中，我们将变量的名字定义为custUser，查看代码的人一眼就可以看出来这个参数表示的是CustUser类型的custUser参数。

名字写的有意义可以很大程度上提升代码的可读性和可维护性。如果你这样写：

~~~java
forEach(u-> System.out.println(u.name)
~~~

虽然代码变得更短了，但是失去了可读的意义，一眼看过去，大家并不知道你这个u代表的是什么，从而影响了代码的可读性。

所以变量名的定义一定要有意义。

# 类型推断对性能的影响

类型推断是个好东西，那么有同学会问了，类型推断对于java的性能会有影响吗？

我们可以把java分成编译和运行两部分。类型推断是在编译期间做的事情，可能使用类型推断会延长代码编译的时间，但是对运行时的效率是没有影响的。

一般来说，我们关注程序的性能问题是在运行时而不是编译时，所以类型推断对性能是没有影响的。

# 类型推断的限制

java虽然有类型推断，但是这个推断是有一定的限制的，它并不能够像人一样去思考，但是也已经足够智能了。下面我们举个例子：

~~~java
public static Comparator<CustUser> createUser1(){
        return (CustUser user1, CustUser user2) -> user1.getAge() - user2.getAge();
    }
~~~

上面的例子中，我们需要创建一个Comparator，使用lambda表达式我们可以生成一个Comparator。

Comparator需要实现方法int compare(T o1, T o2)，传入两个参数，返回一个int。

上面例子中，我们显示指定了两个参数的类型是CustUser,编译没有问题。

如果不显示指定CustUser类型可以吗？

~~~java
public static Comparator<CustUser> createUser2(){
        return (user1, user2) -> user1.getAge() - user2.getAge();
    }
~~~

答案也是可以的。这个例子中，我们并没有传入user1，user2，java是怎么找到user1和user2的类型呢？

注意，上面的例子中，我们定义了返回类型是CustUser的，Java通过这个返回类型来推断出传入的实际类型就是CustUser的。是不是很智能。

如果我们将上面的return语句拆分成两条，会出现问题问题呢？

~~~java
Comparator comparator=(user1, user2) -> user1.getAge() - user2.getAge();
~~~

这时候就会编译报错，说找不到getAge方法。这是因为我们返回的Comparator并没有指明类型，所以默认情况下是Object类型。Object类型并没有getAge方法，所以报错。

我们可以这样改写：

~~~java
Comparator<CustUser> comparator=(user1, user2) -> user1.getAge() - user2.getAge();
~~~

编译完成，没有错误。

# 总结

除了JDK8中引入的lambda表示中使用了类型推断，其实JDK10中的var本地变量类型也是用到了类型推断,详请参考[JDK10的新特性:本地变量类型var](http://www.flydean.com/jdk10-var-local-variable/)。

本文的例子[https://github.com/ddean2009/
learn-java-base-9-to-20](https://github.com/
ddean2009/learn-java-base-9-to-20)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！



