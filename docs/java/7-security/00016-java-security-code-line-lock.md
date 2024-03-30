---
slug: /java-security-code-line-lock
---

# 16. java安全编码指南之:lock和同步的正确使用

# 简介

在java多线程环境中，lock和同步是我们一定会使用到的功能。那么在java中编写lock和同步相关的代码之后，需要注意哪些问题呢？一起来看看吧。

# 使用private final object来作为lock对象

一般来说我们在做多线程共享对象的时候就需要进行同步。java中有两种同步方式，第一种就是方法同步，第二种是同步块。

如果我们在实例方法中使用的是synchronized关键字,或者在同步块中使用的是synchronized(this)，那么会以该该对象的实例作为monitor，我们称之为intrinsic lock。

如果有恶意代码恶意获取该对象的锁并且释放，那么我们的系统将不能及时响应正常的服务，将会遭受到DOS攻击。

解决这种问题的方法就是使用private final object来作为lock的对象。因为是private的，所以恶意对象无法获取到该对象的锁，从而避免了问题的产生。

如果是在类方法（static）中使用了synchronized关键字，那么将会以这个class对象作为monitor。这种情况下，恶意对象可以通过该class的子类或者直接获取到该class，然后通过调用getClass()获取到class对象，从而进行加锁操作，让正常服务无法获取到锁。

所以，我们推荐使用private final object来作为lock对象。

下面举几个例子来说明：

~~~java
public class SynObject {

    public synchronized  void doSomething(){
        //do something
    }

    public static void main(String[] args) throws InterruptedException {
        SynObject synObject= new SynObject();
        synchronized (synObject){
            while (true){
                //loop forever
                Thread.sleep(10000);
            }
        }
    }
}
~~~

上面代码可能使我们最常使用的代码，我们在对象中定义了一个synchronized的doSomething方法。

如果有恶意代码直接拿到了我们要调用的SynObject对象，并且直接对其进行同步，如上例所示，那么这个对象的锁将永远无法释放。最终导致DOS。

我们看第二种写法：

~~~java
    public Object lock = new Object();

    public void doSomething2(){
        synchronized (lock){
            //do something
        }
    }
~~~

上面的例子中，我们同步了一个public对象，但是因为该对象是public的，所以恶意程序完全可以访问该public字段，并且永久获得这个对象的monitor,从而产生DOS。

再看下面的一个例子：

~~~java
    private volatile Object lock2 = new Object();

    public void doSomething3() {
        synchronized (lock2) {
            // do something
        }
    }

    public void setLock2(Object lockValue) {
        lock2 = lockValue;
    }
~~~

上面的例子中，我们定义了一个private的lock对象，并且使用它来为doSomething3方法加锁。

虽然是private的，但是我们提供了一个public的方法来对该对象进行修改。所以也是有安全问题的。

正确的做法是使用private final Object:

~~~java
    private final Object lock4= new Object();

    public void doSomething4() {
        synchronized (lock4) {
            // do something
        }
    }
~~~

我们再考虑一下静态方法的情况：

~~~java
    public static synchronized void doSomething5() {
        // do something
    }

synchronized (SynObject.class) {
  while (true) {
    Thread.sleep(10000); 
  }
}
~~~

上面定义了一个public static的方法，从而锁定的是class对象，恶意代码可以恶意占有该对象的锁，从而导致DOS。

# 不要synchronize可被重用的对象

之前我们在讲表达式规则的时候，提到了封装类对象的构建原则：

对于Boolean和Byte来说，如果直接从基础类值构建的话，也是同一个对象。

而对于Character来说，如果值的范围在\u0000 to \u007f，则属于同一个对象，如果超出了这个范围，则是不同的对象。

对于Integer和Short来说，如果值的范围在-128 and 127，则属于同一个对象，如果超出了这个范围，则是不同的对象。

举个例子：

~~~java
        Boolean boolA=true;
        Boolean boolB=true;
        System.out.println(boolA==boolB);
~~~

上面从基础类型构建的Boolean对象其实是同一个对象。

如果我们在代码中使用下面的Boolean对象来进行同步，则可能会触发安全问题：

~~~java
private final Boolean booleanLock = Boolean.FALSE;
 
public void doSomething() {
  synchronized (booleanLock) {
    // ...
  }
}
~~~

上面的例子中，我们从Boolean.FALSE构建了一个Boolean对象，虽然这个对象是private的，但是恶意代码可以通过Boolean.FALSE来构建一个相同的对象，从而让private规则失效。

