---
slug: /concurrent-exchanger
---

# 38. java并发Exchanger的使用

## 简介

Exchanger是java 5引入的并发类，Exchanger顾名思义就是用来做交换的。这里主要是两个线程之间交换持有的对象。当Exchanger在一个线程中调用exchange方法之后，会等待另外的线程调用同样的exchange方法。

两个线程都调用exchange方法之后，传入的参数就会交换。

## 类定义

~~~java
public class Exchanger<V>
~~~

其中V表示需要交换的对象类型。

## 类继承

~~~java
java.lang.Object
↳ java.util.concurrent.Exchanger<V>
~~~

Exchanger直接继承自Object。

## 构造函数

~~~java
Exchanger() 
~~~

Exchanger提供一个无参构造函数。

## 两个主要方法

1. public V exchange(V x) throws InterruptedException 

当这个方法被调用的时候，当前线程将会等待直到其他的线程调用同样的方法。当其他的线程调用exchange之后，当前线程将会继续执行。

在等待过程中，如果有其他的线程interrupt当前线程，则会抛出InterruptedException。

2. public V exchange(V x, long timeout, TimeUnit unit) throws InterruptedException, TimeoutException

和第一个方法类似，区别是多了一个timeout时间。如果在timeout时间之内没有其他线程调用exchange方法，则会抛出TimeoutException。 

## 具体的例子

我们先定义一个带交换的类：

~~~java
@Data
public class CustBook {

    private String name;
}
~~~

然后定义两个Runnable，在run方法中调用exchange方法：

~~~java
@Slf4j
public class ExchangerOne implements Runnable{

    Exchanger<CustBook> ex;

    ExchangerOne(Exchanger<CustBook> ex){
      this.ex=ex;
    }

    @Override
    public void run() {
    CustBook custBook= new CustBook();
        custBook.setName("book one");

        try {
            CustBook exhangeCustBook=ex.exchange(custBook);
            log.info(exhangeCustBook.getName());
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
~~~

~~~java
@Slf4j
public class ExchangerTwo implements Runnable{

    Exchanger<CustBook> ex;

    ExchangerTwo(Exchanger<CustBook> ex){
      this.ex=ex;
    }

    @Override
    public void run() {
    CustBook custBook= new CustBook();
        custBook.setName("book two");

        try {
            CustBook exhangeCustBook=ex.exchange(custBook);
            log.info(exhangeCustBook.getName());
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
~~~

最后在主方法中调用：

~~~java
public class ExchangerUsage {

    public static void main(String[] args) {
        Exchanger<CustBook> exchanger = new Exchanger<>();
        // Starting two threads
        new Thread(new ExchangerOne(exchanger)).start();
        new Thread(new ExchangerTwo(exchanger)).start();
    }
}
~~~

我们看下结果：

~~~java
22:14:09.069 [Thread-1] INFO com.flydean.ExchangerTwo - book one
22:14:09.073 [Thread-0] INFO com.flydean.ExchangerOne - book two
~~~

可以看到对象已经被交换了。

## 结语

Exchanger在两个线程需要交换对象的时候非常好用。大家可以在实际工作生活中使用。

本文的例子[https://github.com/ddean2009/learn-java-concurrency/tree/master/Exchanger](https://github.com/ddean2009/learn-java-concurrency/tree/master/Exchanger)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)




