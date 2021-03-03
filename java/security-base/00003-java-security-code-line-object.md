java安全编码指南之:对象构建

# 简介

程序员肯定是不缺对象的，因为随时都可以构建一个，对象多了肯定会出现点安全问题，一起来看看在java的对象构建中怎么保证对象的安全性吧。

# 构造函数的异常

考虑下面的一个例子：

~~~java
public class SensitiveOperation {

    public SensitiveOperation(){
        if(!doSecurityCheck()){
            throw new SecurityException("Security check failed!");
        }
    }

    //Security check return false
    private boolean doSecurityCheck(){
        return false;
    }

    public void storeMoney(){
        System.out.println("Store 1000000 RMB!");
    }
}
~~~

上面的例子中，我们在构造函数中做了一个securityCheck，因为这个securityCheck返回的值是false，所以会抛出SecurityException。

看下调用的例子：

~~~java
    public static void main(String[] args) {
        SensitiveOperation sensitiveOperation = new SensitiveOperation();
        sensitiveOperation.storeMoney();
    }
~~~

这个调用会抛出下面的异常：

~~~java
Exception in thread "main" java.lang.SecurityException: Security check failed!
	at com.flydean.SensitiveOperation.<init>(SensitiveOperation.java:11)
	at com.flydean.SensitiveUsage.main(SensitiveUsage.java:10)
~~~

那么问题来了，上面的这个class是不是安全的呢？

# Finalizer Attack

上面的class不是final的，所以我们可以构造一个class去继承它。然后考虑这样一个问题，当构造函数抛出异常之后，会执行什么操作呢？

如果该对象已经被构建了，那么这个对象在GC的时候需要执行finalize方法。那么我们是不是可以在finalize方法中绕过安全检查呢？

看下面的例子：

~~~java
public class SensitiveOperationFinalizer extends  SensitiveOperation{

    public SensitiveOperationFinalizer(){
    }

    @Override
    protected void finalize() {
        System.out.println("We can still do store Money action!");
        this.storeMoney();
        System.exit(0);
    }
}
~~~

上的例子中，我们继承了SensitiveOperation，并且实现了finalize方法，在finalize中，我们调用了storeMoney。看下运行的代码：

~~~java
    public void testFinalizer() throws InterruptedException {
        try {
        SensitiveOperation sensitiveOperation = new SensitiveOperationFinalizer();
            sensitiveOperation.storeMoney();
        }catch (Exception e){
            System.out.println(e.getMessage());
        }
        System.gc();
        Thread.sleep(10000);
    }
~~~

运行结果：

~~~java
Security check failed!
We can still do store Money action!
Store 1000000 RMB!
~~~

可以看到，虽然我们构造函数抛出了异常，但是storeMoney的操作还是被执行了！

这个操作就叫做Finalizer Attack。

# 解决Finalizer Attack

怎么解决这个构造函数抛出异常的问题呢？这里给大家介绍几种解决方法。

## 使用final class

如果使用final class，那么类是不能够被继承的，问题自然就解决了。

~~~java
public final class SensitiveOperationFinal {

    public SensitiveOperationFinal(){
        if(!doSecurityCheck()){
            throw new SecurityException("Security check failed!");
        }
    }

    //Security check return false
    private boolean doSecurityCheck(){
        return false;
    }

    public void storeMoney(){
        System.out.println("Store 1000000 RMB!");
    }
}
~~~

## 使用final finalize方法

因为子类想要重写finalize方法，如果我们的父类中finalize方法定义为final，也可以解决这个问题。

~~~java
public final class SensitiveOperationFinal {

    public SensitiveOperationFinal(){
        if(!doSecurityCheck()){
            throw new SecurityException("Security check failed!");
        }
    }

    //Security check return false
    private boolean doSecurityCheck(){
        return false;
    }

    public void storeMoney(){
        System.out.println("Store 1000000 RMB!");
    }
    
    final protected void finalize() {
    }
}
~~~

## 使用flag变量

我们可以在对象构建完毕的时候设置一个flag变量，然后在每次安全操作的时候都去判断一下这个flag变量，这样也可以避免之前提到的问题：

~~~java
public class SensitiveOperationFlag {

    private volatile boolean flag= false;

    public SensitiveOperationFlag(){
        if(!doSecurityCheck()){
            throw new SecurityException("Security check failed!");
        }
        flag=true;
    }

    //Security check return false
    private boolean doSecurityCheck(){
        return false;
    }

    public void storeMoney(){
        if(!flag){
            System.out.println("Object is not initiated yet!");
            return;
        }
        System.out.println("Store 1000000 RMB!");
    }
}
~~~

注意，这里flag需要设置为volatile，只有这样才能保证构造函数在flag设置之前执行。也就是说需要保证happens-before特性。

## 使用this或者super

在JDK6或者更高版本中，如果对象的构造函数在java.lang.Object构造函数退出之前引发异常，则JVM将不会执行该对象的finalize方法。

因为Java确保java.lang.Object构造函数在任何构造函数的第一条语句之上或之前执行。如果构造函数中的第一个语句是对超类的构造函数或同一个类中的另一个构造函数的调用，则java.lang.Object构造函数将在该调用中的某个位置执行。否则，Java将在该构造函数的代码中的任何一个执行之前执行超类的默认构造函数，并且将通过隐式调用执行java.lang.Object构造函数。

也就是说如果异常发生在构造函数中的第一条this或者super中的时候，JVM将不会调用对象的finalize方法：

~~~java
public class SensitiveOperationThis {

    public SensitiveOperationThis(){
        this(doSecurityCheck());
    }

    private SensitiveOperationThis(boolean secure) {
    }

    //Security check return false
    private static boolean doSecurityCheck(){
         throw new SecurityException("Security check failed!");
    }

    public void storeMoney(){
        System.out.println("Store 1000000 RMB!");
    }
}
~~~

本文的例子：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

![](https://img-blog.csdnimg.cn/20200709152618916.png)
