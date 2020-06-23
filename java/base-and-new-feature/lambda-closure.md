Lambda表达式和闭包Closure

# 简介

我们通常讲到闭包，一般都是指在javascript的环境中。闭包是JS中一个非常重要的也非常常用的概念。闭包产生的原因就是变量的作用域范围不同。一般来说函数内部的定义的变量只有函数内部可见。如果我们想要在函数外部操作这个变量就需要用到闭包了。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# JS中的闭包

在JS中，变量可以分为两种全局作用域和局部作用域。在函数外部无法读取函数内部定义的局部变量。

~~~javascript
　　function f1(){
　　　　var n=10;
　　}
　　alert(n); // error
~~~

上面的例子中，我们在函数f1中定义了一个局部变量n，然后尝试从函数外部访问它。结果出错。

虽然函数中定义的变量在函数外部无法被访问。但是在函数中定义的函数中可以访问呀。

~~~javascript
function f1(){
　　　　var n=10;
　　　　function f2(){
　　　　　　alert(n);
　　　　}
　　　　return f2;
　　}
　　var result=f1();
　　result(); // 10
~~~

上面的例子中，我们在f1中定义了f2，在f2中访问了局部变量n。最后将f2返回。接着我们可以操作返回的函数f2来对函数中定义的局部变量n进行操作。

所以我们得出了闭包的定义：闭包就是定义在函数内部的函数，或者闭包是能够访问函数局部变量的函数。

# java中的闭包

在lambda表达式出现之前，java中是没有函数的概念的。和函数差不多相当的就是方法了。

在方法内部可以定义方法的局部变量。我们无法在方法内部定义方法，但是我们可以在方法内部定义匿名类。那么这个匿名类是可以访问方法中定义的局部变量的。如下例所示：

~~~java
public Runnable createClosureUsingClass(){
        int count=10;
        Runnable runnable= new Runnable() {
            @Override
            public void run() {
                System.out.println(count);
            }
        };
        return runnable;
    }
~~~

在上面的方法中，我们定义了一个局部变量count。然后创建了一个匿名类runnable。在runnable中，我们访问了局部变量count。

最后将这个创建的匿名类返回。这样返回的匿名类就包含了对方法局部变量的操作，这样就叫做闭包。

在[Lambda表达式最佳实践](http://www.flydean.com/lambda-best-practices/)中，我们介绍了lambda表达式和匿名类的不同之处在于：

在内部类中，会创建一个新的作用域范围，在这个作用域范围之内，你可以定义新的变量，并且可以用this引用它。

但是在Lambda表达式中，并没有定义新的作用域范围，如果在Lambda表达式中使用this，则指向的是外部类。

虽然this的指向是不同的，但是在lambda表达式中也是可以访问方法的局部变量：

~~~java
public Runnable createClosureUsingLambda(){
        int count=10;
        Runnable runnable=()-> System.out.println(count);
        return runnable;
    }
~~~

上面的例子中，我们在lambda表达式中访问了定义的count变量。

# 深入理解lambda表达式和函数的局部变量

首先lambda表达式是无状态的，因为lambda表达式的本质是函数，它的作用就是在给定输入参数的情况下，输出固定的结果。

如果lambda表达式中引用的方法中的局部变量，则lambda表达式就变成了闭包，因为这个时候lambda表达式是有状态的。我们接下来用个例子来具体说明。

上面的lambda表达式创建的Runnable，我们可以这样使用：

~~~java
public void testClosureLambda(){
        Runnable runnable=createClosureUsingLambda();
        runnable.run();
    }
~~~

为了深入理解lambda表达式和局部变量传值的关系，我们将编译好的class文件进行反编译。

~~~java
javap -c -p ClosureUsage
~~~

将部分输出结果列出如下：

~~~java
  public java.lang.Runnable createClosureUsingLambda();
    Code:
       0: bipush        10
       2: istore_1
       3: iload_1
       4: invokedynamic #12,  0             // InvokeDynamic #0:run:(I)Ljava/lang/invokedynamicinvokedynamic;
       9: astore_2
      10: aload_2
      11: areturn

private static void lambda$createClosureUsingLambda$0(int);
    Code:
       0: getstatic     #29                 // Field java/lang/System.out:Ljava/io/PrintStream;
       3: iload_0
       4: invokevirtual #35                 // Method java/io/PrintStream.println:(I)V
       7: return

~~~

上面我们列出了createClosureUsingLambda和它内部的lambda表达式的反编译结果。

可以看到在createClosureUsingLambda方法中，我们首先定义了一个值为10的int，并将其入栈。

再看lambda表达式生成的方法，我们可以看到这个方法多出了一个int参数，并且通过getstatic命令将参数传递进来。

这就是lambda表达式传递状态的原理。

# 总结

本文介绍了闭包和lambda表达式之间的关系，并从字节码的角度进一步说明了局部变量是怎么传递给函数内部的lambda表达式的。

本文的例子[https://github.com/ddean2009/
learn-java-base-9-to-20](https://github.com/ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 
> 更多系列内容请访问我的博客: [www.flydean.com](www.flydean.com)





