这样也行,在lambda表达式中优雅的处理checked exception

[toc]

# 简介

最近发现很多小伙伴还不知道如何在lambda表达式中优雅的处理checked exception，所以今天就重点和大家来探讨一下这个问题。

lambda表达式本身是为了方便程序员书写方便的工具，使用lambda表达式可以让我们的代码更加简洁。

可能大多数小伙伴在使用的过程中从来没有遇到过里面包含异常的情况，所以对这种在lambda表达式中异常的处理可能没什么经验。

不过没关系，今天我们就来一起探讨一下。

# lambda表达式中的checked exception

java中异常的类型，大家应该是耳熟能详了，具体而言可以有两类，一种是checked exception, 一种是unchecked exception。

所谓checked exception就是需要在代码中手动捕获的异常。unchecked exception就是不需要手动捕获的异常，比如运行时异常。

首先我们定义一个checked exception，直接继承Exception就好了：

```
public class MyCheckedException extends Exception{
    @java.io.Serial
    private static final long serialVersionUID = -1574710658998033284L;

    public MyCheckedException() {
        super();
    }

    public MyCheckedException(String s) {
        super(s);
    }
}

```

接下来我们定义一个类，这个类中有两个方法，一个抛出checked exception，一个抛出unchecked exception:

```
public class MyStudents {

    public int changeAgeWithCheckedException() throws MyCheckedException {
        throw new MyCheckedException();
    }

    public int changeAgeWithUnCheckedException(){
        throw new RuntimeException();
    }
}
```

好了，我们首先在lambda表达式中抛出CheckedException：

```
    public static void streamWithCheckedException(){
        Stream.of(new MyStudents()).map(s->s.changeAgeWithCheckedException()).toList();
    }
```

这样写在现代化的IDE中是编译不过的，它会提示你需要显示catch住CheckedException，所以我们需要把上面的代码改成下面这种：

```
    public static void streamWithCheckedException(){
        Stream.of(new MyStudents()).map(s-> {
            try {
                return s.changeAgeWithCheckedException();
            } catch (MyCheckedException e) {
                e.printStackTrace();
            }
        }).toList();
    }
```

这样做是不是就可以了呢？

再考虑一个情况，如果stream中不止一个map操作，而是多个map操作，每个map都抛出一个checkedException,那岂不是要这样写？

```
    public static void streamWithCheckedException(){
        Stream.of(new MyStudents()).map(s-> {
            try {
                return s.changeAgeWithCheckedException();
            } catch (MyCheckedException e) {
                e.printStackTrace();
            }
        }).map(s-> {
            try {
                return s.changeAgeWithCheckedException();
            } catch (MyCheckedException e) {
                e.printStackTrace();
            }
        }).
        toList();
    }
```

实在是太难看了,也不方便书写，那么有没有什么好的方法来处理，lambda中的checked异常呢？办法当然是有的。

# lambda中的unchecked exception

上面例子中我们抛出了一个checked exception，那么就必须在lambda表达式中对异常进行捕捉。

那么我们可不可以换个思路来考虑一下？

比如，把上面的checked exception,换成unchecked exception会怎么样呢？

```
    public static void streamWithUncheckedException(){
        Stream.of(new MyStudents()).map(MyStudents::changeAgeWithUnCheckedException).toList();
    }
```

我们可以看到程序可以正常编译通过，可以减少或者几乎不需要使用try和catch,这样看起来，代码是不是简洁很多。

那么我们是不是可以考虑把checked exception转换成为unchecked exception，然后用在lambda表达式中，这样就可以简化我们的代码，给程序员以更好的代码可读性呢？

说干就干。

基本的思路就是把传入的checked exception转换为unchecked exception，那么怎么转换比较合适呢？

这里我们可以用到JDK中的类型推断，通过使用泛型来达到这样的目的：

```
    public static <T extends Exception,R> R sneakyThrow(Exception t) throws T {
        throw (T) t;
    }
```

这个方法接收一个checked exception，在内部强制转换之后，抛出T。

看看在代码中如何使用：

