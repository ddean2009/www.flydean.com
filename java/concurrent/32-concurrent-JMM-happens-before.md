java内存模型(JMM)和happens-before

我们知道java程序是运行在JVM中的，而JVM就是构建在内存上的虚拟机，那么内存模型JMM是做什么用的呢？

我们考虑一个简单的赋值问题：

~~~java
int a=100;
~~~

JMM考虑的就是什么情况下读取变量a的线程可以看到值为100。看起来这是一个很简单的问题，赋值之后不就可以读到值了吗？ 

但是上面的只是我们源码的编写顺序，当把源码编译之后，在编译器中生成的指令的顺序跟源码的顺序并不是完全一致的。处理器可能采用乱序或者并行的方式来执行指令（在JVM中只要程序的最终执行结果和在严格串行环境中执行结果一致，这种重排序是允许的）。并且处理器还有本地缓存，当将结果存储在本地缓存中，其他线程是无法看到结果的。除此之外缓存提交到主内存的顺序也肯能会变化。

上面提到的种种可能都会导致在多线程环境中产生不同的结果。在多线程环境中，大部分时间多线程都是在执行各自的任务，只有在多个线程需要共享数据的时候，才需要协调线程之间的操作。

而JMM就是JVM中必须遵守的一组最小保证，它规定了对于变量的写入操作在什么时候对其他线程是可见的。

## 重排序

上面讲了JVM中的重排序，这里我们举个例子，以便大家对重排序有一个更深入的理解：

~~~java
@Slf4j
public class Reorder {

    int x=0, y=0;
    int a=0, b=0;

    private  void reorderMethod() throws InterruptedException {

        Thread one = new Thread(()->{
            a=1;
            x=b;
        });

        Thread two = new Thread(()->{
            b=1;
            y=a;
        });
        one.start();
        two.start();
        one.join();
        two.join();
        log.info("{},{}", x, y);
    }

    public static void main(String[] args) throws InterruptedException {

        for (int i=0; i< 100; i++){
            new Reorder().reorderMethod();
        }
    }
}
~~~

上面的例子是一个很简单的并发程序。由于我们没有使用同步限制，所以线程one和two的执行顺序是不定的。有可能one在two之前执行，也有可能在two之后执行，也可能两者同时执行。不同的执行顺序可能会导致不同的输出结果。

同时虽然我们在代码中指定了先执行a=1, 再执行x=b，但是这两条语句实际上是没有关系的，在JVM中完全可能将两条语句重排序成x=b在前，a=1在后，从而导致输出更多意想不到的结果。

## Happens-Before

为了保证java内存模型中的操作顺序，JMM为程序中的所有操作定义了一个顺序关系，这个顺序叫做Happens-Before。要想保证操作B看到操作A的结果，不管A和B是在同一线程还是不同线程，那么A和B必须满足Happens-Before的关系。如果两个操作不满足happens-before的关系，那么JVM可以对他们任意重排序。

我们看一下happens-before的规则：

1. 程序顺序规则： 如果在程序中操作A在操作B之前，那么在同一个线程中操作A将会在操作B之前执行。

> 注意，这里的操作A在操作B之前执行是指在单线程环境中，虽然虚拟机会对相应的指令进行重排序，但是最终的执行结果跟按照代码顺序执行是一样的。虚拟机只会对不存在依赖的代码进行重排序。

2. 监视器锁规则： 监视器上的解锁操作必须在同一个监视器上面的加锁操作之前执行。

> 锁我们大家都很清楚了，这里的顺序必须指的是同一个锁，如果是在不同的锁上面，那么其执行顺序也不能得到保证。

3. volatile变量规则： 对volatile变量的写入操作必须在对该变量的读操作之前执行。

> 原子变量和volatile变量在读写操作上面有着相同的语义。

4. 线程启动规则： 线程上对Thread.start的操作必须要在该线程中执行任何操作之前执行。

