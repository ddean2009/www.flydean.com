java安全编码指南之:线程安全规则

# 简介

如果我们在多线程中引入了共享变量，那么我们就需要考虑一下多线程下线程安全的问题了。那么我们在编写代码的过程中，需要注意哪些线程安全的问题呢？ 

一起来看看吧。

# 注意线程安全方法的重写

大家都做过方法重写，我们知道方法重写是不会检查方法修饰符的，也就是说，我们可以将一个synchronized的方法重写成为非线程安全的方法：

~~~java
public class SafeA {
    public synchronized void doSomething(){
    }
}
~~~

~~~java
public class UnsafeB extends SafeA{
    @Override
    public void doSomething(){
    }
}
~~~

我们在实现子类功能的时候，一定要保持方法的线程安全性。

# 构造函数中this的溢出

this是什么呢？根据JLS的规范，当用作主要表达式时，关键字this表示一个值，该值是对其调用实例方法的对象或正在构造的对象的引用。

那么问题来了，因为this能够表示正在构造的对象，那么意味着，如果对象还没有构建完毕，而this又可以被外部访问的话，就会造成外部对象访问到还未构造成功对象的问题。

我们来具体看一下this溢出都会发生在哪些情况：

~~~java
public class ChildUnsafe1 {

    public static ChildUnsafe1 childUnsafe1;
    int age;

    ChildUnsafe1(int age){
        childUnsafe1 = this;
        this.age = age;
    }
}
~~~

上面是一个非常简单的this溢出的情况，在构造函数的过程中，将this赋值给了一个public对象，将会导致this还没有被初始化完毕就被其他对象访问。

那么我们调整一下顺序是不是就可以了呢？

~~~java
public class ChildUnsafe2 {

    public static ChildUnsafe2 childUnsafe2;
    int age;

    ChildUnsafe2(int age){
        this.age = age;
        childUnsafe2 = this;
    }
}
~~~

上面我们看到，this的赋值被放到了构造方法的最后面，是不是就可以避免访问到未初始化完毕的对象呢？

答案是否定的，因为java会对代码进行重排序，所以childUnsafe2 = this的位置是不定的。

我们需要这样修改：

~~~java
public class Childsafe2 {

    public volatile static Childsafe2 childUnsafe2;
    int age;

    Childsafe2(int age){
        this.age = age;
        childUnsafe2 = this;
    }
}
~~~

加一个volatile描述符，禁止重排序，完美解决。

我们再来看一个父子类的问题，还是上面的Childsafe2，我们再为它写一个子类：

~~~java
public class ChildUnsafe3 extends Childsafe2{

    private Object obj;

    ChildUnsafe3(int age){
       super(10);
       obj= new Object();
    }

    public void doSomething(){
        System.out.println(obj.toString());
    }
}
~~~

上面的例子有什么问题呢？因为父类在调用构造函数的时候，已经暴露了this变量，所以可能会导致ChildUnsafe3中的obj还没有被初始化的时候，外部程序就调用了doSomething()，这个时候obj还没有被初始化，所以会抛出NullPointerException。

解决办法就是不要在构造函数中设置this，我们可以新创建一个方法，在构造函数调用完毕之后，再进行设置。

# 不要在类初始化的时候使用后台线程

如果在类初始化的过程中，使用后台进程，有可能会造成死锁，我们考虑下面的情况：

~~~java
public final class ChildFactory {
    private static int age;

    static {
        Thread ageInitializerThread = new Thread(()->{
            System.out.println("in thread running");
            age=10;
        });

        ageInitializerThread.start();
        try {
            ageInitializerThread.join();
        } catch (InterruptedException ie) {
            throw new AssertionError(ie);
        }
    }

    public static int getAge() {
        if (age == 0) {
            throw new IllegalStateException("Error initializing age");
        }
        return age;
    }

    public static void main(String[] args) {
        int age = getAge();
    }
}
~~~

上面的类使用了一个static的block，在这个block中，我们启动一个后台进程来设置age这个字段。

为了保证可见性，static变量必须在其他线程运行之前初始化完毕，所以ageInitializerThread需要等待main线程的static变量执行完毕之后才能运行，但是我们又调用了ageInitializerThread.join()方法，主线程又需要反过来等待ageInitializerThread的执行完毕。

最终导致了循环等待，造成了死锁。

最简单的解决办法就是不使用后台进程，直接在static block中设置：

~~~java
public final class ChildFactory2 {
    private static int age;

    static {
            System.out.println("in thread running");
            age=10;
    }

    public static int getAge() {
        if (age == 0) {
            throw new IllegalStateException("Error initializing age");
        }
        return age;
    }

    public static void main(String[] args) {
        int age = getAge();
    }
}
~~~

还有一种办法就是使用ThreadLocal将初始化变量保存在线程本地。

~~~java
public final class ChildFactory3 {

    private static final ThreadLocal<Integer> ageHolder = ThreadLocal.withInitial(() -> 10);

    public static int getAge() {
        int localAge = ageHolder.get();
        if (localAge == 0) {
            throw new IllegalStateException("Error initializing age");
        }
        return localAge;
    }

    public static void main(String[] args) {
        int age = getAge();
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