```
    public static void sneakyThrow(){
            Stream.of(new MyStudents()).map(s -> SneakilyThrowException.sneakyThrow(new IOException())).toList();
    }
```

代码可以编译通过，这说明我们已经把checked异常转换成为unchecked异常了。

运行之后你可以得到下面的输出：

```
Exception in thread "main" java.io.IOException
	at com.flydean.Main.lambda$sneakyThrow$1(Main.java:28)
	at java.base/java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:197)
	at java.base/java.util.stream.Streams$StreamBuilderImpl.forEachRemaining(Streams.java:411)
	at java.base/java.util.stream.AbstractPipeline.copyInto(AbstractPipeline.java:509)
	at java.base/java.util.stream.AbstractPipeline.wrapAndCopyInto(AbstractPipeline.java:499)
	at java.base/java.util.stream.AbstractPipeline.evaluate(AbstractPipeline.java:575)
	at java.base/java.util.stream.AbstractPipeline.evaluateToArrayNode(AbstractPipeline.java:260)
	at java.base/java.util.stream.ReferencePipeline.toArray(ReferencePipeline.java:616)
	at java.base/java.util.stream.ReferencePipeline.toArray(ReferencePipeline.java:622)
	at java.base/java.util.stream.ReferencePipeline.toList(ReferencePipeline.java:627)
	at com.flydean.Main.sneakyThrow(Main.java:28)
	at com.flydean.Main.main(Main.java:9)
```

从日志中，我们可以看出最后抛出的还是java.io.IOException，但是如果我们尝试对这个异常进行捕获：

```
    public static void sneakyThrow(){
        try {
            Stream.of(new MyStudents()).map(s -> SneakilyThrowException.sneakyThrow(new IOException())).toList();
        }catch (IOException e){
           System.out.println("get exception");
        }
    }
```

在编译器中会提示编译不通过，因为代码并不会抛出IOException。如果你把IOException修改为RuntimeException,也没法捕获到最后的异常。

只能这样修改：

```
    public static void sneakyThrow(){
        try {
            Stream.of(new MyStudents()).map(s -> SneakilyThrowException.sneakyThrow(new IOException())).toList();
        }catch (Exception e){
           System.out.println("get exception");
        }
    }
```

才能最终捕获到stream中抛出的异常。所以如果你使用了我这里说的这种异常转换技巧，那就必须要特别注意这种异常的捕获情况。

# 对lambda的最终改造

上面可以封装异常了是不是就完成了我们的工作了呢？

并不是，因为我们在map中传入的是一个Function而不是一个专门的异常类。所以我们需要对Function进行额外的处理。

首先JDK中的Function中必须实现这样的方法：

```
    R apply(T t);
```

如果这个方法里面抛出了checked Exception，那么必须进行捕获，如果不想捕获的话，我们可以在方法申明中抛出异常，所以我们需要重新定义一个Function，如下所示：

```
@FunctionalInterface
public interface FunctionWithThrow<T, R> {
    R apply(T t) throws Exception;
}

```

然后再定义一个unchecked方法，用来对FunctionWithThrow进行封装，通过捕获抛出的异常，再次调用sneakyThrow进行checked异常和unchecked异常的转换：

```
    static <T, R> Function<T, R> unchecked(FunctionWithThrow<T, R> f) {
        return t -> {
            try {
                return f.apply(t);
            } catch (Exception ex) {
                return SneakilyThrowException.sneakyThrow(ex);
            }
        };
    }
```

最后，我们就可以在代码中优雅的使用了：

```
    public static void sneakyThrowFinal(){
        try {
            Stream.of(new MyStudents()).map(SneakilyThrowException.unchecked(MyStudents::changeAgeWithCheckedException)).toList();
        }catch (Exception e){
            System.out.println("get exception");
        }
    }
```

# 总结

以上就是如何在lambda表达式中优雅的进行异常转换的例子了。大家使用的过程中一定要注意最后对异常的捕获。

好了，本文的代码：

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/lambda-and-checked-exception/](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/lambda-and-checked-exception/)

> 更多文章请看 [www.flydean.com](www.flydean.com)































