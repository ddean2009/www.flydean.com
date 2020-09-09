java安全编码指南之:可见性和原子性

# 简介

java类中会定义很多变量，有类变量也有实例变量，这些变量在访问的过程中，会遇到一些可见性和原子性的问题。这里我们来详细了解一下怎么避免这些问题。

# 不可变对象的可见性

不可变对象就是初始化之后不能够被修改的对象，那么是不是类中引入了不可变对象，所有对不可变对象的修改都立马对所有线程可见呢？

实际上，不可变对象只能保证在多线程环境中，对象使用的安全性，并不能够保证对象的可见性。

先来讨论一下可变性，我们考虑下面的一个例子：

~~~java
public final class ImmutableObject {
    private final int age;
    public ImmutableObject(int age){
        this.age=age;
    }
}
~~~

我们定义了一个ImmutableObject对象，class是final的，并且里面的唯一字段也是final的。所以这个ImmutableObject初始化之后就不能够改变。

然后我们定义一个类来get和set这个ImmutableObject：

~~~java
public class ObjectWithNothing {
    private ImmutableObject refObject;
    public ImmutableObject getImmutableObject(){
        return refObject;
    }
    public void setImmutableObject(int age){
        this.refObject=new ImmutableObject(age);
    }
}
~~~

上面的例子中，我们定义了一个对不可变对象的引用refObject，然后定义了get和set方法。

> 注意，虽然ImmutableObject这个类本身是不可变的，但是我们对该对象的引用refObject是可变的。这就意味着我们可以调用多次setImmutableObject方法。

再来讨论一下可见性。

上面的例子中，在多线程环境中，是不是每次setImmutableObject都会导致getImmutableObject返回一个新的值呢？

答案是否定的。

当把源码编译之后，在编译器中生成的指令的顺序跟源码的顺序并不是完全一致的。处理器可能采用乱序或者并行的方式来执行指令（在JVM中只要程序的最终执行结果和在严格串行环境中执行结果一致，这种重排序是允许的）。并且处理器还有本地缓存，当将结果存储在本地缓存中，其他线程是无法看到结果的。除此之外缓存提交到主内存的顺序也肯能会变化。

怎么解决呢？

最简单的解决可见性的办法就是加上volatile关键字，volatile关键字可以使用java内存模型的happens-before规则，从而保证volatile的变量修改对所有线程可见。

~~~java
public class ObjectWithVolatile {
    private volatile ImmutableObject refObject;
    public ImmutableObject getImmutableObject(){
        return refObject;
    }
    public void setImmutableObject(int age){
        this.refObject=new ImmutableObject(age);
    }
}
~~~

另外，使用锁机制，也可以达到同样的效果：

~~~java
public class ObjectWithSync {
    private  ImmutableObject refObject;
    public synchronized ImmutableObject getImmutableObject(){
        return refObject;
    }
    public synchronized void setImmutableObject(int age){
        this.refObject=new ImmutableObject(age);
    }
}
~~~

最后，我们还可以使用原子类来达到同样的效果：

~~~java
public class ObjectWithAtomic {
    private final AtomicReference<ImmutableObject> refObject= new AtomicReference<>();
    public ImmutableObject getImmutableObject(){
        return refObject.get();
    }
    public void setImmutableObject(int age){
        refObject.set(new ImmutableObject(age));
    }
}
~~~

# 保证共享变量的复合操作的原子性

如果是共享对象，那么我们就需要考虑在多线程环境中的原子性。如果是对共享变量的复合操作，比如：++,  -- *=, /=, %=, +=, -=, <<=, >>=, >>>=, ^= 等，看起来是一个语句，但实际上是多个语句的集合。

我们需要考虑多线程下面的安全性。

考虑下面的例子：

~~~java
public class CompoundOper1 {
    private int i=0;
    public int increase(){
        i++;
        return i;
    }
}
~~~

例子中我们对int i进行累加操作。但是++实际上是由三个操作组成的：

1. 从内存中读取i的值，并写入CPU寄存器中。
2. CPU寄存器中将i值+1
3. 将值写回内存中的i中。

如果在单线程环境中，是没有问题的，但是在多线程环境中，因为不是原子操作，就可能会发生问题。

解决办法有很多种，第一种就是使用synchronized关键字

~~~java
    public synchronized int increaseSync(){
        i++;
        return i;
    }
~~~

第二种就是使用lock：

~~~java
    private final ReentrantLock reentrantLock=new ReentrantLock();

    public int increaseWithLock(){
        try{
            reentrantLock.lock();
            i++;
            return i;
        }finally {
            reentrantLock.unlock();
        }
    }
~~~