5. 线程结束规则： 线程中的任何操作都必须在其他线程检测到该线程结束之前执行。

6. 中断规则： 当一个线程再另一个线程上调用interrupt时，必须在被中断线程检测到interrupt调用之前执行。

7. 终结器规则： 对象的构造函数必须在启动该对象的终结器之前执行完毕。

8. 传递性： 如果操作A在操作B之前执行，并且操作B在操作C之前执行，那么操作A必须在操作C之前执行。

上面的规则2很好理解，在加锁的过程中，不允许其他的线程获得该锁，也意味着其他的线程必须等待锁释放之后才能加锁和执行其业务逻辑。

4，5，6，7规则也很好理解，只有开始，才能结束。这符合我们对程序的一般认识。

8的传递性相信学过数学的人应该也不难理解。

接下来我们重点讨论一下规则3和规则1的结合。讨论之前我们再总结一下happens-before到底是做什么的。

因为JVM会对接收到的指令进行重排序，为了保证指令的执行顺序，我们才有了happens-before规则。上面讲到的2，3，4，5，6，7规则可以看做是重排序的节点，这些节点是不允许重排序的，只有在这些节点之间的指令才允许重排序。

结合规则1程序顺序规则，我们得到其真正的含义：代码中写在重排序节点之前的指令，一定会在重排序节点执行之前执行。

重排序节点就是一个分界点，它的位置是不能够移动的。看一下下面的直观例子：

![](https://img-blog.csdnimg.cn/20200329180927143.png)

线程1中有两个指令：set i=1, set volatile a=2。 
线程2中也有两个指令：get volatile a, get i。

按照上面的理论，set和get volatile是两个重排序节点，set必须排在get之前。而依据规则1，代码中set i=1 在set volatile a=2之前，因为set volatile是重排序节点，所以需要遵守程序顺序执行规则，从而set i=1要在set volatile a=2之前执行。同样的道理get volatile a在get i之前执行。最后导致i=1在get i之前执行。

这个操作叫做借助同步。

## 安全发布

我们经常会用到单例模式来创建一个单的对象，我们看下下面的方法有什么不妥：

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

初看起来，好像没什么问题，但是如果仔细考虑JMM的重排规则，就会发现问题所在。
book=new Book（）其实一个复杂的命令，并不是原子性操作。它大概可以分解为1.分配内存，2.实例化对象，3.将对象和内存地址建立关联。

其中2和3有可能会被重排序，然后就有可能出现book返回了，但是还没有初始化完毕的情况。从而出现不可以预见的错误。

根据上面我们讲到的happens-before规则， 最简单的办法就是给方法前面加上synchronized关键字：

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

我们再看下面一种静态域的实现：

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

接下来我们再介绍一下双重检查加锁。

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

上面的类中检测了两次bookDLC的值，只有bookDLC为空的时候才进行加锁操作。看起来一切都很完美，但是我们要注意一点，这里bookDLC一定要是volatile。

因为bookDLC的赋值操作和返回操作并没有happens-before，所以可能会出现获取到一个仅部分构造的实例。这也是为什么我们要加上volatile关键词。

## 初始化安全性

本文的最后，我们将讨论一下在构造函数中含有final域的对象初始化。

对于正确构造的对象，初始化对象保证了所有的线程都能够正确的看到由构造函数为对象给各个final域设置的正确值，包括final域可以到达的任何变量（比如final数组中的元素，final的hashMap等）。

~~~java
public class FinalSafe {
    private final HashMap<String,String> hashMap;

    public FinalSafe(){
        hashMap= new HashMap<>();
        hashMap.put("key1","value1");
    }
}
~~~

上面的例子中，我们定义了一个final对象，并且在构造函数中初始化了这个对象。那么这个final对象是将不会跟构造函数之后的其他操作重排序。

本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/reorder](https://github.com/ddean2009/learn-java-concurrency/tree/master/reorder)

更多内容请访问 [flydean的博客](www.flydean.com)

















