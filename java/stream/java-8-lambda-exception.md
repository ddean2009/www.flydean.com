java 8 lambda表达式中的异常处理

# 简介

java 8中引入了lambda表达式，lambda表达式可以让我们的代码更加简介，业务逻辑更加清晰，但是在lambda表达式中使用的Functional Interface并没有很好的处理异常，因为JDK提供的这些Functional Interface通常都是没有抛出异常的，这意味着需要我们自己手动来处理异常。

因为异常分为Unchecked Exception和checked Exception,我们分别来讨论。

# 处理Unchecked Exception

Unchecked exception也叫做RuntimeException，出现RuntimeException通常是因为我们的代码有问题。RuntimeException是不需要被捕获的。也就是说如果有RuntimeException，没有捕获也可以通过编译。

我们看一个例子：

~~~java
List<Integer> integers = Arrays.asList(1,2,3,4,5);
        integers.forEach(i -> System.out.println(1 / i));
~~~

这个例子是可以编译成功的，但是上面有一个问题，如果list中有一个0的话，就会抛出ArithmeticException。 

虽然这个是一个Unchecked Exception，但是我们还是想处理一下：

~~~java
        integers.forEach(i -> {
            try {
                System.out.println(1 / i);
            } catch (ArithmeticException e) {
                System.err.println(
                        "Arithmetic Exception occured : " + e.getMessage());
            }
        });
~~~

上面的例子我们使用了try，catch来处理异常，简单但是破坏了lambda表达式的最佳实践。代码变得臃肿。

我们将try，catch移到一个wrapper方法中：

~~~java
    static Consumer<Integer> lambdaWrapper(Consumer<Integer> consumer) {
        return i -> {
            try {
                consumer.accept(i);
            } catch (ArithmeticException e) {
                System.err.println(
                        "Arithmetic Exception occured : " + e.getMessage());
            }
        };
    }
~~~

则原来的调用变成这样：

~~~java
integers.forEach(lambdaWrapper(i -> System.out.println(1 / i)));
~~~

但是上面的wrapper固定了捕获ArithmeticException，我们再将其改编成一个更通用的类：

~~~java
    static <T, E extends Exception> Consumer<T>
    consumerWrapperWithExceptionClass(Consumer<T> consumer, Class<E> clazz) {

        return i -> {
            try {
                consumer.accept(i);
            } catch (Exception ex) {
                try {
                    E exCast = clazz.cast(ex);
                    System.err.println(
                            "Exception occured : " + exCast.getMessage());
                } catch (ClassCastException ccEx) {
                    throw ex;
                }
            }
        };
    }
~~~

上面的类传入一个class，并将其cast到异常，如果能cast，则处理，否则抛出异常。

这样处理之后，我们这样调用：

~~~java
integers.forEach(
                consumerWrapperWithExceptionClass(
                        i -> System.out.println(1 / i),
                        ArithmeticException.class));
~~~


# 处理checked Exception

checked Exception是必须要处理的异常，我们还是看个例子：

~~~java
    static void throwIOException(Integer integer) throws IOException {
    }
~~~

~~~java
List<Integer> integers = Arrays.asList(1, 2, 3, 4, 5);
        integers.forEach(i -> throwIOException(i));
~~~

上面我们定义了一个方法抛出IOException，这是一个checked Exception，需要被处理，所以在下面的forEach中，程序会编译失败，因为没有处理相应的异常。

最简单的办法就是try，catch住，如下所示：

~~~java
        integers.forEach(i -> {
            try {
                throwIOException(i);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
~~~

当然，这样的做法的坏处我们在上面已经讲过了，同样的，我们可以定义一个新的wrapper方法：

~~~java
    static <T> Consumer<T> consumerWrapper(
            ThrowingConsumer<T, Exception> throwingConsumer) {

        return i -> {
            try {
                throwingConsumer.accept(i);
            } catch (Exception ex) {
                throw new RuntimeException(ex);
            }
        };
    }
~~~

我们这样调用：

~~~java
integers.forEach(consumerWrapper(i -> throwIOException(i)));
~~~

我们也可以封装一下异常：

~~~java
static <T, E extends Exception> Consumer<T> consumerWrapperWithExceptionClass(
            ThrowingConsumer<T, E> throwingConsumer, Class<E> exceptionClass) {

        return i -> {
            try {
                throwingConsumer.accept(i);
            } catch (Exception ex) {
                try {
                    E exCast = exceptionClass.cast(ex);
                    System.err.println(
                            "Exception occured : " + exCast.getMessage());
                } catch (ClassCastException ccEx) {
                    throw new RuntimeException(ex);
                }
            }
        };
    }
~~~

然后这样调用：

~~~java
integers.forEach(consumerWrapperWithExceptionClass(
                i -> throwIOException(i), IOException.class));
~~~

# 总结

本文介绍了如何在lambda表达式中处理checked和unchecked异常，希望能给大家一些帮助。

本文的例子[https://github.com/ddean2009/learn-java-streams/tree/master/lambda-exception](https://github.com/ddean2009/learn-java-streams/tree/master/lambda-exception)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)