第三种就是使用Atomic原子类：

~~~java
    private AtomicInteger atomicInteger=new AtomicInteger(0);

    public int increaseWithAtomic(){
        return atomicInteger.incrementAndGet();
    }
~~~

# 保证多个Atomic原子类操作的原子性

如果一个方法使用了多个原子类的操作，虽然单个原子操作是原子性的，但是组合起来就不一定了。

我们看一个例子：

~~~java
public class CompoundAtomic {
    private AtomicInteger atomicInteger1=new AtomicInteger(0);
    private AtomicInteger atomicInteger2=new AtomicInteger(0);

    public void update(){
        atomicInteger1.set(20);
        atomicInteger2.set(10);
    }

    public int get() {
        return atomicInteger1.get()+atomicInteger2.get();
    }
}
~~~

上面的例子中，我们定义了两个AtomicInteger，并且分别在update和get操作中对两个AtomicInteger进行操作。

虽然AtomicInteger是原子性的，但是两个不同的AtomicInteger合并起来就不是了。在多线程操作的过程中可能会遇到问题。

同样的，我们可以使用同步机制或者锁来保证数据的一致性。

# 保证方法调用链的原子性

如果我们要创建一个对象的实例，而这个对象的实例是通过链式调用来创建的。那么我们需要保证链式调用的原子性。

考虑下面的一个例子：

~~~java
public class ChainedMethod {
    private int age=0;
    private String name="";
    private String adress="";

    public ChainedMethod setAdress(String adress) {
        this.adress = adress;
        return this;
    }

    public ChainedMethod setAge(int age) {
        this.age = age;
        return this;
    }

    public ChainedMethod setName(String name) {
        this.name = name;
        return this;
    }
}
~~~

很简单的一个对象，我们定义了三个属性，每次set都会返回对this的引用。

我们看下在多线程环境下面怎么调用：

~~~java
        ChainedMethod chainedMethod= new ChainedMethod();
        Thread t1 = new Thread(() -> chainedMethod.setAge(1).setAdress("www.flydean.com1").setName("name1"));
        t1.start();

        Thread t2 = new Thread(() -> chainedMethod.setAge(2).setAdress("www.flydean.com2").setName("name2"));
        t2.start();
~~~

因为在多线程环境下，上面的set方法可能会出现混乱的情况。

怎么解决呢？我们可以先创建一个本地的副本，这个副本因为是本地访问的，所以是线程安全的，最后将副本拷贝给新创建的实例对象。

主要的代码是下面样子的：

~~~java
public class ChainedMethodWithBuilder {
    private int age=0;
    private String name="";
    private String adress="";

    public ChainedMethodWithBuilder(Builder builder){
        this.adress=builder.adress;
        this.age=builder.age;
        this.name=builder.name;
    }

    public static class Builder{
        private int age=0;
        private String name="";
        private String adress="";

        public static Builder newInstance(){
            return new Builder();
        }
        private Builder() {}

        public Builder setName(String name) {
            this.name = name;
            return this;
        }

        public Builder setAge(int age) {
            this.age = age;
            return this;
        }

        public Builder setAdress(String adress) {
            this.adress = adress;
            return this;
        }

        public ChainedMethodWithBuilder build(){
            return new ChainedMethodWithBuilder(this);
        }
    }
~~~

我们看下怎么调用：

~~~java
      final ChainedMethodWithBuilder[] builder = new ChainedMethodWithBuilder[1];
        Thread t1 = new Thread(() -> {
            builder[0] =ChainedMethodWithBuilder.Builder.newInstance()
                .setAge(1).setAdress("www.flydean.com1").setName("name1")
                .build();});
        t1.start();

        Thread t2 = new Thread(() ->{
            builder[0] =ChainedMethodWithBuilder.Builder.newInstance()
                .setAge(1).setAdress("www.flydean.com1").setName("name1")
                .build();});
        t2.start();
~~~

因为lambda表达式中使用的变量必须是final或者final等效的，所以我们需要构建一个final的数组。

# 读写64bits的值

在java中，64bits的long和double是被当成两个32bits来对待的。

所以一个64bits的操作被分成了两个32bits的操作。从而导致了原子性问题。

考虑下面的代码：

~~~java
public class LongUsage {
    private long i =0;

    public void setLong(long i){
        this.i=i;
    }
    public void printLong(){
        System.out.println("i="+i);
    }
}
~~~

因为long的读写是分成两部分进行的，如果在多线程的环境中多次调用setLong和printLong的方法，就有可能会出现问题。

解决办法本简单，将long或者double变量定义为volatile即可。

~~~java
private volatile long i = 0;
~~~

本文的代码：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！