同样的问题也可能出现在String中：

~~~java
private final String lock = "lock";
 
public void doSomething() {
  synchronized (lock) {
    // ...
  }
}
~~~

因为String对象有字符串常量池，直接通过字符串来创建的String对象其实是同一个对象。所以上面的代码是有安全问题的。

解决办法就是使用new来新创建一个对象。

~~~java
private final String lock = new String("LOCK");
~~~

# 不要sync Object.getClass()

有时候我们想要同步class类，Object提供了一个方便的getClass方法来返回当前的类。但是如果在父类和子类的情况下，子类的getClass会返回子类的class类而不是父类的class类，从而产生不一致对象同步的情况。

看下面的一个例子：

~~~java
public class SycClass {

    public void doSomething(){
        synchronized (getClass()){
            //do something
        }
    }
}
~~~

在SycClass中，我们定义了一个doSomething方法，在该方法中，我们sync的是getClass()返回的对象。

如果SycClass有子类的情况下：

~~~java
public class SycClassSub extends SycClass{

    public void doSomethingElse(){
        synchronized (SycClass.class){
           doSomething();
        }
    }
}
~~~

doSomethingElse方法实际上获得了两个锁，一个是SycClass，一个是SycClassSub，从而产生了安全隐患。

在sync的时候，我们需要明确指定要同步的对象，有两种方法指定要同步的class：

~~~java
synchronized (SycClass.class)
synchronized (Class.forName("com.flydean.SycClass"))
~~~

我们可以直接调用SycClass.class也可以使用Class.forName来获取。

# 不要sync高级并发对象

我们把实现了java.util.concurrent.locks包中的Lock和Condition接口的对象称作高级并发对象。比如：ReentrantLock。

这些高级并发对象看起来也是一个个的Lock，那么我们可不可以直接sync这些高级并发对象呢？看下面的例子：

~~~java
public class SyncLock {

    private final Lock lock = new ReentrantLock();

    public void doSomething(){
        synchronized (lock){
            //do something
        }
    }
}
~~~

看起来好像没问题，但是我们要注意的是，我们自定义的synchronized (lock)和高级并发对象中的Lock实现是不一样的，如果我们同时使用了synchronized (lock)和Lock自带的lock.lock(),那么就有可能产生安全隐患。

所以，对于这些高级并发对象，最好的做法就是不要直接sync，而是使用他们自带的lock机制，如下：

~~~java
    public void doSomething2(){
        lock.lock();
        try{
        //do something
        }finally {
            lock.unlock();
        }
    }
~~~

# 不要使用Instance lock来保护static数据

一个class中可以有static类变量，也可以有实例变量。类变量是和class相关的，而实例变量是和class的实例对象相关的。

那么我们在保护类变量的时候，一定要注意sync的也必须是类变量，如果sync的是实例变量，就无法达到保护的目的。

看下面的一个例子：

~~~java
public class SyncStatic {
    private static volatile int age;

    public synchronized void doSomething(){
        age++;
    }
}
~~~

我们定义了一个static变量age，然后在一个方法中希望对其累加。之前的文章我们也讲过了，++是一个复合操作，我们需要对其进行数据同步。

但是上面的例子中，我们使用了synchronized关键字，同步的实际上是SyncStatic的实例对象，如果有多个线程创建多个实例对象同时调用doSomething方法，完全是可以并行进行的。从而导致++操作出现问题。

同样的，下面的代码也是一样的问题：

~~~java
    private final Object lock = new Object();
    public  void doSomething2(){
        synchronized (lock) {
            age++;
        }
    }
~~~

解决办法就是定义一个类变量：

~~~java
    private static final Object lock3 = new Object();
    public  void doSomething3(){
        synchronized (lock3) {
            age++;
        }
    }
~~~

# 在持有lock期间，不要做耗时操作

如果在持有lock期间，我们进行了比较耗时的操作，像I/O操作，那么持有lock的时间就会过长，如果是在高并发的情况下，就有可能出现线程饿死的情况，或者DOS。

所以这种情况我们一定要避免。

# 正确释放锁

在持有锁之后，一定要注意正确的释放锁，即使遇到了异常也不应该打断锁的释放。

一般来说锁放在finally{}中释放最好。

~~~java
    public void doSomething(){
        lock.lock();
        try{
        //do something
        }finally {
            lock.unlock();
        }
    }
~~~

本文的代码：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！















