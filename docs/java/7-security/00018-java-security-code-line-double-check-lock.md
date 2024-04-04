---
slug: /java-security-code-line-double-check-lock
---

# 18. java安全编码指南之:锁的双重检测

# 简介

双重检测锁定模式是一种设计模式，我们通过首次检测锁定条件而不是实际获得锁从而减少获取锁的开销。

双重检查锁定模式用法通常用于实现执行延迟初始化的单例工厂模式。延迟初始化推迟了成员字段或成员字段引用的对象的构造，直到实际需要才真正的创建。

但是我们需要非常小心的使用双重检测模式，以避免发送错误。

# 单例模式的延迟加载

先看一个在单线程正常工作的单例模式：

~~~java
public class Book {

    private static Book book;

    public static Book getBook(){
        if(book==null){
            book = new Book();
        }
        return book;
    }
}
~~~

上面的类中定义了一个getBook方法来返回一个新的book对象，返回对象之前，我们先判断了book是否为空，如果不为空的话就new一个book对象。

初看起来，好像没什么问题，我们仔细考虑一下：

book=new Book（）其实一个复杂的命令，并不是原子性操作。它大概可以分解为1.分配内存，2.实例化对象，3.将对象和内存地址建立关联。

在多线程环境中，因为重排序的影响，我们可能的到意向不到的结果。

最简单的办法就是加上synchronized关键字：

~~~java
public class Book {

    private static Book book;

    public synchronized static Book getBook(){
        if(book==null){
            book = new Book();
        }
        return book;
    }
}
~~~

# double check模式

如果要使用double check模式该怎么做呢？

~~~java
public class BookDLC {
    private static BookDLC bookDLC;

    public static BookDLC getBookDLC(){
        if(bookDLC == null ){
            synchronized (BookDLC.class){
                if(bookDLC ==null){
                    bookDLC=new BookDLC();
                }
            }
        }
        return bookDLC;
    }
}
~~~

我们先判断bookDLC是否为空，如果为空，说明需要实例化一个新的对象，这时候我们锁住BookDLC.class,然后再进行一次为空判断，如果这次不为空，则进行初始化。

那么上的代码有没有问题呢？

有，bookDLC虽然是一个static变量，但是因为CPU缓存的原因，我们并不能够保证当前线程被赋值之后的bookDLC，立马对其他线程可见。

所以我们需要将bookDLC定义为volatile，如下所示：

~~~java
public class BookDLC {
    private volatile static BookDLC bookDLC;

    public static BookDLC getBookDLC(){
        if(bookDLC == null ){
            synchronized (BookDLC.class){
                if(bookDLC ==null){
                    bookDLC=new BookDLC();
                }
            }
        }
        return bookDLC;
    }
}
~~~

# 静态域的实现

~~~java
public class BookStatic {
    private static BookStatic bookStatic= new BookStatic();

    public static BookStatic getBookStatic(){
        return bookStatic;
    }
}
~~~

JVM在类被加载之后和被线程使用之前，会进行静态初始化，而在这个初始化阶段将会获得一个锁，从而保证在静态初始化阶段内存写入操作将对所有的线程可见。

上面的例子定义了static变量，在静态初始化阶段将会被实例化。这种方式叫做提前初始化。

下面我们再看一个延迟初始化占位类的模式：

~~~java

public class BookStaticLazy {

    private static class BookStaticHolder{
        private static BookStaticLazy bookStatic= new BookStaticLazy();
    }

    public static BookStaticLazy getBookStatic(){
        return BookStaticHolder.bookStatic;
    }
}
~~~

上面的类中，只有在调用getBookStatic方法的时候才会去初始化类。

# ThreadLocal版本

我们知道ThreadLocal就是Thread的本地变量，它实际上是对Thread中的成员变量ThreadLocal.ThreadLocalMap的封装。

所有的ThreadLocal中存放的数据实际上都存储在当前线程的成员变量ThreadLocal.ThreadLocalMap中。

如果使用ThreadLocal，我们可以先判断当前线程的ThreadLocal中有没有，没有的话再去创建。

如下所示：

~~~java
public class BookThreadLocal {
    private static final ThreadLocal<BookThreadLocal> perThreadInstance =
            new ThreadLocal<>();
    private static BookThreadLocal bookThreadLocal;

    public static BookThreadLocal getBook(){
        if (perThreadInstance.get() == null) {
            createBook();
        }
        return bookThreadLocal;
    }

    private static synchronized void createBook(){
        if (bookThreadLocal == null) {
            bookThreadLocal = new BookThreadLocal();
        }
        perThreadInstance.set(bookThreadLocal);
    }
}
~~~

本文的代码：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

