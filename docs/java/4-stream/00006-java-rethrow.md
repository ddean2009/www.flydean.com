---
slug: /java-rethrow
---

# 6. java关于throw Exception的一个小秘密

# 简介

之前的文章我们讲到，在stream中处理异常，需要将checked exception转换为unchecked exception来处理。

我们是这样做的：

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

将异常捕获，然后封装成为RuntimeException。

封装成RuntimeException感觉总是有那么一点点问题，那么有没有什么更好的办法？

# throw小诀窍

java的类型推断大家应该都知道，如果是&lt;T extends Throwable> 这样的形式，那么T将会被认为是RuntimeException！

我们看下例子：

~~~java
public class RethrowException {

    public static <T extends Exception, R> R throwException(Exception t) throws T {
        throw (T) t; // just throw it, convert checked exception to unchecked exception
    }

}
~~~

上面的类中，我们定义了一个throwException方法，接收一个Exception参数，将其转换为T，这里的T就是unchecked exception。

接下来看下具体的使用：

~~~java
@Slf4j
public class RethrowUsage {

    public static void main(String[] args) {
        try {
            throwIOException();
        } catch (IOException e) {
           log.error(e.getMessage(),e);
            RethrowException.throwException(e);
        }
    }

    static void throwIOException() throws IOException{
        throw new IOException("io exception");
    }
}
~~~

上面的例子中，我们将一个IOException转换成了一个unchecked exception。

# 总结

本文介绍了一种特殊的异常转换的例子，大家可以参考一下。

本文的例子[https://github.com/ddean2009/learn-java-streams/tree/master/rethrow-exception](https://github.com/ddean2009/learn-java-streams/tree/master/rethrow-exception)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)
