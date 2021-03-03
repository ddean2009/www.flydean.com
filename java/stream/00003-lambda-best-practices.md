Lambda表达式最佳实践

# 简介

Lambda表达式java 8引入的函数式编程框架。之前的文章中我们也讲过Lambda表达式的基本用法。

本文将会在之前的文章基础上更加详细的讲解Lambda表达式在实际应用中的最佳实践经验。

# 优先使用标准Functional接口

之前的文章我们讲到了，java在java.util.function包中定义了很多Function接口。基本上涵盖了我们能够想到的各种类型。

假如我们自定义了下面的Functional interface：

~~~java
@FunctionalInterface
public interface Usage {
    String method(String string);
}
~~~

然后我们需要在一个test方法中传入该interface：

~~~java
public String test(String string, Usage usage) {
    return usage.method(string);
}
~~~

上面我们定义的函数接口需要实现method方法，接收一个String，返回一个String。这样我们完全可以使用Function来代替：

~~~java
public String test(String string, Function<String, String> fn) {
    return fn.apply(string);
}
~~~

使用标准接口的好处就是，不要重复造轮子。

# 使用@FunctionalInterface注解

虽然@FunctionalInterface不是必须的，不使用@FunctionalInterface也可以定义一个Functional Interface。 

但是使用@FunctionalInterface可以在违背Functional Interface定义的时候报警。

如果是在维护一个大型项目中，加上@FunctionalInterface注解可以清楚的让其他人了解这个类的作用。

从而使代码更加规范和更加可用。

所以我们需要这样定义：

~~~java
@FunctionalInterface
public interface Usage {
    String method(String string);
}
~~~

而不是：

~~~java
public interface Usage {
    String method(String string);
}
~~~

# 在Functional Interfaces中不要滥用Default Methods

Functional Interface是指只有一个未实现的抽象方法的接口。

如果该Interface中有多个方法，则可以使用default关键字为其提供一个默认的实现。

但是我们知道Interface是可以多继承的，一个class可以实现多个Interface。 如果多个Interface中定义了相同的default方法，则会报错。

通常来说default关键字一般用在升级项目中，避免代码报错。

# 使用Lambda 表达式来实例化Functional Interface

还是上面的例子：

~~~java
@FunctionalInterface
public interface Usage {
    String method(String string);
}
~~~

要实例化Usage，我们可以使用new关键词：

~~~java
Usage usage = new Usage() {
    @Override
    public String method(String string) {
        return string;
    }
};
~~~

但是最好的办法就是用lambda表达式：

~~~java
Usage usage = parameter -> parameter;
~~~

# 不要重写Functional Interface作为参数的方法

怎么理解呢？ 我们看下面两个方法：

~~~java
public class ProcessorImpl implements Processor {
    @Override
    public String process(Callable<String> c) throws Exception {
        // implementation details
    }
 
    @Override
    public String process(Supplier<String> s) {
        // implementation details
    }
}
~~~

两个方法的方法名是一样的，只有传入的参数不同。但是两个参数都是Functional Interface，都可以用同样的lambda表达式来表示。

在调用的时候：

~~~java
String result = processor.process(() -> "test");
~~~

因为区别不了到底调用的哪个方法，则会报错。

最好的办法就是将两个方法的名字修改为不同的。

# Lambda表达式和内部类是不同的

虽然我们之前讲到使用lambda表达式可以替换内部类。但是两者的作用域范围是不同的。

在内部类中，会创建一个新的作用域范围，在这个作用域范围之内，你可以定义新的变量，并且可以用this引用它。

但是在Lambda表达式中，并没有定义新的作用域范围，如果在Lambda表达式中使用this，则指向的是外部类。

我们举个例子：

~~~java
private String value = "Outer scope value";

public String scopeExperiment() {
    Usage usage = new Usage() {
        String value = "Inner class value";
 
        @Override
        public String method(String string) {
            return this.value;
        }
    };
    String result = usage.method("");
 
    Usage usageLambda = parameter -> {
        String value = "Lambda value";
        return this.value;
    };
    String resultLambda = usageLambda.method("");
 
    return "Results: result = " + result + 
      ", resultLambda = " + resultLambda;
}

~~~

上面的例子将会输出“Results: result = Inner class value, resultLambda = Outer scope value”

# Lambda Expression尽可能简洁

通常来说一行代码即可。如果你有非常多的逻辑，可以将这些逻辑封装成一个方法，在lambda表达式中调用该方法即可。

因为lambda表达式说到底还是一个表达式，表达式当然越短越好。

java通过类型推断来判断传入的参数类型，所以我们在lambda表达式的参数中尽量不传参数类型，像下面这样：

~~~java
(a, b) -> a.toLowerCase() + b.toLowerCase();
~~~

而不是：

~~~java
(String a, String b) -> a.toLowerCase() + b.toLowerCase();
~~~

如果只有一个参数的时候，不需要带括号：

~~~java
a -> a.toLowerCase();
~~~

而不是：

~~~java
(a) -> a.toLowerCase();
~~~

返回值不需要带return:

~~~java
a -> a.toLowerCase();
~~~

而不是：

~~~java
a -> {return a.toLowerCase()};
~~~

# 使用方法引用

为了让lambda表达式更加简洁，在可以使用方法引用的时候，我们可以使用方法引用：

~~~java
a -> a.toLowerCase();
~~~

可以被替换为：
~~~java
String::toLowerCase;
~~~

# Effectively Final 变量

如果在lambda表达式中引用了non-final变量，则会报错。

effectively final是什么意思呢？这个是一个近似final的意思。只要一个变量只被赋值一次，那么编译器将会把这个变量看作是effectively final的。

~~~java
    String localVariable = "Local";
    Usage usage = parameter -> {
         localVariable = parameter;
        return localVariable;
    };
~~~

上面的例子中localVariable被赋值了两次，从而不是一个Effectively Final 变量，会编译报错。

为什么要这样设置呢？因为lambda表达式通常会用在并行计算中，当有多个线程同时访问变量的时候Effectively Final 变量可以防止不可以预料的修改。

# 结论

lambda是一个非常有用的功能，希望小伙伴们能够在工作中掌握。

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)















