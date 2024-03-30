---
slug: /JDK10-var-usage
---

# 7. JDK10的新特性:本地变量类型var

# 简介

java以面向对象的特性显著于世并得到了蓬勃的发展。在语言的发展过程中，为了让java语言更加简洁和方便使用，JDK也在不断的进行改进。

今天本文将要介绍一下JDK10中引入的本地变量类型var。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# 为什么我们需要var

类型推断是很多编程语言都具有的特性，编译器可以在我们不指定具体变量类型的情况下推断出该变量的实际类型。

类型推断的出现，可以让程序员的代码更加灵活，利于维护和编写。其实我们一直都有使用到类型推断。

JDK8中引入的lambda表达式就是类型推断的一个非常有用的例子：

~~~java
int maxWeight = blocks.stream().filter(b -> b.getColor() == BLUE).mapToInt(Block::getWeight)
.max();
~~~

上面的例子中blocks是一个Stream&lt;Block>类型，在filter中使用到的b实际上就没有指定其类型，它的类型是从Stream中推断出来的。

再看一个线程池的例子：

~~~java
ExecutorService executorService= Executors.newSingleThreadExecutor();
Runnable runnable=new Runnable() {
    @Override
    public void run() {
        log.info("inside runnable");
     }
 };
 executorService.submit(runnable);
~~~

很多时候，我们从变量的名字就已经知道了这个变量到底是什么类型的，那么上面的例子如果用var来改写就可以像这样：

~~~java
var executorService= Executors.newSingleThreadExecutor();
var runnable=new Runnable() {
    @Override
    public void run() {
         log.info("inside runnable");
     }
 };
executorService.submit(runnable);
~~~

代码更加简洁，程序员写起来也更加方便。

如果上面的例子还不能够提起你使用var的兴趣，那么下面的例子你一定很乐意使用var了。

假如我们有一个非常非常长的类名：

~~~java
ItIsAVeryLongNameJavaClass itIsAVeryLongNameJavaClass= new ItIsAVeryLongNameJavaClass();
~~~

写起来是不是超级麻烦，代码看起也非常冗余，这时候我们就可以将其简化为：

~~~java
var itIsAVeryLongNameJavaClass= new ItIsAVeryLongNameJavaClass();
~~~

# var使用在什么地方

首先var代表的是本地变量，所以，只有本地变量才能够使用var。

其次var在定义的时候就必须被初始化：

~~~java
var a;  //Invalid Declaration - - Cannot use 'var' on variable without initializer
var a = 100; //Valid Declaration
~~~

var可以用在for loop中：

~~~java
for ( var element : elementList){
    //do something for element
}
~~~

或者这种：

~~~java
for ( var i = 0 ; i < elementList.size(); i++ ){
    System.out.println( elementList.get(i) );
}
~~~

# var不能用在什么地方

因为var是本地变量类型，它不能用在类变量的定义中，不能用在方法变量中，不能用在构造函数中，不能用在方法返回中,不能用在catch变量定义中。

~~~java
public class VarIncorrectUsage {
     
    //var user;    //Not allowed as class fields
         
    //public VarIncorrectUsage(var param){    //Not allowed as parameter 
    //}
 
    /*try{
         
    } catch(var exception){    //Not allowed as catch formal 
 
    }*/
 
    /*public var returnMethod(){  //Not allowed in method return type
        return null;
    }*/
 
    /*public Integer parameterMethod( var input ){  //Not allowed in method parameters
        return null;
    }*/
}
~~~

注意，var在JVM无法推断其类型或者可以有很多类型的情况下不能够使用：

~~~java
var ints = {1, 2, 3};
var lambda = a -> a;
var methodReference = String::concat;
~~~

上面例子中数组初始化，lambda表达式和方法引用都是不能用var的。

# 其他var的特点

var不是关键字，所以我们可以使用var来做变量名字：

~~~java
var var = 2;   //Valid Declaration
         
int var = 2;   //Also valid Declaration
~~~

因为var是JDK10引入的概念，所以不是向下兼容的。不能够用低版本的编译器来编译var。

var不会影响性能，因为var是在代码编译器进行的类型推断，所以并不会影响到性能。

# 总结

var是JDK10中引入的一个新的特性，希望大家可以喜欢。

本文的例子[https://github.com/ddean2009/
learn-java-base-9-to-20](https://github.com/
ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)
